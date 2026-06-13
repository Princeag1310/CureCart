import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allowedEmail = 'prince@curecart.com';

  console.log(`Starting admin cleanup... Ensuring ONLY ${allowedEmail} is an ADMIN.`);

  // Find all current admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });

  const toDemote = admins.filter(admin => admin.email !== allowedEmail);

  if (toDemote.length === 0) {
    console.log("No other admins found. Your account is the exclusive admin.");
  } else {
    for (const admin of toDemote) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { role: 'USER' }
      });
      console.log(`Demoted ${admin.email || admin.id} back to standard USER.`);
    }
    console.log(`✅ Cleanup complete. ${toDemote.length} accounts demoted.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
