import type { VisitMedalTier } from "@prisma/client";
import { prisma } from "./prisma.js";
import {
  calculateMedalQuotas,
  getCourseVisitTotal,
  MEDAL_EMOJI,
  validateVisitMedals,
  type MedalTier as SharedMedalTier,
} from "@restart-clinic/shared";

export { MEDAL_EMOJI };

export function toSharedMedalTier(tier: VisitMedalTier): SharedMedalTier {
  return tier as SharedMedalTier;
}

export async function getPatientMedalUsage(patientId: string) {
  const grouped = await prisma.visitMedal.groupBy({
    by: ["tier"],
    where: { visit: { patientId } },
    _count: { _all: true },
  });

  const used: Record<VisitMedalTier, number> = { BRONZE: 0, SILVER: 0, GOLD: 0 };
  for (const row of grouped) {
    used[row.tier] = row._count._all;
  }
  return used;
}

export async function getPatientMedalQuotas(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { targetVisits: true, scheduledVisits: true, completedVisits: true },
  });
  if (!patient) return { quotas: { BRONZE: 0, SILVER: 0, GOLD: 0 }, total: 0 };

  const total = getCourseVisitTotal(
    patient.targetVisits,
    patient.scheduledVisits,
    patient.completedVisits
  );
  return { quotas: calculateMedalQuotas(total), total };
}

export async function validatePatientVisitMedals(patientId: string, medals: VisitMedalTier[]) {
  const [{ quotas }, used] = await Promise.all([
    getPatientMedalQuotas(patientId),
    getPatientMedalUsage(patientId),
  ]);
  return validateVisitMedals(
    medals as SharedMedalTier[],
    used as Record<SharedMedalTier, number>,
    quotas
  );
}

export function formatVisitMedals(medals: Array<{ tier: VisitMedalTier }>) {
  return medals.map((m) => ({
    tier: m.tier,
    emoji: MEDAL_EMOJI[m.tier as SharedMedalTier],
  }));
}
