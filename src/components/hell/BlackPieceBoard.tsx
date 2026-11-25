"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, ChevronDown, Crown, Skull } from 'lucide-react';
import type { GameId } from '@/lib/stats';
import { CERT_GAMES } from '@/lib/hardClear';
import { type BlackPieceRow, hellWeekDays, hellWeekOf, kstDay } from '@/lib/hell';
import { getSupabase } from '@/lib/supabase';
import { GAME_LABEL } from '../HallCelebration';
import { useAuth } from '../AuthProvider';
import { Stone } from '../StoneAvatar';
import RankMove from '../RankMove';
import { BlackPiece, BlackPieceCount } from './BlackPiece';

/**
 * 블랙피스 경쟁전 standings of a 7-day week (top `limit` plus my own row when signed in); the current week by default,
 * a finished week from its frozen board. null while loading.
 */
export function useBlackPieceRanking(limit: number, week?: number) {
  const { user } = useAuth();
  const current = hellWeekOf();
  const w = week ?? current;
  const [loaded, setLoaded] = useState<{ week: number; rows: BlackPieceRow[] } | null>(null);
  useEffect(() => {
    let alive = true;
    const supabase = getSupabase();
    if (!supabase) { setLoaded({ week: w, rows: [] }); return; } // eslint-disable-line react-hooks/set-state-in-effect -- no server: show the empty board
    const call = w === current ? supabase.rpc('black_piece_ranking', { p_limit: limit }) : supabase.rpc('black_piece_final_board', { p_week: w, p_limit: limit });
    call.then(({ data }) => { if (alive) setLoaded({ week: w, rows: Array.isArray(data) ? (data as BlackPieceRow[]) : [] }); });
    return () => { alive = false; };
  }, [user, limit, w, current]);
  return loaded?.week === w ? loaded.rows : null;
}

/** "1W 기간 출시(11/24) ~ 12/1(화) 23:59 · 7일마다 새 주". */
export function useHellPeriod() {
  const t = useTranslations('Hell');
  const locale = useLocale();
  return (week: number, short = false) => {
    const { first, last } = hellWeekDays(week);
    const to = kstDay(last, locale);
    return short ? t('periodShort', { n: week, to }) : t('period', { n: week, from: week <= 1 ? t('launchDay') : kstDay(first, locale), to });
  };
}

