import type { Gender } from "@prisma/client";

export type PatientFields = {
  fullName?: string;
  age?: number | null;
  gender?: Gender | null;
  diagnosis?: string | null;
  doctorId?: string;
};

const GENDERS: Gender[] = ["MALE", "FEMALE"];
const has = (body: object, key: string) => Object.prototype.hasOwnProperty.call(body, key);
const isBlank = (v: unknown) => v === null || v === undefined || (typeof v === "string" && v.trim() === "");

/**
 * Проверяет и нормализует поля карточки пациента.
 * required = true (одобрение заявки, создание): все поля обязательны.
 * required = false (редактирование): берутся только переданные поля, пустые значения
 * становятся null, а не "" или 0. ФИО и врача очистить нельзя.
 */
export function parsePatientFields(
  body: Record<string, unknown> | undefined,
  required: boolean
): { data: PatientFields } | { error: string } {
  const src = body ?? {};
  const data: PatientFields = {};
  const want = (key: string) => required || has(src, key);

  if (want("fullName")) {
    const v = typeof src.fullName === "string" ? src.fullName.trim() : "";
    if (!v) return { error: "Укажите ФИО" };
    if (v.length > 200) return { error: "ФИО слишком длинное" };
    data.fullName = v;
  }

  if (want("age")) {
    if (isBlank(src.age) || src.age === 0) {
      if (required) return { error: "Укажите возраст" };
      data.age = null;
    } else {
      const n = Number(src.age);
      if (!Number.isInteger(n) || n < 1 || n > 120) return { error: "Возраст должен быть от 1 до 120" };
      data.age = n;
    }
  }

  if (want("gender")) {
    if (isBlank(src.gender)) {
      if (required) return { error: "Укажите пол" };
      data.gender = null;
    } else if (GENDERS.includes(src.gender as Gender)) {
      data.gender = src.gender as Gender;
    } else {
      return { error: "Некорректный пол" };
    }
  }

  if (want("diagnosis")) {
    const v = typeof src.diagnosis === "string" ? src.diagnosis.trim() : "";
    if (!v && required) return { error: "Укажите диагноз" };
    if (v.length > 500) return { error: "Диагноз слишком длинный" };
    data.diagnosis = v || null;
  }

  if (want("doctorId")) {
    const v = typeof src.doctorId === "string" ? src.doctorId.trim() : "";
    if (!v) return { error: "Выберите врача" };
    data.doctorId = v;
  }

  return { data };
}
