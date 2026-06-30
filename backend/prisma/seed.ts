import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#F97316' },
  { name: 'Transport', color: '#3B82F6' },
  { name: 'Shopping', color: '#EC4899' },
  { name: 'Entertainment', color: '#8B5CF6' },
  { name: 'Bills', color: '#EF4444' },
  { name: 'Healthcare', color: '#10B981' },
  { name: 'Education', color: '#F59E0B' },
];

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@expensevault.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@expensevault.com',
      password: passwordHash,
    },
  });

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: cat.name } },
      update: {},
      create: { ...cat, userId: user.id },
    });
  }

  const existingExpenses = await prisma.expense.count({ where: { userId: user.id } });
  if (existingExpenses === 0) {
    const sample = [
      { amount: 45.5, description: 'Grocery shopping', category: 'Food', daysAgo: 1 },
      { amount: 12.0, description: 'Uber ride', category: 'Transport', daysAgo: 2 },
      { amount: 89.99, description: 'New shoes', category: 'Shopping', daysAgo: 4 },
      { amount: 25.0, description: 'Movie night', category: 'Entertainment', daysAgo: 6 },
      { amount: 150.0, description: 'Electricity bill', category: 'Bills', daysAgo: 8 },
      { amount: 60.0, description: 'Pharmacy', category: 'Healthcare', daysAgo: 10 },
      { amount: 200.0, description: 'Online course', category: 'Education', daysAgo: 15 },
      { amount: 33.25, description: 'Restaurant dinner', category: 'Food', daysAgo: 20 },
    ];
    for (const item of sample) {
      const date = new Date();
      date.setDate(date.getDate() - item.daysAgo);
      await prisma.expense.create({
        data: {
          amount: item.amount,
          description: item.description,
          category: item.category,
          date,
          userId: user.id,
        },
      });
    }
  }

  console.log('Seed completed. Demo login: demo@expensevault.com / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
