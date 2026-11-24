"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Award, Lock, Skull, Swords } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { HELL_GAMES, hellHref, hellLabel } from '@/lib/hell';
import type { GameId } from '@/lib/stats';
import { getSupabase } from '@/lib/supabase';
import { GamePreview } from '../HomeClient';
import { FitTile } from '../OpenMatchCard';
import { useAuth } from '../AuthProvider';
import AuthButton from '../AuthButton';
import { BlackPiece, BlackPieceCount } from './BlackPiece';
import BlackPieceBoard, { useBlackPieceRanking } from './BlackPieceBoard';

/** The rules, as short lines (shared by the hell page and the home banner). */
export const HELL_RULES = ['rule1', 'rule2', 'rule3', 'rule4', 'rule5'] as const;

/** AI 헬모드: every game with a 매우 어려움 AI, the black-piece rules, my record and the black-piece top 10. */
export default function HellPageClient() {
  const t = useTranslations('Hell');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { user } = useAuth();
  const [clears, setClears] = useState<Map<GameId, number> | null>(null);
  const [certs, setCerts] = useState<{ id: string; game: GameId; clear_no: number }[]>([]);
  const ranking = useBlackPieceRanking(10);
  const me = ranking?.find((r) => r.is_me) ?? null;

  useEffect(() => {
    let alive = true;
    getSupabase()?.rpc('hell_clear_counts').then(({ data }) => {
      if (alive && Array.isArray(data)) setClears(new Map((data as { game: GameId; clears: number }[]).map((r) => [r.game, r.clears])));
    });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!user) return;
    getSupabase()?.rpc('my_hell_clears').then(({ data }) => { if (Array.isArray(data)) setCerts(data); });
  }, [user]);

  return (
    <main className="hell-surface min-h-screen px-4 pb-24 pt-8 text-white sm:px-5 sm:pt-14">
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <section className="hell-scan relative overflow-hidden rounded-[28px] border border-[#ff3355]/30 bg-black/40 px-5 py-9 text-center sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#ff2448]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#e0129b]/8 blur-3xl" />
          <p className="relative inline-flex items-center gap-2 rounded-full border border-[#ff3355]/50 bg-[#ff3355]/10 px-3 py-1 text-[10px] font-black tracking-[0.3em] text-[#ff8ea0]"><Skull size={12} />{t('eyebrow')}</p>
          <h1 className="relative mt-4 text-[3rem] font-black leading-none tracking-[-0.05em] sm:text-8xl">
            <span className="hell-glitch hell-neon" data-text={t('title')}>{t('title')}</span>
          </h1>
          <p className="relative mx-auto mt-4 max-w-xl break-keep text-base font-black text-white/90 sm:text-xl">{t('subtitle')}</p>
          <p className="relative mx-auto mt-3 max-w-xl break-keep text-[13px] leading-6 text-white/55 sm:text-sm">{t('intro')}</p>
          <p className="relative mx-auto mt-5 w-fit rounded-md border border-[#ff3355]/40 bg-black/50 px-3 py-1.5 font-mono text-[11px] font-black tracking-[0.12em] text-[#ff3355]">{t('warn')}</p>
        </section>

        {/* Rules */}
        <section className="hell-edge mt-5 rounded-[22px] bg-black/40 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-black tracking-[0.04em]"><BlackPiece size={16} />{t('ruleTitle')}</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {HELL_RULES.map((key, i) => (
              <li key={key} className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-[13px] font-bold leading-5 text-white/80">
                <span className="mt-0.5 font-mono text-[10px] font-black text-[#ff3355]">{String(i + 1).padStart(2, '0')}</span>{t(key)}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-white/40">{t('separate')}</p>
        </section>

        {/* Games */}
        <h2 className="mt-10 flex items-center gap-2 text-lg font-black"><Swords size={18} className="text-[#ff3355]" />{t('gamesTitle')}</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
          {HELL_GAMES.map((game) => {
            const n = clears?.get(game.stat);
            const body = (
              <>
                <div className="relative">
                  <FitTile title={tc(game.id)} className={`rounded-[14px] bg-black/50 ${game.hell.live ? '' : 'opacity-40 grayscale'}`}><GamePreview id={game.id} /></FitTile>
                  <span className="pointer-events-none absolute inset-0 rounded-[14px] bg-gradient-to-t from-[#ff2448]/25 to-transparent mix-blend-screen" />
                  {game.hell.query && <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-black text-[#ff8ea0] ring-1 ring-[#ff3355]/50">{t('duelOnly')}</span>}
                </div>
                <p className="mt-2.5 truncate px-1 text-sm font-black sm:text-base">{tc(game.id)}</p>
                <p className="px-1 text-[11px] font-bold text-white/45">{!game.hell.live ? t('soonDesc') : n ? t('clears', { n }) : t('noClears')}</p>
                {game.hell.live
                  ? <span className="hell-btn mt-2.5 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-black text-white sm:text-sm">{t('challenge')}<ArrowRight size={14} /></span>
                  : <span className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-black text-white/40 sm:text-sm"><Lock size={13} />{t('soon')}</span>}
              </>
            );
            return (
              <li key={game.id}>
                {game.hell.live
                  ? <a href={`/${locale}${hellHref(game)}`} className="hell-edge block rounded-[20px] bg-black/40 p-2.5 transition hover:-translate-y-0.5 hover:bg-black/60 sm:p-3">{body}</a>
                  : <div className="block rounded-[20px] border border-white/10 bg-black/30 p-2.5 sm:p-3" aria-disabled>{body}</div>}
              </li>
            );
          })}
        </ul>

        {/* My record */}
        <section className="hell-edge mt-10 rounded-[22px] bg-black/40 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-black"><Award size={16} className="text-[#ff2bd6]" />{t('myTitle')}</h2>
          {!user ? (
            <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-white/55">{t('mySignIn')}</p>
              <AuthButton source="hell" />
            </div>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-[10px] font-black tracking-[0.12em] text-white/40">{t('myPieces')}</p><BlackPieceCount n={me?.pieces ?? 0} size={16} className="mt-1 text-2xl" /></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-[10px] font-black tracking-[0.12em] text-white/40">{t('myRankLabel')}</p><p className="mt-1 font-mono text-2xl font-black">{me ? t('myRank', { rank: me.rank }) : '—'}</p></div>
              </div>
              {!me && ranking !== null && <p className="mt-3 text-xs text-white/45">{t('myNone')}</p>}
              <h3 className="mt-4 text-[11px] font-black tracking-[0.12em] text-white/45">{t('myCerts')}</h3>
              {certs.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {certs.map((c) => (
                    <Link key={c.id} href={`/cert/${c.id}`} className="flex items-center gap-2 rounded-full border border-[#ff3355]/50 bg-[#ff3355]/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-[#ff3355]/20">
                      <span className="font-mono font-black text-[#ff3355]">#{c.clear_no}</span>{hellLabel(c.game, locale)}
                    </Link>
                  ))}
                </div>
              ) : <p className="mt-1 text-xs text-white/40">{t('myCertsEmpty')}</p>}
            </>
          )}
        </section>

        {/* Top 10 */}
        <BlackPieceBoard limit={10} />
        <Link href={{ pathname: '/records', hash: 'black-piece' }} className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-black text-white/70 hover:border-[#ff3355]/60 hover:text-white">{t('viewAll')}<ArrowRight size={14} /></Link>
      </div>
    </main>
  );
}
