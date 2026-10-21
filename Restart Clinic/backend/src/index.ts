import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth.js";
import { adminRoutes } from "./routes/admin.js";
import { doctorRoutes } from "./routes/doctor.js";
import { patientRoutes } from "./routes/patient.js";
import { createBot } from "./bot/index.js";
import { startNotificationJobs } from "./jobs/notifications.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT ?? 3001);
const WEBAPP_URL = process.env.WEBAPP_URL ?? "http://localhost:5173";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
});

await authRoutes(app);
await adminRoutes(app);
await doctorRoutes(app);
await patientRoutes(app);

app.get("/api/health", async () => ({ ok: true }));

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (botToken) {
  const bot = createBot(botToken, WEBAPP_URL);
  bot.start({
    onStart: () => console.log("Telegram bot started"),
  });
  startNotificationJobs();
} else {
  console.warn("TELEGRAM_BOT_TOKEN not set — bot disabled");
}

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`API listening on http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
