import { prisma } from "@/lib/prisma";

export async function getSessionBusiness() {
  const existing = await prisma.business.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (existing) {
    return existing;
  }
  return prisma.business.create({ data: { name: "My business" } });
}
