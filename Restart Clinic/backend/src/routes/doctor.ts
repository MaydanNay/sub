import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole, type JwtPayload } from "./auth.js";
import {
  applyVisitProgress,
  getDisciplineAndReward,
  toPrismaStage,
} from "../lib/progress.js";
import { getBot, notifyVisitRecorded } from "../bot/index.js";
import { serialize } from "../lib/serialize.js";
import { grantEligibleRewards } from "../lib/rewards.js";
import { patientRewardInclude, validateRewardInput } from "../lib/patient-rewards.js";
import {
  formatVisitMedals,
  getPatientMedalQuotas,
  getPatientMedalUsage,
  validatePatientVisitMedals,
} from "../lib/medals.js";
import type { PatientRewardTrigger, VisitMedalTier } from "@prisma/client";
import { HttpError, nextVisitBody, parse, stageBody, targetVisitsBody, visitBody } from "../lib/validation.js";

export async function doctorRoutes(app: FastifyInstance) {
  app.get(
    "/api/doctor/patients",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req) => {
      const user = req.user as JwtPayload;
      return serialize(
        await prisma.patient.findMany({
          where: { doctorId: user.sub, hasAppAccess: true },
          orderBy: { fullName: "asc" },
        })
      );
    }
  );

  app.get(
    "/api/doctor/calendar",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req) => {
      const user = req.user as JwtPayload;
      
      const [visits, scheduled] = await Promise.all([
        prisma.visit.findMany({
          where: { doctorId: user.sub },
          include: { patient: { select: { fullName: true } } },
          orderBy: { createdAt: "desc" }
        }),
        prisma.patient.findMany({
          where: { doctorId: user.sub, nextVisitAt: { not: null } },
          select: { id: true, fullName: true, nextVisitAt: true }
        }),
      ]);

      return serialize({ visits, scheduled });
    }
  );

  app.get<{
    Params: { id: string };
  }>(
    "/api/doctor/patients/:id",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const patient = await prisma.patient.findFirst({
        where: { id: req.params.id, doctorId: user.sub },
        include: {
          visits: {
            orderBy: { createdAt: "desc" },
            take: 20,
            include: { medals: { orderBy: { createdAt: "asc" } } },
          },
          doctor: { select: { fullName: true } },
          rewards: { orderBy: { createdAt: "asc" }, include: patientRewardInclude },
        },
      });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });
      return serialize(patient);
    }
  );

  app.post<{ Params: { id: string } }>(
    "/api/doctor/patients/:id/visit",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const body = parse(visitBody, req.body);
      const medals: VisitMedalTier[] = body.medals;

      const updated = await prisma.$transaction(async (tx) => {
        // Row lock: two visits recorded at once both read the same
        // completedVisits/stats and one increment was lost
        await tx.$queryRaw`SELECT 1 FROM "Patient" WHERE id = ${req.params.id} FOR UPDATE`;
        const patient = await tx.patient.findFirst({
          where: { id: req.params.id, doctorId: user.sub },
        });
        if (!patient) throw new HttpError(404, "Пациент не найден");
        if (patient.courseCompleted) throw new HttpError(400, "Курс уже завершён");

        const medalError = await validatePatientVisitMedals(patient.id, medals, tx);
        if (medalError) throw new HttpError(400, medalError);

        const visit = await tx.visit.create({
          data: {
            patientId: patient.id,
            doctorId: user.sub,
            title: body.title || `Посещение №${patient.completedVisits + 1}`,
            note: body.note?.trim() || null,
          },
        });

        if (medals.length > 0) {
          await tx.visitMedal.createMany({
            data: medals.map((tier) => ({ visitId: visit.id, tier })),
          });
        }

        return tx.patient.update({
          where: { id: patient.id },
          data: applyVisitProgress(patient),
        });
      });

      // Independent side effects run concurrently; neither may fail the saved visit
      const bot = getBot();
      await Promise.all([
        bot &&
          notifyVisitRecorded(bot, updated.telegramId, {
            endurance: updated.endurance,
            ligaments: updated.ligaments,
            balance: updated.balance,
          }).catch((e) => req.log.warn(e, "Failed to notify patient about visit")),
        grantEligibleRewards(updated.id, bot).catch((e) =>
          req.log.error(e, "Failed to grant rewards after visit")
        ),
      ]);

      return serialize(updated);
    }
  );

  app.get<{
    Params: { id: string };
  }>(
    "/api/doctor/patients/:id/medals",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const patient = await prisma.patient.findFirst({
        where: { id: req.params.id, doctorId: user.sub },
      });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      const [{ quotas, total }, used] = await Promise.all([
        getPatientMedalQuotas(patient.id),
        getPatientMedalUsage(patient.id),
      ]);

      return serialize({ quotas, used, total });
    }
  );

  app.patch<{ Params: { id: string } }>(
    "/api/doctor/patients/:id/stage",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      // stage outside 1..4 used to reach Prisma as undefined
      const { stage: stageNum } = parse(stageBody, req.body);
      const patient = await prisma.patient.findFirst({
        where: { id: req.params.id, doctorId: user.sub },
      });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      const stage = toPrismaStage(stageNum);
      let endurance = patient.endurance;
      let ligaments = patient.ligaments;
      let balance = patient.balance;

      if (stageNum === 3) {
        endurance = Math.min(endurance, 50);
        ligaments = Math.min(ligaments, 50);
        balance = Math.min(balance, 50);
      }
      if (stageNum === 4) {
        endurance = 100;
        ligaments = 100;
        balance = 100;
      }

      const updated = await prisma.patient.update({
        where: { id: patient.id },
        data: { stage, endurance, ligaments, balance },
      });

      await grantEligibleRewards(patient.id, getBot());

      return serialize(updated);
    }
  );

  app.patch<{ Params: { id: string } }>(
    "/api/doctor/patients/:id/next-visit",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const { nextVisitAt } = parse(nextVisitBody, req.body);
      const patient = await prisma.patient.findFirst({
        where: { id: req.params.id, doctorId: user.sub },
      });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });
      if (patient.courseCompleted) {
        return reply.status(400).send({ error: "Курс уже завершён" });
      }

      const isNewAppointment = patient.nextVisitAt === null;

      return serialize(
        await prisma.patient.update({
          where: { id: patient.id },
          data: {
            nextVisitAt,
            ...(isNewAppointment ? { scheduledVisits: { increment: 1 } } : {}),
          },
        })
      );
    }
  );

  app.patch<{ Params: { id: string } }>(
    "/api/doctor/patients/:id/target-visits",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const { targetVisits } = parse(targetVisitsBody, req.body);
      const patient = await prisma.patient.findFirst({
        where: { id: req.params.id, doctorId: user.sub },
      });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });
      
      return serialize(
        await prisma.patient.update({
          where: { id: patient.id },
          data: { targetVisits },
        })
      );
    }
  );

  app.post<{
    Params: { id: string };
  }>(
    "/api/doctor/patients/:id/complete-course",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const patient = await prisma.patient.findFirst({
        where: { id: req.params.id, doctorId: user.sub },
      });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });
      if (patient.courseCompleted) {
        return reply.status(400).send({ error: "Курс уже завершён" });
      }

      const { percent, tier } = getDisciplineAndReward(
        patient.scheduledVisits,
        patient.completedVisits
      );

      const updated = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          courseCompleted: true,
          rewardTier: tier,
          stage: "STAGE_4",
          endurance: 100,
          ligaments: 100,
          balance: 100,
        },
      });

      await grantEligibleRewards(patient.id, getBot());

      return serialize({ ...updated, disciplinePercent: percent });
    }
  );

  app.post<{
    Params: { id: string };
    Body: {
      title: string;
      description?: string;
      trigger: PatientRewardTrigger;
    };
  }>(
    "/api/doctor/patients/:id/rewards",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const patient = await prisma.patient.findFirst({
        where: { id: req.params.id, doctorId: user.sub },
      });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      const parsed = validateRewardInput(req.body ?? {});
      if ("error" in parsed) return reply.status(400).send({ error: parsed.error });

      const reward = await prisma.patientReward.create({
        data: {
          patientId: patient.id,
          title: parsed.title,
          description: parsed.description,
          trigger: parsed.trigger,
          issuerType: "DOCTOR",
          issuerDoctorId: user.sub,
          createdByStaffId: user.sub,
        },
        include: patientRewardInclude,
      });

      await grantEligibleRewards(patient.id, getBot());

      return serialize(reward);
    }
  );

  app.delete<{
    Params: { id: string; rewardId: string };
  }>(
    "/api/doctor/patients/:id/rewards/:rewardId",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const patient = await prisma.patient.findFirst({
        where: { id: req.params.id, doctorId: user.sub },
      });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      const reward = await prisma.patientReward.findFirst({
        where: { id: req.params.rewardId, patientId: patient.id },
      });
      if (!reward) return reply.status(404).send({ error: "Приз не найден" });
      if (reward.grantedAt) {
        return reply.status(400).send({ error: "Нельзя удалить уже выданный приз" });
      }

      await prisma.patientReward.delete({ where: { id: reward.id } });
      return { ok: true };
    }
  );
}
