import { api } from './client';
import { DashboardStats, Expense, MonthlyTrendPoint, PaginatedExpenses } from '@/types';

export interface ExpenseQueryParams {
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ExpensePayload {
  amount: number;
  description: string;
  category: string;
  date: string;
}

export const expensesApi = {
  list: (params: ExpenseQueryParams) =>
    api.get<PaginatedExpenses>('/expenses', { params }).then((r) => r.data),

  get: (id: string) => api.get<Expense>(`/expenses/${id}`).then((r) => r.data),

  create: (data: ExpensePayload) => api.post<Expense>('/expenses', data).then((r) => r.data),

  update: (id: string, data: Partial<ExpensePayload>) =>
    api.patch<Expense>(`/expenses/${id}`, data).then((r) => r.data),

  remove: (id: string) => api.delete(`/expenses/${id}`).then((r) => r.data),

  dashboardStats: () =>
    api.get<DashboardStats>('/expenses/dashboard/stats').then((r) => r.data),

  monthlyTrend: (months = 6) =>
    api
      .get<MonthlyTrendPoint[]>('/expenses/dashboard/trend', { params: { months } })
      .then((r) => r.data),
};
