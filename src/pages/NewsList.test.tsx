import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/adminService', () => ({
  adminApi: { news: vi.fn(), deleteNews: vi.fn() },
}));

import { adminApi } from '@/service/adminService';
import type { News } from '@/api/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { NewsList } from './NewsList';

const article: News = { id: 1, title: 'Brown spot outbreak', description: 'Details here', imageUrl: null, createdAt: '2026-08-01T00:00:00Z' };

describe('NewsList page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ADM-NEWS-01: renders every published article', async () => {
    vi.mocked(adminApi.news).mockResolvedValueOnce([article]);
    renderWithProviders(<NewsList />);

    expect(await screen.findByText('Brown spot outbreak')).toBeInTheDocument();
  });

  it('ADM-NEWS-02: shows an empty state when there is no news yet', async () => {
    vi.mocked(adminApi.news).mockResolvedValueOnce([]);
    renderWithProviders(<NewsList />);

    expect(await screen.findByText('No news yet.')).toBeInTheDocument();
  });

  it('ADM-NEWS-03: deleting an article asks for confirmation, then calls deleteNews', async () => {
    vi.mocked(adminApi.news).mockResolvedValueOnce([article]);
    vi.mocked(adminApi.deleteNews).mockResolvedValueOnce(undefined);
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    renderWithProviders(<NewsList />);
    await screen.findByText('Brown spot outbreak');

    await userEvent.click(screen.getByTitle('Delete'));

    await waitFor(() => expect(adminApi.deleteNews).toHaveBeenCalledWith(1));
    expect(screen.queryByText('Brown spot outbreak')).not.toBeInTheDocument();
  });

  it('ADM-NEWS-04: cancelling the confirmation does not delete the article', async () => {
    vi.mocked(adminApi.news).mockResolvedValueOnce([article]);
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
    renderWithProviders(<NewsList />);
    await screen.findByText('Brown spot outbreak');

    await userEvent.click(screen.getByTitle('Delete'));

    expect(adminApi.deleteNews).not.toHaveBeenCalled();
    expect(screen.getByText('Brown spot outbreak')).toBeInTheDocument();
  });
});
