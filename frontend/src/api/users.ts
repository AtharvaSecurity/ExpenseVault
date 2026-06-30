import { api } from './client';
import { User } from '@/types';

export const usersApi = {
  me: () => api.get<User>('/users/me').then((r) => r.data),

  updateProfile: (data: { name?: string; email?: string; avatar?: string }) =>
    api.patch<User>('/users/me', data).then((r) => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/users/me/change-password', data).then((r) => r.data),
};
