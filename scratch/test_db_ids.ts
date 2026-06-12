import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('connection_limit')) {
  dbUrl = dbUrl.includes('?') ? `${dbUrl}&connection_limit=1` : `${dbUrl}?connection_limit=1`;
}

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function test() {
  try {
    const meds = await prisma.medicine.findMany({
      where: { name: { contains: "Aciclovir", mode: "insensitive" } }
    });

    console.log("Found medicines:");
    for (const med of meds) {
      console.log(`ID: ${med.id}, Name: ${med.name}`);
    }
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
