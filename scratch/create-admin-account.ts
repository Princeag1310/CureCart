import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const rawPassword = process.argv[3];

  if (!email || !rawPassword) {
    console.error("❌ Please provide an email and password.");
    console.error("Usage: npx tsx scratch/create-admin-account.ts <your-email> <your-password>");
    process.exit(1);
  }

  // Check if admin already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    console.log(`⚠️ User with email ${email} already exists.`);
    
    // Optionally update their password and role just in case
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', password: hashedPassword }
    });
    console.log(`✅ Reset password for ${email} and ensured ADMIN role.`);
    console.log(`Credentials -> Email: ${email} | Password: ${rawPassword}`);
    process.exit(0);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Create the dedicated admin account
  await prisma.user.create({
    data: {
      email,
      name: "System Administrator",
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log(`✅ Successfully created dedicated Admin account!`);
  console.log(`Credentials -> Email: ${email} | Password: ${rawPassword}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
