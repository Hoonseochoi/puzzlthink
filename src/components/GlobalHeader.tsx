"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Grid2X2, Menu, X } from 'lucide-react';
import { usePathname, Link } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButton from './AuthButton';

const HIDE_ON = ['/play', '/wallgo', '/janggi', '/heavy13'];

export default function GlobalHeader() {
  const pathname = usePathname();
  const t = useTranslations('Common');
  const [open, setOpen] = useState(false);
  if (HIDE_ON.some((segment) => pathname.includes(segment))) return null;

  const nav = [
    { href: '/', label: t('games') },
    { href: '/wallgo', label: t('wallgo') },
    { href: '/heavy13', label: t('heavy13') },
    { href: '/janggi', label: t('janggi') },
    { href: '/play', label: t('sudoku') },
    { href: '/records', label: t('records') },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.07] bg-[#f3f0e8]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 grid-cols-2 gap-0.5 rounded-[10px] bg-[#17201e] p-2"><i className="rounded-sm bg-[#ff6b4a]" /><i className="rounded-sm bg-white/85" /><i className="rounded-sm bg-white/85" /><i className="rounded-sm bg-[#f2c14e]" /></span>
          <span className="text-sm font-black tracking-[-0.03em]">PUZZLTHINK</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-xs font-bold text-black/55 transition hover:bg-white/70 hover:text-black">{item.label}</Link>)}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher compact />
          <AuthButton />
          <Link href="/wallgo" className="flex items-center gap-2 rounded-full bg-[#17201e] px-4 py-2.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5"><Grid2X2 size={14} /> {t('playNow')}</Link>
        </div>

        <button type="button" aria-label={t('menu')} onClick={() => setOpen((value) => !value)} className="rounded-xl p-2 transition hover:bg-white md:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>

      {open && (
        <div className="border-t border-black/[0.07] bg-[#f8f6ef] px-5 py-4 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1">
            {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-extrabold hover:bg-white">{item.label}</Link>)}
            <div className="mt-2 flex flex-col gap-2 border-t border-black/[0.07] pt-3"><AuthButton full /><LanguageSwitcher /></div>
          </nav>
        </div>
      )}
    </header>
  );
}
