import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@restart-clinic.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const doctorHash = await bcrypt.hash("doctor123", 10);

  await prisma.staffUser.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      fullName: "Администратор",
      role: "ADMIN",
    },
    update: {},
  });

  await prisma.staffUser.upsert({
    where: { email: "doctor@restart-clinic.local" },
    create: {
      email: "doctor@restart-clinic.local",
      passwordHash: doctorHash,
      fullName: "Др. Иванов",
      role: "DOCTOR",
    },
    update: {},
  });

  console.log("Seed complete:");
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
  console.log("  Doctor: doctor@restart-clinic.local / doctor123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
