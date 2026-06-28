import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '@/api/types';

interface AuthState {
  user: User | null;
  /** Access token — short-lived (15 min). Persisted to sessionStorage via redux-persist. */
  accessToken: string | null;
}

const initialState: AuthState = { user: null, accessToken: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setCredentials, setAccessToken, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
