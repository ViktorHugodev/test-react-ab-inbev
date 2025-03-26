import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../features/ui/uiSlice';
import themeReducer from '../features/theme/themeSlice';

// Create a makeStore function to properly handle SSR
export const makeStore = () => {
  return configureStore({
    reducer: {
      ui: uiReducer,
      theme: themeReducer,
    },
    // Disable devTools in production
    devTools: process.env.NODE_ENV !== 'production',
  });
};

// Infer types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];