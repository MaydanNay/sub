import type { PatientRewardTrigger, RehabStage } from "@prisma/client";
import { prisma } from "./prisma.js";
import type { Bot } from "grammy";
import { notifyRewardGranted } from "../bot/index.js";

const TRIGGER_STAGE: Record<PatientRewardTrigger, RehabStage | null> = {
  STAGE_1: "STAGE_1",
  STAGE_2: "STAGE_2",
  STAGE_3: "STAGE_3",
  STAGE_4: "STAGE_4",
  COURSE_COMPLETE: null,
};

const STAGE_ORDER: Record<RehabStage, number> = {
  STAGE_1: 1,
  STAGE_2: 2,
  STAGE_3: 3,
  STAGE_4: 4,
};

function isRewardEligible(
  trigger: PatientRewardTrigger,
  stage: RehabStage,
  courseCompleted: boolean
) {
  if (trigger === "COURSE_COMPLETE") return courseCompleted;
  if (trigger === "STAGE_4") return stage === "STAGE_4";
  const required = TRIGGER_STAGE[trigger];
  if (!required) return false;
  // Приз за этап N выдаётся после его прохождения (переход на следующий этап)
  return STAGE_ORDER[stage] > STAGE_ORDER[required];
}

export async function grantEligibleRewards(patientId: string, bot?: Bot | null) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      rewards: { where: { grantedAt: null }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!patient) return [];

  const granted: Array<{ id: string; title: string; trigger: PatientRewardTrigger }> = [];
  const now = new Date();

  for (const reward of patient.rewards) {
    if (!isRewardEligible(reward.trigger, patient.stage, patient.courseCompleted)) {
      continue;
    }

    const result = await prisma.patientReward.updateMany({
      where: { id: reward.id, grantedAt: null },
      data: { grantedAt: now },
    });
    if (result.count === 0) continue;

    granted.push({ id: reward.id, title: reward.title, trigger: reward.trigger });

    if (bot) {
      try {
        await notifyRewardGranted(bot, patient.telegramId, reward.title, reward.trigger);
      } catch (err) {
        // notification failure should not block grant
        console.warn(`Reward notification failed for patient ${patient.id}`, err);
      }
    }
  }

  return granted;
}
