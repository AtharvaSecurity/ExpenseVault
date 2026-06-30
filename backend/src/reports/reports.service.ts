import { Injectable } from '@nestjs/common';
import { Parser as Json2CsvParser } from 'json2csv';
import * as PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildDateRange(query: ReportQueryDto) {
    const where: any = {};
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }
    return where;
  }

  async getMonthlyReport(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: start, lt: end } },
      orderBy: { date: 'asc' },
    });
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory = new Map<string, number>();
    for (const e of expenses) {
      byCategory.set(e.category, (byCategory.get(e.category) || 0) + Number(e.amount));
    }
    return {
      period: `${year}-${String(month).padStart(2, '0')}`,
      total,
      count: expenses.length,
      categoryBreakdown: Array.from(byCategory.entries()).map(([category, total]) => ({
        category,
        total,
      })),
      expenses,
    };
  }

  async getWeeklyReport(userId: string, weekStart: string) {
    const start = new Date(weekStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: start, lt: end } },
      orderBy: { date: 'asc' },
    });
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory = new Map<string, number>();
    for (const e of expenses) {
      byCategory.set(e.category, (byCategory.get(e.category) || 0) + Number(e.amount));
    }
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      total,
      count: expenses.length,
      categoryBreakdown: Array.from(byCategory.entries()).map(([category, total]) => ({
        category,
        total,
      })),
      expenses,
    };
  }

  async getCategoryAnalytics(userId: string, query: ReportQueryDto) {
    const where = { userId, ...this.buildDateRange(query) };
    const expenses = await this.prisma.expense.findMany({ where });
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory = new Map<string, { total: number; count: number }>();
    for (const e of expenses) {
      const current = byCategory.get(e.category) || { total: 0, count: 0 };
      current.total += Number(e.amount);
      current.count += 1;
      byCategory.set(e.category, current);
    }
    return Array.from(byCategory.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: total > 0 ? Number(((data.total / total) * 100).toFixed(2)) : 0,
    }));
  }

  async exportCsv(userId: string, query: ReportQueryDto): Promise<string> {
    const where = { userId, ...this.buildDateRange(query) };
    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const rows = expenses.map((e) => ({
      Date: e.date.toISOString().split('T')[0],
      Description: e.description,
      Category: e.category,
      Amount: Number(e.amount).toFixed(2),
    }));

    const parser = new Json2CsvParser({ fields: ['Date', 'Description', 'Category', 'Amount'] });
    return parser.parse(rows);
  }

  async exportPdf(userId: string, query: ReportQueryDto): Promise<Buffer> {
    const where = { userId, ...this.buildDateRange(query) };
    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('ExpenseVault Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('gray').text(`Generated: ${new Date().toLocaleString()}`, {
        align: 'center',
      });
      doc.moveDown(2);

      doc.fillColor('black').fontSize(12);
      const tableTop = doc.y;
      const colX = { date: 40, desc: 130, category: 320, amount: 460 };

      doc.font('Helvetica-Bold');
      doc.text('Date', colX.date, tableTop);
      doc.text('Description', colX.desc, tableTop);
      doc.text('Category', colX.category, tableTop);
      doc.text('Amount', colX.amount, tableTop);
      doc.moveDown();
      doc.font('Helvetica');

      let y = doc.y;
      for (const e of expenses) {
        if (y > 720) {
          doc.addPage();
          y = 40;
        }
        doc.text(e.date.toISOString().split('T')[0], colX.date, y, { width: 80 });
        doc.text(e.description, colX.desc, y, { width: 180 });
        doc.text(e.category, colX.category, y, { width: 120 });
        doc.text(`$${Number(e.amount).toFixed(2)}`, colX.amount, y, { width: 80 });
        y += 20;
      }

      doc.moveDown(2);
      doc.font('Helvetica-Bold').fontSize(14).text(`Total: $${total.toFixed(2)}`, {
        align: 'right',
      });

      doc.end();
    });
  }
}
