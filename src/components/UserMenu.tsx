"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import { Link } from '@/i18n/routing';

interface UserMenuProps {
    user: User;
    onSignOut: () => void;
}

export default function UserMenu({ user, onSignOut }: UserMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User';

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <div className="relative" ref={menuRef}>
            {/* Pill trigger */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-700/80"
            >
                {user.user_metadata?.avatar_url ? (
                    <img
                        src={user.user_metadata.avatar_url}
                        alt={displayName}
                        className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {displayName[0].toUpperCase()}
                    </div>
                )}
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block max-w-[120px] truncate">
                    {displayName}
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500 leading-none"
                    style={{ fontSize: '16px' }}
                >
                    keyboard_arrow_down
                </motion.span>
            </button>

            {/* Dropdown panel — Dynamic Island style */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute right-0 top-full mt-2 w-60 bg-white/90 dark:bg-[#1a2535]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-[100]"
                    >
                        {/* Profile header */}
                        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt={displayName} className="w-9 h-9 rounded-full shadow-sm" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                    {displayName[0].toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{displayName}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5 flex flex-col gap-0.5">
                            <Link
                                href="/myrecord"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-semibold transition-all group"
                            >
                                <span className="material-symbols-outlined text-[20px] text-blue-500 group-hover:scale-110 transition-transform">bar_chart</span>
                                MY RECORD
                            </Link>
                            <button
                                onClick={() => { onSignOut(); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 text-sm font-semibold transition-all group"
                            >
                                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">logout</span>
                                로그아웃
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
