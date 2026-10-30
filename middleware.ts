import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)'],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || '';

  // 1. Ignorar si estamos en rutas directas o si no hay subdominio personalizado configurado
  if (!rootDomain || hostname === rootDomain || hostname.endsWith('.vercel.app') || hostname.startsWith('localhost')) {
    return NextResponse.next();
  }

  // 2. Detección de subdominios solo para dominios personalizados (ej. demo.tudominio.com)
  if (hostname.includes(`.${rootDomain}`)) {
    const subdomain = hostname.replace(`.${rootDomain}`, '').split(':')[0];
    
    if (url.pathname.startsWith('/r/')) {
      return NextResponse.next();
    }

    return NextResponse.rewrite(new URL(`/r/${subdomain}${url.pathname}`, req.url));
  }

  return NextResponse.next();
}
