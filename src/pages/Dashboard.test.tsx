import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: () => null,
}));

vi.mock('@/service/adminService', () => ({
  adminApi: { analytics: vi.fn(), outbreaks: vi.fn(), news: vi.fn(), users: vi.fn(), updateUser: vi.fn() },
}));

import { adminApi } from '@/service/adminService';
import type { Analytics, News, User } from '@/api/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Dashboard } from './Dashboard';

const analytics: Analytics = {
  totalScans: 4812, totalUsers: 1204, totalFarmers: 1050, pendingAgronomists: 1,
  scansByDisease: { rice_blast: 42 }, weeklyTrend: [{ weekStart: '2026-08-01', scans: 12 }],
};

const pendingAgronomist: User = {
  id: 1, username: 'agro1', email: 'agro1@agrimate.lk', name: 'S. Perera', phone: '0771234567',
  role: 'AGRONOMIST', roles: ['AGRONOMIST'], language: 'en', agronomistStatus: 'PENDING', suspended: false,
};

function mockDefaults() {
  vi.mocked(adminApi.analytics).mockResolvedValue(analytics);
  vi.mocked(adminApi.outbreaks).mockResolvedValue([]);
  vi.mocked(adminApi.news).mockResolvedValue([]);
  vi.mocked(adminApi.users).mockResolvedValue([]);
}

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ADM-DASH-01: renders the headline stat cards from analytics', async () => {
    mockDefaults();
    renderWithProviders(<Dashboard />);

    expect(await screen.findByText('4812')).toBeInTheDocument();
    expect(screen.getByText('1204')).toBeInTheDocument();
  });

  it('ADM-DASH-02: shows an empty state when there are no geo-tagged scans this week', async () => {
    mockDefaults();
    renderWithProviders(<Dashboard />);

    expect(await screen.findByText('No geo-tagged scans in the last 7 days')).toBeInTheDocument();
  });

  it('ADM-DASH-03: lists pending agronomist applications needing attention', async () => {
    vi.mocked(adminApi.analytics).mockResolvedValue(analytics);
    vi.mocked(adminApi.outbreaks).mockResolvedValue([]);
    vi.mocked(adminApi.news).mockResolvedValue([]);
    vi.mocked(adminApi.users).mockResolvedValue([pendingAgronomist]);
    renderWithProviders(<Dashboard />);

    expect(await screen.findByText('S. Perera')).toBeInTheDocument();
  });

  it('ADM-DASH-04: approving a pending agronomist from the dashboard removes them from the queue', async () => {
    vi.mocked(adminApi.analytics).mockResolvedValue(analytics);
    vi.mocked(adminApi.outbreaks).mockResolvedValue([]);
    vi.mocked(adminApi.news).mockResolvedValue([]);
    vi.mocked(adminApi.users).mockResolvedValue([pendingAgronomist]);
    vi.mocked(adminApi.updateUser).mockResolvedValueOnce({ ...pendingAgronomist, agronomistStatus: 'APPROVED' });
    renderWithProviders(<Dashboard />);
    await screen.findByText('S. Perera');

    await userEvent.click(screen.getByTitle('Approve'));

    await waitFor(() => expect(adminApi.updateUser).toHaveBeenCalledWith(1, { agronomistStatus: 'APPROVED' }));
    await waitFor(() => expect(screen.queryByText('S. Perera')).not.toBeInTheDocument());
  });

  it('ADM-DASH-05: renders the latest published news headlines', async () => {
    mockDefaults();
    vi.mocked(adminApi.news).mockResolvedValue([
      { id: 1, title: 'Monsoon advisory', description: '', imageUrl: null, createdAt: '2026-08-01T00:00:00Z' } as News,
    ]);
    renderWithProviders(<Dashboard />);

    expect(await screen.findByText('Monsoon advisory')).toBeInTheDocument();
  });
});
