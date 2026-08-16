import { api } from '@/api/api';
import type { AuthResponse } from '@/api/types';

export const login = (identifier: string, password: string) =>
  api.post<AuthResponse>('/api/auth/login', { identifier, password }).then((r) => r.data);

export const logout = () => api.post('/api/auth/logout').then(() => undefined);
