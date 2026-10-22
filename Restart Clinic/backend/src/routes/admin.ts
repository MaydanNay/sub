import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole, type JwtPayload } from "./auth.js";
import { toPrismaStage } from "../lib/progress.js";
import type { RehabStage } from "@restart-clinic/shared";
import type { Gender } from "@restart-clinic/shared";
import { getBot, notifyAppointmentScheduled, notifyPatientAccessGranted } from "../bot/index.js";
import { grantEligibleRewards } from "../lib/rewards.js";
import { patientRewardInclude, serializePatientReward, validateRewardInput } from "../lib/patient-rewards.js";
import { serialize } from "../lib/serialize.js";
import bcrypt from "bcryptjs";
import type { PatientRewardTrigger, RewardIssuerType } from "@prisma/client";
import { parsePatientFields } from "../lib/patient-input.js";
import { makePlaceholderTelegramId } from "../lib/patient-identity.js";

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

  app.post<{
    Params: { id: string };
    Body: {
      fullName: string;
      age: number;
      gender: Gender;
      diagnosis: string;
      doctorId: string;
      nextVisitAt?: string;
    };
  }>(
    "/api/admin/applications/:id/approve",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const appRecord = await prisma.application.findUnique({
        where: { id: req.params.id },
        include: { patient: true },
      });
      if (!appRecord) return reply.status(404).send({ error: "Заявка не найдена" });
      if (appRecord.status !== "PENDING") {
        return reply.status(400).send({ error: "Заявка уже обработана" });
      }

      const parsed = parsePatientFields(req.body, true);
      if ("error" in parsed) return reply.status(400).send({ error: parsed.error });
      const fields = parsed.data;

      const doctor = await prisma.staffUser.findFirst({
        where: { id: fields.doctorId, role: "DOCTOR" },
      });
      if (!doctor) return reply.status(400).send({ error: "Врач не найден" });

      let nextVisitAt: Date | undefined;
      if (req.body.nextVisitAt) {
        nextVisitAt = new Date(req.body.nextVisitAt);
        if (Number.isNaN(nextVisitAt.getTime())) {
          return reply.status(400).send({ error: "Некорректная дата приёма" });
        }
      }

      const patient = await prisma.$transaction(async (tx) => {
        const updated = await tx.patient.update({
          where: { id: appRecord.patientId },
          data: {
            ...fields,
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
      return Promise.all(
        doctors.map(async (doc) => {
          const visitCount = await prisma.visit.count({ where: { doctorId: doc.id } });
          return { ...doc, visitCount };
        })
      );
    }
  );

  app.post<{
    Body: {
      email: string;
      fullName: string;
      password?: string;
    }
  }>(
    "/api/admin/doctors",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const { email, fullName, password } = req.body;
      const existing = await prisma.staffUser.findUnique({ where: { email } });
      if (existing) {
        return reply.status(400).send({ error: "Email уже используется" });
      }
      
      const passwordHash = password 
        ? await bcrypt.hash(password, 10)
        : await bcrypt.hash("doctor123", 10);
        
      const doctor = await prisma.staffUser.create({
        data: {
          email,
          fullName,
          passwordHash,
          role: "DOCTOR"
        },
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

  app.post<{ Body: { text: string; type?: "NIGHTMARE" | "MOTIVATIONAL" | "SYSTEM" } }>(
    "/api/admin/push-notifications",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const text = req.body.text?.trim();
      if (!text) {
        return reply.status(400).send({ error: "Текст не может быть пустым" });
      }
      return prisma.pushNotification.create({
        data: { 
          text,
          type: req.body.type ?? "NIGHTMARE"
        },
      });
    }
  );

  app.delete<{ Params: { id: string } }>(
    "/api/admin/push-notifications/:id",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      try {
        await prisma.pushNotification.delete({
          where: { id: req.params.id },
        });
        return { ok: true };
      } catch (e) {
        return reply.status(404).send({ error: "Уведомление не найдено" });
      }
    }
  );

  app.post<{
    Body: {
      fullName: string;
      age: number;
      gender: Gender;
      diagnosis: string;
      doctorId: string;
      phone?: string;
      telegramId?: string;
    };
  }>(
    "/api/admin/patients",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const phone = req.body.phone != null ? String(req.body.phone).trim() || null : null;
      const telegramIdRaw =
        req.body.telegramId != null ? String(req.body.telegramId).trim() : "";
      if (!telegramIdRaw && !phone) {
        return reply.status(400).send({ error: "Нужен telegramId или phone" });
      }
      if (telegramIdRaw && !/^[1-9]\d{0,15}$/.test(telegramIdRaw)) {
        return reply.status(400).send({ error: "Некорректный telegramId" });
      }

      const parsed = parsePatientFields(req.body, true);
      if ("error" in parsed) return reply.status(400).send({ error: parsed.error });

      const doctor = await prisma.staffUser.findFirst({
        where: { id: parsed.data.doctorId, role: "DOCTOR" },
      });
      if (!doctor) return reply.status(400).send({ error: "Врач не найден" });

      // Без telegramId — временный отрицательный ID; настоящий подставит бот,
      // когда пациент поделится этим же номером (см. linkPlaceholderPatientByPhone).
      const telegramId = telegramIdRaw ? BigInt(telegramIdRaw) : makePlaceholderTelegramId();
      if (telegramIdRaw && (await prisma.patient.findUnique({ where: { telegramId } }))) {
        return reply.status(400).send({ error: "Пациент с таким telegramId уже есть" });
      }

      const patient = await prisma.patient.create({
        data: {
          telegramId,
          phone,
          ...parsed.data,
          hasAppAccess: true,
          scheduledVisits: 0,
        },
      });

      return serialize(patient);
    }
  );

  app.patch<{
    Params: { id: string };
    Body: Partial<{
      fullName: string;
      age: number;
      gender: Gender;
      diagnosis: string;
      doctorId: string;
      stage: RehabStage;
      nextVisitAt: string | null;
    }>;
  }>(
    "/api/admin/patients/:id",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (req, reply) => {
      const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
      if (!patient) return reply.status(404).send({ error: "Пациент не найден" });

      // Только разрешённые поля; пустые значения -> null, а не "" или 0.
      const parsed = parsePatientFields(req.body, false);
      if ("error" in parsed) return reply.status(400).send({ error: parsed.error });
      const data: Record<string, unknown> = { ...parsed.data };

      if (parsed.data.doctorId) {
        const doctor = await prisma.staffUser.findFirst({
          where: { id: parsed.data.doctorId, role: "DOCTOR" },
        });
        if (!doctor) return reply.status(400).send({ error: "Врач не найден" });
      }
      if (req.body.stage) {
        data.stage = toPrismaStage(req.body.stage);
      }

      let nextVisitAt: Date | undefined;
      let clearNextVisit = false;
      if (req.body.nextVisitAt === null) {
        data.nextVisitAt = null;
        clearNextVisit = true;
      } else if (req.body.nextVisitAt) {
        nextVisitAt = new Date(req.body.nextVisitAt);
        if (Number.isNaN(nextVisitAt.getTime())) {
          return reply.status(400).send({ error: "Некорректная дата приёма" });
        }
        data.nextVisitAt = nextVisitAt;
        if (patient.nextVisitAt === null) {
          data.scheduledVisits = { increment: 1 };
        }
      }

      const updated = await prisma.patient.update({
        where: { id: req.params.id },
        data,
        include: { doctor: { select: { id: true, fullName: true } } },
      });

      const bot = getBot();
      if (
        bot &&
        nextVisitAt &&
        !clearNextVisit &&
        patient.nextVisitAt?.getTime() !== nextVisitAt.getTime()
      ) {
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

      const parsed = validateRewardInput(req.body);
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
        const doctor = await prisma.staffUser.findFirst({
          where: { id: doctorId, role: "DOCTOR" },
        });
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
