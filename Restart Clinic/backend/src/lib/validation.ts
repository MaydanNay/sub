import { z } from "zod";

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

/** Parses untrusted input; a ZodError is turned into 400 by the error handler. */
export function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data ?? {});
}

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Некорректная дата")
  .transform((v) => new Date(v));

export const gender = z.enum(["MALE", "FEMALE"]);
export const rehabStage = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

export const loginBody = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export const approveApplicationBody = z.object({
  fullName: z.string().trim().min(1),
  age: z.number().int().min(0).max(150),
  gender,
  diagnosis: z.string().trim().min(1),
  doctorId: z.string().min(1),
  nextVisitAt: isoDate.optional(),
});

export const createDoctorBody = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().min(1),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов"),
});

export const createPatientBody = z
  .object({
    fullName: z.string().trim().min(1),
    age: z.number().int().min(0).max(150),
    gender,
    diagnosis: z.string().trim().min(1),
    doctorId: z.string().min(1),
    phone: z.string().trim().min(1).optional(),
    telegramId: z.string().regex(/^\d+$/, "telegramId должен состоять из цифр").optional(),
  })
  .refine((b) => b.telegramId || b.phone, "Нужен telegramId или phone");

// Whitelist: the PATCH body used to be spread straight into prisma.update
export const updatePatientBody = z
  .object({
    fullName: z.string().trim().min(1),
    age: z.number().int().min(0).max(150),
    gender,
    diagnosis: z.string().trim().min(1),
    doctorId: z.string().min(1),
    stage: rehabStage,
    nextVisitAt: isoDate.nullable(),
  })
  .partial()
  .strict();

export const pushNotificationBody = z.object({
  text: z.string().trim().min(1, "Текст не может быть пустым"),
  type: z.enum(["NIGHTMARE", "MOTIVATIONAL", "SYSTEM"]).default("NIGHTMARE"),
});

export const visitBody = z.object({
  note: z.string().optional(),
  title: z.string().trim().max(120, "Название посещения слишком длинное").optional(),
  medals: z.array(z.enum(["BRONZE", "SILVER", "GOLD"])).default([]),
});

export const stageBody = z.object({ stage: rehabStage });
export const nextVisitBody = z.object({ nextVisitAt: isoDate });
export const targetVisitsBody = z.object({
  targetVisits: z.number().int().min(1).max(1000).nullable(),
});
