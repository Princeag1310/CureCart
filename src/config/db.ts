import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL;
  // Automatically force a connection limit to prevent exhausting Aiven database slots.
  // Production (Vercel Serverless) gets 1 connection per instance, local dev gets 3.
  if (url && !url.includes('connection_limit')) {
    const limit = process.env.NODE_ENV === 'production' ? 1 : 3;
    url = url.includes('?') ? `${url}&connection_limit=${limit}` : `${url}?connection_limit=${limit}`;
  }

  return new PrismaClient(url ? { datasources: { db: { url } } } : undefined);
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Ensure thread-safety and prevent connection limits during Next.js hot reloading
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
