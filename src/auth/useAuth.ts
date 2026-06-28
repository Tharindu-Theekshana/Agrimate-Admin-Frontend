import { useCallback } from 'react';

import { apiErrorMessage } from '@/api/client';
import { authApi } from '@/api/endpoints';
import { clearAuth, setCredentials } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Redux-backed auth hook. Session lives in sessionStorage (access token) + httpOnly cookie (refresh). */
export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isAuthenticated = !!user && !!accessToken;

  const login = useCallback(
    async (identifier: string, password: string) => {
      try {
        const res = await authApi.login(identifier, password);
        if (res.user.role !== 'ADMIN') throw new Error('This dashboard is for administrators only.');
        // Refresh token is set as an httpOnly cookie by the server; we keep only the access token.
        dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      } catch (e) {
        throw new Error(apiErrorMessage(e));
      }
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout(); // clears the refresh cookie server-side
    } catch {
      /* ignore network errors on logout */
    }
    dispatch(clearAuth());
  }, [dispatch]);

  return { user, isAuthenticated, login, logout };
}
