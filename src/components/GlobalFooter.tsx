"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HIDE_ON = ['/play', '/login'];

const footerLinks = [
    {
        title: 'PUZZL THINK',
        links: [
            { label: 'Play Sudoku', href: '/' },
            { label: 'Sudoku Tip', href: '/sudoku-tip' },
            { label: 'Sudoku Print', href: '/sudoku-print' },
            { label: 'My Record', href: '/myrecord' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '/about' },
            { label: 'Contact Us', href: '/contact' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Terms of Service', href: '/terms' },
        ],
    },
];

export default function GlobalFooter() {
    const pathname = usePathname();
    if (HIDE_ON.some(seg => pathname?.includes(seg))) return null;

    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md mt-auto">
            <div className="max-w-5xl mx-auto px-6 py-10 lg:px-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <img src="/logo.png" alt="PUZZL THINK logo" className="h-8 w-auto rounded-lg" />
                            <span className="font-black text-base tracking-tight text-slate-800 dark:text-white">PUZZL THINK</span>
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Your daily dose of logic.<br />
                            Sharpen your mind with Sudoku.
                        </p>
                    </div>

                    {/* Link columns */}
                    {footerLinks.map(col => (
                        <div key={col.title}>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">{col.title}</h4>
                            <ul className="space-y-2">
                                {col.links.map(l => (
                                    <li key={l.href}>
                                        <Link
                                            href={l.href}
                                            className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} PUZZL THINK. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-400">
                        Made with ♥ for puzzle lovers
                    </p>
                </div>
            </div>
        </footer>
    );
}
