"use client";

import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';

const HIDE_ON = ['/play', '/wallgo', '/blind-gomoku', '/laser-janggi', '/janggi', '/heavy13', '/russian-roulette', '/russian-janggi'];

export default function GlobalFooter() {
  const pathname = usePathname();
  const t = useTranslations('Common');
  if (HIDE_ON.some((segment) => pathname.includes(segment))) return null;

  return (
    <footer className="border-t border-black/[0.07] bg-[#f3f0e8]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:flex-row sm:text-left">
        <div><p className="text-sm font-black tracking-[-0.03em]">PUZZLTHINK</p><p className="mt-1 text-[11px] text-black/40">{t('tagline')}</p><p className="mt-1 text-[11px] text-black/45">{t('contactPartnership')} · <a href="mailto:contact@puzzlthink.com" className="font-bold hover:text-black">contact@puzzlthink.com</a></p></div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-bold text-black/45">
          <Link href="/laser-janggi" className="hover:text-black">{t('laserJanggi')}</Link>
          <Link href="/blind-gomoku" className="hover:text-black">{t('blindGomoku')}</Link>
          <Link href="/wallgo" className="hover:text-black">{t('wallgo')}</Link>
          <Link href="/russian-roulette" className="hover:text-black">{t('russianRoulette')}</Link>
          <Link href="/heavy13" className="hover:text-black">{t('heavy13')}</Link>
          <Link href="/janggi" className="hover:text-black">{t('janggi')}</Link>
          <Link href="/russian-janggi" className="hover:text-black">{t('russianJanggi')}</Link>
          <Link href="/play" className="hover:text-black">{t('sudoku')}</Link>
          <Link href="/games" className="hover:text-black">{t('gamesIntro')}</Link>
          <Link href="/records" className="hover:text-black">{t('records')}</Link>
          <Link href="/about" className="hover:text-black">{t('about')}</Link>
          <Link href="/contact" className="hover:text-black">{t('contact')}</Link>
          <Link href="/privacy-policy" className="hover:text-black">{t('privacy')}</Link>
          <Link href="/terms" className="hover:text-black">{t('terms')}</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
