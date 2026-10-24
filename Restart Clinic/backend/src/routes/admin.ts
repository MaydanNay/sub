import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole, type JwtPayload } from "./auth.js";
import { toPrismaStage } from "../lib/progress.js";
import { getBot, notifyAppointmentScheduled, notifyPatientAccessGranted } from "../bot/index.js";
import { grantEligibleRewards } from "../lib/rewards.js";
import { patientRewardInclude, serializePatientReward, validateRewardInput } from "../lib/patient-rewards.js";
import { serialize } from "../lib/serialize.js";
import bcrypt from "bcryptjs";
import type { PatientRewardTrigger, Prisma, RewardIssuerType } from "@prisma/client";
import {
  approveApplicationBody,
  createDoctorBody,
  createPatientBody,
  parse,
  pushNotificationBody,
  updatePatientBody,
} from "../lib/validation.js";

async function findDoctor(id: string) {
  return prisma.staffUser.findFirst({ where: { id, role: "DOCTOR" } });
}

export async function adminRoutes(app: FastifyInstance) {
  app.get(
    "/api/admin/applications",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async () => {
      return serialize(
        await prisma.application.findMany({
          where: { status: "PENDING" },
          include: { patient: true },
          orderBy: { createdAt: "desc" },
        })
      );
    }
  );

  app.post<{ Params: { id: string } }>(
    "/api/admin/applications/:id/approve",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const body = parse(approveApplicationBody, req.body);
      const appRecord = await prisma.application.findUnique({
        where: { id: req.params.id },
        include: { patient: true },
      });
      if (!appRecord) return reply.status(404).send({ error: "Заявка не найдена" });
      if (appRecord.status !== "PENDING") {
        return reply.status(400).send({ error: "Заявка уже обработана" });
      }

      if (!(await findDoctor(body.doctorId))) return reply.status(400).send({ error: "Врач не найден" });

      const { nextVisitAt } = body;
      const patient = await prisma.$transaction(async (tx) => {
        const updated = await tx.patient.update({
          where: { id: appRecord.patientId },
          data: {
            fullName: body.fullName,
            age: body.age,
            gender: body.gender,
            diagnosis: body.diagnosis,
            doctorId: body.doctorId,
            hasAppAccess: true,
            ...(nextVisitAt
              ? { nextVisitAt, scheduledVisits: { increment: 1 } }
              : {}),
          },
        });

        await tx.application.update({
          where: { id: req.params.id },
          data: { status: "APPROVED" },
        });

        return updated;
      });

      const bot = getBot();
      const webappUrl = process.env.WEBAPP_URL ?? "http://localhost:5173";
      if (bot) {
        try {
          await notifyPatientAccessGranted(bot, patient.telegramId, webappUrl, nextVisitAt);
        } catch (e) {
          req.log.warn(e, "Failed to notify patient about access");
        }
      }

      return serialize({ patient });
    }
  );

  app.get(
    "/api/admin/patients",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async () => {
      return serialize(
        await prisma.patient.findMany({
          include: { doctor: { select: { id: true, fullName: true } } },
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        })
      );
    }
  );

  app.get(
    "/api/admin/doctors",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async () => {
      const doctors = await prisma.staffUser.findMany({
        where: { role: "DOCTOR" },
        select: { id: true, fullName: true, email: true },
        orderBy: { createdAt: "desc" }
      });
      // One grouped query instead of one count query per doctor
      const counts = await prisma.visit.groupBy({
        by: ["doctorId"],
        where: { doctorId: { in: doctors.map((d) => d.id) } },
        _count: { _all: true },
      });
      const visitsByDoctor = new Map(counts.map((c) => [c.doctorId, c._count._all]));
      return doctors.map((doc) => ({ ...doc, visitCount: visitsByDoctor.get(doc.id) ?? 0 }));
    }
  );

  app.post(
    "/api/admin/doctors",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      // Password is required: an empty field used to silently become "doctor123"
      const { email, fullName, password } = parse(createDoctorBody, req.body);
      const existing = await prisma.staffUser.findUnique({ where: { email } });
      if (existing) {
        return reply.status(400).send({ error: "Email уже используется" });
      }

      const doctor = await prisma.staffUser.create({
        data: {
          email,
          fullName,
          passwordHash: await bcrypt.hash(password, 10),
          role: "DOCTOR"
        },
        select: { id: true, email: true, fullName: true, role: true, createdAt: true },
      });
      return serialize(doctor);
    }
  );

  app.get(
    "/api/admin/push-notifications",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async () => {
      return prisma.pushNotification.findMany({
        orderBy: { createdAt: "desc" },
      });
    }
  );

  app.post(
    "/api/admin/push-notifications",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req) => {
      const data = parse(pushNotificationBody, req.body);
      return prisma.pushNotification.create({ data });
    }
  );

  app.delete<{ Params: { id: string } }>(
    "/api/admin/push-notifications/:id",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      // Any error used to be reported as 404; now only "nothing deleted" is
      const { count } = await prisma.pushNotification.deleteMany({
        where: { id: req.params.id },
      });
      if (count === 0) return reply.status(404).send({ error: "Уведомление не найдено" });
      return { ok: true };
    }
  );

  app.post(
    "/api/admin/patients",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const body = parse(createPatientBody, req.body);

      if (!(await findDoctor(body.doctorId))) return reply.status(400).send({ error: "Врач не найден" });

      // telegramId is required and unique in the schema, so phone-only patients
      // get a timestamp placeholder; bot messages to them fail until a real id is linked.
      const telegramId = body.telegramId ? BigInt(body.telegramId) : BigInt(Date.now());

      const patient = await prisma.patient.create({
        data: {
          telegramId,
          phone: body.phone,
          fullName: body.fullName,
          age: body.age,
          gender: body.gender,
          diagnosis: body.diagnosis,
          doctorId: body.doctorId,
          hasAppAccess: true,
          scheduledVisits: 0,
        },
      });

      return serialize(patient);
    }
  );

  app.patch<{ Params: { id: string } }>(
    "/api/admin/patients/:id",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      // Whitelisted fields: the raw body used to be spread into prisma.update,
      // so a client could set hasAppAccess, completedVisits, telegramId, ...
      const body = parse(updatePatientBody, req.body);
      const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      if (body.doctorId && !(await findDoctor(body.doctorId))) {
        return reply.status(400).send({ error: "Врач не найден" });
      }

      const { stage, nextVisitAt, ...fields } = body;
      const data: Prisma.PatientUncheckedUpdateInput = { ...fields };
      if (stage) {
        data.stage = toPrismaStage(stage);
      }
      if (nextVisitAt !== undefined) {
        data.nextVisitAt = nextVisitAt;
        if (nextVisitAt && patient.nextVisitAt === null) {
          data.scheduledVisits = { increment: 1 };
        }
      }

      const updated = await prisma.patient.update({
        where: { id: req.params.id },
        data,
        include: { doctor: { select: { id: true, fullName: true } } },
      });

      const bot = getBot();
      if (bot && nextVisitAt && patient.nextVisitAt?.getTime() !== nextVisitAt.getTime()) {
        try {
          await notifyAppointmentScheduled(bot, patient.telegramId, nextVisitAt);
        } catch (e) {
          req.log.warn(e, "Failed to notify patient about appointment");
        }
      }

      return serialize(updated);
    }
  );

  app.patch<{ Params: { id: string } }>(
    "/api/admin/patients/:id/pin",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      return serialize(
        await prisma.patient.update({
          where: { id: req.params.id },
          data: { isPinned: !patient.isPinned },
          include: { doctor: { select: { id: true, fullName: true } } },
        })
      );
    }
  );

  app.delete<{ Params: { id: string } }>(
    "/api/admin/patients/:id",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      await prisma.patient.delete({ where: { id: req.params.id } });
      return { ok: true };
    }
  );

  app.get<{ Params: { id: string } }>(
    "/api/admin/patients/:id/rewards",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      const rewards = await prisma.patientReward.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: "asc" },
        include: patientRewardInclude,
      });

      return serialize(rewards.map((r) => serializePatientReward(r)));
    }
  );

  app.post<{
    Params: { id: string };
    Body: {
      title: string;
      description?: string;
      trigger: PatientRewardTrigger;
      issuerType: RewardIssuerType;
      doctorId?: string;
    };
  }>(
    "/api/admin/patients/:id/rewards",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const user = req.user as JwtPayload;
      const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      const parsed = validateRewardInput(req.body ?? {});
      if ("error" in parsed) return reply.status(400).send({ error: parsed.error });

      const issuerType = req.body.issuerType;
      if (issuerType !== "ADMIN" && issuerType !== "DOCTOR") {
        return reply.status(400).send({ error: "Некорректный источник приза" });
      }

      let issuerDoctorId: string | null = null;
      if (issuerType === "DOCTOR") {
        const doctorId = req.body.doctorId ?? patient.doctorId;
        if (!doctorId) {
          return reply.status(400).send({ error: "Выберите врача" });
        }
        const doctor = await findDoctor(doctorId);
        if (!doctor) return reply.status(400).send({ error: "Врач не найден" });
        issuerDoctorId = doctor.id;
      }

      const reward = await prisma.patientReward.create({
        data: {
          patientId: patient.id,
          title: parsed.title,
          description: parsed.description,
          trigger: parsed.trigger,
          issuerType,
          issuerDoctorId,
          createdByStaffId: user.sub,
        },
        include: patientRewardInclude,
      });

      await grantEligibleRewards(patient.id, getBot());

      return serialize(serializePatientReward(reward));
    }
  );

  app.delete<{ Params: { id: string; rewardId: string } }>(
    "/api/admin/patients/:id/rewards/:rewardId",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
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
