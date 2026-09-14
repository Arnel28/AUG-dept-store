import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || "admin@augdept.com").toLowerCase();
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "AUG Admin";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { isAdmin: true },
    create: {
      email,
      name,
      passwordHash,
      isAdmin: true,
    },
  });

  console.log(`\n=========================================`);
  console.log(`  ADMIN ACCOUNT READY`);
  console.log(`  Email:    ${user.email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Name:     ${user.name}`);
  console.log(`  Admin:    ${user.isAdmin}`);
  console.log(`=========================================\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
