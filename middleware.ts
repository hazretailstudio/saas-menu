import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)'],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  if (hostname.includes('.') && hostname !== rootDomain && !hostname.startsWith('www.')) {
    const subdomain = hostname.replace(`.${rootDomain}`, '').split(':')[0];
    
    if (url.pathname.startsWith('/r/')) {
      return NextResponse.next();
    }

    return NextResponse.rewrite(new URL(`/r/${subdomain}${url.pathname}`, req.url));
  }

  return NextResponse.next();
}
