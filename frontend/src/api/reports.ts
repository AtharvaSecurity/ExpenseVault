import { api } from './client';
import { CategoryAnalytics } from '@/types';

export const reportsApi = {
  monthly: (year: number, month: number) =>
    api.get(`/reports/monthly/${year}/${month}`).then((r) => r.data),

  weekly: (weekStart: string) =>
    api.get('/reports/weekly', { params: { weekStart } }).then((r) => r.data),

  categoryAnalytics: (params: { startDate?: string; endDate?: string }) =>
    api.get<CategoryAnalytics[]>('/reports/categories', { params }).then((r) => r.data),

  exportCsv: async (params: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/reports/export/csv', { params, responseType: 'blob' });
    return response.data as Blob;
  },

  exportPdf: async (params: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/reports/export/pdf', { params, responseType: 'blob' });
    return response.data as Blob;
  },
};
