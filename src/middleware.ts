import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    // Supabase 세션 업데이트 (환경변수 확인 및 에러 방지)
    try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            await updateSession(request);
        }
    } catch (e) {
        console.error('Middleware session update error:', e);
    }

    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    // Excluding auth/callback from internationalization
    matcher: ['/', '/(ko|en)/:path*', '/((?!api|auth/callback|_next|_vercel|.*\\..*).*)']
};
