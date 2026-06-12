import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('connection_limit')) {
  dbUrl = dbUrl.includes('?') ? `${dbUrl}&connection_limit=1` : `${dbUrl}?connection_limit=1`;
}

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function killConnections() {
  try {
    console.log("Attempting to kill idle ghost connections...");
    
    // We only kill connections belonging to our user (usename = current_user)
    // that are 'idle' or have been hanging.
    const result = await prisma.$executeRaw`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE state = 'idle' 
      AND pid <> pg_backend_pid()
      AND usename = current_user;
    `;
    
    console.log(`Successfully killed ${result} ghost connection(s).`);
  } catch (error) {
    console.error("Failed to kill connections:", error);
  } finally {
    await prisma.$disconnect();
  }
}

killConnections();
