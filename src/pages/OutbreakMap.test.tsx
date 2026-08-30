import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: () => null,
  Popup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/service/adminService', () => ({
  adminApi: { outbreaks: vi.fn() },
}));
vi.mock('@/service/diseaseService', () => ({
  diseaseApi: { list: vi.fn() },
}));

import { adminApi } from '@/service/adminService';
import { diseaseApi } from '@/service/diseaseService';
import type { OutbreakPoint } from '@/api/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { OutbreakMap } from './OutbreakMap';

const point: OutbreakPoint = {
  scanId: 1, disease: 'rice_blast', confidence: 0.9, latitude: 7.29, longitude: 80.63, createdAt: '2026-08-01T00:00:00Z',
};

describe('OutbreakMap page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(diseaseApi.list).mockResolvedValue([{ diseaseKey: 'rice_blast', nameEn: 'Rice Blast' }]);
  });

  it('ADM-MAP-01: fetches outbreaks for the default 90-day window on load', async () => {
    vi.mocked(adminApi.outbreaks).mockResolvedValue([]);
    renderWithProviders(<OutbreakMap />);

    await waitFor(() => expect(adminApi.outbreaks).toHaveBeenCalledWith(undefined, 90));
  });

  it('ADM-MAP-02: shows the detection count once loaded', async () => {
    vi.mocked(adminApi.outbreaks).mockResolvedValue([point]);
    renderWithProviders(<OutbreakMap />);

    expect(await screen.findByText('1 detection')).toBeInTheDocument();
  });

  it('ADM-MAP-03: changing the time window re-fetches outbreaks for the new range', async () => {
    vi.mocked(adminApi.outbreaks).mockResolvedValue([]);
    renderWithProviders(<OutbreakMap />);
    await waitFor(() => expect(adminApi.outbreaks).toHaveBeenCalledWith(undefined, 90));

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[1], '7');

    await waitFor(() => expect(adminApi.outbreaks).toHaveBeenCalledWith(undefined, 7));
  });

  it('ADM-MAP-04: filtering by a specific disease re-fetches with that disease key', async () => {
    vi.mocked(adminApi.outbreaks).mockResolvedValue([]);
    renderWithProviders(<OutbreakMap />);
    await screen.findByText('Rice Blast');

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'rice_blast');

    await waitFor(() => expect(adminApi.outbreaks).toHaveBeenCalledWith('rice_blast', 90));
  });
});
