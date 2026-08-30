import { api } from '@/api/api';
import type { AuthResponse } from '@/api/types';

export const login = (identifier: string, password: string) =>
  api.post<AuthResponse>('/api/auth/login', { identifier, password }).then((r) => r.data);

export const logout = () => api.post('/api/auth/logout').then(() => undefined);

export const requestPasswordReset = (email: string) =>
  api.post('/api/auth/password-reset/request', { email }).then(() => undefined);

export const confirmPasswordReset = (email: string, code: string, newPassword: string) =>
  api
    .post<AuthResponse>('/api/auth/password-reset/confirm', { email, code, newPassword })
    .then((r) => r.data);
