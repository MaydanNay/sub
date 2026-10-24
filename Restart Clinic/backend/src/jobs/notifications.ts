import cron from "node-cron";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "../lib/prisma.js";
import {
  getBot,
  notifyAppointmentReminder,
  notifyInactivePatient,
} from "../bot/index.js";

const INACTIVE_DAYS = Number(process.env.INACTIVE_DAYS_THRESHOLD ?? 7);

/**
 * node-cron does not await or catch async callbacks: a rejected promise
 * (e.g. DB down) became an unhandledRejection and could kill the process.
 */
function schedule(expr: string, name: string, log: FastifyBaseLogger, job: () => Promise<void>) {
  cron.schedule(expr, () => {
    job().catch((err) => log.error(err, `Cron job "${name}" failed`));
  });
}

// Messages go out one by one on purpose: Telegram limits bots to ~30 msg/s,
// and a failure for one patient must not stop the rest.
export function startNotificationJobs(log: FastifyBaseLogger) {
  schedule("0 9 * * *", "appointment-reminders", log, async () => {
    const bot = getBot();
    if (!bot) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tomorrow);
    end.setHours(23, 59, 59, 999);

    const patients = await prisma.patient.findMany({
      where: {
        hasAppAccess: true,
        courseCompleted: false,
        nextVisitAt: { gte: start, lte: end },
      },
    });

    for (const p of patients) {
      if (!p.nextVisitAt) continue;
      try {
        await notifyAppointmentReminder(bot, p.telegramId, p.nextVisitAt);
      } catch (err) {
        log.warn(err, `Reminder failed for patient ${p.id}`);
      }
    }
  });

  schedule("0 10 * * *", "inactive-patients", log, async () => {
    const bot = getBot();
    if (!bot) return;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - INACTIVE_DAYS);

    const [patients, nightmares] = await Promise.all([
      prisma.patient.findMany({
        where: { hasAppAccess: true, courseCompleted: false },
        include: { visits: { orderBy: { createdAt: "desc" }, take: 1 } },
      }),
      // Loaded once instead of once per patient
      prisma.pushNotification.findMany({ where: { type: "NIGHTMARE" } }),
    ]);
    const texts = nightmares.map((n) => n.text);

    for (const p of patients) {
      const lastVisit = p.visits[0]?.createdAt;
      if (lastVisit && lastVisit > cutoff) continue;
      if (!lastVisit && p.createdAt > cutoff) continue;

      try {
        await notifyInactivePatient(bot, p.telegramId, texts);
      } catch (err) {
        log.warn(err, `Inactive notify failed for patient ${p.id}`);
      }
    }
  });

  log.info("Notification cron jobs started");
}
