import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/adminService', () => ({
  adminApi: { users: vi.fn(), updateUser: vi.fn() },
}));

import { adminApi } from '@/service/adminService';
import type { User } from '@/api/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Users } from './Users';

const pendingAgronomist: User = {
  id: 1, username: 'agro1', email: 'agro1@agrimate.lk', name: 'S. Perera', phone: '0771234567',
  role: 'AGRONOMIST', roles: ['AGRONOMIST'], language: 'en', agronomistStatus: 'PENDING', suspended: false,
};

const farmer: User = {
  id: 2, username: 'farmer1', email: 'farmer1@agrimate.lk', name: 'K. Fernando', phone: '0712223344',
  role: 'FARMER', roles: ['FARMER'], language: 'en', agronomistStatus: 'NONE', suspended: false,
};

describe('Users page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ADM-USERS-01: renders every returned user in the table', async () => {
    vi.mocked(adminApi.users).mockResolvedValueOnce([pendingAgronomist, farmer]);
    renderWithProviders(<Users />);

    expect(await screen.findByText('S. Perera')).toBeInTheDocument();
    expect(screen.getByText('K. Fernando')).toBeInTheDocument();
  });

  it('ADM-USERS-02: shows a PENDING agronomist status badge and Approve/Reject actions', async () => {
    vi.mocked(adminApi.users).mockResolvedValueOnce([pendingAgronomist]);
    renderWithProviders(<Users />);

    await screen.findByText('S. Perera');
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('ADM-USERS-03: approving an agronomist calls updateUser and refreshes the row', async () => {
    vi.mocked(adminApi.users).mockResolvedValueOnce([pendingAgronomist]);
    vi.mocked(adminApi.updateUser).mockResolvedValueOnce({ ...pendingAgronomist, agronomistStatus: 'APPROVED' });
    renderWithProviders(<Users />);
    await screen.findByText('S. Perera');

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect(adminApi.updateUser).toHaveBeenCalledWith(1, { agronomistStatus: 'APPROVED' }),
    );
  });

  it('ADM-USERS-04: a farmer row has no agronomist approve/reject actions', async () => {
    vi.mocked(adminApi.users).mockResolvedValueOnce([farmer]);
    renderWithProviders(<Users />);

    await screen.findByText('K. Fernando');
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
  });

  it('ADM-USERS-05: suspending a user toggles their suspended state', async () => {
    vi.mocked(adminApi.users).mockResolvedValueOnce([farmer]);
    vi.mocked(adminApi.updateUser).mockResolvedValueOnce({ ...farmer, suspended: true });
    renderWithProviders(<Users />);
    await screen.findByText('K. Fernando');

    await userEvent.click(screen.getByRole('button', { name: 'Suspend' }));

    await waitFor(() => expect(adminApi.updateUser).toHaveBeenCalledWith(2, { suspended: true }));
  });

  it('ADM-USERS-06: the "Create Admin" button navigates to /users/new', async () => {
    vi.mocked(adminApi.users).mockResolvedValueOnce([]);
    renderWithProviders(
      <Routes>
        <Route path="/users" element={<Users />} />
        <Route path="/users/new" element={<div>CREATE_ADMIN_PAGE</div>} />
      </Routes>,
      { route: '/users' },
    );
    await waitFor(() => expect(adminApi.users).toHaveBeenCalled());

    await userEvent.click(screen.getByRole('button', { name: /create admin/i }));

    expect(await screen.findByText('CREATE_ADMIN_PAGE')).toBeInTheDocument();
  });
});
