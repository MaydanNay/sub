import type { PatientRewardTrigger, RewardIssuerType } from "@prisma/client";
import { REWARD_TRIGGER_LABELS } from "@restart-clinic/shared";

const VALID_TRIGGERS: PatientRewardTrigger[] = [
  "STAGE_1",
  "STAGE_2",
  "STAGE_3",
  "STAGE_4",
  "COURSE_COMPLETE",
];

export function validateRewardInput(body: {
  title?: string;
  description?: string;
  trigger?: PatientRewardTrigger;
}) {
  const title = body.title?.trim();
  if (!title) return { error: "Укажите название приза" as const };
  if (title.length > 120) return { error: "Название приза слишком длинное" as const };

  const description = body.description?.trim() || null;
  if (description && description.length > 500) {
    return { error: "Описание приза слишком длинное" as const };
  }

  if (!body.trigger || !VALID_TRIGGERS.includes(body.trigger)) {
    return { error: "Некорректный этап для приза" as const };
  }

  return { title, description, trigger: body.trigger };
}

export function formatRewardSourceLabel(
  issuerType: RewardIssuerType,
  doctorName?: string | null
) {
  if (issuerType === "ADMIN") return "От Restart Clinic";
  return doctorName ? `От врача ${doctorName}` : "От врача";
}

export function serializePatientReward(reward: {
  id: string;
  title: string;
  description: string | null;
  trigger: PatientRewardTrigger;
  grantedAt: Date | null;
  issuerType: RewardIssuerType;
  issuerDoctor?: { fullName: string } | null;
}) {
  return {
    id: reward.id,
    title: reward.title,
    description: reward.description,
    trigger: reward.trigger,
    triggerLabel: REWARD_TRIGGER_LABELS[reward.trigger],
    grantedAt: reward.grantedAt,
    earned: reward.grantedAt !== null,
    issuerType: reward.issuerType,
    sourceLabel: formatRewardSourceLabel(reward.issuerType, reward.issuerDoctor?.fullName),
  };
}

export const patientRewardInclude = {
  issuerDoctor: { select: { fullName: true } },
} as const;
