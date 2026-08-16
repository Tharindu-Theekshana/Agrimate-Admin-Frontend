import { api } from '@/api/api';
import type { Analytics, News, OutbreakPoint, User } from '@/api/types';

export const adminApi = {
  analytics: () => api.get<Analytics>('/api/admin/analytics').then((r) => r.data),
  outbreaks: (disease?: string, days = 90) =>
    api.get<OutbreakPoint[]>('/api/admin/outbreaks', { params: { disease, days } }).then((r) => r.data),
  users: (role?: string) =>
    api.get<User[]>('/api/admin/users', { params: { role } }).then((r) => r.data),
  updateUser: (id: number, body: { agronomistStatus?: string; suspended?: boolean }) =>
    api.patch<User>(`/api/admin/users/${id}`, body).then((r) => r.data),

  news: () => api.get<News[]>('/api/admin/news').then((r) => r.data),
  createNews: (title: string, description: string, image: File | null) => {
    const form = new FormData();
    form.append('title', title);
    form.append('description', description);
    if (image) form.append('image', image);
    return api.post<News>('/api/admin/news', form).then((r) => r.data);
  },
  deleteNews: (id: number) => api.delete(`/api/admin/news/${id}`).then(() => undefined),

  broadcast: (title: string, body: string, type: string) =>
    api.post<{ delivered: number }>('/api/admin/notifications', { title, body, type }).then((r) => r.data),
};
