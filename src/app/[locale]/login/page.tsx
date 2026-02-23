"use client";

import { Link } from '@/i18n/routing';
import { LoginFormContent } from '@/components/LoginFormContent';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100/80 dark:bg-slate-950/80">
            <div className="w-full max-w-md flex flex-col gap-4">
                {/* 뒤로가기 */}
                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors self-start"
                >
                    <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                    <span className="text-sm font-medium">뒤로가기</span>
                </Link>

                {/* 로그인 카드 (팝업형) */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden p-6">
                    <LoginFormContent />
                </div>
            </div>
        </div>
    );
}
