import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth.js";
import { adminRoutes } from "./routes/admin.js";
import { doctorRoutes } from "./routes/doctor.js";
import { patientRoutes } from "./routes/patient.js";
import { createBot, getBot } from "./bot/index.js";
import { startNotificationJobs } from "./jobs/notifications.js";
import { prisma } from "./lib/prisma.js";
import { registerErrorHandler } from "./lib/errors.js";

const PORT = Number(process.env.PORT ?? 3001);
const WEBAPP_URL = process.env.WEBAPP_URL ?? "http://localhost:5173";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  // A known fallback secret would let anyone mint staff tokens
  throw new Error("JWT_SECRET must be set in production");
}

const app = Fastify({ logger: true });
registerErrorHandler(app);

await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(jwt, {
  secret: JWT_SECRET ?? "dev-secret-change-me",
});

await authRoutes(app);
await adminRoutes(app);
await doctorRoutes(app);
await patientRoutes(app);

app.get("/api/health", async () => ({ ok: true }));

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (botToken) {
  const bot = createBot(botToken, WEBAPP_URL);
  // start() resolves only when polling stops; a bad token rejects it
  bot
    .start({ onStart: () => app.log.info("Telegram bot started") })
    .catch((err) => app.log.error(err, "Telegram bot stopped with an error"));
  startNotificationJobs(app.log);
} else {
  app.log.warn("TELEGRAM_BOT_TOKEN not set — bot disabled");
}

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

// Docker sends SIGTERM, Ctrl+C sends SIGINT
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    await getBot()?.stop();
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}
