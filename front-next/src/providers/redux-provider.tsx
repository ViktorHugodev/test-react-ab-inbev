"use client";

import { ReactNode, useMemo } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/redux/store';

export function ReduxProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => makeStore(), []);
  return <Provider store={store}>{children}</Provider>;
}