import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthResponse, User } from '@/api/types';

vi.mock('@/service/authService', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

import * as authService from '@/service/authService';
import authReducer, {
  clearAuth,
  confirmPasswordResetThunk,
  loginThunk,
  logoutThunk,
  setAccessToken,
  setCredentials,
  setUser,
} from './authSlice';

function testStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

const farmerUser: User = {
  id: 1,
  username: 'kasun',
  email: 'kasun@agrimate.lk',
  name: 'Kasun Perera',
  role: 'FARMER',
  roles: ['FARMER'],
  language: 'en',
  agronomistStatus: 'NONE',
  suspended: false,
};

const adminUser: User = { ...farmerUser, id: 2, username: 'admin', role: 'ADMIN', roles: ['ADMIN'] };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authSlice reducers', () => {
  it('ADM-STORE-01: starts with no user and no access token', () => {
    const state = testStore().getState().auth;
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it('ADM-STORE-02: setCredentials stores both user and token', () => {
    const store = testStore();
    store.dispatch(setCredentials({ user: adminUser, accessToken: 'tok-1' }));
    expect(store.getState().auth.user).toEqual(adminUser);
    expect(store.getState().auth.accessToken).toBe('tok-1');
  });

  it('ADM-STORE-03: setAccessToken updates only the token', () => {
    const store = testStore();
    store.dispatch(setCredentials({ user: adminUser, accessToken: 'tok-1' }));
    store.dispatch(setAccessToken('tok-2'));
    expect(store.getState().auth.accessToken).toBe('tok-2');
    expect(store.getState().auth.user).toEqual(adminUser);
  });

  it('ADM-STORE-04: setUser updates only the user', () => {
    const store = testStore();
    store.dispatch(setUser(adminUser));
    expect(store.getState().auth.user).toEqual(adminUser);
    expect(store.getState().auth.accessToken).toBeNull();
  });

  it('ADM-STORE-05: clearAuth resets both fields', () => {
    const store = testStore();
    store.dispatch(setCredentials({ user: adminUser, accessToken: 'tok-1' }));
    store.dispatch(clearAuth());
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.accessToken).toBeNull();
  });
});

describe('loginThunk', () => {
  it('ADM-STORE-06: rejects non-admin users with a friendly message, without storing credentials', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      accessToken: 'tok', refreshToken: 'r', user: farmerUser,
    } satisfies AuthResponse);
    const store = testStore();

    const action = await store.dispatch(loginThunk({ identifier: 'kasun', password: 'secret123' }));

    expect(action.type).toBe('auth/login/rejected');
    expect(action.payload).toBe('This dashboard is for administrators only.');
    expect(store.getState().auth.user).toBeNull();
  });

  it('ADM-STORE-07: stores credentials on successful admin login', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      accessToken: 'tok', refreshToken: 'r', user: adminUser,
    } satisfies AuthResponse);
    const store = testStore();

    await store.dispatch(loginThunk({ identifier: 'admin', password: 'secret123' }));

    expect(store.getState().auth.user).toEqual(adminUser);
    expect(store.getState().auth.accessToken).toBe('tok');
  });

  it('ADM-STORE-08: surfaces the backend error message on failed login', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Invalid credentials' } },
    });
    const store = testStore();

    const action = await store.dispatch(loginThunk({ identifier: 'admin', password: 'wrong' }));

    expect(action.type).toBe('auth/login/rejected');
    expect(store.getState().auth.user).toBeNull();
  });
});

describe('confirmPasswordResetThunk', () => {
  it('ADM-STORE-09: stores the fresh tokens returned after a successful password reset', async () => {
    vi.mocked(authService.confirmPasswordReset).mockResolvedValueOnce({
      accessToken: 'new-tok', refreshToken: 'new-r', user: adminUser,
    } satisfies AuthResponse);
    const store = testStore();

    await store.dispatch(
      confirmPasswordResetThunk({ email: 'admin@agrimate.lk', code: '111222', newPassword: 'newSecret1' }),
    );

    expect(store.getState().auth.user).toEqual(adminUser);
    expect(store.getState().auth.accessToken).toBe('new-tok');
  });
});

describe('logoutThunk', () => {
  it('ADM-STORE-10: clears credentials even if the server call fails', async () => {
    vi.mocked(authService.logout).mockRejectedValueOnce(new Error('network down'));
    const store = testStore();
    store.dispatch(setCredentials({ user: adminUser, accessToken: 'tok-1' }));

    await store.dispatch(logoutThunk());

    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.accessToken).toBeNull();
  });
});
