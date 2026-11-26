"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarDays, ChevronDown, Crown, Swords } from 'lucide-react';
import type { GameId } from '@/lib/stats';
import { CERT_GAMES } from '@/lib/hardClear';
import { getSupabase } from '@/lib/supabase';
import { GAME_LABEL } from './HallCelebration';
import { useAuth } from './AuthProvider';
import { CHAMPION_LOOKS, Stone } from './StoneAvatar';

type Row = { rank: number; nickname: string; avatar_url: string | null; pieces: number; per_game: Partial<Record<GameId, number>>; last_win: string; is_me: boolean | null; prev_rank: number | null };

/**
 * One piece = one win against the hard AI. Drawn after the gold pieces from The Devil's Plan:
 * a flat brass zigzag (a meander with three prongs), brushed gold with a lighter top edge.
 */
export function Piece({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 44 28" width={size * 1.57} height={size} className="inline-block shrink-0 drop-shadow-[0_1.5px_1px_rgba(90,60,0,.35)]" aria-hidden>
      <defs>
        <linearGradient id="piece-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7e08a" />
          <stop offset="45%" stopColor="#d9b24a" />
          <stop offset="100%" stopColor="#a87d22" />
        </linearGradient>
      </defs>
      <path d="M4 25 V4 H16 V24 H28 V4 H40 V25" fill="none" stroke="#8a6416" strokeWidth="5.4" strokeLinejoin="miter" strokeLinecap="square" transform="translate(0.6 0.9)" />
      <path d="M4 25 V4 H16 V24 H28 V4 H40 V25" fill="none" stroke="url(#piece-gold)" strokeWidth="5" strokeLinejoin="miter" strokeLinecap="square" />
      <path d="M1.9 24 V1.9 H18" fill="none" stroke="#fff6c8" strokeOpacity=".75" strokeWidth=".9" />
    </svg>
  );
}

/** "[piece] ×42", small. */
export function PieceCount({ n, size = 14, className = '' }: { n: number; size?: number; className?: string }) {
  return <span className={`inline-flex shrink-0 items-center gap-1 font-mono font-black ${className}`}><Piece size={size} /><span className="text-black/35">×</span>{n}</span>;
}

/** Change since the start of today (KST): red ▲ up, blue ▼ down, NEW for a first appearance, a dash for none. */
function RankChange({ row, className = '' }: { row: Row; className?: string }) {
  const t = useTranslations('Records');
  if (row.prev_rank == null) return <span title={t('rankNew')} className={`shrink-0 rounded-full bg-[#ff6b4a] px-1.5 py-0.5 text-[9px] font-black leading-none text-white ${className}`}>NEW</span>;
  const d = row.prev_rank - row.rank;
  if (d === 0) return <span title={t('rankSame')} className={`shrink-0 font-mono text-[10px] font-black text-black/25 ${className}`}>–</span>;
  return d > 0
    ? <span title={t('rankUp', { n: d })} className={`shrink-0 font-mono text-[10px] font-black text-[#e5484d] ${className}`}>▲{d}</span>
    : <span title={t('rankDown', { n: -d })} className={`shrink-0 font-mono text-[10px] font-black text-[#3b82f6] ${className}`}>▼{-d}</span>;
}


/**
 * Weeks of 피스 경쟁전: 2W runs one week, 11/25 00:00 → 12/2 00:00 KST (5 pieces per game; the SQL stops counting at
 * the end too); 1W ended 11/24 (30 per game) and is kept as a hall of fame. A week is live until it ends.
 */
export const PIECE_WEEKS = {
  2: { cap: 5, ends: Date.parse('2026-12-02T00:00:00+09:00') },
  1: { cap: 30, ends: Date.parse('2026-11-25T00:00:00+09:00') },
} as const;
type Week = keyof typeof PIECE_WEEKS;
export const pieceWeekLive = (week: Week) => Date.now() < PIECE_WEEKS[week].ends;

/** Wins per game behind a player's pieces, most first. */
function GameWins({ row, cap }: { row: Row; cap: number }) {
  const tc = useTranslations('Common');
  const games = (Object.entries(row.per_game) as [GameId, number][]).filter(([g]) => CERT_GAMES[g]).sort((a, b) => b[1] - a[1]);
  return (
    <ul className="grid gap-1.5 sm:grid-cols-2">
      {games.map(([game, n]) => (
        <li key={game} data-play-game={game} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CERT_GAMES[game].color }} />
          <span className="min-w-0 flex-1 truncate">{tc(GAME_LABEL[game])}</span>
          {n >= cap && <span className="shrink-0 rounded-full bg-[#e8a33c] px-1.5 py-0.5 text-[9px] font-black text-white">MAX</span>}
          <PieceCount n={n} size={11} />
        </li>
      ))}
    </ul>
  );
}

