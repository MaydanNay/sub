export type UserRole = "PATIENT" | "ADMIN" | "DOCTOR";

export type RehabStage = 1 | 2 | 3 | 4;

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type RewardTier = "NONE" | "BRONZE" | "SILVER" | "GOLD";

export type Gender = "MALE" | "FEMALE";

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Мужской",
  FEMALE: "Женский",
};

export function genderLabel(gender: Gender | string | null | undefined): string {
  if (gender === "MALE") return GENDER_LABELS.MALE;
  if (gender === "FEMALE") return GENDER_LABELS.FEMALE;
  return "—";
}

export type MascotVariant =
  | "STAGE1_SICK"
  | "STAGE2_RECOVERING"
  | "STAGE3_ILLUSION"
  | "STAGE4_HEALTHY";

export interface PatientStats {
  endurance: number;
  ligaments: number;
  balance: number;
}

export const STAGE_LABELS: Record<RehabStage, string> = {
  1: "Стабилизация",
  2: "Восстановление",
  3: "Иллюзия здоровья",
  4: "Полное восстановление",
};

export type PatientRewardTrigger =
  | "STAGE_1"
  | "STAGE_2"
  | "STAGE_3"
  | "STAGE_4"
  | "COURSE_COMPLETE";

export const REWARD_TRIGGER_LABELS: Record<PatientRewardTrigger, string> = {
  STAGE_1: "Этап 1 — Стабилизация",
  STAGE_2: "Этап 2 — Восстановление",
  STAGE_3: "Этап 3 — Иллюзия здоровья",
  STAGE_4: "Этап 4 — Полное восстановление",
  COURSE_COMPLETE: "Завершение лечения",
};

export function calculateDisciplinePercent(
  scheduledVisits: number,
  completedVisits: number
): number {
  if (scheduledVisits === 0) return 0;
  const percent = Math.round((completedVisits / scheduledVisits) * 100);
  return Math.min(100, percent);
}

export function calculateRewardTier(disciplinePercent: number): RewardTier {
  if (disciplinePercent >= 95) return "GOLD";
  if (disciplinePercent >= 85) return "SILVER";
  if (disciplinePercent >= 70) return "BRONZE";
  return "NONE";
}

export type MedalTier = "BRONZE" | "SILVER" | "GOLD";

export const MEDAL_EMOJI: Record<MedalTier, string> = {
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
};

export const MAX_MEDALS_PER_VISIT = 10;

export const MEDAL_SHARES: Record<MedalTier, number> = {
  BRONZE: 0.3,
  SILVER: 0.3,
  GOLD: 0.4,
};

const MEDAL_TIERS: MedalTier[] = ["BRONZE", "SILVER", "GOLD"];

/** Квота медалей на весь курс: 30% бронза, 30% серебро, 40% золото (сумма = totalVisits) */
export function calculateMedalQuotas(totalVisits: number): Record<MedalTier, number> {
  if (totalVisits <= 0) return { BRONZE: 0, SILVER: 0, GOLD: 0 };

  const exact = {
    BRONZE: totalVisits * MEDAL_SHARES.BRONZE,
    SILVER: totalVisits * MEDAL_SHARES.SILVER,
    GOLD: totalVisits * MEDAL_SHARES.GOLD,
  };

  const result: Record<MedalTier, number> = {
    BRONZE: Math.floor(exact.BRONZE),
    SILVER: Math.floor(exact.SILVER),
    GOLD: Math.floor(exact.GOLD),
  };

  let remaining = totalVisits - result.BRONZE - result.SILVER - result.GOLD;
  const byRemainder = MEDAL_TIERS.map((tier) => ({
    tier,
    remainder: exact[tier] - Math.floor(exact[tier]),
  })).sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < remaining; i++) {
    result[byRemainder[i].tier]++;
  }

  return result;
}

export function getCourseVisitTotal(
  targetVisits: number | null | undefined,
  scheduledVisits: number,
  completedVisits: number
): number {
  const planned = targetVisits ?? scheduledVisits;
  return Math.max(planned, completedVisits);
}

export function countMedalsByTier(medals: MedalTier[]): Record<MedalTier, number> {
  const counts: Record<MedalTier, number> = { BRONZE: 0, SILVER: 0, GOLD: 0 };
  for (const tier of medals) counts[tier]++;
  return counts;
}

export function validateVisitMedals(
  newMedals: MedalTier[],
  used: Record<MedalTier, number>,
  quotas: Record<MedalTier, number>
): string | null {
  if (newMedals.length > MAX_MEDALS_PER_VISIT) {
    return `На одно посещение можно выдать не более ${MAX_MEDALS_PER_VISIT} медалей`;
  }

  const adding = countMedalsByTier(newMedals);
  for (const tier of MEDAL_TIERS) {
    if (used[tier] + adding[tier] > quotas[tier]) {
      return `Превышена квота медалей «${tier}» (${quotas[tier]} на весь курс)`;
    }
  }

  return null;
}

