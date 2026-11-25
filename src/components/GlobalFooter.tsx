"use client";

import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import SupportLink from './SupportLink';

const HIDE_ON = ['/hidden-word', '/equation-signal', '/equation-tower', '/card-janggi', '/point-omok', '/2048', '/play', '/four-three', '/monorail', '/flip-omok', '/nine-mens-morris', '/gyulhap', '/indian-poker', '/hexagon', '/piggy-bank', '/wallgo', '/blind-gomoku', '/black-white', '/laser-janggi', '/nemo-count', '/janggi', '/heavy13', '/russian-roulette', '/russian-janggi', '/two-sided-poker'];

export default function GlobalFooter() {
  const pathname = usePathname();
  const t = useTranslations('Common');
  if (HIDE_ON.some((segment) => pathname.includes(segment))) return null;

  return (
    <footer className="border-t border-black/[0.07] bg-[#f3f0e8]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 lg:px-8 text-center sm:flex-row sm:text-left">
        <div className="max-w-2xl">
          <p className="text-sm font-black tracking-[-0.03em]">PUZZLTHINK</p>
          <p className="mt-1 text-[11px] text-black/40">{t('tagline')}</p>
          <p className="mt-3 text-[11px] leading-5 text-black/50">{t('operationNotice')}</p>
          <p className="mt-2 max-w-sm text-[10px] leading-4 text-black/35">{t('unofficialNotice')}</p>
          <p className="mt-1 text-[11px] text-black/45">{t('contactPartnership')} · <a href="mailto:contact@puzzlthink.com" className="font-bold hover:text-black">contact@puzzlthink.com</a></p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-bold text-black/45">
          <Link href="/about" className="hover:text-black">{t('about')}</Link>
          <Link href="/contact" className="hover:text-black">{t('contact')}</Link>
          <SupportLink />
          <Link href="/privacy-policy" className="hover:text-black">{t('privacy')}</Link>
          <Link href="/terms" className="hover:text-black">{t('terms')}</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
