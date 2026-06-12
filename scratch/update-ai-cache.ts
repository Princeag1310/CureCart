import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Clearing outdated AI cache to regenerate with 'uses' field...");
  const result = await prisma.medicine.updateMany({
    where: {
      interactions: { not: null }
    },
    data: {
      interactions: null
    }
  });
  console.log(`Successfully cleared cache for ${result.count} medicines.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
