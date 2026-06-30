import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        category: dto.category,
        date: new Date(dto.date),
        userId,
      },
    });
  }

  async findAll(userId: string, query: QueryExpensesDto) {
    const {
      search,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.ExpenseWhereInput = {
      userId,
      ...(search && {
        description: { contains: search },
      }),
      ...(category && { category }),
      ...((startDate || endDate) && {
        date: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
      ...((minAmount !== undefined || maxAmount !== undefined) && {
        amount: {
          ...(minAmount !== undefined && { gte: minAmount }),
          ...(maxAmount !== undefined && { lte: maxAmount }),
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({ where: { id, userId } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    await this.findOne(userId, id);
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted successfully' };
  }

  async getDashboardStats(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalAgg, monthlyAgg, weeklyAgg, allExpenses, recent] = await Promise.all([
      this.prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({
        where: { userId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { userId, date: { gte: startOfWeek } },
        _sum: { amount: true },
      }),
      this.prisma.expense.findMany({ where: { userId }, select: { category: true, amount: true } }),
      this.prisma.expense.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    const categoryMap = new Map<string, number>();
    for (const e of allExpenses) {
      const current = categoryMap.get(e.category) || 0;
      categoryMap.set(e.category, current + Number(e.amount));
    }
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, total]) => ({
      category,
      total,
    }));

    return {
      totalExpenses: Number(totalAgg._sum.amount || 0),
      monthlyExpenses: Number(monthlyAgg._sum.amount || 0),
      weeklyExpenses: Number(weeklyAgg._sum.amount || 0),
      categoryBreakdown,
      recentTransactions: recent,
    };
  }

  async getMonthlyTrend(userId: string, months = 6) {
    const result: { month: string; total: number }[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const agg = await this.prisma.expense.aggregate({
        where: { userId, date: { gte: start, lt: end } },
        _sum: { amount: true },
      });
      result.push({
        month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        total: Number(agg._sum.amount || 0),
      });
    }
    return result;
  }
}
