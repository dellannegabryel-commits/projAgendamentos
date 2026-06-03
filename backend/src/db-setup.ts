import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "appointment_active_slot"
    ON "Appointment"("professionalId", "date")
    WHERE status <> 'CANCELLED'
  `);
  console.log('Partial unique index created/verified');
}

main()
  .catch((e) => {
    console.error('Failed to create index:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
