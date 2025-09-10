
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PAGES = ["/", "/registrations", "/confirmations", "/validate-payment", "/spot-registration", "/issue-band"];
const SPOT_PAGES = ["/spot-registration"];
const ENTRY_PAGES = ["/issue-band"];

const ROLE_PAGES: Record<string, string[]> = {
    admin: ADMIN_PAGES,
    spot: SPOT_PAGES,
    entry: ENTRY_PAGES
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('user_role')?.value;
  
  const isLoginPage = pathname.startsWith('/login');

  // If user is not logged in
  if (!role) {
    // and trying to access anything other than the login page, redirect to login
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // If user is logged in
  const allowedPages = ROLE_PAGES[role] || [];

  // and tries to access the login page, redirect them to their default page
  if (isLoginPage) {
    let homeUrl = '/';
    if(role === 'spot') homeUrl = '/spot-registration';
    if(role === 'entry') homeUrl = '/issue-band';
    return NextResponse.redirect(new URL(homeUrl, request.url));
  }
  
  // and tries to access a page they are not allowed to, redirect them
  if (!allowedPages.includes(pathname)) {
    let homeUrl = '/';
    if(role === 'spot') homeUrl = '/spot-registration';
    if(role === 'entry') homeUrl = '/issue-band';
    return NextResponse.redirect(new URL(homeUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
