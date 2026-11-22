"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Crown, Loader2 } from 'lucide-react';
import { type LogicHistoryRow, fetchLogicHistory } from '@/lib/logicChallenge';
import ClearRate from '../ClearRate';

/** A board's owners in order: who made it (badged with the map's clear rate) and each player who took it, with their times. The last one holds it now. */
export default function LogicHistory({ id, attempts, clears }: { id: string; attempts: number; clears: number }) {
  const t = useTranslations('Logic');
  const [rows, setRows] = useState<LogicHistoryRow[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetchLogicHistory(id).then(({ data }) => { if (alive) setRows(data ?? []); });
    return () => { alive = false; };
  }, [id]);
  const time = (ms: number) => { const s = Math.floor(ms / 1000); return t('minSec', { m: Math.floor(s / 60), s: s % 60 }); };

  if (rows === null) return <p className="flex items-center gap-2 py-1 text-[11px] text-white/45"><Loader2 size={12} className="animate-spin" />{t('loading')}</p>;
  if (!rows.length) return null;
  return (
    <ol className="space-y-1">
      {rows.map((r, i) => {
        const holder = i === rows.length - 1;
        return (
          <li key={r.nth} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${holder ? 'bg-[#ffcf3f]/12 ring-1 ring-[#ffcf3f]/35' : 'bg-white/[.04]'}`}>
            {r.kind === 'new' ? <ClearRate ns="Logic" attempts={attempts} clears={clears} full /> : <span className="w-11 shrink-0 rounded-full bg-white/12 px-1.5 py-0.5 text-center text-[9px] font-black text-white/70">{t('historyTake', { n: r.nth - 1 })}</span>}
            <span className={`min-w-0 flex-1 truncate font-bold ${r.is_me ? 'text-(--accent)' : ''}`}>{r.nickname}</span>
            {holder && <Crown size={12} className="shrink-0 text-[#ffcf3f]" aria-label={t('historyHolder')} />}
            <span className="shrink-0 font-mono font-black text-white/80">{time(r.ms)}</span>
          </li>
        );
      })}
    </ol>
  );
}
