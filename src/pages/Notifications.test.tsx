import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/adminService', () => ({
  adminApi: { users: vi.fn(), broadcast: vi.fn() },
}));

import { adminApi } from '@/service/adminService';
import type { User } from '@/api/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Notifications } from './Notifications';

const farmer: User = {
  id: 1, username: 'kasun', email: 'kasun@agrimate.lk', name: 'Kasun Perera', phone: '0771234567',
  role: 'FARMER', roles: ['FARMER'], language: 'en', agronomistStatus: 'NONE', suspended: false,
};

function renderPage() {
  return renderWithProviders(
    <>
      <Toaster />
      <Notifications />
    </>,
  );
}

describe('Notifications page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ADM-NOTIF-01: defaults to "All users" and does not fetch the user list', () => {
    renderPage();

    expect(adminApi.users).not.toHaveBeenCalled();
  });

  it('ADM-NOTIF-02: does not submit when the title is blank', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /send to all/i }));

    expect(adminApi.broadcast).not.toHaveBeenCalled();
  });

  it('ADM-NOTIF-03: broadcasts to all users and reports how many were delivered', async () => {
    vi.mocked(adminApi.broadcast).mockResolvedValueOnce({ delivered: 42 });
    renderPage();

    await userEvent.type(screen.getByPlaceholderText(/scheduled maintenance/i), 'Server maintenance');
    await userEvent.click(screen.getByRole('button', { name: /send to all/i }));

    await waitFor(() =>
      expect(adminApi.broadcast).toHaveBeenCalledWith('Server maintenance', '', 'SYSTEM', undefined),
    );
    expect(await screen.findByText('Sent to 42 users')).toBeInTheDocument();
  });

  it('ADM-NOTIF-04: switching to "Specific user" fetches the user list for the search box', async () => {
    vi.mocked(adminApi.users).mockResolvedValueOnce([farmer]);
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /specific user/i }));

    await waitFor(() => expect(adminApi.users).toHaveBeenCalled());
  });

  it('ADM-NOTIF-05: requires a selected user before sending to a specific person', async () => {
    vi.mocked(adminApi.users).mockResolvedValueOnce([farmer]);
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /specific user/i }));
    await waitFor(() => expect(adminApi.users).toHaveBeenCalled());
    await userEvent.type(screen.getByPlaceholderText(/scheduled maintenance/i), 'Reminder');

    await userEvent.click(screen.getByRole('button', { name: /^send$/i }));

    expect(await screen.findByText('Pick a user to notify')).toBeInTheDocument();
    expect(adminApi.broadcast).not.toHaveBeenCalled();
  });
});
