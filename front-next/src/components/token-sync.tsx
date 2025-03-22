"use client";

import React, { useEffect } from 'react';
import Cookies from 'js-cookie';

interface TokenSyncProps {
  children: React.ReactNode;
}

const AUTH_COOKIE_NAME = 'auth_token';
const COOKIE_EXPIRY_DAYS = 1;

/**
 * Componente para sincronização de token entre localStorage e cookies
 * 
 * Este componente garante que o token seja sincronizado entre localStorage e cookies,
 * permitindo que o middleware funcione corretamente.
 */
export default function TokenSync({ children }: TokenSyncProps) {
  useEffect(() => {
    // Função para sincronizar o token do localStorage para o cookie
    const syncTokenToCookie = () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Se o token existe no localStorage, sincroniza com o cookie
        Cookies.set(AUTH_COOKIE_NAME, token, {
          expires: COOKIE_EXPIRY_DAYS,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        console.log('Token sincronizado do localStorage para cookie:', !!token);
      } else {
        // Se o token não existe no localStorage, remove o cookie
        Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
        console.log('Token removido do cookie');
      }
    };

    // Sincroniza o token imediatamente quando o componente é montado
    syncTokenToCookie();

    // Adiciona um event listener para detectar mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token') {
        syncTokenToCookie();
      }
    };

    // Adiciona um intervalo para verificar periodicamente o token
    const intervalId = setInterval(syncTokenToCookie, 5000);

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup: remove o event listener e o intervalo quando o componente é desmontado
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);
  
  // Apenas renderiza os filhos, sem adicionar nenhum elemento ao DOM
  return <>{children}</>;
}
