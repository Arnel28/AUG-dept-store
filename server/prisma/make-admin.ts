import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log("\nUsage: npx tsx prisma/make-admin.ts <user-email>");
    console.log("Listing current users:\n");
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, isAdmin: true },
    });
    console.table(users);
    return;
  }

  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { isAdmin: true },
  });

  console.log(`\n[SUCCESS] User "${user.email}" (${user.name}) is now an ADMIN.\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
