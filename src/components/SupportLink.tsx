"use client";

import { useTranslations } from 'next-intl';
import { Coffee, Heart } from 'lucide-react';

/** Voluntary support goes through CTEE: supporters see only "PUZZLTHINK", never the developer's name or account. */
export const SUPPORT_URL = 'https://ctee.kr/place/puzzlthink/donation';

/**
 * "Support the developer". `card` is a small panel (home, game entry screens); `link` is a footer link.
 * Opens CTEE in a new tab; nothing is sent from this site.
 */
export default function SupportLink({ variant = 'card', tone = 'light' }: { variant?: 'card' | 'link'; tone?: 'light' | 'dark' }) {
  const t = useTranslations('Common');
  if (variant === 'link') {
    return <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#e8590c] hover:text-[#c2410c]"><Heart size={11} fill="currentColor" />{t('supportShort')}</a>;
  }
  const dark = tone === 'dark';
  return (
    <div className={`mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-[20px] border px-5 py-5 text-center sm:flex-row sm:justify-between sm:text-left ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-white/60'}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a]"><Coffee size={19} /></span>
        <div>
          <p className={`text-sm font-black ${dark ? 'text-white' : 'text-[#17201e]'}`}>{t('supportTitle')}</p>
          <p className={`mt-0.5 break-keep text-xs leading-5 ${dark ? 'text-white/50' : 'text-black/50'}`}>{t('supportDesc')}</p>
        </div>
      </div>
      <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#ff6b4a] px-5 py-2.5 text-xs font-black text-white shadow-[0_6px_18px_rgba(255,107,74,.35)] transition hover:-translate-y-0.5 hover:bg-[#f25a38]">
        <Heart size={13} fill="currentColor" />{t('supportButton')}
      </a>
    </div>
  );
}

/**
 * One quiet line for end-of-game screens: "☕ 재밌었다면 개발자에게 커피 한 잔". Small, centred, no box,
 * so it never competes with "play again".
 */
export function CoffeeNudge({ tone = 'dark', className = '' }: { tone?: 'light' | 'dark'; className?: string }) {
  const t = useTranslations('Common');
  return (
    <p className={`text-center ${className}`}>
      <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 text-[11px] font-bold underline-offset-4 transition hover:underline ${tone === 'dark' ? 'text-white/45 hover:text-[#ffb199]' : 'text-black/45 hover:text-[#e8590c]'}`}>
        <Coffee size={12} />{t('coffeeNudge')}
      </a>
    </p>
  );
}
