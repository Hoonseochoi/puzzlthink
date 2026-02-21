"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import UserMenu from '@/components/UserMenu';
import SudokuNavDropdown from '@/components/SudokuNavDropdown';

// Pages that have their own immersive header (hide global header)
const HIDE_ON = ['/play', '/login'];

export default function GlobalHeader() {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [supabase] = useState(() => createClient());

    const hidden = HIDE_ON.some(seg => pathname?.includes(seg));

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) =>
            setUser(data.session?.user ?? null)
        );
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) =>
            setUser(session?.user ?? null)
        );
        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => await supabase.auth.signOut();

    if (hidden) return null;

    return (
        <header className="w-full flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 md:px-10 lg:px-16 shrink-0">
            {/* ——— LEFT: Logo + Category Nav ——— */}
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2.5 shrink-0">
                    <img src="/logo.png" alt="PUZZL THINK" className="h-9 w-auto object-contain rounded-lg" />
                    <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white hidden sm:block">PUZZL THINK</span>
                </Link>
                {/* Divider */}
                <span className="hidden md:block w-px h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                {/* SUDOKU category dropdown — left of nav */}
                <div className="hidden md:block">
                    <SudokuNavDropdown />
                </div>
            </div>

            {/* ——— RIGHT: User / Sign In ——— */}
            <div className="flex items-center gap-3">
                {user ? (
                    <UserMenu user={user} onSignOut={handleSignOut} />
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center justify-center rounded-lg h-9 px-5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </header>
    );
}
