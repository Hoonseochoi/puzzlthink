"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown, Trophy } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import StoneAvatar from '@/components/StoneAvatar';
import { type PgRankRow, clock, fetchRanking } from '@/lib/propositionGoClient';
import { BoardTabs, WeekTopBlock, useWeek, useWeekRows } from './PropWeekly';

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * 명제 바둑's ranking on its entry screen (GameIntroHero): this week's #1 (points: each day #1 = 20 … #20 = 1), then
 * 오늘 / 이번 주 tabs — today's board by time, the week's by points — top five with a button for the top 20.
 * The other games' GameRankCard links to /ranking/<game>, which 명제 바둑 has no page for (a daily board, not wins).
 */
export default function PropRankCard() {
  const en = useLocale() === 'en';
  const t = useTranslations('PropositionGo');
  const { user, ready } = useAuth();
  const [rows, setRows] = useState<PgRankRow[] | null>(null);
  const [all, setAll] = useState(false);
  const [tab, setTab] = useState<'today' | 'week'>('today');
  const week = useWeek();
  const weekRows = useWeekRows(20, tab === 'week');

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    fetchRanking(20).then(({ data }) => { if (alive) setRows(data ?? []); });
    return () => { alive = false; };
  }, [ready, user?.id]);

  // One list for both tabs: today's rows show the time, the week's the points (and days scored).
  const list: { rank: number; nickname: string; is_me: boolean; value: string; sub?: string }[] | null = tab === 'today'
    ? rows && rows.map((r) => ({ rank: r.rank, nickname: r.nickname, is_me: r.is_me, value: clock(r.total, true) }))
    : weekRows && weekRows.map((r) => ({ rank: r.rank, nickname: r.nickname, is_me: r.is_me, value: t('weekPoints', { n: r.points }), sub: t('weekDays', { n: r.days }) }));
  const shown = list ? (all ? list : list.slice(0, 5)) : [];
  const me = list?.find((r) => r.is_me);
  const empty = tab === 'today' ? (en ? 'No one has cleared today yet. Be the first!' : '아직 오늘 깬 사람이 없어요. 첫 1위에 도전!') : t('weekEmpty');
  return (
    <section className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
      <WeekTopBlock week={week} className="mb-3" />
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 text-[15px] font-black"><Trophy size={16} className="shrink-0 text-(--accent)" /><span className="truncate">{t('rankingBoard')}</span><span className="truncate text-[11px] font-bold text-white/45">{tab === 'today' ? (en ? 'fastest clear' : '3문제 기록') : (en ? 'daily points' : '일일 순위 점수')}</span></h3>
        <BoardTabs value={tab} onChange={(v) => { setTab(v); setAll(false); }} className="shrink-0" />
      </div>
      <ol className="mt-3 flex flex-col gap-1.5">
        {!list ? <li className="flex h-11 items-center justify-center rounded-xl border border-dashed border-white/10 text-[11px] font-bold text-white/45">…</li>
          : !list.length ? <li className="flex h-11 items-center justify-center rounded-xl border border-dashed border-white/10 text-[12px] font-bold text-white/45">{empty}</li>
          : shown.map((r) => (
            <li key={`${r.rank}-${r.nickname}`} className={`flex h-11 min-w-0 items-center gap-2 rounded-xl px-3 ${r.is_me ? 'bg-(--accent)/20 ring-1 ring-(--accent)/50' : 'bg-white/[0.05]'}`}>
              <span className="w-6 text-center text-[14px] font-black leading-none text-white/50">{r.rank <= 3 ? MEDALS[r.rank - 1] : r.rank}</span>
              <span className="shrink-0"><StoneAvatar name={r.nickname} size={24} /></span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold">{r.nickname}</span>
              {r.sub && <span className="shrink-0 text-[10.5px] font-bold text-white/40">{r.sub}</span>}
              <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] font-black ${r.rank === 1 ? 'bg-(--accent)/15 text-(--accent)' : 'bg-white/[0.06] text-white/60'}`}>{r.value}</span>
            </li>
          ))}
      </ol>
      {list && list.length > 5 && (
        <button type="button" onClick={() => setAll((x) => !x)} className="mt-2 flex items-center justify-center gap-1 rounded-xl py-1.5 text-[12px] font-black text-(--accent) hover:bg-white/[0.04]">
          {all ? (en ? 'Show less' : '접기') : (en ? `Top ${Math.min(list.length, 20)}` : `${Math.min(list.length, 20)}위까지 보기`)}<ChevronDown size={14} className={all ? 'rotate-180' : ''} />
        </button>
      )}
      {me && !all && me.rank > 5 && (
        <p className="mt-2 flex items-center justify-between rounded-xl bg-(--accent) px-3 py-2 text-[12px] font-black text-(--accent-ink)"><span>{en ? 'My rank' : '내 순위'}</span><span className="font-mono text-[13px]">#{me.rank} · {me.value}</span></p>
      )}
      {tab === 'week' && <p className="mt-2 break-keep text-center text-[10.5px] font-bold text-white/40">{t('weekRule')}</p>}
    </section>
  );
}
