import axios from 'axios';

import { API_BASE_URL } from '@/constant/serviceConstant';

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000, withCredentials: true });

api.interceptors.request.use(async (config) => {
  const { store } = await import('@/store');
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { store } = await import('@/store');
  const { clearAuth, setCredentials } = await import('@/store/authSlice');
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/auth/refresh`,
      {},
      { withCredentials: true },
    );
    store.dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
    return data.accessToken as string;
  } catch {
    store.dispatch(clearAuth());
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.includes('/api/auth/');
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccessToken();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message ?? error.message ?? fallback;
  }
  return fallback;
}
