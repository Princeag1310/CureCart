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
    const med = await prisma.medicine.findFirst({
      where: { name: { contains: "Aciclovir", mode: "insensitive" } }
    });

    if (!med) {
      console.log("Medicine not found in DB.");
      return;
    }

    console.log("Found Medicine ID:", med.id);
    console.log("Current Interactions:", med.interactions);

    // Try to update it with a fake string
    const updated = await prisma.medicine.update({
      where: { id: med.id },
      data: { interactions: '{"test": "true"}' }
    });
    
    console.log("Update successful!");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
