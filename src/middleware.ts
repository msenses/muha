import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths (izin verilen sayfalar)
  const publicPaths = ['/login', '/test-connection', '/'];
  const isPublicPath = publicPaths.includes(pathname) || publicPaths.some(path => pathname.startsWith(path + '/'));

  // Static files, API routes ve özel path'ler - direkt geç
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // Public path ise direkt geç (redirect loop'u önlemek için)
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Private sayfalar için Supabase cookie kontrolü
  // Supabase cookies format: sb-<project-ref>-auth-token
  const cookies = req.cookies.getAll();
  const hasAuthCookie = cookies.some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
  );

  // Session yoksa login'e yönlendir
  if (!hasAuthCookie) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
