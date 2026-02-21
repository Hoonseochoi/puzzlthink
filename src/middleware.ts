import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    // 1. Supabase 세션 업데이트 (쿠키 세션 유지)
    // 2. i18n 미들웨어 적용
    // Note: updateSession 내부에서 유저 정보를 체크할 수 있음
    await updateSession(request);
    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    // Excluding auth/callback from internationalization
    matcher: ['/', '/(ko|en)/:path*', '/((?!api|auth/callback|_next|_vercel|.*\\..*).*)']
};
