"use client";

import React, { useEffect } from 'react';
import Cookies from 'js-cookie';

interface TokenSyncProps {
  children: React.ReactNode;
}

const AUTH_COOKIE_NAME = 'auth_token';
const COOKIE_EXPIRY_DAYS = 1;

export default function TokenSync({ children }: TokenSyncProps) {
  useEffect(() => {
    const syncTokenToCookie = () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        Cookies.set(AUTH_COOKIE_NAME, token, {
          expires: COOKIE_EXPIRY_DAYS,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        console.log('Token sincronizado do localStorage para cookie:', !!token);
      } else {
        Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
        console.log('Token removido do cookie');
      }
    };

    syncTokenToCookie();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token') {
        syncTokenToCookie();
      }
    };

    const intervalId = setInterval(syncTokenToCookie, 5000);

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);
  
  return <>{children}</>;
}
