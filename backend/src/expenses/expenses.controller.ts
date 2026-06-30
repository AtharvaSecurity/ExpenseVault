import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'expenses', version: '1' })
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: QueryExpensesDto) {
    return this.expensesService.findAll(user.id, query);
  }

  @Get('dashboard/stats')
  getDashboardStats(@CurrentUser() user: any) {
    return this.expensesService.getDashboardStats(user.id);
  }

  @Get('dashboard/trend')
  getMonthlyTrend(@CurrentUser() user: any, @Query('months') months?: string) {
    return this.expensesService.getMonthlyTrend(user.id, months ? Number(months) : 6);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expensesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expensesService.remove(user.id, id);
  }
}
