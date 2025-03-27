import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../features/ui/uiSlice';
import themeReducer from '../features/theme/themeSlice';


export const makeStore = () => {
  return configureStore({
    reducer: {
      ui: uiReducer,
      theme: themeReducer,
    },
    
    devTools: process.env.NODE_ENV !== 'production',
  });
};


export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];