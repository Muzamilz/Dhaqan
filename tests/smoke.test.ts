import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestPrisma, truncateAllTables } from "./helpers/db";

const prisma = createTestPrisma();

beforeEach(async () => {
  await truncateAllTables(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("database test harness", () => {
  it("round-trips a User row through the migrated schema", async () => {
    const created = await prisma.user.create({
      data: { email: "smoke@dhaqan.test", name: "Smoke" },
    });

    const found = await prisma.user.findUnique({ where: { id: created.id } });

    expect(found).toEqual(created);
  });

  it("enforces the unique email constraint", async () => {
    await prisma.user.create({ data: { email: "duplicate@dhaqan.test" } });

    await expect(
      prisma.user.create({ data: { email: "duplicate@dhaqan.test" } }),
    ).rejects.toThrow();
  });
});