/** Какая медаль соответствует посещению №N в раскладке 30/30/40 */
export function getVisitSlotMedalTier(
  visitNumber: number,
  quotas: Record<MedalTier, number>
): MedalTier {
  if (visitNumber <= quotas.BRONZE) return "BRONZE";
  if (visitNumber <= quotas.BRONZE + quotas.SILVER) return "SILVER";
  return "GOLD";
}

export function mascotVariantForStage(stage: RehabStage): MascotVariant {
  switch (stage) {
    case 1:
      return "STAGE1_SICK";
    case 2:
      return "STAGE2_RECOVERING";
    case 3:
      return "STAGE3_ILLUSION";
    case 4:
      return "STAGE4_HEALTHY";
  }
}

export function visitsUntilMascotUpgrade(visitCount: number): number {
  const cycle = visitCount % 3;
  return cycle === 0 ? 3 : 3 - cycle;
}

export function averageStats(stats: PatientStats): number {
  return Math.round((stats.endurance + stats.ligaments + stats.balance) / 3);
}

/** Максимум средних статов на этапе (этап 3 — «иллюзия», потолок 50%) */
export function getStageStatMax(stage: RehabStage): number {
  return stage === 3 ? 50 : 100;
}

/** Прогресс внутри этапа: 0–100% относительно потолка этапа */
export function getStageProgressPercent(stage: RehabStage, stats: PatientStats): number {
  const max = getStageStatMax(stage);
  if (max <= 0) return 0;
  return Math.min(100, Math.round((averageStats(stats) / max) * 100));
}

/** Подуровень внутри этапа: 25 / 50 / 75 / 100% прогресса этапа */
export function getStageSubLevel(stageProgressPercent: number): 1 | 2 | 3 | 4 {
  if (stageProgressPercent >= 75) return 4;
  if (stageProgressPercent >= 50) return 3;
  if (stageProgressPercent >= 25) return 2;
  return 1;
}

/** Номер картинки персонажа (1–16): 4 этапа × 4 подуровня по % этапа */
export function getCharacterImageIndex(stage: RehabStage, stats: PatientStats): number {
  const progress = getStageProgressPercent(stage, stats);
  const subLevel = getStageSubLevel(progress);
  const index = (stage - 1) * 4 + subLevel;
  return Math.min(16, Math.max(1, index));
}

export function getMotivationMessage(level: number, isBad: boolean): string {
  if (isBad) {
    if (level <= 4) return "Ваши показатели ухудшаются! Если вы будете пропускать занятия, в суставе образуются спайки, и он навсегда потеряет подвижность!";
    if (level <= 8) return "Внимание! Мышцы стремительно атрофируются без регулярной нагрузки. Если вы остановитесь сейчас, хромота останется с вами навсегда!";
    if (level <= 12) return "КРИТИЧЕСКИЙ РИСК РЕЦИДИВА! Вы не чувствуете боли, но связки сейчас как тонкие нитки. При малейшем неловком движении они порвутся снова, и понадобится повторная операция!";
    return "Вы в шаге от выздоровления, но теряете дисциплину! Слабость мышц-стабилизаторов может перечеркнуть месяцы реабилитации и привести к хронической нестабильности!";
  }

  const messages: Record<number, string> = {
    1: "Начало пути. Главное сейчас — снять отек и боль. Слушайте врача и берегите сустав.",
    2: "Отек постепенно уходит. Мы начинаем легкие движения для восстановления подвижности.",
    3: "Сустав привыкает к небольшим нагрузкам. Не спешите, связки еще очень слабые.",
    4: "Отличная работа! Первичная стабилизация пройдена, готовимся к переходу на следующий этап.",
    5: "Связки начали срастаться. Теперь наша цель — вернуть полный объем движений.",
    6: "Мы добавляем силовые упражнения. Возможно легкое чувство стянутости, это нормально.",
    7: "Мышцы вокруг сустава крепнут. Они скоро возьмут на себя часть нагрузки.",
    8: "Второй этап почти завершен! Ваш сустав уже значительно стабильнее.",
    9: "Опасный этап «Иллюзия выздоровления». Боли нет, но новые ткани еще рыхлые. Берегите сустав!",
    10: "Продолжаем укреплять сухожилия. Избегайте резких скручиваний и прыжков.",
    11: "Ткани становятся плотнее. Риск повторного разрыва снижается, но всё ещё присутствует.",
    12: "Вы молодец! Самый коварный этап позади, связки обрели нужную жесткость.",
    13: "Финальный этап! Начинаем подготовку к полноценным нагрузкам и бегу.",
    14: "Добавляем прыжковую и взрывную нагрузку. Сустав готов к серьезным испытаниям.",
    15: "Вы почти вернулись в свою лучшую форму. Баланс и координация восстановлены.",
    16: "Поздравляем! Ваш сустав полностью здоров. Вы готовы к возвращению в спорт и активной жизни!"
  };

  return messages[level] || messages[16];
}
