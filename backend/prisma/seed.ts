import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@agendafacil.com';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin'; // Senha padrão caso não definido no .env

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
      },
    });
    console.log(`Admin criado com sucesso: ${adminEmail}`);
  } else {
    console.log('Admin já existe no banco de dados.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
