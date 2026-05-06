import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Fix DATABASE_URL: unescape characters that may be double-escaped
  let dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.includes('\\!')) {
    dbUrl = dbUrl.replace(/\\!/g, '!');
  }

  return new PrismaClient({
    ...(dbUrl && { datasources: { db: { url: dbUrl } } }),
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
