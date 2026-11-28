"use client";

// 명제 바둑's weekly board (supabase/migrations/20271208000000_prop_weekly.sql): each day #1 = 20 points … #20 = 1,
// summed over the 피스 경쟁전 week (Wed 00:00 – Tue 24:00 KST). Today counts live. Shown on the game screen (under
// TodayCard and on the result), in the ranking tabs, and on the entry page (PropRankCard).
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Trophy } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import StoneAvatar from '@/components/StoneAvatar';
import { type PgWeek, type PgWeekRow, fetchWeek, fetchWeeklyRanking } from '@/lib/propositionGoClient';

/** Fired when a daily run ends, so boards on the page pick up the new time and points. */
export const PG_RANKED_EVENT = 'puzzlthink:pg-ranked';
export const useRankedTick = () => {
  const [n, setN] = useState(0);
  useEffect(() => { const on = () => setN((x) => x + 1); window.addEventListener(PG_RANKED_EVENT, on); return () => window.removeEventListener(PG_RANKED_EVENT, on); }, []);
  return n;
};

/** This week at a glance (undefined while loading, null if it could not be read). */
export function useWeek(tick = 0) {
  const { user, ready } = useAuth();
  const own = useRankedTick();
  const [week, setWeek] = useState<PgWeek | null | undefined>(undefined);
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    fetchWeek().then(({ data }) => { if (alive) setWeek(data ?? null); });
    return () => { alive = false; };
  }, [ready, user?.id, own, tick]);
  return week;
}

/** '2026-11-25' → '11/25'. */
const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
export const weekRange = (w: Pick<PgWeek, 'start' | 'end'>) => `${md(w.start)}–${md(w.end)}`;

/** The "주간 1위" block: this week's #1 so far with points, last week's #1 small, and my place. */
export function WeekTopBlock({ week, className = '' }: { week: PgWeek | null | undefined; className?: string }) {
  const t = useTranslations('PropositionGo');
  if (week === null) return null;
  const top = week?.top;
  return (
    <div data-pg-week-top className={`relative flex items-center gap-2.5 overflow-hidden rounded-[14px] bg-[linear-gradient(120deg,rgba(255,211,110,.2),rgba(155,123,255,.1)_55%,rgba(0,0,0,.25))] px-3 py-2.5 ring-1 ring-[#ffd36e]/35 ${className}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#ffe08a] to-[#e8a33c] text-[#3a2400] shadow-[0_0_16px_rgba(255,196,60,.45),inset_0_2px_0_rgba(255,255,255,.5)]">
        <Trophy size={19} strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black tracking-[0.12em] text-[#ffd36e]">{t('weekTop')}{week && <span className="ml-1.5 font-bold tracking-normal text-white/45">{weekRange(week)}</span>}</p>
        {!week ? <Loader2 size={14} className="mt-1 animate-spin text-white/40" />
          : top ? (
            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[15px] font-black leading-5">
              <span className="shrink-0"><StoneAvatar name={top.nickname} size={20} /></span><span className="truncate">{top.nickname}</span>
            </p>
          ) : <p className="mt-0.5 break-keep text-[12px] font-bold leading-4 text-white/60">{t('weekEmpty')}</p>}
        {week && (week.last || week.me) && (
          <p className="mt-0.5 flex min-w-0 gap-2 text-[10.5px] font-bold text-white/50">
            {week.last && <span className="min-w-0 truncate">{t('weekLast', { name: week.last.nickname })}</span>}
            {week.me && <span className="shrink-0 text-[#e3d8ff]">{t('weekMe', { r: week.me.rank, n: week.me.points })}</span>}
          </p>
        )}
      </div>
      {top && <span className="shrink-0 rounded-full bg-[#ffd36e]/15 px-2.5 py-1 font-mono text-[14px] font-black text-[#ffe7a8] ring-1 ring-[#ffd36e]/30">{t('weekPoints', { n: top.points })}</span>}
    </div>
  );
}

/** The weekly board rows (top p_limit plus mine). */
export function useWeekRows(limit: number, on = true, tick = 0) {
  const own = useRankedTick();
  const [rows, setRows] = useState<PgWeekRow[] | null>(null);
  useEffect(() => {
    if (!on) return;
    let alive = true;
    fetchWeeklyRanking(limit).then(({ data }) => { if (alive) setRows(data ?? []); });
    return () => { alive = false; };
  }, [limit, on, own, tick]);
  return rows;
}

/** 오늘 / 이번 주 tabs for the ranking boards. */
export function BoardTabs({ value, onChange, className = '' }: { value: 'today' | 'week'; onChange: (v: 'today' | 'week') => void; className?: string }) {
  const t = useTranslations('PropositionGo');
  return (
    <div role="tablist" className={`flex gap-0.5 rounded-full bg-black/40 p-0.5 ${className}`}>
      {(['today', 'week'] as const).map((w) => (
        <button key={w} type="button" role="tab" aria-selected={value === w} onClick={() => onChange(w)}
          className={`rounded-full px-2.5 py-1 text-[10.5px] font-black transition ${value === w ? 'bg-(--accent) text-(--accent-ink)' : 'text-white/55 hover:text-white'}`}>{w === 'today' ? t('tabToday') : t('tabWeek')}</button>
      ))}
    </div>
  );
}

/** The weekly board in the side panel / result style (small rows). */
export function WeekRanking({ rows }: { rows: PgWeekRow[] | null }) {
  const t = useTranslations('PropositionGo');
  if (!rows) return <div className="flex h-16 items-center justify-center"><Loader2 size={16} className="animate-spin text-white/40" /></div>;
  if (!rows.length) return <p className="py-2 text-center text-[12px] text-white/45">{t('weekEmpty')}</p>;
  return (
    <ol className="flex flex-col">
      {rows.map((r) => (
        <li key={`${r.rank}-${r.nickname}`} className={`flex items-center gap-2 rounded-[8px] px-1.5 py-1 text-[12.5px] ${r.is_me ? 'bg-(--accent)/15' : ''}`}>
          <span className={`w-5 text-center font-mono text-[11px] font-black ${r.rank <= 3 ? 'text-[#ffd36e]' : 'text-white/40'}`}>{r.rank === 1 ? <Trophy size={12} className="mx-auto" /> : r.rank}</span>
          <StoneAvatar name={r.nickname} size={20} />
          <span className="min-w-0 flex-1 truncate font-bold">{r.nickname}</span>
          <span className="text-[10px] font-bold text-white/40">{t('weekDays', { n: r.days })}</span>
          <span className="min-w-[38px] text-right font-mono text-[12px] font-black text-white/85">{t('weekPoints', { n: r.points })}</span>
        </li>
      ))}
    </ol>
  );
}

/** One line under a board: how points are given. */
export function WeekRule({ className = '' }: { className?: string }) {
  const t = useTranslations('PropositionGo');
  return <p className={`break-keep text-center text-[10.5px] font-bold leading-4 text-white/40 ${className}`}>{t('weekRule')}</p>;
}
