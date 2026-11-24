"use client";

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Flame, Medal } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { GameId, ResultRow } from '@/lib/stats';
import { getSupabase } from '@/lib/supabase';
import { CERT_GAMES } from '@/lib/hardClear';
import { GAME_LABEL } from './HallCelebration';
import RankMove from './RankMove';
import { byGameOrder } from './recordOrder';
import RankBlock from './merge2048/RankBlock';
import { blockOfSub } from '@/lib/merge2048';

type Board = 'merge2048' | 'magicswap' | 'binairo' | 'onestroke' | 'colorlink' | 'starbattle' | 'masyu' | 'nonogram' | 'slither' | 'gyulhap10' | 'gyulhap5' | 'hexagon' | 'nemo_easy' | 'nemo_normal' | 'nemo_hard';
type Row = { rank: number; nickname: string; avatar_url: string | null; score: number; sub: number | null; prev_rank?: number | null };
type Card = { key: string; game: GameId; boards: Board[]; title: string };

const MEDALS = ['🥇', '🥈', '🥉'];
const NEMO: Board[] = ['nemo_hard', 'nemo_normal', 'nemo_easy'];
const BOARDS: Board[] = ['magicswap', 'slither', 'binairo', 'onestroke', 'colorlink', 'starbattle', 'masyu', 'nonogram', 'gyulhap10', 'gyulhap5', 'hexagon', 'merge2048', ...NEMO];
const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

