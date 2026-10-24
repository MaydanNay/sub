import type { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { loginBody, parse } from "../lib/validation.js";

export async function authRoutes(app: import("fastify").FastifyInstance) {
  app.post("/api/auth/login", async (req, reply) => {
    // A missing body used to throw TypeError -> 500
    const { email, password } = parse(loginBody, req.body);
    const user = await prisma.staffUser.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.status(401).send({ error: "Неверный email или пароль" });
    }
    const token = app.jwt.sign({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.fullName,
    });
    return { token, user: { id: user.id, role: user.role, fullName: user.fullName, email: user.email } };
  });

  app.get("/api/auth/me", { preHandler: [authenticate] }, async (req, reply) => {
    const payload = req.user as JwtPayload;
    const user = await prisma.staffUser.findUnique({ where: { id: payload.sub } });
    if (!user) return reply.status(404).send({ error: "User not found" });
    return { id: user.id, role: user.role, fullName: user.fullName, email: user.email };
  });
}

export interface JwtPayload {
  sub: string;
  role: "ADMIN" | "DOCTOR";
  email: string;
  name: string;
}

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}

export function requireRole(...roles: Array<"ADMIN" | "DOCTOR">) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as JwtPayload;
    if (!roles.includes(user.role)) {
      return reply.status(403).send({ error: "Forbidden" });
    }
  };
}
