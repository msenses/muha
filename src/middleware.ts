import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Public paths (login ve test sayfaları)
  const publicPaths = ['/login', '/test-connection'];
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));

  // Static files ve API routes - direkt geç
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname.includes('.') ||
    req.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Supabase session cookie kontrolü
  const supabaseAuthToken = req.cookies.get('sb-ithjtcgfsyqfljwyaynw-auth-token');
  const hasSession = !!supabaseAuthToken;

  // Public path'te ve session varsa, dashboard'a yönlendir
  if (isPublicPath && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Private path'te ve session yoksa, login'e yönlendir
  if (!isPublicPath && !hasSession) {
    return NextResponse.redirect(new URL('/login', req.url));
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
