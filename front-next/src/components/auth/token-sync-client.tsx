"use client";

import { useEffect } from 'react';
import Cookies from 'js-cookie';

/**
 * Componente do lado do cliente para sincronizar o token JWT entre localStorage e cookies.
 * Este componente não renderiza nada visualmente, apenas executa a lógica de sincronização.
 */
export function TokenSyncClient() {
  useEffect(() => {
    const syncTokenToCookie = () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        Cookies.set('auth_token', token, {
          expires: 1, // 1 dia
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      } else {
        Cookies.remove('auth_token', { path: '/' });
      }
    };

    // Sincroniza o token imediatamente
    syncTokenToCookie();

    // Configura um listener para mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token') {
        syncTokenToCookie();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
}
