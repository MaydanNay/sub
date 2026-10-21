import type { RehabStage as PrismaStage } from "@prisma/client";
import type { RehabStage } from "@restart-clinic/shared";
import {
  calculateDisciplinePercent,
  calculateRewardTier,
  visitsUntilMascotUpgrade,
  getStageStatMax,
  averageStats,
} from "@restart-clinic/shared";

const STAGE_MAP: Record<PrismaStage, RehabStage> = {
  STAGE_1: 1,
  STAGE_2: 2,
  STAGE_3: 3,
  STAGE_4: 4,
};

const STAGE_REVERSE: Record<RehabStage, PrismaStage> = {
  1: "STAGE_1",
  2: "STAGE_2",
  3: "STAGE_3",
  4: "STAGE_4",
};

export function toRehabStage(stage: PrismaStage): RehabStage {
  return STAGE_MAP[stage];
}

export function toPrismaStage(stage: RehabStage): PrismaStage {
  return STAGE_REVERSE[stage];
}

const STAT_GAIN_PER_VISIT = 10;
const MAX_STAT = 100;

export function applyVisitProgress(patient: {
  endurance: number;
  ligaments: number;
  balance: number;
  visitCount: number;
  completedVisits: number;
  stage: PrismaStage;
}) {
  const newVisitCount = patient.visitCount + 1;
  const newCompleted = patient.completedVisits + 1;

  let endurance = Math.min(MAX_STAT, patient.endurance + STAT_GAIN_PER_VISIT);
  let ligaments = Math.min(MAX_STAT, patient.ligaments + STAT_GAIN_PER_VISIT);
  let balance = Math.min(MAX_STAT, patient.balance + STAT_GAIN_PER_VISIT);

  let stageNum = toRehabStage(patient.stage);

  const max = getStageStatMax(stageNum);
  const avg = averageStats({ endurance, ligaments, balance });

  if (avg >= max && stageNum < 4) {
    stageNum = (stageNum + 1) as RehabStage;
    endurance = 0;
    ligaments = 0;
    balance = 0;
  } else if (stageNum === 3) {
    endurance = Math.min(50, endurance);
    ligaments = Math.min(50, ligaments);
    balance = Math.min(50, balance);
  }

  return {
    visitCount: newVisitCount,
    completedVisits: newCompleted,
    stage: toPrismaStage(stageNum),
    endurance,
    ligaments,
    balance,
  };
}

export function getDisciplineAndReward(scheduled: number, completed: number) {
  const percent = calculateDisciplinePercent(scheduled, completed);
  return { percent, tier: calculateRewardTier(percent) };
}

export { visitsUntilMascotUpgrade };
