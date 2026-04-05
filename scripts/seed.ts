import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Family code
  await db.familyCode.upsert({
    where: { code: "XX" },
    update: {},
    create: { code: "XX", name: "Misc / Private Label" },
  });
  console.log("✓ Family code XX created");

  // Admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  await db.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash: adminHash, role: "admin" },
  });
  console.log("✓ Admin user created (admin / admin123)");

  // Test user
  const userHash = await bcrypt.hash("user123", 12);
  await db.user.upsert({
    where: { username: "testuser" },
    update: {},
    create: { username: "testuser", passwordHash: userHash, role: "user" },
  });
  console.log("✓ Test user created (testuser / user123)");

  console.log("\nSeed complete. Change passwords before deploying to production!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
