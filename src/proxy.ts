import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

/** The bare domain goes to www (the canonical host), like Vercel did; everything else is next-intl's locale routing. */
export default function proxy(request: NextRequest) {
  if (request.headers.get('host') === 'puzzlthink.com') {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://www.puzzlthink.com');
    return NextResponse.redirect(url, 308);
  }
  return intl(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
