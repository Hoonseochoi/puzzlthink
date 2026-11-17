"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Swords } from 'lucide-react';
import { type GameId, type RankRow, type TopRow, fetchOpenTop, myOpenPlace } from '@/lib/stats';
import { useAuth } from './AuthProvider';
import { GAME_LABEL } from './HallCelebration';

const GAMES: { id: GameId; color: string }[] = [
  { id: 'heavy13', color: '#c9a061' }, { id: 'russian_roulette', color: '#238ca8' }, { id: 'nemo_count', color: '#7d86a8' },
  { id: 'wallgo', color: '#ff6b4a' }, { id: 'black_white', color: '#2b2b31' }, { id: 'black_white_2', color: '#ef3340' },
  { id: 'laser_janggi', color: '#28b9d7' }, { id: 'russian_janggi', color: '#e2283c' }, { id: 'blind_gomoku', color: '#d39b2f' }, { id: 'janggi', color: '#e8a33c' },
];
const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Open-match ranking per game: the top 5 and, for a signed-in player, the places just above and below
 * theirs. Everyone appears under their current nickname.
 */
export default function OpenRankingBoard() {
  const t = useTranslations('OpenRanking');
  const tc = useTranslations('Common');
  const { user } = useAuth();
  const [game, setGame] = useState<GameId>('heavy13');
  // Results are kept with the game they belong to, so switching tabs shows a loading state until they arrive.
  const [topOf, setTopOf] = useState<{ game: GameId; rows: TopRow[] } | null>(null);
  const [nearOf, setNearOf] = useState<{ game: GameId; rows: RankRow[] } | null>(null);
  const top = topOf?.game === game ? topOf.rows : null;
  const near = nearOf?.game === game ? nearOf.rows : null;

  useEffect(() => {
    let alive = true;
    fetchOpenTop(game).then((rows) => { if (alive) setTopOf({ game, rows: rows ?? [] }); });
    if (user) myOpenPlace(game).then((place) => { if (alive) setNearOf({ game, rows: place?.near ?? [] }); });
    return () => { alive = false; };
  }, [game, user]);

  const wl = (r: { wins: number; losses: number; draws: number }) => {
    const n = r.wins + r.losses + r.draws;
    return `${t('wl', { w: r.wins, l: r.losses })} · ${n ? Math.round((r.wins / n) * 100) : 0}%`;
  };
  const meRow = near?.find((row) => row.is_me);
  const color = GAMES.find((g) => g.id === game)?.color ?? '#17201e';

  return (
    <section id="open-ranking" className="mt-10 scroll-mt-24">
      <h2 className="flex items-center gap-2 text-xl font-black"><Swords size={20} className="text-[#ff4d5e]" />{t('title')}</h2>
      <p className="mt-1 text-xs text-black/45">{t('desc')}</p>
      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
        {GAMES.map((g) => (
          <button key={g.id} type="button" onClick={() => setGame(g.id)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold transition ${game === g.id ? 'text-white' : 'border border-black/10 bg-white/70 text-black/60 hover:bg-white'}`}
            style={game === g.id ? { background: g.color } : undefined}>{tc(GAME_LABEL[g.id])}</button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <section className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4">
          <p className="text-[10px] font-black tracking-[0.16em] text-black/40">TOP 5</p>
          <ol className="mt-3 space-y-2">
            {top === null ? <li className="text-xs text-black/40">…</li> : [0, 1, 2, 3, 4].map((i) => {
              const row = top[i];
              return (
                <li key={i} className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 ${row ? 'bg-white' : 'border border-dashed border-black/10'}`}>
                  <span className="w-7 text-center text-base font-black">{MEDALS[i] ?? i + 1}</span>
                  {row ? <>
                    <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{row.nickname ?? 'Player'}</span>
                    <span className="shrink-0 font-mono text-[11px] font-black text-black/55">{wl(row)}</span>
                  </> : <span className="text-[11px] text-black/30">{t('empty')}</span>}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4">
          <p className="text-[10px] font-black tracking-[0.16em] text-black/40">{t('nearTitle')}</p>
          {!user ? <p className="mt-3 text-xs text-black/50">{t('loginToSee')}</p>
            : near === null ? <p className="mt-3 text-xs text-black/40">…</p>
              : !meRow || meRow.rank === null ? (
                <p className="mt-3 break-keep text-sm text-black/60">{t('notRanked', { n: Math.max(1, 3 - (meRow?.wins ?? 0)), w: meRow?.wins ?? 0, l: meRow?.losses ?? 0 })}</p>
              ) : (
                <ol className="mt-3 space-y-2">
                  {near.filter((row) => row.rank !== null).map((row) => (
                    <li key={`${row.rank}-${row.is_me}`} className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 ${row.is_me ? 'text-white' : 'bg-white'}`} style={row.is_me ? { background: color } : undefined}>
                      <span className="w-7 text-center font-mono text-sm font-black">{row.rank}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{row.nickname ?? t('me')}{row.is_me ? ` (${t('me')})` : ''}</span>
                      <span className={`shrink-0 font-mono text-[11px] font-black ${row.is_me ? '' : 'text-black/55'}`}>{wl(row)}</span>
                    </li>
                  ))}
                </ol>
              )}
        </section>
      </div>
    </section>
  );
}
