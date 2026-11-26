import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { GAMES } from './lib/gameCatalog';
import { PLAY_APP_COOKIE, PLAY_APP_VALUE, hiddenGameOfPath, isPlayAppRequest } from './lib/playApp';

const intl = createMiddleware(routing);

/**
 * The bare domain goes to www (the canonical host), like Vercel did; everything else is next-intl's locale routing.
 * Inside the Google Play app (see src/lib/playApp.ts) a hidden game's pages are served as the neutral /web-only page.
 */
export default function proxy(request: NextRequest) {
  if (request.headers.get('host') === 'puzzlthink.com') {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://www.puzzlthink.com');
    return NextResponse.redirect(url, 308);
  }
  const { pathname, searchParams } = request.nextUrl;
  if (!isPlayAppRequest(searchParams, request.headers.get('referer'), request.cookies.get(PLAY_APP_COOKIE)?.value)) {
    return intl(request);
  }
  const locale = pathname.match(/^\/(ko|en)(?=\/|$)/)?.[1];
  const response = locale && hiddenGameOfPath(pathname, GAMES)
    ? NextResponse.rewrite(new URL(`/${locale}/web-only`, request.url))
    : intl(request);
  if (request.cookies.get(PLAY_APP_COOKIE)?.value !== PLAY_APP_VALUE) {
    response.cookies.set(PLAY_APP_COOKIE, PLAY_APP_VALUE, { path: '/', sameSite: 'lax' });
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
