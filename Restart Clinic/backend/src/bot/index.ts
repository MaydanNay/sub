import { Bot, InlineKeyboard, Keyboard } from "grammy";
import { REWARD_TRIGGER_LABELS } from "@restart-clinic/shared";
import { prisma } from "../lib/prisma.js";

let botInstance: Bot | null = null;

export function getBot(): Bot | null {
  return botInstance;
}

export function createBot(token: string, webappUrl: string): Bot {
  const bot = new Bot(token);
  botInstance = bot;

  const contactKeyboard = new Keyboard()
    .requestContact("📱 Поделиться контактом")
    .resized()
    .oneTime();

  bot.command("start", async (ctx) => {
    if (!ctx.from) return;
    const telegramId = BigInt(ctx.from.id);
    let patient = await prisma.patient.findUnique({ where: { telegramId } });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          telegramId,
          telegramUsername: ctx.from.username,
        },
      });
    }

    if (patient.hasAppAccess) {
      const keyboard = new InlineKeyboard().webApp(
        "🚀 Открыть Restart Clinic",
        webappUrl
      );
      await ctx.reply(
        `С возвращением, ${patient.fullName ?? ctx.from.first_name}! Ваш персонаж ждёт вас.`,
        { reply_markup: keyboard }
      );
      return;
    }

    const keyboard = new InlineKeyboard().text(
      "📋 Записаться на консультацию",
      "apply_consultation"
    );

    await ctx.reply(
      `Добро пожаловать в Restart Clinic! 🏥\n\n` +
        `Мы поможем вам пройти путь восстановления с мотивацией и игровым прогрессом.\n\n` +
        `Доступ к приложению откроется после первичной консультации.\n\n` +
        `Нажмите кнопку ниже, чтобы оставить заявку.`,
      { reply_markup: keyboard }
    );
  });

  bot.callbackQuery("apply_consultation", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      "Для записи поделитесь номером телефона — администратор свяжется с вами.",
      { reply_markup: contactKeyboard }
    );
  });

  bot.on("message:contact", async (ctx) => {
    if (!ctx.from) return;
    const contact = ctx.message.contact;
    if (!contact || contact.user_id !== ctx.from.id) {
      await ctx.reply("Пожалуйста, используйте кнопку «Поделиться контактом».");
      return;
    }

    const telegramId = BigInt(ctx.from.id);
    const patient = await prisma.patient.findUnique({ where: { telegramId } });
    if (!patient) {
      await ctx.reply("Нажмите /start для начала.");
      return;
    }

    const existing = await prisma.application.findUnique({
      where: { patientId: patient.id },
    });
    if (existing?.status === "PENDING") {
      await ctx.reply("Ваша заявка уже принята. Администратор свяжется с вами.");
      return;
    }
    if (existing?.status === "APPROVED" || patient.hasAppAccess) {
      await ctx.reply("У вас уже открыт доступ. Нажмите /start для входа в приложение.");
      return;
    }

    await prisma.patient.update({
      where: { id: patient.id },
      data: { phone: contact.phone_number },
    });

    if (existing) {
      await prisma.application.update({
        where: { patientId: patient.id },
        data: {
          phone: contact.phone_number,
          telegramUsername: ctx.from.username,
          status: "PENDING",
        },
      });
    } else {
      await prisma.application.create({
        data: {
          patientId: patient.id,
          phone: contact.phone_number,
          telegramUsername: ctx.from.username,
          status: "PENDING",
        },
      });
    }

    await ctx.reply(
      "✅ Заявка отправлена!\n\nАдминистратор Restart Clinic свяжется с вами для назначения первичного приёма.",
      { reply_markup: { remove_keyboard: true } }
    );
  });

  bot.catch((err) => console.error("Bot error:", err));

  return bot;
}

function formatAppointmentDate(date: Date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function notifyPatientAccessGranted(
  bot: Bot,
  telegramId: bigint,
  webappUrl: string,
  nextVisitAt?: Date
) {
  const keyboard = new InlineKeyboard().webApp(
    "🚀 Открыть Restart Clinic",
    webappUrl
  );
  const appointmentLine = nextVisitAt
    ? `\n\n📅 Первичный приём: ${formatAppointmentDate(nextVisitAt)}`
    : "";
  await bot.api.sendMessage(
    Number(telegramId),
    `🎉 Доступ открыт!\n\nАдминистратор оформил вашу карточку.${appointmentLine}\n\nЗапускайте Mini App и начинайте путь героя!`,
    { reply_markup: keyboard }
  );
}

export async function notifyRewardGranted(
  bot: Bot,
  telegramId: bigint,
  title: string,
  trigger: string
) {
  const triggerLabel =
    REWARD_TRIGGER_LABELS[trigger as keyof typeof REWARD_TRIGGER_LABELS] ?? trigger;
  await bot.api.sendMessage(
    Number(telegramId),
    `🎁 Вы получили приз!\n\n«${title}»\n\nЗа: ${triggerLabel}`
  );
}

export async function notifyAppointmentScheduled(
  bot: Bot,
  telegramId: bigint,
  date: Date
) {
  await bot.api.sendMessage(
    Number(telegramId),
    `📅 Назначен приём: ${formatAppointmentDate(date)}\n\nЖдём вас в Restart Clinic!`
  );
}

export async function notifyVisitRecorded(
  bot: Bot,
  telegramId: bigint,
  stats: { endurance: number; ligaments: number; balance: number }
) {
  await bot.api.sendMessage(
    Number(telegramId),
    `💪 Врач отметил ваше посещение!\n\n` +
      `Выносливость: ${stats.endurance}%\n` +
      `Сила связок: ${stats.ligaments}%\n` +
      `Баланс: ${stats.balance}%`
  );
}

export async function notifyAppointmentReminder(
  bot: Bot,
  telegramId: bigint,
  date: Date
) {
  await bot.api.sendMessage(
    Number(telegramId),
    `📅 Завтра у вас тренировка (${formatAppointmentDate(date)}). Ваш персонаж готов к прокачке!`
  );
}

export async function notifyInactivePatient(bot: Bot, telegramId: bigint) {
  const nightmares = await prisma.pushNotification.findMany({ where: { type: "NIGHTMARE" } });
  let text = `⚠️ Вы давно не были на реабилитации. Ваши показатели выносливости начали падать. Запишитесь на приём!`;
  if (nightmares.length > 0) {
    const random = nightmares[Math.floor(Math.random() * nightmares.length)];
    text = random.text;
  }
  await bot.api.sendMessage(Number(telegramId), text);
}
