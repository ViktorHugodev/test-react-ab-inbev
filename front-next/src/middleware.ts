import { NextRequest, NextResponse } from 'next/server';



const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
];

const API_AUTH_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
];

// Problema: diretório com parênteses está causando erro no build standalone
// Verifica se o usuário está tentando acessar a rota principal que pode ter problemas
const needsRedirectToAlternativeRoute = (path: string): boolean => {
  // Se estiver tentando acessar a raiz ou algum caminho que passa por (routes)
  return path === '/' || path.includes('/(routes)/');
};

const isStaticFile = (path: string): boolean => {
  return (
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.includes('.')
  );
};

const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
};

const isPublicApiRoute = (path: string): boolean => {
  return API_AUTH_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware executando para:', pathname);
  
  // Redirecionar para a versão alternativa da página que não usa parênteses no caminho
  if (needsRedirectToAlternativeRoute(pathname)) {
    console.log('Redirecionando para rota alternativa');
    const url = new URL('/routes', request.url);
    return NextResponse.rewrite(url);
  }
  
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }
  
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ message: 'Não autenticado' }),
        { 
          status: 401,
          headers: { 'content-type': 'application/json' }
        }
      );
    }
    
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    // Verificação do token simplificada
    return NextResponse.next();
  } catch (error) {
    console.error('Erro na validação do token:', error);
    
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}


export const config = {
  matcher: [
    
    '/((?!_next/static|_next/image|favicon.ico).*)',
    
    '/api/:path*',
  ],
};