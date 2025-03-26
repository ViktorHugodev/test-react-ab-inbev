"use client";

import React from 'react';
import { useTokenSync } from '@/lib/token-sync';

interface TokenSyncProviderProps {
  children: React.ReactNode;
}


export function TokenSyncProvider({ children }: TokenSyncProviderProps) {
  useTokenSync();

  return <>{children}</>;
}
