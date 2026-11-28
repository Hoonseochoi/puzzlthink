"use client";

// The PUZZLTHINK ORIGINAL row on the home page (phone and web): the series mark, one line on what "original"
// means here, and a card per original game with its picture. The full list lives at /originals.
import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ORIGINALS, type GameId } from '@/lib/gameCatalog';
import { FitTile } from './OpenMatchCard';
import { CHANGED_TAG } from './changedTags';
import { OriginalMark, PgDefs } from './propositionGo/PropParts';

export default function OriginalsRow({ Preview, isNew, onOpen, className = '' }: { Preview: ComponentType<{ id: GameId }>; isNew: (id: GameId) => boolean; onOpen?: (href: string) => void; className?: string }) {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');
  return (
    <section className={`relative overflow-hidden rounded-[24px] bg-[radial-gradient(120%_120%_at_0%_0%,#3b2393_0%,#1a0f3a_55%,#0f0a22_100%)] p-3.5 text-white ring-1 ring-[#c9b6ff]/25 sm:p-5 ${className}`}>
      <PgDefs />
      <span className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-[#9b7bff]/20" />
      <div className="relative flex items-center justify-between gap-2">
        <OriginalMark size="md" />
        <Link href="/originals" className="flex shrink-0 items-center text-[11.5px] font-black text-[#c9b6ff] hover:text-white">{t('originalsAll')}<ChevronRight size={13} /></Link>
      </div>
      <p className="relative mt-2 break-keep text-[12px] font-bold leading-[17px] text-white/65 sm:text-[13px]">{t('originalsLead')}</p>
      <ul className="relative mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
        {ORIGINALS.map((g) => (
          <li key={g.id}>
            <Link href={g.href} onClick={() => onOpen?.(g.href)} className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-black/30 ring-1 ring-white/10 transition active:scale-[.98] sm:hover:ring-[#c9b6ff]/50">
              <span className="relative block aspect-[4/3] overflow-hidden bg-[#17201e]">
                <FitTile title={tc(g.id)} className="h-full w-full"><Preview id={g.id} /></FitTile>
                {CHANGED_TAG[g.id] ? <span className="absolute left-2 top-2 rounded-full bg-[#3fb8ff] px-1.5 py-0.5 text-[9px] font-black tracking-[0.02em] text-[#04263a]">{tc(CHANGED_TAG[g.id]!)}</span> : isNew(g.id) && <span className="absolute left-2 top-2 rounded-full bg-[#ff4d5e] px-1.5 py-0.5 text-[9px] font-black tracking-[0.08em] text-white">NEW</span>}
              </span>
              <span className="flex flex-1 flex-col gap-0.5 p-2.5">
                <b className="truncate text-[14px] font-black tracking-[-0.03em] sm:text-[16px]">{tc(g.id)}</b>
                <span className="line-clamp-2 break-keep text-[10.5px] font-bold leading-[14px] text-white/55 sm:text-[11.5px] sm:leading-[16px]">{t(`${g.id}Description`)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