/** The hell-mode icons a week's top three keep for good, shown ahead of time. */
function HellReward({ week }: { week: number }) {
  const t = useTranslations('Hell');
  const ti = useTranslations('Icons');
  return (
    <div className="relative mt-4 overflow-hidden rounded-[20px] border border-[#ff3355]/35 bg-black/40 p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-[#ff2448]/20 blur-3xl" />
      <div className="relative grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <span className="hell-btn inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-[0.12em] text-white"><Crown size={11} />{t('rewardBadge', { n: week })}</span>
          <h3 className="mt-2 break-keep text-lg font-black leading-tight">{t('rewardTitle')}</h3>
          <p className="mt-1.5 break-keep text-xs leading-5 text-white/55">{t('rewardDesc')}</p>
        </div>
        <div className="grid grid-cols-3 items-end gap-2">
          {([2, 1, 3] as const).map((place) => (
            <div key={place} className="flex flex-col items-center text-center">
              <Stone name={ti(`hellName${place}`)} size={place === 1 ? 62 : 48} icon={`h${week}-${place}`} />
              <span className="mt-1.5 text-[11px] font-black">{t('rewardPlace', { n: place })}</span>
              <span className="text-[10px] font-bold text-[#ff8ea0]">{ti(`hellName${place}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Wins per game behind a player's black pieces, most first. */
function GameWins({ row }: { row: BlackPieceRow }) {
  const tc = useTranslations('Common');
  const games = (Object.entries(row.per_game) as [GameId, number][]).filter(([g]) => CERT_GAMES[g]).sort((a, b) => b[1] - a[1]);
  return (
    <ul className="grid gap-1.5 sm:grid-cols-2">
      {games.map(([game, n]) => (
        <li key={game} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/80">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CERT_GAMES[game].color }} />
          <span className="min-w-0 flex-1 truncate">{tc(GAME_LABEL[game])}</span>
          <BlackPieceCount n={n} size={11} />
        </li>
      ))}
    </ul>
  );
}

/**
 * 블랙피스 경쟁전: one black piece per win against the 매우 어려움 AI, no cap; most pieces first, a tie goes to whoever
 * got there first, within a 7-day week (a finished week's top three keep a hell-mode icon, which the podium shows).
 * Top three on a neon podium, the rest in a list; tap anyone to see their wins by game. Past weeks sit in tabs.
 * Used by the records tab (limit 50) and the hell page (limit 10).
 */
export default function BlackPieceBoard({ limit = 50, heading = true }: { limit?: number; heading?: boolean }) {
  const t = useTranslations('Hell');
  const { user } = useAuth();
  const current = hellWeekOf();
  const [week, setWeek] = useState(current);
  const live = week === current;
  const rows = useBlackPieceRanking(limit, week);
  const period = useHellPeriod();
  const [open, setOpen] = useState<number | null>(null);
  const weeks = Array.from({ length: Math.min(current, 4) }, (_, i) => current - i); // this week and up to 3 past ones

  const top = rows?.filter((r) => r.rank <= limit) ?? [];
  const me = rows?.find((r) => r.is_me) ?? null;
  const podium = [top[1], top[0], top[2]];
  const rest = top.slice(3);
  const toggle = (rank: number) => setOpen((current) => (current === rank ? null : rank));
  const openRow = rows?.find((r) => r.rank === open) ?? null;

  return (
    <section className="hell-surface hell-scan hell-edge mt-10 overflow-hidden rounded-[26px] p-4 text-white sm:p-6">
      {heading && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-xl font-black"><Skull size={20} className="text-[#ff3355]" />{t('boardTitle')}</h2>
            {weeks.length > 1 && (
              <div className="flex gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1" role="tablist" aria-label={t('weekTabs')}>
                {weeks.map((w) => (
                  <button key={w} type="button" role="tab" aria-selected={week === w} onClick={() => { setWeek(w); setOpen(null); }}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-black transition ${week === w ? 'bg-[#ff2448] text-white shadow-[0_0_12px_rgba(255,36,72,.45)]' : 'text-white/50 hover:text-white'}`}>
                    {w === current ? t('weekLive', { n: w }) : t('weekHall', { n: w })}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1 break-keep text-xs leading-5 text-white/55">{live ? t('boardDesc') : t('hallDesc', { n: week })}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-[#ff2448] px-3 py-1 text-[11px] font-black text-white"><CalendarDays size={12} />{period(week)}</p>
            {live && <p className="inline-flex items-center gap-1.5 rounded-full border border-[#ff3355]/45 bg-[#ff3355]/10 px-3 py-1 text-[11px] font-bold text-[#ff8ea0]"><BlackPiece size={12} />{t('rule1')} · {t('rule2')}</p>}
          </div>
          {live && <p className="mt-1.5 text-[10px] font-bold text-white/35">{t('rankChangeHint')}</p>}
          {live && <p className="mt-1 break-keep text-[10px] font-bold text-white/35">{t('capHint')}</p>}
          {live && <HellReward week={week} />}
        </>
      )}

      {rows === null ? (
        <p className="mt-6 text-sm text-white/40">{t('loading')}</p>
      ) : !top.length ? (
        <p className="mt-6 rounded-[20px] border border-dashed border-[#ff3355]/30 p-6 text-center text-sm text-white/50">{t('topEmpty')}</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 items-end gap-2 sm:gap-4">
            {podium.map((row, i) => {
              const place = [2, 1, 3][i];
              const block = place === 1 ? 'h-28 sm:h-36 from-[#ff2448] to-[#5a0718]' : place === 2 ? 'h-20 sm:h-28 from-[#c8126f] to-[#3a0626]' : 'h-14 sm:h-20 from-[#7a1430] to-[#22050e]';
              if (!row) return <div key={place} />;
              return (
                <button key={place} type="button" onClick={() => toggle(row.rank)} aria-expanded={open === row.rank} className="group flex min-w-0 flex-col items-center text-center">
                  <span className={`rounded-full ${place === 1 ? 'drop-shadow-[0_0_8px_rgba(255,51,85,.45)]' : ''} ${row.is_me ? 'ring-2 ring-[#ff2bd6] ring-offset-2 ring-offset-[#07060a]' : ''}`}><Stone name={row.nickname} icon={`h${week}-${place}`} size={place === 1 ? 64 : 50} /></span>
                  <span className="mt-1.5 w-full truncate px-1 text-xs font-black sm:text-sm">{row.nickname}</span>
                  <BlackPieceCount n={row.pieces} size={13} className="mt-0.5 text-sm sm:text-base" />
                  {live && <span className="mt-1"><RankMove rank={row.rank} prev={row.prev_rank} dark /></span>}
                  <span className={`mt-2 flex w-full items-start justify-center rounded-t-2xl border-x border-t border-[#ff3355]/40 bg-gradient-to-b pt-2 font-black text-white shadow-[0_0_12px_rgba(255,36,72,.12)] transition group-hover:brightness-125 ${block}`}><span className="hell-neon text-3xl !text-white sm:text-4xl">{place}</span></span>
                </button>
              );
            })}
          </div>
          {openRow && openRow.rank <= 3 && (
            <div className="mt-3 rounded-[18px] border border-white/10 bg-black/30 p-3">
              <p className="mb-2 px-1 text-[11px] font-bold text-white/50">{t('piecesOf', { name: openRow.nickname, n: openRow.pieces })}</p>
              <GameWins row={openRow} />
            </div>
          )}
          {rest.length > 0 && (
            <ol className="mt-5 space-y-1.5">
              {rest.map((row) => <RankRow key={row.rank} row={row} open={open === row.rank} onToggle={() => toggle(row.rank)} />)}
            </ol>
          )}
          {me && me.rank > limit && (
            <ol className="mt-4 border-t border-dashed border-white/15 pt-4"><RankRow row={me} open={open === me.rank} onToggle={() => toggle(me.rank)} /></ol>
          )}
          {user && !me && live && <p className="mt-4 text-center text-xs text-white/45">{t('notYet')}</p>}
        </>
      )}
    </section>
  );
}

function RankRow({ row, open, onToggle }: { row: BlackPieceRow; open: boolean; onToggle: () => void }) {
  const t = useTranslations('Hell');
  return (
    <li className={`overflow-hidden rounded-2xl border ${row.is_me ? 'border-[#ff2bd6]/60 bg-[#ff2bd6]/10' : 'border-white/10 bg-white/[0.03]'}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.05]">
        <span className="flex w-9 shrink-0 flex-col items-center gap-0.5"><span className="font-mono text-sm font-black leading-none text-white/50">{row.rank}</span><RankMove rank={row.rank} prev={row.prev_rank} dark /></span>
        <Stone name={row.nickname} size={30} />
        <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{row.nickname}{row.is_me && <span className="ml-1.5 rounded-full bg-[#ff2bd6] px-1.5 py-0.5 text-[9px] font-black text-white">{t('me')}</span>}</span>
        <BlackPieceCount n={row.pieces} size={13} className="text-sm" />
        <ChevronDown size={15} className={`shrink-0 text-white/35 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-white/5 p-2.5"><GameWins row={row} /></div>}
    </li>
  );
}
