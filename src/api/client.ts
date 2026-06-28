import axios from 'axios';

import { clearAuth, setCredentials } from '@/store/authSlice';
import { store } from '@/store';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// withCredentials so the httpOnly refresh cookie is sent to /api/auth/refresh.
export const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000, withCredentials: true });

// Attach the short-lived access token (from sessionStorage-backed redux state).
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh so concurrent 401s don't fire multiple refreshes.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    // Bare axios (no interceptors) + credentials so the refresh cookie is sent.
    const { data } = await axios.post(
      `${API_BASE_URL}/api/auth/refresh`,
      {},
      { withCredentials: true },
    );
    store.dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
    return data.accessToken as string;
  } catch {
    store.dispatch(clearAuth()); // refresh token expired/invalid → force logout
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
