'use client';

import { Provider } from 'react-redux';
import { makeStore } from './store';
import { ReactNode, useMemo } from 'react';

export function ReduxProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => makeStore(), []);
  return <Provider store={store}>{children}</Provider>;
}
