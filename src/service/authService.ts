import { api } from '@/api/api';
import type { AuthResponse } from '@/api/types';

export const login = (identifier: string, password: string) =>
  api.post<AuthResponse>('/api/auth/login', { identifier, password }).then((r) => r.data);

export const logout = () => api.post('/api/auth/logout').then(() => undefined);

export const requestRegisterOtp = (username: string, email: string) =>
  api.post('/api/auth/register/request-otp', { username, email }).then(() => undefined);

export interface CreateAdminInput {
  username: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  location?: string;
  code: string;
}

export const createAdmin = (input: CreateAdminInput) => {
  const form = new FormData();
  form.append('username', input.username);
  form.append('email', input.email);
  form.append('password', input.password);
  form.append('name', input.name);
  if (input.phone) form.append('phone', input.phone);
  if (input.location) form.append('location', input.location);
  form.append('role', 'ADMIN');
  form.append('code', input.code);
  return api
    .post<AuthResponse>('/api/auth/register', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.user);
};
