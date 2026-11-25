"use client";

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Stone } from './StoneAvatar';

const SHOWCASE = ['h1-1', 'w2-1', 'm8192'];

/**
 * A shortcut card to the 아이콘 컬렉션 page (/icons): a fan of sample icons, a title and an arrow.
 * `owned` (signed in) turns the sub line into "보유 n개". `tone` fits it on a light or a dark surface.
 */
export default function IconCollectionLink({ owned, tone = 'dark', className = '' }: { owned?: number; tone?: 'dark' | 'light'; className?: string }) {
  const t = useTranslations('Icons');
  const dark = tone === 'dark';
  return (
    <Link href="/icons" className={`group relative flex items-center gap-3 overflow-hidden rounded-[22px] px-4 py-3.5 transition active:scale-[.985] ${dark ? 'bg-[#17201e] text-white' : 'border border-black/10 bg-white text-[#17201e] hover:border-black/25'} ${className}`}>
      {dark && <span className="pointer-events-none absolute -left-6 -top-10 h-28 w-40 rounded-full bg-[#ffd36e]/20 blur-2xl" />}
      <span className="relative flex shrink-0 items-end pl-1">
        {SHOWCASE.map((icon, i) => (
          <span key={icon} className={`relative transition-transform duration-300 ${i ? '-ml-3' : ''} ${i % 2 ? 'translate-y-0.5 group-hover:-translate-y-0.5' : '-translate-y-0.5 group-hover:translate-y-0.5'}`} style={{ zIndex: i === 1 ? 3 : 1 }}>
            <Stone name={t('collectionLink')} size={i === 1 ? 40 : 32} icon={icon} />
          </span>
        ))}
      </span>
      <span className="relative min-w-0 flex-1">
        <b className="block text-[15px] font-black tracking-[-0.02em]">{t('collectionLink')}</b>
        <span className={`block truncate text-[11.5px] font-bold ${dark ? 'text-white/55' : 'text-black/45'}`}>{owned != null ? t('collectionLinkOwned', { n: owned }) : t('collectionLinkSub')}</span>
      </span>
      <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition group-hover:translate-x-0.5 ${dark ? 'bg-[#ffd36e] text-[#17201e]' : 'bg-[#17201e] text-white'}`}><ArrowRight size={16} /></span>
    </Link>
  );
}
