import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/authService', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

import * as authService from '@/service/authService';
import type { User } from '@/api/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Login } from './Login';

const adminUser: User = {
  id: 1, username: 'admin', email: 'admin@agrimate.lk', name: 'Admin',
  role: 'ADMIN', roles: ['ADMIN'], language: 'en', agronomistStatus: 'NONE', suspended: false,
};

function renderLoginPage(preloaded?: Parameters<typeof renderWithProviders>[1]) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<div>DASHBOARD_HOME</div>} />
    </Routes>,
    { route: '/login', ...preloaded },
  );
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ADM-LOGIN-01: renders a "Forgot password?" link', () => {
    renderLoginPage();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('ADM-LOGIN-02: shows an error message when login fails', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Invalid credentials' } },
    });
    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('admin'), 'admin');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('ADM-LOGIN-03: navigates to the dashboard on successful admin login', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      accessToken: 'tok', refreshToken: 'r', user: adminUser,
    });
    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('admin'), 'admin');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText('DASHBOARD_HOME')).toBeInTheDocument());
  });

  it('ADM-LOGIN-04: rejects a non-admin account with a clear message', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      accessToken: 'tok', refreshToken: 'r',
      user: { ...adminUser, role: 'FARMER', roles: ['FARMER'] },
    });
    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('admin'), 'farmer1');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('This dashboard is for administrators only.')).toBeInTheDocument();
  });

  it('ADM-LOGIN-05: redirects straight to the dashboard if already authenticated', () => {
    renderLoginPage({ preloaded: { auth: { user: adminUser, accessToken: 'tok' } } });
    expect(screen.getByText('DASHBOARD_HOME')).toBeInTheDocument();
  });
});
