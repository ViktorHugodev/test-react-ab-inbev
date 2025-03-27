"use client";

import { useEffect } from 'react';
import Cookies from 'js-cookie';

const AUTH_COOKIE_NAME = 'auth_token';
const COOKIE_EXPIRY_DAYS = 1;


export function useTokenSync() {
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
}


export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_token');
  Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
  console.log('Token removido do localStorage e cookie');
}
