import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Define as opções padrão para o cookie de autenticação
 */
const getDefaultCookieOptions = (): Partial<ResponseCookie> => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24, // 1 dia em segundos
  path: '/',
});

/**
 * Salva o token de autenticação em um cookie
 */
export function setAuthCookie(token: string): void {
  cookies().set(AUTH_COOKIE_NAME, token, getDefaultCookieOptions());
}

/**
 * Obtém o token de autenticação do cookie
 */
export function getAuthCookie(): string | undefined {
  return cookies().get(AUTH_COOKIE_NAME)?.value;
}

/**
 * Remove o cookie de autenticação
 */
export function removeAuthCookie(): void {
  cookies().delete(AUTH_COOKIE_NAME);
}
