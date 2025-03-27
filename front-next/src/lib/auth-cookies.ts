import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const AUTH_COOKIE_NAME = 'auth_token';


const getDefaultCookieOptions = (): Partial<ResponseCookie> => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24, 
  path: '/',
});


export function setAuthCookie(token: string): void {
  cookies().set(AUTH_COOKIE_NAME, token, getDefaultCookieOptions());
}


export function getAuthCookie(): string | undefined {
  return cookies().get(AUTH_COOKIE_NAME)?.value;
}


export function removeAuthCookie(): void {
  cookies().delete(AUTH_COOKIE_NAME);
}