/** Solo challenges in 기록실: a top-3 board per challenge, then my own best runs. Games follow the site order; boards nobody is on yet go last. */
export default function ChallengeRecords({ results, signedIn }: { results: ResultRow[]; signedIn: boolean }) {
  const t = useTranslations('Records');
  const tc = useTranslations('Common');
  const [tops, setTops] = useState<Partial<Record<Board, Row[]>>>({});
  const [nemoLevel, setNemoLevel] = useState<Board>('nemo_hard');

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let alive = true;
    Promise.all(BOARDS.map(async (b) => {
      const { data } = await supabase.rpc('challenge_top', { p_board: b, p_limit: 3 });
      return [b, (data as Row[] | null) ?? []] as const;
    })).then((entries) => { if (alive) setTops(Object.fromEntries(entries)); });
    return () => { alive = false; };
  }, []);

  const cards: Card[] = [
    { key: 'slither', game: 'slitherlink', boards: ['slither'], title: t('chSlither') },
    { key: 'binairo', game: 'binairo', boards: ['binairo'], title: t('chBinairo') },
    { key: 'onestroke', game: 'onestroke', boards: ['onestroke'], title: t('chOnestroke') },
    { key: 'colorlink', game: 'colorlink', boards: ['colorlink'], title: t('chColorlink') },
    { key: 'magicswap', game: 'magicswap', boards: ['magicswap'], title: t('chMagicswap') },
    { key: 'starbattle', game: 'starbattle', boards: ['starbattle'], title: t('chStarbattle') },
    { key: 'masyu', game: 'masyu', boards: ['masyu'], title: t('chMasyu') },
    { key: 'nonogram', game: 'nonogram', boards: ['nonogram'], title: t('chNonogram') },
    { key: 'gyulhap10', game: 'gyulhap', boards: ['gyulhap10'], title: t('chGyul10') },
    { key: 'gyulhap5', game: 'gyulhap', boards: ['gyulhap5'], title: t('chGyul5') },
    { key: 'nemo', game: 'nemo_count', boards: NEMO, title: t('chNemo') },
    { key: 'hexagon', game: 'hexagon', boards: ['hexagon'], title: t('chHexagon') },
    { key: 'merge2048', game: 'merge2048', boards: ['merge2048'], title: t('chMerge2048') },
  ];
  const stat = (b: Board, r: Row) => b === 'slither' || b === 'binairo' || b === 'onestroke' || b === 'colorlink' || b === 'magicswap' || b === 'starbattle' || b === 'masyu' || b === 'nonogram' ? t('chMaps', { n: r.score })
    : b.startsWith('nemo') ? t('chCorrect', { n: r.score }) : t('chScore', { n: r.score });
  const filled = (c: Card) => c.boards.some((b) => (tops[b]?.length ?? 0) > 0);
  const ordered = byGameOrder(cards, (c) => c.game, filled);

  // My best runs, from my own results.
  const mine = useMemo(() => {
    const best = (list: number[]) => (list.length ? Math.max(...list) : null);
    const solo = results.filter((r) => r.mode === 'solo');
    const num = (v: unknown) => (typeof v === 'number' ? v : Number.NaN);
    const pick = (game: GameId, test: (d: Record<string, unknown>) => boolean, field: string) =>
      best(solo.filter((r) => r.game === game && test(r.detail)).map((r) => num(r.detail[field])).filter((n) => Number.isFinite(n)));
    const slitherClears = solo.filter((r) => r.game === 'slitherlink' && r.result === 'win');
    const fastest = slitherClears.map((r) => num(r.detail.ms)).filter((n) => Number.isFinite(n));
    const clearsOf = (game: GameId) => {
      const wins = solo.filter((r) => r.game === game && r.result === 'win');
      const times = wins.map((r) => num(r.detail.ms)).filter((n) => Number.isFinite(n));
      return { clears: wins.length, fastest: times.length ? Math.min(...times) : null };
    };
    return {
      binairo: clearsOf('binairo'), onestroke: clearsOf('onestroke'), colorlink: clearsOf('colorlink'), magicswap: clearsOf('magicswap'), starbattle: clearsOf('starbattle'), masyu: clearsOf('masyu'), nonogram: clearsOf('nonogram'),
      slither: { clears: slitherClears.length, fastest: fastest.length ? Math.min(...fastest) : null },
      gyulhap10: pick('gyulhap', (d) => d.mode === 'challenge10', 'score'),
      gyulhap5: pick('gyulhap', (d) => d.mode === 'challenge5', 'score'),
      hexagon: pick('hexagon', (d) => d.mode === 'challenge', 'score'),
      merge2048: pick('merge2048', (d) => d.mode === 'endless', 'score'),
      nemo: Object.fromEntries(['easy', 'normal', 'hard'].map((lv) => [lv, pick('nemo_count', (d) => d.difficulty === lv, 'correct')])) as Record<string, number | null>,
    };
  }, [results]);

  const myCards = byGameOrder([
    { game: 'slitherlink' as GameId, title: t('chSlither'), line: mine.slither.clears ? t('mySlither', { n: mine.slither.clears, time: mine.slither.fastest ? clock(mine.slither.fastest) : '—' }) : null },
    { game: 'binairo' as GameId, title: t('chBinairo'), line: mine.binairo.clears ? t('mySlither', { n: mine.binairo.clears, time: mine.binairo.fastest ? clock(mine.binairo.fastest) : '—' }) : null },
    { game: 'onestroke' as GameId, title: t('chOnestroke'), line: mine.onestroke.clears ? t('mySlither', { n: mine.onestroke.clears, time: mine.onestroke.fastest ? clock(mine.onestroke.fastest) : '—' }) : null },
    { game: 'colorlink' as GameId, title: t('chColorlink'), line: mine.colorlink.clears ? t('mySlither', { n: mine.colorlink.clears, time: mine.colorlink.fastest ? clock(mine.colorlink.fastest) : '—' }) : null },
    { game: 'magicswap' as GameId, title: t('chMagicswap'), line: mine.magicswap.clears ? t('mySlither', { n: mine.magicswap.clears, time: mine.magicswap.fastest ? clock(mine.magicswap.fastest) : '—' }) : null },
    { game: 'starbattle' as GameId, title: t('chStarbattle'), line: mine.starbattle.clears ? t('mySlither', { n: mine.starbattle.clears, time: mine.starbattle.fastest ? clock(mine.starbattle.fastest) : '—' }) : null },
    { game: 'masyu' as GameId, title: t('chMasyu'), line: mine.masyu.clears ? t('mySlither', { n: mine.masyu.clears, time: mine.masyu.fastest ? clock(mine.masyu.fastest) : '—' }) : null },
    { game: 'nonogram' as GameId, title: t('chNonogram'), line: mine.nonogram.clears ? t('mySlither', { n: mine.nonogram.clears, time: mine.nonogram.fastest ? clock(mine.nonogram.fastest) : '—' }) : null },
    { game: 'gyulhap' as GameId, title: t('chGyul10'), line: mine.gyulhap10 !== null ? t('chScore', { n: mine.gyulhap10 }) : null },
    { game: 'gyulhap' as GameId, title: t('chGyul5'), line: mine.gyulhap5 !== null ? t('chScore', { n: mine.gyulhap5 }) : null },
    { game: 'nemo_count' as GameId, title: t('chNemo'), line: Object.values(mine.nemo).some((v) => v !== null) ? t('myNemo', { e: mine.nemo.easy ?? '—', n: mine.nemo.normal ?? '—', h: mine.nemo.hard ?? '—' }) : null },
    { game: 'hexagon' as GameId, title: t('chHexagon'), line: mine.hexagon !== null ? t('chScore', { n: mine.hexagon }) : null },
    { game: 'merge2048' as GameId, title: t('chMerge2048'), line: mine.merge2048 !== null ? t('chScore', { n: mine.merge2048 }) : null },
  ], (c) => c.game, (c) => c.line !== null);

  return (
    <>
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-black"><Flame size={20} className="text-[#8f7cff]" />{t('chTitle')}</h2>
        <p className="mt-1 text-xs text-black/45">{t('chDesc')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((card) => {
            const board = card.key === 'nemo' ? nemoLevel : card.boards[0];
            const rows = tops[board] ?? [];
            return (
              <section key={card.key} className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link href={CERT_GAMES[card.game].href} className="min-w-0 truncate text-sm font-black hover:underline">{card.title}</Link>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CERT_GAMES[card.game].color }} />
                </div>
                {card.key === 'nemo' && (
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    {NEMO.map((b) => <button key={b} type="button" onClick={() => setNemoLevel(b)} className={`rounded-lg py-1 text-[10px] font-black ${nemoLevel === b ? 'bg-[#17201e] text-white' : 'bg-white/70 text-black/50'}`}>{t(`ch_${b}`)}</button>)}
                  </div>
                )}
                <ol className="mt-3 space-y-2">
                  {[0, 1, 2].map((i) => {
                    const r = rows[i];
                    return (
                      <li key={i} className={`flex items-center gap-2.5 rounded-2xl px-2.5 py-2 ${r ? 'bg-white' : 'border border-dashed border-black/10'}`}>
                        <span className="w-6 text-center text-lg">{MEDALS[i]}</span>
                        {r ? <>
                          {board === 'merge2048' && <RankBlock block={blockOfSub(r.sub)} name={r.nickname} size={26} />}
                          <span className="min-w-0 flex-1 truncate text-xs font-extrabold">{r.nickname}</span>
                          <span className="shrink-0 font-mono text-[11px] font-black text-black/55">{stat(board, r)}</span>
                          <RankMove rank={r.rank} prev={r.prev_rank} />
                        </> : <span className="text-[11px] text-black/30">{t('emptySpot')}</span>}
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-xl font-black"><Medal size={20} className="text-[#8f7cff]" />{t('chMineTitle')}</h2>
        <p className="mt-1 text-xs text-black/45">{t('chMineDesc')}</p>
        {signedIn ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myCards.map((c) => (
              <Link key={c.title} href={CERT_GAMES[c.game].href} className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4 transition hover:-translate-y-0.5 hover:bg-white">
                <div className="flex items-center justify-between"><h3 className="text-sm font-black">{c.title}</h3><span className="h-2.5 w-2.5 rounded-full" style={{ background: CERT_GAMES[c.game].color }} /></div>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-black/40">{tc(GAME_LABEL[c.game])} · {t('chBest')}</p>
                <p className="mt-0.5 text-xl font-black">{c.line ?? <span className="text-sm font-bold text-black/35">{t('chNone')}</span>}</p>
              </Link>
            ))}
          </div>
        ) : <p className="mt-4 rounded-[24px] border border-black/10 bg-[#f9f7f1] p-5 text-sm text-black/55">{t('loginPrompt')}</p>}
      </section>
    </>
  );
}
