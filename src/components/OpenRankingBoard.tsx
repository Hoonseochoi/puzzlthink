"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Swords } from 'lucide-react';
import { type GameId, type RankRow, type TopRow, fetchOpenTop, myOpenPlace } from '@/lib/stats';
import { useAuth } from './AuthProvider';
import { GAME_LABEL } from './HallCelebration';

const GAMES: { id: GameId; color: string }[] = [
  { id: 'hexagon', color: '#e8b04a' }, { id: 'piggy_bank', color: '#e0a91c' }, { id: 'heavy13', color: '#c9a061' }, { id: 'russian_roulette', color: '#238ca8' }, { id: 'nemo_count', color: '#7d86a8' },
  { id: 'wallgo', color: '#ff6b4a' }, { id: 'black_white', color: '#2b2b31' }, { id: 'black_white_2', color: '#ef3340' },
  { id: 'laser_janggi', color: '#28b9d7' }, { id: 'russian_janggi', color: '#e2283c' }, { id: 'blind_gomoku', color: '#d39b2f' }, { id: 'janggi', color: '#e8a33c' },
];
const MEDALS = ['🥇', '🥈', '🥉'];
type Ranking = { top: TopRow[]; near: RankRow[] };

/** Open-match rankings for every game, shown at once like the AI Hall of Fame. */
export default function OpenRankingBoard() {
  const t = useTranslations('OpenRanking');
  const tc = useTranslations('Common');
  const { user } = useAuth();
  const [rankings, setRankings] = useState<Partial<Record<GameId, Ranking>>>({});

  useEffect(() => {
    let alive = true;
    Promise.all(GAMES.map(async ({ id }) => {
      const [top, place] = await Promise.all([fetchOpenTop(id), user ? myOpenPlace(id) : Promise.resolve(null)]);
      return [id, { top: top ?? [], near: place?.near ?? [] }] as const;
    })).then((entries) => { if (alive) setRankings(Object.fromEntries(entries)); });
    return () => { alive = false; };
  }, [user]);

  const wl = (row: { wins: number; losses: number; draws: number }) => {
    const games = row.wins + row.losses + row.draws;
    return `${t('wl', { w: row.wins, l: row.losses })} · ${games ? Math.round((row.wins / games) * 100) : 0}%`;
  };

  return (
    <section id="open-ranking" className="mt-10 scroll-mt-24">
      <h2 className="flex items-center gap-2 text-xl font-black"><Swords size={20} className="text-[#ff4d5e]" />{t('title')}</h2>
      <p className="mt-1 text-xs text-black/45">{t('desc')}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => {
          const ranking = rankings[game.id];
          const me = ranking?.near.find((row) => row.is_me);
          return (
            <section key={game.id} className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-sm font-black">{tc(GAME_LABEL[game.id])}</h3>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: game.color }} />
              </div>
              <p className="mt-3 text-[10px] font-black tracking-[0.16em] text-black/40">TOP 5</p>
              <ol className="mt-2 space-y-1.5">
                {!ranking ? <li className="py-2 text-xs text-black/35">…</li> : [0, 1, 2, 3, 4].map((index) => {
                  const row = ranking.top[index];
                  return (
                    <li key={index} className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ${row ? 'bg-white' : 'border border-dashed border-black/10'}`}>
                      <span className="w-6 text-center text-sm font-black">{MEDALS[index] ?? index + 1}</span>
                      {row ? <><span className="min-w-0 flex-1 truncate text-xs font-extrabold">{row.nickname ?? 'Player'}</span><span className="shrink-0 font-mono text-[10px] font-black text-black/50">{wl(row)}</span></> : <span className="text-[10px] text-black/30">{t('empty')}</span>}
                    </li>
                  );
                })}
              </ol>

              <div className="mt-3 border-t border-black/[0.07] pt-3">
                <p className="text-[10px] font-black tracking-[0.14em] text-black/40">{t('myPlace')}</p>
                {!user ? <p className="mt-1.5 text-[11px] leading-4 text-black/45">{t('loginToSee')}</p>
                  : !ranking ? <p className="mt-1.5 text-xs text-black/35">…</p>
                    : !me || me.rank === null ? <p className="mt-1.5 break-keep text-[11px] leading-4 text-black/50">{t('notRanked', { n: Math.max(1, 3 - (me?.wins ?? 0)), w: me?.wins ?? 0, l: me?.losses ?? 0 })}</p>
                      : <div className="mt-1.5 flex items-center gap-2 rounded-xl px-2.5 py-2 text-white" style={{ background: game.color }}><span className="font-mono text-sm font-black">#{me.rank}</span><span className="min-w-0 flex-1 truncate text-xs font-extrabold">{me.nickname ?? t('me')}</span><span className="shrink-0 font-mono text-[10px] font-black">{wl(me)}</span></div>}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
