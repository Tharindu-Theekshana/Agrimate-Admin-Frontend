import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/authService', () => ({
  requestPasswordReset: vi.fn(),
}));

import * as authService from '@/service/authService';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ForgotPassword } from './ForgotPassword';

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<div>RESET_PASSWORD_PAGE</div>} />
    </Routes>,
    { route: '/forgot-password' },
  );
}

describe('ForgotPassword page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ADM-FORGOT-01: shows a validation message when the email field is empty', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /send verification code/i }));

    expect(await screen.findByText('Enter your email address')).toBeInTheDocument();
    expect(authService.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('ADM-FORGOT-02: requests an OTP then navigates to Reset Password on success', async () => {
    vi.mocked(authService.requestPasswordReset).mockResolvedValueOnce(undefined);
    renderPage();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'admin@agrimate.lk');
    await userEvent.click(screen.getByRole('button', { name: /send verification code/i }));

    expect(await screen.findByText('RESET_PASSWORD_PAGE')).toBeInTheDocument();
    expect(authService.requestPasswordReset).toHaveBeenCalledWith('admin@agrimate.lk');
  });

  it('ADM-FORGOT-03: shows the backend error message when the request fails', async () => {
    vi.mocked(authService.requestPasswordReset).mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Please wait a moment before requesting another code' } },
    });
    renderPage();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'admin@agrimate.lk');
    await userEvent.click(screen.getByRole('button', { name: /send verification code/i }));

    expect(await screen.findByText('Please wait a moment before requesting another code')).toBeInTheDocument();
  });

  it('ADM-FORGOT-04: has a "Back to sign in" link', () => {
    renderPage();
    expect(screen.getByText('Back to sign in')).toBeInTheDocument();
  });
});
