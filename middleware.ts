import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)'],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || '';

  // 1. Si no hay dominio personalizado configurado, o es localhost o termina en vercel.app, dejar pasar directo
  if (
    !rootDomain ||
    hostname.endsWith('.vercel.app') ||
    hostname.startsWith('localhost') ||
    hostname === rootDomain
  ) {
    return NextResponse.next();
  }

  // 2. Solo reescribir si es un subdominio real sobre tu dominio propio (ej: demo.mirestaurante.com)
  if (hostname.endsWith(`.${rootDomain}`)) {
    const subdomain = hostname.replace(`.${rootDomain}`, '').split(':')[0];

    if (url.pathname.startsWith('/r/')) {
      return NextResponse.next();
    }

    return NextResponse.rewrite(new URL(`/r/${subdomain}${url.pathname}`, req.url));
  }

  return NextResponse.next();
}
