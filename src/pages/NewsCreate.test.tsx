import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/adminService', () => ({
  adminApi: { createNews: vi.fn() },
}));

import { adminApi } from '@/service/adminService';
import type { News } from '@/api/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { NewsCreate } from './NewsCreate';

function renderPage() {
  return renderWithProviders(
    <>
      <Toaster />
      <Routes>
        <Route path="/news/new" element={<NewsCreate />} />
        <Route path="/news" element={<div>NEWS_LIST_PAGE</div>} />
      </Routes>
    </>,
    { route: '/news/new' },
  );
}

describe('NewsCreate page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ADM-NEWSNEW-01: does not submit when title or description is blank', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /publish/i }));

    expect(adminApi.createNews).not.toHaveBeenCalled();
  });

  it('ADM-NEWSNEW-02: publishes the article and navigates to the news list on success', async () => {
    vi.mocked(adminApi.createNews).mockResolvedValueOnce({} as News);
    renderPage();

    await userEvent.type(screen.getByPlaceholderText(/brown spot outbreak/i), 'New Advisory');
    await userEvent.type(screen.getByPlaceholderText(/write the announcement/i), 'Body text');
    await userEvent.click(screen.getByRole('button', { name: /publish/i }));

    await waitFor(() => expect(adminApi.createNews).toHaveBeenCalledWith('New Advisory', 'Body text', null));
    expect(await screen.findByText('NEWS_LIST_PAGE')).toBeInTheDocument();
  });

  it('ADM-NEWSNEW-03: shows the backend error message when publishing fails', async () => {
    vi.mocked(adminApi.createNews).mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Upload failed' } },
    });
    renderPage();

    await userEvent.type(screen.getByPlaceholderText(/brown spot outbreak/i), 'New Advisory');
    await userEvent.type(screen.getByPlaceholderText(/write the announcement/i), 'Body text');
    await userEvent.click(screen.getByRole('button', { name: /publish/i }));

    expect(await screen.findByText('Upload failed')).toBeInTheDocument();
  });
});
