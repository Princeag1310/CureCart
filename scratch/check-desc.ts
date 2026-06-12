import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const med = await prisma.medicine.findFirst({ where: { name: { contains: "Basugine" } } });
  console.log(med?.description);
}

main().finally(() => prisma.$disconnect());
