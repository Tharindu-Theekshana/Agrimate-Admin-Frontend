import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { apiErrorMessage } from '@/api/api';
import type { User } from '@/api/types';
import * as authService from '@/service/authService';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
}

const initialState: AuthState = { user: null, accessToken: null };

export const loginThunk = createAsyncThunk<
  { user: User; accessToken: string },
  { identifier: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ identifier, password }, { rejectWithValue }) => {
  let res;
  try {
    res = await authService.login(identifier, password);
  } catch (e) {
    return rejectWithValue(apiErrorMessage(e));
  }
  if (res.user.role !== 'ADMIN') {
    return rejectWithValue('This dashboard is for administrators only.');
  }
  return { user: res.user, accessToken: res.accessToken };
});

export const confirmPasswordResetThunk = createAsyncThunk<
  { user: User; accessToken: string },
  { email: string; code: string; newPassword: string },
  { rejectValue: string }
>('auth/confirmPasswordReset', async ({ email, code, newPassword }, { rejectWithValue }) => {
  let res;
  try {
    res = await authService.confirmPasswordReset(email, code, newPassword);
  } catch (e) {
    return rejectWithValue(apiErrorMessage(e));
  }
  return { user: res.user, accessToken: res.accessToken };
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch (e){
    console.error(e);
  }
});

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
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
      })
      .addCase(confirmPasswordResetThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      });
  },
});

export const { setCredentials, setAccessToken, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
