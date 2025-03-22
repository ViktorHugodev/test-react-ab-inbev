"use client";

import React from 'react';
import { useTokenSync } from '@/lib/token-sync';

interface TokenSyncProviderProps {
  children: React.ReactNode;
}

/**
 * Provedor para sincronização de token entre localStorage e cookies
 * 
 * Este componente utiliza o hook useTokenSync para garantir que o token
 * seja sincronizado entre localStorage e cookies, permitindo que o middleware
 * funcione corretamente.
 */
export function TokenSyncProvider({ children }: TokenSyncProviderProps) {
  // Utiliza o hook para sincronizar o token
  useTokenSync();
  
  // Apenas renderiza os filhos, sem adicionar nenhum elemento ao DOM
  return <>{children}</>;
}
