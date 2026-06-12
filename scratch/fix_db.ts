import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('connection_limit')) {
  dbUrl = dbUrl.includes('?') ? `${dbUrl}&connection_limit=1` : `${dbUrl}?connection_limit=1`;
}

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function fixDB() {
  try {
    const meds = await prisma.medicine.findMany({
      where: { name: { contains: "Aciclovir", mode: "insensitive" } }
    });

    for (const med of meds) {
      if (med.interactions === '{"test": "true"}') {
        console.log(`Fixing corrupted interactions for ID: ${med.id}`);
        await prisma.medicine.update({
          where: { id: med.id },
          data: { interactions: null }
        });
      }
    }
    
    console.log("Database fixed! It will now regenerate proper AI details.");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDB();
