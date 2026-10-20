import { PrismaPg } from "@prisma/adapter-pg";
import "server-only";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_PRISMA_URL is not configured");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
