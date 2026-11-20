"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Swords } from 'lucide-react';
import type { GameId } from '@/lib/stats';
import { CERT_GAMES } from '@/lib/hardClear';
import { getSupabase } from '@/lib/supabase';
import { GAME_LABEL } from './HallCelebration';
import { useAuth } from './AuthProvider';

type Row = { rank: number; nickname: string; avatar_url: string | null; pieces: number; per_game: Partial<Record<GameId, number>>; last_win: string; is_me: boolean | null };

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

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  return src
    // eslint-disable-next-line @next/next/no-img-element -- remote avatars of any host
    ? <img src={src} alt="" width={size} height={size} referrerPolicy="no-referrer" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
    : <span className="flex shrink-0 items-center justify-center rounded-full bg-[#17201e] font-black text-white" style={{ width: size, height: size, fontSize: size * 0.4 }}>{name.slice(0, 1).toUpperCase()}</span>;
}

/** Wins per game behind a player's pieces, most first. */
function GameWins({ row }: { row: Row }) {
  const tc = useTranslations('Common');
  const games = (Object.entries(row.per_game) as [GameId, number][]).filter(([g]) => CERT_GAMES[g]).sort((a, b) => b[1] - a[1]);
  return (
    <ul className="grid gap-1.5 sm:grid-cols-2">
      {games.map(([game, n]) => (
        <li key={game} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CERT_GAMES[game].color }} />
          <span className="min-w-0 flex-1 truncate">{tc(GAME_LABEL[game])}</span>
          {n >= 30 && <span className="shrink-0 rounded-full bg-[#e8a33c] px-1.5 py-0.5 text-[9px] font-black text-white">MAX</span>}
          <PieceCount n={n} size={11} />
        </li>
      ))}
    </ul>
  );
}

/**
 * 피스 경쟁전: everyone on one board. Each win against the hard AI (any game) is one piece, at most 30 per game
 * (the server caps it; 러시안 룰렛 and 인디언 포커 do not count); most pieces first,
 * a tie goes to whoever got there first. The top three stand on a podium; tap anyone to see their wins by game.
 */
export default function CompetitionBoard() {
  const t = useTranslations('Records');
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const supabase = getSupabase();
    if (!supabase) { setRows([]); return; } // eslint-disable-line react-hooks/set-state-in-effect -- no server: show the empty board
    supabase.rpc('competition_ranking', { p_limit: 50 }).then(({ data }) => { if (alive) setRows(Array.isArray(data) ? (data as Row[]) : []); });
    return () => { alive = false; };
  }, [user]);

  const top = rows?.filter((r) => r.rank <= 50) ?? [];
  const me = rows?.find((r) => r.is_me) ?? null;
  const podium = [top[1], top[0], top[2]]; // 2nd, 1st, 3rd from left
  const rest = top.slice(3);
  const toggle = (rank: number) => setOpen((current) => (current === rank ? null : rank));
  const openRow = rows?.find((r) => r.rank === open) ?? null;

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-black"><Swords size={20} className="text-[#e8a33c]" />{t('competitionTitle')}</h2>
      <p className="mt-1 break-keep text-xs leading-5 text-black/45">{t('competitionDesc')}</p>
      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#e8a33c]/40 bg-[#fff6e2] px-3 py-1 text-[11px] font-bold text-[#8a5a12]"><Piece size={12} />{t('pieceRule')}</p>

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
                  <span className={`rounded-full p-0.5 ${place === 1 ? 'bg-[#ffd45c] shadow-[0_0_24px_rgba(255,196,60,.6)]' : 'bg-white'} ${row.is_me ? 'ring-2 ring-[#ff6b4a]' : ''}`}><Avatar src={row.avatar_url} name={row.nickname} size={place === 1 ? 64 : 50} /></span>
                  <span className="mt-1.5 w-full truncate px-1 text-xs font-black sm:text-sm">{row.nickname}</span>
                  <PieceCount n={row.pieces} size={13} className="mt-0.5 text-sm sm:text-base" />
                  <span className={`mt-2 flex w-full items-start justify-center rounded-t-2xl pt-2 font-black text-white/90 shadow-[inset_0_2px_0_rgba(255,255,255,.4)] transition group-hover:brightness-105 ${block}`}><span className="text-3xl sm:text-4xl" style={{ textShadow: '0 2px 0 rgba(0,0,0,.18)' }}>{place}</span></span>
                </button>
              );
            })}
          </div>
          {openRow && openRow.rank <= 3 && (
            <div className="mt-3 rounded-[20px] border border-black/10 bg-[#f9f7f1] p-3">
              <p className="mb-2 px-1 text-[11px] font-bold text-black/45">{t('piecesOf', { name: openRow.nickname, n: openRow.pieces })}</p>
              <GameWins row={openRow} />
            </div>
          )}

          {rest.length > 0 && (
            <ol className="mt-5 space-y-1.5">
              {rest.map((row) => <RankRow key={row.rank} row={row} open={open === row.rank} onToggle={() => toggle(row.rank)} />)}
            </ol>
          )}
          {me && me.rank > 50 && (
            <ol className="mt-4 border-t border-dashed border-black/15 pt-4"><RankRow row={me} open={open === me.rank} onToggle={() => toggle(me.rank)} /></ol>
          )}
          {user && !me && <p className="mt-4 text-center text-xs text-black/45">{t('competitionNotYet')}</p>}
        </>
      )}
    </section>
  );
}

function RankRow({ row, open, onToggle }: { row: Row; open: boolean; onToggle: () => void }) {
  const t = useTranslations('Records');
  return (
    <li className={`overflow-hidden rounded-2xl border ${row.is_me ? 'border-[#ff6b4a]/50 bg-[#fff0eb]' : 'border-black/10 bg-[#f9f7f1]'}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/60">
        <span className="w-8 shrink-0 text-center font-mono text-sm font-black text-black/45">{row.rank}</span>
        <Avatar src={row.avatar_url} name={row.nickname} size={30} />
        <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{row.nickname}{row.is_me && <span className="ml-1.5 rounded-full bg-[#ff6b4a] px-1.5 py-0.5 text-[9px] font-black text-white">{t('me')}</span>}</span>
        <PieceCount n={row.pieces} size={13} className="text-sm" />
        <ChevronDown size={15} className={`shrink-0 text-black/35 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-black/5 p-2.5"><GameWins row={row} /></div>}
    </li>
  );
}
