import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";
import {
  parseTelegramUser,
  validateTelegramInitData,
} from "../lib/telegram-auth.js";
import { toRehabStage } from "../lib/progress.js";
import {
  getCharacterImageIndex,
  getMotivationMessage,
  STAGE_LABELS,
  calculateMedalQuotas,
  getCourseVisitTotal,
  getVisitSlotMedalTier,
  MEDAL_EMOJI,
} from "@restart-clinic/shared";
import { formatVisitMedals, getPatientMedalUsage } from "../lib/medals.js";
import { patientRewardInclude, serializePatientReward } from "../lib/patient-rewards.js";

const botToken = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim().replace(/^["']|["']$/g, "");

type AuthError = "no_init_data" | "no_bot_token" | "invalid_init_data" | "patient_not_found";

type PatientWithDoctor = {
  doctor: { fullName: string } | null;
  visits: Array<{
    id: string;
    createdAt: Date;
    title: string | null;
    note: string | null;
    medals: Array<{ tier: import("@prisma/client").VisitMedalTier }>;
  }>;
  rewards: Array<{
    id: string;
    title: string;
    description: string | null;
    trigger: import("@prisma/client").PatientRewardTrigger;
    grantedAt: Date | null;
    issuerType: import("@prisma/client").RewardIssuerType;
    issuerDoctor?: { fullName: string } | null;
  }>;
} & NonNullable<Awaited<ReturnType<typeof prisma.patient.findUnique>>>;

async function getPatientFromInitData(
  initDataRaw: string | undefined
): Promise<{ patient: PatientWithDoctor | null; error?: AuthError }> {
  const initData = initDataRaw?.trim();
  if (!initData) return { patient: null, error: "no_init_data" };
  if (!botToken) return { patient: null, error: "no_bot_token" };

  const validated = validateTelegramInitData(initData, botToken);
  if (!validated) return { patient: null, error: "invalid_init_data" };

  const tgUser = parseTelegramUser(initData);
  if (!tgUser) return { patient: null, error: "invalid_init_data" };

  const patient = await prisma.patient.findUnique({
    where: { telegramId: BigInt(tgUser.id) },
    include: {
      doctor: { select: { fullName: true } },
      visits: { orderBy: { createdAt: "desc" }, take: 30, include: { medals: { orderBy: { createdAt: "asc" } } } },
      rewards: { orderBy: { createdAt: "asc" }, include: patientRewardInclude },
    },
  });

  if (!patient) return { patient: null, error: "patient_not_found" };
  return { patient };
}

const AUTH_MESSAGES: Record<AuthError, string> = {
  no_init_data: "Нет данных Telegram. Откройте Mini App через кнопку бота, не по прямой ссылке.",
  no_bot_token: "На сервере не задан TELEGRAM_BOT_TOKEN.",
  invalid_init_data: "Не удалось проверить подпись Telegram. Перезапустите npm run dev после смены токена бота.",
  patient_not_found: "Сначала нажмите /start в боте Restart Clinic.",
};

export async function patientRoutes(app: FastifyInstance) {
  const handleMe = async (
    req: FastifyRequest<{ Body?: { initData?: string } }>,
    reply: FastifyReply
  ) => {
    const initData =
      req.body?.initData ??
      (req.headers["x-telegram-init-data"] as string | undefined);

    const { patient, error } = await getPatientFromInitData(initData);
    if (!patient) {
      return reply.status(401).send({
        error: error ?? "Unauthorized",
        message: AUTH_MESSAGES[error ?? "invalid_init_data"],
      });
    }

    if (!patient.hasAppAccess) {
      return reply.status(403).send({
        error: "access_denied",
        message: "Доступ к Mini App ещё не открыт. Дождитесь подтверждения администратора.",
      });
    }

    const stage = toRehabStage(patient.stage);
    const stats = {
      endurance: patient.endurance,
      ligaments: patient.ligaments,
      balance: patient.balance,
    };

    const imageIndex = getCharacterImageIndex(stage, stats);
    const disciplinePercent = patient.scheduledVisits > 0 
      ? (patient.completedVisits / patient.scheduledVisits) * 100 
      : 100;
    const isBad = disciplinePercent < 50;

    const courseTotal = getCourseVisitTotal(
      patient.targetVisits,
      patient.scheduledVisits,
      patient.completedVisits
    );
    const medalQuotas = calculateMedalQuotas(courseTotal);
    const medalUsed = await getPatientMedalUsage(patient.id);

    return {
      profile: {
        fullName: patient.fullName,
        age: patient.age,
        gender: patient.gender,
        diagnosis: patient.diagnosis,
        doctorName: patient.doctor?.fullName ?? null,
      },
      journey: {
        stage,
        stageLabel: STAGE_LABELS[stage],
        courseCompleted: patient.courseCompleted,
        rewardTier: patient.rewardTier,
        motivation: getMotivationMessage(imageIndex, isBad),
        warning: isBad || (stage >= 3 && !patient.courseCompleted),
      },
      mascot: {
        imageIndex,
        stats,
        showInternalBars: stage === 3,
      },
      visits: {
        completed: patient.completedVisits,
        scheduled: patient.scheduledVisits,
        targetVisits: patient.targetVisits,
        nextVisitAt: patient.nextVisitAt,
        courseTotal,
        medalQuotas,
        medalUsed,
        history: patient.visits.map((v, index) => {
          const visitNumber = patient.completedVisits - index;
          const slotTier = getVisitSlotMedalTier(visitNumber, medalQuotas);
          const awardedMedals = formatVisitMedals(v.medals);
          return {
            id: v.id,
            title: v.title ?? `Посещение №${visitNumber}`,
            visitNumber,
            date: v.createdAt,
            note: v.note,
            medals: awardedMedals,
            slotMedal: { tier: slotTier, emoji: MEDAL_EMOJI[slotTier] },
            earned: awardedMedals.length > 0,
          };
        }),
      },
      rewards: patient.rewards.map((r) => serializePatientReward(r)),
    };
  };

  app.post<{ Body: { initData?: string } }>("/api/patient/me", handleMe);
  app.get("/api/patient/me", handleMe);
}
