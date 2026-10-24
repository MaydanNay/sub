import type { FastifyError, FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { HttpError } from "./validation.js";

/** One place that turns thrown errors into `{ error }` responses the dashboard understands. */
export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err: FastifyError | Error, req, reply) => {
    if (err instanceof HttpError) {
      return reply.status(err.statusCode).send({ error: err.message });
    }
    if (err instanceof ZodError) {
      const first = err.issues[0];
      const field = first?.path.join(".");
      return reply.status(400).send({
        error: field ? `${field}: ${first.message}` : first?.message ?? "Некорректные данные",
      });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return reply.status(404).send({ error: "Запись не найдена" });
      if (err.code === "P2002") return reply.status(409).send({ error: "Запись уже существует" });
      if (err.code === "P2003") return reply.status(400).send({ error: "Связанная запись не найдена" });
    }
    // Fastify's own errors (bad JSON, 404 route, payload too large) carry a 4xx status
    const status = (err as FastifyError).statusCode;
    if (status && status < 500) {
      return reply.status(status).send({ error: err.message });
    }

    req.log.error(err);
    return reply.status(500).send({ error: "Внутренняя ошибка сервера" });
  });
}
