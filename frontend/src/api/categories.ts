import { api } from './client';
import { Category } from '@/types';

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),

  create: (data: { name: string; color: string }) =>
    api.post<Category>('/categories', data).then((r) => r.data),

  update: (id: string, data: { name?: string; color?: string }) =>
    api.patch<Category>(`/categories/${id}`, data).then((r) => r.data),

  remove: (id: string) => api.delete(`/categories/${id}`).then((r) => r.data),
};
