import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "appointment_active_slot"
    ON "Appointment"("professionalId", "date")
    WHERE status <> 'CANCELLED'
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Availability" DROP CONSTRAINT IF EXISTS "Availability_professionalId_dayOfWeek_startTime_key"
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "availability_active_slot"
    ON "Availability"("professionalId", "dayOfWeek", "startTime")
    WHERE "isActive" = true
  `);

  console.log('Partial unique indexes created/verified');
}

main()
  .catch((e) => {
    console.error('Failed to create index:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
