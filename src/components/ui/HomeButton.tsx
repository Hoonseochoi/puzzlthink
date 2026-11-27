"use client";

import { House } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const TONE = {
  dark: 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white',
  light: 'border-black/15 bg-white text-black/75 hover:bg-white/70 hover:text-black',
};

/**
 * "홈으로" on a finished game's screen: to the home page for the current locale (the app's home inside the Play app too).
 * It replaces the current history entry, so back from the home page does not reopen the finished game.
 * `tone` is the surface it sits on; `block` fills its grid cell / row like the other result buttons, otherwise it is a
 * compact inline button (the size of BTN in gameUi). The screen's own 다시 하기 stays the primary action next to it.
 */
export default function HomeButton({ tone = 'dark', block = false, className = '', onClick, label }: {
  tone?: 'dark' | 'light'; block?: boolean; className?: string; onClick?: () => void; label?: string;
}) {
  const t = useTranslations('Common');
  const size = block ? 'w-full rounded-[12px] py-3 text-xs' : 'rounded-md px-3 py-2 text-xs';
  return (
    <Link href="/" replace onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 border font-bold transition ${size} ${TONE[tone]} ${className}`}>
      <House size={14} />{label ?? t('goHome')}
    </Link>
  );
}
