"use client";

import { useEffect } from 'react';
import Cookies from 'js-cookie';

/**
 * Componente do lado do cliente para sincronizar o token JWT entre localStorage e cookies.
 * Este componente não renderiza nada visualmente, apenas executa a lógica de sincronização.
 */
export function TokenSyncClient(): React.ReactNode {
  useEffect(() => {
    const syncTokenToCookie = () => {
      if (typeof window === 'undefined') return;
      
      try {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          Cookies.set('auth_token', token, {
            expires: 1, // 1 dia
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
          return true;
        } else {
          Cookies.remove('auth_token', { path: '/' });
          return false;
        }
      } catch (error) {
        console.error('Erro ao sincronizar token:', error);
        return false;
      }
    };

    // Sincroniza o token imediatamente
    const syncResult = syncTokenToCookie();
    console.log('Token sincronizado do localStorage para cookie:', syncResult);

    // Configura um listener para mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token') {
        const syncResult = syncTokenToCookie();
        console.log('Token atualizado do localStorage para cookie:', syncResult);
      }
    };

    // Verificar periodicamente (a cada 30 segundos) se o token ainda está válido
    const intervalId = setInterval(() => {
      syncTokenToCookie();
    }, 30000); // 30 segundos

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
}
