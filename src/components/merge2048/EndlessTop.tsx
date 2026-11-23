"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, Medal } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getSupabase } from '@/lib/supabase';
import RankBlock, { blockOfSub } from './RankBlock';

type Row = { rank: number; nickname: string; score: number; sub: number | null };
const MEDALS = ['🥇', '🥈', '🥉'];

/** 챌린지 도전 top 5 beside the board (the full list is on /ranking/2048). `refresh` reloads it after a run is recorded. */
export default function EndlessTop({ refresh = 0 }: { refresh?: number }) {
  const t = useTranslations('Merge2048');
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let alive = true;
    supabase.rpc('challenge_top', { p_board: 'merge2048', p_limit: 5 }).then(({ data }) => { if (alive) setRows((data as Row[] | null) ?? []); });
    return () => { alive = false; };
  }, [refresh]);

  return (
    <section className="rounded-[14px] border border-white/10 bg-[#121217]/85 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/40"><Medal size={12} className="text-(--accent)" />{t('rankingTitle')}</p>
        <Link href="/ranking/2048" className="flex items-center text-[11px] font-bold text-white/45 hover:text-(--accent)">{t('seeAll')}<ChevronRight size={13} /></Link>
      </div>
      {rows === null ? <p className="mt-3 text-xs text-white/35">…</p>
        : rows.length === 0 ? <p className="mt-3 break-keep text-xs leading-5 text-white/40">{t('rankingEmpty')}</p>
          : (
            <ol className="mt-3 space-y-1.5">
              {rows.map((r, i) => (
                <li key={`${r.nickname}-${i}`} className="flex items-center gap-2 rounded-md bg-black/25 px-2.5 py-1.5 text-xs">
                  <span className="w-5 text-center font-black">{MEDALS[i] ?? i + 1}</span>
                  <RankBlock block={blockOfSub(r.sub)} name={r.nickname} size={26} />
                  <span className="min-w-0 flex-1 truncate font-bold text-white/80">{r.nickname}</span>
                  <span className="font-mono font-black text-(--accent)">{r.score.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          )}
      <p className="mt-2.5 break-keep text-[10px] leading-4 text-white/35">{t('rankingNote')}</p>
    </section>
  );
}
