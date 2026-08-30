import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import authReducer, { type AuthState } from '@/store/authSlice';
import uiReducer, { type UiState } from '@/store/uiSlice';

export interface TestPreloadedState {
  auth?: AuthState;
  ui?: UiState;
}

export function makeTestStore(preloaded?: TestPreloadedState) {
  return configureStore({
    reducer: { auth: authReducer, ui: uiReducer },
    preloadedState: {
      auth: preloaded?.auth ?? authReducer(undefined, { type: '@@test/init' }),
      ui: preloaded?.ui ?? uiReducer(undefined, { type: '@@test/init' }),
    },
  });
}

type RouteEntry = string | { pathname: string; state?: unknown };

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', preloaded }: { route?: RouteEntry; preloaded?: TestPreloadedState } = {},
) {
  const store = makeTestStore(preloaded);
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
}
