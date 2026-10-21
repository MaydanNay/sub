import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole, type JwtPayload } from "./auth.js";
import {
  applyVisitProgress,
  getDisciplineAndReward,
  toPrismaStage,
} from "../lib/progress.js";
import type { RehabStage } from "@restart-clinic/shared";
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
      
      const visits = await prisma.visit.findMany({
        where: { doctorId: user.sub },
        include: { patient: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" }
      });

      const scheduled = await prisma.patient.findMany({
        where: { doctorId: user.sub, nextVisitAt: { not: null } },
        select: { id: true, fullName: true, nextVisitAt: true }
      });

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

  app.post<{
    Params: { id: string };
    Body: { note?: string; title?: string; medals?: VisitMedalTier[] };
  }>(
    "/api/doctor/patients/:id/visit",
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

      const medals = req.body.medals ?? [];
      const validTiers: VisitMedalTier[] = ["BRONZE", "SILVER", "GOLD"];
      if (medals.some((m) => !validTiers.includes(m))) {
        return reply.status(400).send({ error: "Некорректный тип медали" });
      }

      const medalError = await validatePatientVisitMedals(patient.id, medals);
      if (medalError) return reply.status(400).send({ error: medalError });

      const visitNumber = patient.completedVisits + 1;
      const title = req.body.title?.trim() || `Посещение №${visitNumber}`;
      if (title.length > 120) {
        return reply.status(400).send({ error: "Название посещения слишком длинное" });
      }

      const progress = applyVisitProgress(patient);

      let updated;
      try {
        updated = await prisma.$transaction(async (tx) => {
          const inTxError = await validatePatientVisitMedals(patient.id, medals);
          if (inTxError) throw new Error(inTxError);

          const visit = await tx.visit.create({
            data: {
              patientId: patient.id,
              doctorId: user.sub,
              title,
              note: req.body.note?.trim() || null,
            },
          });

          if (medals.length > 0) {
            await tx.visitMedal.createMany({
              data: medals.map((tier) => ({ visitId: visit.id, tier })),
            });
          }

          return tx.patient.update({
            where: { id: patient.id },
            data: progress,
          });
        });
      } catch (e) {
        if (e instanceof Error && e.message.includes("медал")) {
          return reply.status(400).send({ error: e.message });
        }
        throw e;
      }

      const bot = getBot();
      if (bot) {
        try {
          await notifyVisitRecorded(bot, patient.telegramId, {
            endurance: updated.endurance,
            ligaments: updated.ligaments,
            balance: updated.balance,
          });
        } catch (e) {
          req.log.warn(e, "Failed to notify patient about visit");
        }
      }

      await grantEligibleRewards(patient.id, bot);

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

  app.patch<{
    Params: { id: string };
    Body: { stage: RehabStage };
  }>(
    "/api/doctor/patients/:id/stage",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const patient = await prisma.patient.findFirst({
        where: { id: req.params.id, doctorId: user.sub },
      });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      const stage = toPrismaStage(req.body.stage);
      let endurance = patient.endurance;
      let ligaments = patient.ligaments;
      let balance = patient.balance;

      if (req.body.stage === 3) {
        endurance = Math.min(endurance, 50);
        ligaments = Math.min(ligaments, 50);
        balance = Math.min(balance, 50);
      }
      if (req.body.stage === 4) {
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

  app.patch<{
    Params: { id: string };
    Body: { nextVisitAt: string };
  }>(
    "/api/doctor/patients/:id/next-visit",
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

      const nextVisitAt = new Date(req.body.nextVisitAt);
      if (Number.isNaN(nextVisitAt.getTime())) {
        return reply.status(400).send({ error: "Некорректная дата визита" });
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

  app.patch<{
    Params: { id: string };
    Body: { targetVisits: number | null };
  }>(
    "/api/doctor/patients/:id/target-visits",
    { preHandler: [authenticate, requireRole("DOCTOR")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const patient = await prisma.patient.findFirst({
        where: { id: req.params.id, doctorId: user.sub },
      });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });
      
      return serialize(
        await prisma.patient.update({
          where: { id: patient.id },
          data: { targetVisits: req.body.targetVisits },
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

      const parsed = validateRewardInput(req.body);
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
