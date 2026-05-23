import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleDestroy, OnModuleInit
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is required. Create a .env file and set DATABASE_URL before starting the app.",
      );
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: ["error", "warn"],
    });
  }

  async onModuleInit() {
    await this.$connect();
    Logger.log("Database connected", PrismaService.name);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    Logger.log("Database disconnected", PrismaService.name);
  }
}
