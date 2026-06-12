import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const glucon = await prisma.medicine.findMany({
    where: {
      name: {
        contains: 'glucon',
        mode: 'insensitive'
      }
    },
    select: { name: true }
  });

  console.log("Found medicines containing 'glucon':");
  console.log(glucon);
}

main().finally(() => prisma.$disconnect());
