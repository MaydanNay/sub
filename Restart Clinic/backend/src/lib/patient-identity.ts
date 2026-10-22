import { prisma } from "./prisma.js";

// Реальные Telegram ID положительные и пока < 10^10. Пациенты, созданные админом
// без telegramId, получают отрицательный временный ID (раньше — Date.now() ≈ 1.7·10^12).
const LEGACY_PLACEHOLDER_MIN = 1_000_000_000_000n;

export function isPlaceholderTelegramId(id: bigint) {
  return id <= 0n || id >= LEGACY_PLACEHOLDER_MIN;
}

export function makePlaceholderTelegramId() {
  return -(BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000)));
}

// Последние 10 цифр: "+7 701 123-45-67", "87011234567" и "77011234567" совпадут.
export function phoneKey(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
}

/**
 * Пациент, созданный админом по телефону, получает настоящий telegramId,
 * когда человек делится тем же номером в боте. Иначе бот создал бы дубль.
 */
export async function linkPlaceholderPatientByPhone(
  telegramId: bigint,
  phone: string,
  telegramUsername?: string
) {
  const key = phoneKey(phone);
  if (!key) return null;

  const candidates = await prisma.patient.findMany({
    where: {
      phone: { not: null },
      OR: [{ telegramId: { lte: 0n } }, { telegramId: { gte: LEGACY_PLACEHOLDER_MIN } }],
    },
  });
  const match = candidates.find((p) => phoneKey(p.phone) === key);
  if (!match) return null;

  return prisma.patient.update({
    where: { id: match.id },
    data: { telegramId, telegramUsername: telegramUsername ?? match.telegramUsername },
  });
}
