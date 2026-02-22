"use client";

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';

export default function EscapeNavDropdown() {
    const t = useTranslations('Escape');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const navItems = [
        {
            href: '/escape',
            icon: 'door_open',
            labelKey: 'title' as const,
            descKey: 'title' as const,
            color: 'text-violet-500',
            bg: 'group-hover:bg-violet-50 dark:group-hover:bg-violet-500/10',
        },
        {
            href: '/escape/blue-moon',
            icon: 'night_shelter',
            labelKey: 'firstStoryTitle' as const,
            descKey: 'firstStoryDesc' as const,
            color: 'text-amber-600',
            bg: 'group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10',
        },
    ];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(p => !p)}
                className="flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-violet-500 dark:hover:text-violet-400 transition-colors py-1"
            >
                {t('title')}
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="material-symbols-outlined text-[16px] opacity-60"
                    style={{ fontSize: '16px' }}
                >
                    keyboard_arrow_down
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute left-0 top-full mt-2 w-64 bg-white/95 dark:bg-[#1a2535]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-[200]"
                    >
                        <div className="px-3 pt-3 pb-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">{t('title')}</p>
                        </div>
                        <div className="px-2 pb-2.5 flex flex-col gap-0.5">
                            {navItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${item.bg}`}
                                >
                                    <span className={`material-symbols-outlined text-[22px] ${item.color} group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{t(item.labelKey)}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{t(item.descKey)}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-[16px] text-slate-300 dark:text-slate-600 ml-auto">arrow_forward_ios</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
