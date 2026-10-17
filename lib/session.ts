import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSessionBusiness = cache(async () => {
  const existing = await prisma.business.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (existing) {
    return existing;
  }
  return prisma.business.create({ data: { name: "My business" } });
});
