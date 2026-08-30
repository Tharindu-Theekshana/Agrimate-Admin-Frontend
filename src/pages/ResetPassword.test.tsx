import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/authService', () => ({
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

import * as authService from '@/service/authService';
import type { User } from '@/api/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ResetPassword } from './ResetPassword';

const adminUser: User = {
  id: 1, username: 'admin', email: 'admin@agrimate.lk', name: 'Admin',
  role: 'ADMIN', roles: ['ADMIN'], language: 'en', agronomistStatus: 'NONE', suspended: false,
};

function renderPage(route: Parameters<typeof renderWithProviders>[1]) {
  return renderWithProviders(
    <Routes>
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<div>FORGOT_PASSWORD_PAGE</div>} />
      <Route path="/" element={<div>DASHBOARD_HOME</div>} />
    </Routes>,
    route,
  );
}

describe('ResetPassword page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ADM-RESET-01: redirects to Forgot Password when no email was handed off via router state', () => {
    renderPage({ route: '/reset-password' });
    expect(screen.getByText('FORGOT_PASSWORD_PAGE')).toBeInTheDocument();
  });

  it('ADM-RESET-02: shows the OTP and password fields once an email is present', () => {
    renderPage({ route: { pathname: '/reset-password', state: { email: 'admin@agrimate.lk' } } });
    expect(screen.getByText('admin@agrimate.lk')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
    expect(screen.getByText('New password')).toBeInTheDocument();
    expect(screen.getByText('Confirm new password')).toBeInTheDocument();
  });

  it('ADM-RESET-03: rejects mismatched passwords without calling the backend', async () => {
    renderPage({ route: { pathname: '/reset-password', state: { email: 'admin@agrimate.lk' } } });

    await userEvent.type(screen.getByPlaceholderText('123456'), '111222');
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(passwordFields[0], 'secretOne');
    await userEvent.type(passwordFields[1], 'secretTwo');
    await userEvent.click(screen.getByRole('button', { name: /set new password/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(authService.confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('ADM-RESET-04: submits the OTP + new password and lands on the dashboard on success', async () => {
    vi.mocked(authService.confirmPasswordReset).mockResolvedValueOnce({
      accessToken: 'new-tok', refreshToken: 'new-r', user: adminUser,
    });
    renderPage({ route: { pathname: '/reset-password', state: { email: 'admin@agrimate.lk' } } });

    await userEvent.type(screen.getByPlaceholderText('123456'), '111222');
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(passwordFields[0], 'newSecret1');
    await userEvent.type(passwordFields[1], 'newSecret1');
    await userEvent.click(screen.getByRole('button', { name: /set new password/i }));

    expect(await screen.findByText('DASHBOARD_HOME')).toBeInTheDocument();
    expect(authService.confirmPasswordReset).toHaveBeenCalledWith('admin@agrimate.lk', '111222', 'newSecret1');
  });

  it('ADM-RESET-05: rejects a code that is not 6 digits', async () => {
    renderPage({ route: { pathname: '/reset-password', state: { email: 'admin@agrimate.lk' } } });

    await userEvent.type(screen.getByPlaceholderText('123456'), '123');
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(passwordFields[0], 'newSecret1');
    await userEvent.type(passwordFields[1], 'newSecret1');
    await userEvent.click(screen.getByRole('button', { name: /set new password/i }));

    expect(await screen.findByText('Enter the 6-digit code sent to your email')).toBeInTheDocument();
    expect(authService.confirmPasswordReset).not.toHaveBeenCalled();
  });
});
