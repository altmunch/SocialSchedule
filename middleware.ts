import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from './src/lib/supabase/middleware';
import { verifyCsrfToken } from '@/lib/csrf';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/confirm',
  '/api/auth/csrf',
];

// Paths that should be accessible only when not authenticated
const authPaths = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes that don't need protection
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|css|js|json)$/)
  ) {
    return NextResponse.next();
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Skip CSRF check for public API routes
    if (!pathname.startsWith('/api/auth/') && !publicPaths.some(path => pathname.startsWith(path))) {
      // Verify CSRF token for non-public API routes
      const csrfToken = request.headers.get('x-csrf-token');
      const isValidCsrf = csrfToken && (await verifyCsrfToken(csrfToken));
      
      if (!isValidCsrf) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    return NextResponse.next();
  }

  // Check if the path is public
  if (publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    // If user is already authenticated and trying to access auth pages, redirect to dashboard
    if (authPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
      const { supabase, response } = createClient(request);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const url = new URL('/dashboard', request.url);
        return NextResponse.redirect(url);
      }
      
      return response;
    }
    
    // For other public paths, allow access without authentication
    return NextResponse.next();
  }

  // Protected routes - require authentication
  const { supabase, response } = createClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  
  // If no session, redirect to sign-in
  if (!session) {
    const url = new URL('/auth/sign-in', request.url);
    url.searchParams.set('redirected', 'true');
    return NextResponse.redirect(url);
  }

  // Check for team dashboard access control
  if (pathname.startsWith('/team-dashboard') || pathname.startsWith('/team_dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single();

    const tier = profile?.subscription_tier || 'lite';
    
    // Only team tier users can access team dashboard
    if (tier !== 'team') {
      const url = new URL('/pricing', request.url);
      url.searchParams.set('upgrade', 'team');
      url.searchParams.set('reason', 'team_dashboard_access');
      return NextResponse.redirect(url);
    }
  }

  // Redirect team users from root to team dashboard
  if (pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single();

    const tier = profile?.subscription_tier || 'lite';
    
    if (tier === 'team') {
      const url = new URL('/team-dashboard', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - public paths
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
