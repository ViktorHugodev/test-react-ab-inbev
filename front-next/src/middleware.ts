import { NextRequest, NextResponse } from 'next/server';


// Definição mais clara de rotas públicas vs. protegidas
const PUBLIC_ROUTES = [
  '/login',
  '/auth/login',
  '/auth/register',
];

const API_AUTH_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
];

// Função para verificar se é um arquivo estático
const isStaticFile = (path: string): boolean => {
  return (
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.includes('.')
  );
};

// Função para verificar se é uma rota pública
const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
};

// Função para verificar se é uma rota de API pública
const isPublicApiRoute = (path: string): boolean => {
  return API_AUTH_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
};
console.log('Middleware executando para:');
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Console log para debug (remova em produção)
  console.log('Middleware executando para:', pathname);
  
  // Ignora arquivos estáticos
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }
  
  // Permite acesso a rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Permite acesso a APIs de autenticação
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Verifica o token para rotas protegidas
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    // Se for uma solicitação de API, retorna erro 401
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ message: 'Não autenticado' }),
        { 
          status: 401,
          headers: { 'content-type': 'application/json' }
        }
      );
    }
    
    // Para rotas de página, redireciona para login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    // Verificação básica do token (validação de existência apenas)
    // Para verificação completa, descomente o código abaixo
    
    /*
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    */
    
    // Token existe, prosseguir com a requisição
    return NextResponse.next();
  } catch (error) {
    console.error('Erro na validação do token:', error);
    
    // Se o token for inválido, limpar o cookie e redirecionar
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

// Configuração mais precisa do matcher
export const config = {
  matcher: [
    // Excluir arquivos estáticos específicos
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Incluir rotas de API, exceto as públicas de auth
    '/api/:path*',
  ],
};