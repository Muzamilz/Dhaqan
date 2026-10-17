import { inject } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

export function createTestPrisma(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: inject("dbUrl") });
  return new PrismaClient({ adapter });
}

export async function truncateAllTables(prisma: PrismaClient): Promise<void> {
  const rows = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  if (rows.length === 0) {
    return;
  }
  const tables = rows
    .map((row) => `"public"."${row.tablename}"`)
    .join(", ");
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`,
  );
}
