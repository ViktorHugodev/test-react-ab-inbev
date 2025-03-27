"use client";

import { useEffect } from 'react';
import Cookies from 'js-cookie';


export function TokenSyncClient(): React.ReactNode {
  useEffect(() => {
    const syncTokenToCookie = () => {
      if (typeof window === 'undefined') return;
      
      try {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          Cookies.set('auth_token', token, {
            expires: 1, 
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

    
    const syncResult = syncTokenToCookie();
    console.log('Token sincronizado do localStorage para cookie:', syncResult);

    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token') {
        const syncResult = syncTokenToCookie();
        console.log('Token atualizado do localStorage para cookie:', syncResult);
      }
    };

    
    const intervalId = setInterval(() => {
      syncTokenToCookie();
    }, 30000); 

    window.addEventListener('storage', handleStorageChange);
    
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  
  return null;
}
