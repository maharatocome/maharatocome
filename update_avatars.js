const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { email: 'karim@talentdz.dz' },
    data: { avatar: '/avatars/karim.png' }
  });
  await prisma.user.updateMany({
    where: { email: 'sofia@startupdz.dz' },
    data: { avatar: '/avatars/sofia.png' }
  });
  await prisma.user.updateMany({
    where: { email: 'yasmine@design.dz' },
    data: { avatar: '/avatars/yasmine.png' }
  });
  console.log('Avatars updated.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
