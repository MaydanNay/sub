import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify, { type FastifyInstance } from "fastify";
import jwt from "@fastify/jwt";
import { Prisma } from "@prisma/client";
import { registerErrorHandler } from "./errors.js";
import { HttpError } from "./validation.js";
import { authRoutes } from "../routes/auth.js";
import { adminRoutes } from "../routes/admin.js";
import { doctorRoutes } from "../routes/doctor.js";

// No database here: every request below must be rejected by validation
// before any Prisma query runs.
describe("error handling and validation", () => {
  let app: FastifyInstance;
  let adminToken: string;
  let doctorToken: string;

  before(async () => {
    app = Fastify();
    registerErrorHandler(app);
    await app.register(jwt, { secret: "test" });
    await authRoutes(app);
    await adminRoutes(app);
    await doctorRoutes(app);
    app.get("/boom/http", async () => {
      throw new HttpError(418, "teapot");
    });
    app.get("/boom/p2025", async () => {
      throw new Prisma.PrismaClientKnownRequestError("missing", { code: "P2025", clientVersion: "x" });
    });
    app.get("/boom/unknown", async () => {
      throw new Error("secret internals");
    });
    await app.ready();
    adminToken = app.jwt.sign({ sub: "a", role: "ADMIN", email: "a@x", name: "A" });
    doctorToken = app.jwt.sign({ sub: "d", role: "DOCTOR", email: "d@x", name: "D" });
  });

  after(() => app.close());

  const send = (method: "POST" | "PATCH", url: string, token: string | null, payload?: unknown) =>
    app.inject({
      method,
      url,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      ...(payload === undefined ? {} : { payload: payload as Record<string, unknown> }),
    });

  it("login without body -> 400 instead of TypeError 500", async () => {
    const res = await send("POST", "/api/auth/login", null);
    assert.equal(res.statusCode, 400);
    assert.ok(res.json().error);
  });

  it("doctor without password -> 400 (was silent default 'doctor123')", async () => {
    const res = await send("POST", "/api/admin/doctors", adminToken, { email: "d@x.kz", fullName: "D" });
    assert.equal(res.statusCode, 400);
    assert.match(res.json().error, /password/);
  });

  it("patient PATCH rejects non-whitelisted fields (mass assignment)", async () => {
    const res = await send("PATCH", "/api/admin/patients/p1", adminToken, { hasAppAccess: true });
    assert.equal(res.statusCode, 400);
  });

  it("patient create rejects non-numeric telegramId (was BigInt SyntaxError 500)", async () => {
    const res = await send("POST", "/api/admin/patients", adminToken, {
      fullName: "P", age: 30, gender: "MALE", diagnosis: "x", doctorId: "d", telegramId: "abc",
    });
    assert.equal(res.statusCode, 400);
    assert.match(res.json().error, /telegramId/);
  });

  it("approve rejects bad date", async () => {
    const res = await send("POST", "/api/admin/applications/a1/approve", adminToken, {
      fullName: "P", age: 30, gender: "MALE", diagnosis: "x", doctorId: "d", nextVisitAt: "not-a-date",
    });
    assert.equal(res.statusCode, 400);
  });

  it("empty push notification text -> 400", async () => {
    const res = await send("POST", "/api/admin/push-notifications", adminToken, { text: "   " });
    assert.equal(res.statusCode, 400);
  });

  it("stage outside 1..4 -> 400", async () => {
    const res = await send("PATCH", "/api/doctor/patients/p1/stage", doctorToken, { stage: 7 });
    assert.equal(res.statusCode, 400);
  });

  it("negative target visits -> 400", async () => {
    const res = await send("PATCH", "/api/doctor/patients/p1/target-visits", doctorToken, { targetVisits: -3 });
    assert.equal(res.statusCode, 400);
  });

  it("unknown medal tier -> 400", async () => {
    const res = await send("POST", "/api/doctor/patients/p1/visit", doctorToken, { medals: ["PLATINUM"] });
    assert.equal(res.statusCode, 400);
  });

  it("role checks still run before validation", async () => {
    const res = await send("POST", "/api/admin/doctors", doctorToken, {});
    assert.equal(res.statusCode, 403);
  });

  it("maps HttpError, Prisma P2025 and hides unknown errors", async () => {
    const http = await app.inject({ method: "GET", url: "/boom/http" });
    assert.deepEqual([http.statusCode, http.json().error], [418, "teapot"]);
    const p2025 = await app.inject({ method: "GET", url: "/boom/p2025" });
    assert.equal(p2025.statusCode, 404);
    const unknown = await app.inject({ method: "GET", url: "/boom/unknown" });
    assert.equal(unknown.statusCode, 500);
    assert.doesNotMatch(unknown.body, /secret internals/);
  });

  it("malformed JSON -> 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      headers: { "content-type": "application/json" },
      payload: "{bad",
    });
    assert.equal(res.statusCode, 400);
  });
});
