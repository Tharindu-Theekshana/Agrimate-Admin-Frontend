import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import storageSession from 'redux-persist/lib/storage/session';

import authReducer from './authSlice';
import uiReducer from './uiSlice';

const authPersistConfig = {
  key: 'agrimate-admin-auth',
  storage: storageSession,
  whitelist: ['user', 'accessToken'],
};

const uiPersistConfig = {
  key: 'agrimate-admin-ui',
  storage,
  whitelist: ['sidebarOpen', 'theme'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  ui: persistReducer(uiPersistConfig, uiReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
