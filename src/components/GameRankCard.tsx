"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ChevronRight, Trophy } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { GameId as CatalogId } from '@/lib/gameCatalog';
import { STATS_ID } from '@/lib/openRooms';
import { type GameRanking, fetchGameRanking, hasRankCard, rankSlug } from '@/lib/rankings';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import StoneAvatar from './StoneAvatar';

const MEDALS = ['🥇', '🥈', '🥉'];
type Row = { name: string; stat: string };

/** The top three of the board this game is ranked by (same order of preference as the ranking share image). */
function topThree(r: GameRanking, en: boolean): { kind: string; rows: Row[] } {
  const wins = (n: number) => (en ? `${n} wins` : `${n}승`);
  if (r.maps) return { kind: en ? 'Maps owned' : '보유 맵', rows: r.maps.slice(0, 3).map((x) => ({ name: x.nickname, stat: en ? `${x.score} maps` : `${x.score}개` })) };
  if (r.scores?.length) return { kind: en ? 'Challenge score' : '챌린지 점수', rows: r.scores.slice(0, 3).map((x) => ({ name: x.nickname, stat: en ? x.score.toLocaleString() : `${x.score.toLocaleString()}점` })) };
  if (r.game === 'sudoku' && r.hall.length) return { kind: en ? 'Puzzles solved' : '완성한 퍼즐', rows: r.hall.slice(0, 3).map((x) => ({ name: x.nickname, stat: en ? `${x.wins}` : `${x.wins}개` })) };
  if (r.hall.length) return { kind: en ? 'vs AI' : 'AI 대전', rows: r.hall.slice(0, 3).map((x) => ({ name: x.nickname, stat: wins(x.wins) })) };
  if (r.nemo) {
    const list = r.nemo.hard.length ? r.nemo.hard : r.nemo.normal.length ? r.nemo.normal : r.nemo.easy;
    return { kind: en ? '30-min challenge' : '30분 챌린지', rows: list.slice(0, 3).map((x) => ({ name: x.nickname, stat: en ? `${x.correct}` : `${x.correct}개` })) };
  }
  return { kind: en ? 'Open matches' : '오픈 대전', rows: r.open.slice(0, 3).map((x) => ({ name: x.nickname ?? 'Player', stat: wins(x.wins) })) };
}

/**
 * Ranking at the top of a game's entry screen (GameIntroHero): the top three with their profile icons and wins (or
 * score), the signed-in player's own place, and a link to the full ranking page. Nothing for a game without a ranking.
 */
export default function GameRankCard({ game, tone = 'dark' }: { game: CatalogId; tone?: 'dark' | 'light' }) {
  const en = useLocale() === 'en';
  const { user } = useAuth();
  const id = STATS_ID[game];
  const ranked = hasRankCard(game);
  const [top, setTop] = useState<{ kind: string; rows: Row[] } | null>(null);
  const [mine, setMine] = useState<number | null>(null);

  useEffect(() => {
    if (!ranked) return;
    let alive = true;
    fetchGameRanking(id).then((r) => { if (alive) setTop(topThree(r, en)); });
    return () => { alive = false; };
  }, [id, ranked, en]);
  useEffect(() => {
    if (!ranked || !user) return;
    let alive = true;
    getSupabase()?.rpc('my_game_ranks').then(({ data }) => {
      const row = (data as { game: string; rank: number }[] | null)?.find((x) => x.game === id);
      if (alive) setMine(row && row.rank > 0 ? row.rank : null);
    });
    return () => { alive = false; };
  }, [id, ranked, user]);

  if (!ranked) return null;
  const dark = tone === 'dark';
  const soft = dark ? 'text-white/45' : 'text-black/45';
  return (
    <section className={`flex flex-col rounded-2xl border p-4 sm:p-5 ${dark ? 'border-white/10 bg-white/[0.035]' : 'border-black/10 bg-white/70'}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-black"><Trophy size={16} className="text-(--accent)" />{en ? 'Ranking' : '랭킹'}{top && <span className={`text-[11px] font-bold ${soft}`}>{top.kind}</span>}</h3>
        <Link href={`/ranking/${rankSlug(id)}`} className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-(--accent)/40 bg-(--accent)/10 py-1 pl-2.5 pr-1.5 text-[11px] font-black text-(--accent) transition hover:bg-(--accent)/20">{en ? 'Full ranking' : '전체 보기'}<ChevronRight size={13} /></Link>
      </div>
      {/* A row each when the card is narrow, a three-across podium from 560px of the hero's width. */}
      <ol className="mt-3 grid flex-1 gap-1.5 @min-[560px]:grid-cols-3">
        {[0, 1, 2].map((i) => {
          const row = top?.rows[i];
          return (
            <li key={i} className={`flex h-11 min-w-0 items-center gap-2 rounded-xl px-3 ${row ? (dark ? 'bg-white/[0.05]' : 'bg-white') : `border border-dashed ${dark ? 'border-white/10' : 'border-black/10'}`}`}>
              <span className="w-5 text-center text-[15px] leading-none">{MEDALS[i]}</span>
              {row ? <><span className="shrink-0"><StoneAvatar name={row.name} size={24} /></span><span className="min-w-0 flex-1 truncate text-[13px] font-extrabold">{row.name}</span><span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] font-black ${i === 0 ? 'bg-(--accent)/15 text-(--accent)' : dark ? 'bg-white/[0.06] text-white/60' : 'bg-black/[0.05] text-black/55'}`}>{row.stat}</span></>
                : <span className={`text-[11px] font-bold ${soft}`}>{!top ? '…' : i === 0 ? (en ? 'No one yet. Be the first!' : '아직 없어요. 첫 1위에 도전!') : (en ? 'Open' : '빈자리')}</span>}
            </li>
          );
        })}
      </ol>
      {user && mine !== null && (
        <p className="mt-2.5 flex items-center justify-between rounded-xl bg-(--accent) px-3 py-2 text-[12px] font-black text-(--accent-ink)"><span>{en ? 'My rank' : '내 순위'}</span><span className="font-mono text-[13px]">#{mine}</span></p>
      )}
    </section>
  );
}
