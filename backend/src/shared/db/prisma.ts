import { PrismaClient } from "@prisma/client";

// Cliente único do Prisma. Só os arquivos *.repository.ts devem importá-lo.
export const prisma = new PrismaClient();