/**
 * 피스 경쟁전: everyone on one board. Each win against the hard AI (any game) is one piece, at most PIECE_WEEKS[week].cap per game
 * (the server caps it; 러시안 룰렛 and 인디언 포커 do not count); most pieces first,
 * a tie goes to whoever got there first. The top three stand on a podium; tap anyone to see their wins by game.
 */
export default function CompetitionBoard() {
  const t = useTranslations('Records');
  const { user } = useAuth();
  const [week, setWeek] = useState<Week>(2);
  const [loaded, setLoaded] = useState<{ week: Week; rows: Row[] } | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const live = pieceWeekLive(week);
  const cap = PIECE_WEEKS[week].cap;
  const rows = loaded?.week === week ? loaded.rows : null;

  useEffect(() => {
    let alive = true;
    const supabase = getSupabase();
    if (!supabase) { setLoaded({ week, rows: [] }); return; } // eslint-disable-line react-hooks/set-state-in-effect -- no server: show the empty board
    // 2W is ranked live (the SQL stops counting at its end); 1W is a frozen board.
    const call = week === 2 ? supabase.rpc('competition_ranking', { p_limit: 50 }) : supabase.rpc('competition_final', { p_week: week, p_limit: 50 });
    call.then(({ data }) => { if (alive) setLoaded({ week, rows: Array.isArray(data) ? (data as Row[]) : [] }); });
    return () => { alive = false; };
  }, [user, week]);

  const top = rows?.filter((r) => r.rank <= 50) ?? [];
  const me = rows?.find((r) => r.is_me) ?? null;
  const podium = [top[1], top[0], top[2]]; // 2nd, 1st, 3rd from left
  const rest = top.slice(3);
  const toggle = (rank: number) => setOpen((current) => (current === rank ? null : rank));
  const openRow = rows?.find((r) => r.rank === open) ?? null;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-black"><Swords size={20} className="text-[#e8a33c]" />{t('competitionTitle')}</h2>
        <div className="grid grid-cols-2 gap-1 rounded-full border border-black/10 bg-[#e9e5dc] p-1" role="tablist" aria-label={t('pieceWeekTabs')}>
          {([2, 1] as Week[]).map((w) => (
            <button key={w} type="button" role="tab" aria-selected={week === w} onClick={() => { setWeek(w); setOpen(null); }}
              className={`flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black transition ${week === w ? 'bg-[#17201e] text-white shadow' : 'text-black/50 hover:text-black'}`}>
              {!pieceWeekLive(w) && <Crown size={11} className={week === w ? 'text-[#ffd36b]' : ''} />}{pieceWeekLive(w) ? t('pieceWeekLive', { n: w }) : w === 2 ? t('pieceWeekEnded', { n: w }) : t('pieceWeekHall', { n: w })}
            </button>
          ))}
        </div>
      </div>
      {live ? <>
        <p className="mt-1 break-keep text-xs leading-5 text-black/45">{t('competitionDesc')}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#17201e] px-3 py-1 text-[11px] font-black text-[#ffe08a]"><CalendarDays size={12} />{t('piecePeriod2')}</p>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-[#e8a33c]/40 bg-[#fff6e2] px-3 py-1 text-[11px] font-bold text-[#8a5a12]"><Piece size={12} />{t('pieceRule')}</p>
        </div>
        <p className="mt-1.5 text-[10px] font-bold text-black/35">{t('rankChangeHint')}</p>
        <WeekReward week={week} />
      </> : <>
        <p className="mt-1 break-keep text-xs leading-5 text-black/45">{week === 2 ? t('piecePeriodEnded') : t(`pieceHallDesc${week}`)}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#8fa3c4]/50 bg-[#eef3fb] px-3 py-1 text-[11px] font-bold text-[#3c4f6e]"><Crown size={12} />{t('pieceHallCrown')}</p>
      </>}

      {rows === null ? (
        <p className="mt-6 text-sm text-black/40">{t('competitionLoading')}</p>
      ) : !top.length ? (
        <p className="mt-6 rounded-[24px] border border-dashed border-black/15 p-6 text-center text-sm text-black/45">{t('competitionEmpty')}</p>
      ) : (
        <>
          {/* Podium: 2nd · 1st · 3rd, the blocks stepping up to the middle. */}
          <div className="mt-6 grid grid-cols-3 items-end gap-2 sm:gap-4">
            {podium.map((row, i) => {
              const place = [2, 1, 3][i];
              const block = place === 1 ? 'h-28 sm:h-36 bg-gradient-to-b from-[#ffd45c] to-[#e8a33c]' : place === 2 ? 'h-20 sm:h-28 bg-gradient-to-b from-[#e7e9ee] to-[#b9bec8]' : 'h-14 sm:h-20 bg-gradient-to-b from-[#f0c39a] to-[#c98a55]';
              if (!row) return <div key={place} />;
              return (
                <button key={place} type="button" onClick={() => toggle(row.rank)} aria-expanded={open === row.rank} className="group flex min-w-0 flex-col items-center text-center">
                  <span className="mb-1 text-2xl sm:text-3xl">{['🥇', '🥈', '🥉'][place - 1]}</span>
                  <span className={`rounded-full ${place === 1 ? 'drop-shadow-[0_0_14px_rgba(255,196,60,.7)]' : ''} ${row.is_me ? 'ring-2 ring-[#ff6b4a] ring-offset-2' : ''}`}><Stone name={row.nickname} icon={`w${week}-${place}`} size={place === 1 ? 64 : 50} /></span>
                  <span className="mt-1.5 w-full truncate px-1 text-xs font-black sm:text-sm">{row.nickname}</span>
                  <PieceCount n={row.pieces} size={13} className="mt-0.5 text-sm sm:text-base" />
                  {live && <RankChange row={row} className="mt-1" />}
                  <span className={`mt-2 flex w-full items-start justify-center rounded-t-2xl pt-2 font-black text-white/90 shadow-[inset_0_2px_0_rgba(255,255,255,.4)] transition group-hover:brightness-105 ${block}`}><span className="text-3xl sm:text-4xl" style={{ textShadow: '0 2px 0 rgba(0,0,0,.18)' }}>{place}</span></span>
                </button>
              );
            })}
          </div>
          {openRow && openRow.rank <= 3 && (
            <div className="mt-3 rounded-[20px] border border-black/10 bg-[#f9f7f1] p-3">
              <p className="mb-2 px-1 text-[11px] font-bold text-black/45">{t('piecesOf', { name: openRow.nickname, n: openRow.pieces })}</p>
              <GameWins row={openRow} cap={cap} />
            </div>
          )}

          {rest.length > 0 && (
            <ol className="mt-5 space-y-1.5">
              {rest.map((row) => <RankRow key={row.rank} row={row} open={open === row.rank} onToggle={() => toggle(row.rank)} live={live} cap={cap} />)}
            </ol>
          )}
          {me && me.rank > 50 && (
            <ol className="mt-4 border-t border-dashed border-black/15 pt-4"><RankRow row={me} open={open === me.rank} onToggle={() => toggle(me.rank)} live={live} cap={cap} /></ol>
          )}
          {user && !me && live && <p className="mt-4 text-center text-xs text-black/45">{t('competitionNotYet')}</p>}
        </>
      )}
    </section>
  );
}

