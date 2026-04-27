import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Keep clean URLs on one marketing document (scroll handled client-side). */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/features' || pathname === '/specs' || pathname === '/compat') {
    return NextResponse.rewrite(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/features', '/specs', '/compat'],
};
