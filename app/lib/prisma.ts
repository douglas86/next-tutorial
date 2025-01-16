import { PrismaClient } from "@prisma/client";
import { fieldEncryptionExtension } from "prisma-field-encryption";

const prismaClient = new PrismaClient();

export const prisma = prismaClient.$extends(
  fieldEncryptionExtension({
    encryptionKey: process.env.PRISMA_PRISMA_ENCRYPTION_KEY,
  }),
);

// const globalForPrisma = global as unknown as { prisma: PrismaClient };
//
// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ["query", "info", "warn", "error"],
//   });
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
