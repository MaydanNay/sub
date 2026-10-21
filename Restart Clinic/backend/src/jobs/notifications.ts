import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import {
  getBot,
  notifyAppointmentReminder,
  notifyInactivePatient,
} from "../bot/index.js";

const INACTIVE_DAYS = Number(process.env.INACTIVE_DAYS_THRESHOLD ?? 7);

export function startNotificationJobs() {
  cron.schedule("0 9 * * *", async () => {
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
      try {
        if (p.nextVisitAt) {
          await notifyAppointmentReminder(bot, p.telegramId, p.nextVisitAt);
        }
      } catch (e) {
        console.error("Reminder failed for", p.id, e);
      }
    }
  });

  cron.schedule("0 10 * * *", async () => {
    const bot = getBot();
    if (!bot) return;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - INACTIVE_DAYS);

    const patients = await prisma.patient.findMany({
      where: {
        hasAppAccess: true,
        courseCompleted: false,
      },
      include: {
        visits: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    for (const p of patients) {
      const lastVisit = p.visits[0]?.createdAt;
      if (lastVisit && lastVisit > cutoff) continue;
      if (!lastVisit && p.createdAt > cutoff) continue;

      try {
        await notifyInactivePatient(bot, p.telegramId);
      } catch (e) {
        console.error("Inactive notify failed for", p.id, e);
      }
    }
  });

  console.log("Notification cron jobs started");
}
