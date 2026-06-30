import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly/:year/:month')
  getMonthlyReport(
    @CurrentUser() user: any,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.reportsService.getMonthlyReport(user.id, Number(year), Number(month));
  }

  @Get('weekly')
  getWeeklyReport(@CurrentUser() user: any, @Query('weekStart') weekStart: string) {
    return this.reportsService.getWeeklyReport(user.id, weekStart);
  }

  @Get('categories')
  getCategoryAnalytics(@CurrentUser() user: any, @Query() query: ReportQueryDto) {
    return this.reportsService.getCategoryAnalytics(user.id, query);
  }

  @Get('export/csv')
  async exportCsv(
    @CurrentUser() user: any,
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    const csv = await this.reportsService.exportCsv(user.id, query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  }

  @Get('export/pdf')
  async exportPdf(
    @CurrentUser() user: any,
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    const pdf = await this.reportsService.exportPdf(user.id, query);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.pdf"');
    res.send(pdf);
  }
}