/** What this week's top three will keep for good: the week's champion stones, shown ahead of time (the podium wears them too). */
function WeekReward({ week }: { week: number }) {
  const t = useTranslations('Records');
  if (!CHAMPION_LOOKS[week]) return null;
  const order = [2, 1, 3] as const;
  return (
    <div className="relative mt-4 overflow-hidden rounded-[22px] border border-[#8ec5ff]/40 bg-gradient-to-br from-[#0f1a2e] via-[#16213a] to-[#10291f] p-4 text-white sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-[#c9a2ff]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-[#7ff0b6]/15 blur-3xl" />
      <div className="relative grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff9ad5] via-[#ffe680] to-[#8ec5ff] px-2.5 py-1 text-[10px] font-black tracking-[0.12em] text-[#1a1430]"><Crown size={11} />{t('rewardBadge', { n: week })}</span>
          <h3 className="mt-2 break-keep text-lg font-black leading-tight sm:text-xl">{t('rewardTitle', { n: week })}</h3>
          <p className="mt-1.5 break-keep text-xs leading-5 text-white/60">{t('rewardDesc', { n: week })}</p>
        </div>
        <div className="grid grid-cols-3 items-end gap-2">
          {order.map((place) => (
            <div key={place} className="flex flex-col items-center text-center">
              <Stone name={t(`rewardName${place}`)} size={place === 1 ? 62 : 48} champion={{ week, place }} />
              <span className="mt-1.5 text-[11px] font-black">{t('rewardPlace', { n: place })}</span>
              <span className="text-[10px] font-bold text-white/55">{t(`rewardName${place}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RankRow({ row, open, onToggle, live, cap }: { row: Row; open: boolean; onToggle: () => void; live: boolean; cap: number }) {
  const t = useTranslations('Records');
  return (
    <li className={`overflow-hidden rounded-2xl border ${row.is_me ? 'border-[#ff6b4a]/50 bg-[#fff0eb]' : 'border-black/10 bg-[#f9f7f1]'}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/60">
        <span className="flex w-8 shrink-0 flex-col items-center gap-0.5"><span className="font-mono text-sm font-black leading-none text-black/45">{row.rank}</span>{live && <RankChange row={row} />}</span>
        <Stone name={row.nickname} pieceRank={row.rank} size={30} />
        <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{row.nickname}{row.is_me && <span className="ml-1.5 rounded-full bg-[#ff6b4a] px-1.5 py-0.5 text-[9px] font-black text-white">{t('me')}</span>}</span>
        <PieceCount n={row.pieces} size={13} className="text-sm" />
        <ChevronDown size={15} className={`shrink-0 text-black/35 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-black/5 p-2.5"><GameWins row={row} cap={cap} /></div>}
    </li>
  );
}
