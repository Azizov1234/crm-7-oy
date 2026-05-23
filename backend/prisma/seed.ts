import { PrismaClient, Status, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for seed.");
}

const SUPERADMIN_FULL_NAME =
  process.env.SEED_SUPERADMIN_FULL_NAME ?? "Super Admin";
const SUPERADMIN_EMAIL =
  process.env.SEED_SUPERADMIN_EMAIL ?? "superadmin@crm.uz";
const SUPERADMIN_PHONE =
  process.env.SEED_SUPERADMIN_PHONE ?? "+998900000001";
const SUPERADMIN_PASSWORD = process.env.SEED_SUPERADMIN_PASSWORD;

if (!SUPERADMIN_PASSWORD) {
  throw new Error("SEED_SUPERADMIN_PASSWORD is required in .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seed started (superadmin only)...");

  const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

  const existingCandidates = await prisma.user.findMany({
    where: {
      OR: [{ phone: SUPERADMIN_PHONE }, { email: SUPERADMIN_EMAIL }],
    },
    select: { id: true, phone: true, email: true },
  });

  if (existingCandidates.length > 1) {
    throw new Error(
      "Conflicting users found: superadmin phone/email belong to different users. Clean user table or align env values.",
    );
  }

  const superadmin =
    existingCandidates.length === 1
      ? await prisma.user.update({
          where: { id: existingCandidates[0].id },
          data: {
            full_name: SUPERADMIN_FULL_NAME,
            email: SUPERADMIN_EMAIL,
            phone: SUPERADMIN_PHONE,
            password: hashedPassword,
            role: UserRole.SUPERADMIN,
            status: Status.active,
          },
        })
      : await prisma.user.create({
          data: {
            full_name: SUPERADMIN_FULL_NAME,
            email: SUPERADMIN_EMAIL,
            phone: SUPERADMIN_PHONE,
            password: hashedPassword,
            role: UserRole.SUPERADMIN,
            status: Status.active,
          },
        });

  console.log("Seed completed.");
  console.log(`SUPERADMIN ID: ${superadmin.id}`);
  console.log(`LOGIN PHONE: ${SUPERADMIN_PHONE}`);
  console.log(`LOGIN PASSWORD: ${SUPERADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
