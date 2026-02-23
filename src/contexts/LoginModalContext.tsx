"use client";

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LoginFormContent } from '@/components/LoginFormContent';

type LoginModalContextValue = {
    openLoginModal: () => void;
    closeLoginModal: () => void;
};

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function useLoginModal() {
    const ctx = useContext(LoginModalContext);
    if (!ctx) throw new Error('useLoginModal must be used within LoginModalProvider');
    return ctx;
}

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    const openLoginModal = useCallback(() => setOpen(true), []);
    const closeLoginModal = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLoginModal();
        };
        const onMessage = (e: MessageEvent) => {
            if (e.origin !== window.location.origin) return;
            if (e.data?.type === 'SUPABASE_AUTH_SUCCESS') closeLoginModal();
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('message', onMessage);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('message', onMessage);
        };
    }, [open, closeLoginModal]);

    return (
        <LoginModalContext.Provider value={{ openLoginModal, closeLoginModal }}>
            {children}
            {open && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Sign in"
                    onClick={closeLoginModal}
                >
                    <div
                        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 뒤로가기 / 닫기 */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                            <button
                                type="button"
                                onClick={closeLoginModal}
                                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                                <span className="text-sm font-medium">뒤로가기</span>
                            </button>
                            <button
                                type="button"
                                onClick={closeLoginModal}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                aria-label="Close"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <LoginFormContent />
                        </div>
                    </div>
                </div>
            )}
        </LoginModalContext.Provider>
    );
}
