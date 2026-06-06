import { PrismaClient } from '@prisma/client';
import { encrypt } from '../src/utils/bcrypt.js';

const prisma = new PrismaClient();

const main = async () => {
  console.log('Seeding permissions...');
  const permissions = [
    'manage_users',
    'manage_roles',
    'manage_products',
    'manage_categories',
    'manage_stock',
    'manage_members',
    'process_sales',
    'view_reports',
  ];

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seeding roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: {
        create: permissions.map((p) => ({
          permission: { connect: { name: p } },
        })),
      },
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'CASHIER' },
    update: {},
    create: {
      name: 'CASHIER',
      permissions: {
        create: [
          { permission: { connect: { name: 'process_sales' } } },
          { permission: { connect: { name: 'view_reports' } } },
        ],
      },
    },
  });

  console.log('Seeding users...');
  const password = await encrypt('password123');

  await prisma.users.upsert({
    where: { username: 'admin' },
    update: { roleId: adminRole.id },
    create: {
      username: 'admin',
      password,
      roleId: adminRole.id,
    },
  });

  await prisma.users.upsert({
    where: { username: 'cashier1' },
    update: { roleId: cashierRole.id },
    create: {
      username: 'cashier1',
      password,
      roleId: cashierRole.id,
    },
  });

  console.log('Seeding categories with discounts...');
  const categories = [
    { name: 'Coffee', discount: 10.0 },
    { name: 'Tea', discount: 5.0 },
    { name: 'Pastry', discount: 0.0 },
    { name: 'Non-Coffee', discount: 5.0 },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { memberDiscountRate: cat.discount },
      create: { name: cat.name, memberDiscountRate: cat.discount },
    });
  }

  console.log('Seeding members...');
  const members = [
    { name: 'John Doe', email: 'john@example.com', barcode: 'MEMBER-001' },
    { name: 'Jane Smith', email: 'jane@example.com', barcode: 'MEMBER-002' },
  ];
  for (const m of members) {
    await prisma.member.upsert({
      where: { email: m.email },
      update: { barcode: m.barcode },
      create: m,
    });
  }

  console.log('Seeding products...');
  const coffeeCat = await prisma.category.findUnique({ where: { name: 'Coffee' } });
  
  await prisma.product.upsert({
    where: { id: 'seed-latte' },
    update: {},
    create: {
      id: 'seed-latte',
      name: 'Cafe Latte',
      image: '/public/uploads/seed-latte.jpg', // Placeholder, user should upload real images
      categoryId: coffeeCat.id,
      variants: {
        create: [
          { sku: 'LATTE-HOT', price: 25000, size: 'MEDIUM', temperature: 'HOT' },
          { sku: 'LATTE-ICE', price: 28000, size: 'LARGE', temperature: 'ICED' },
        ]
      }
    }
  });

  console.log('Seed completed successfully.');
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
