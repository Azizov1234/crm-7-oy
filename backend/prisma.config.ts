import { defineConfig } from "prisma/config";
import "dotenv/config";

const fallbackDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/crm?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Keep Prisma Client generation working even before local .env is created.
    url: process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  },
});
