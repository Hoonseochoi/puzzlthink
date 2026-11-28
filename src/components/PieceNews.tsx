"use client";

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Sparkles, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Fireworks } from './HallCelebration';
import { Stone } from './StoneAvatar';
import { Piece } from './CompetitionBoard';
import { TokenExchange } from './SageToken';
import { usePathname } from '@/i18n/routing';
import { GAMES } from '@/lib/gameCatalog';
import { getSupabase } from '@/lib/supabase';
import { walletChanged } from '@/lib/pieceWallet';

export type NewsKind = 'exchange' | 'prop_fast' | 'prop_top';
export type PodiumRow = { rank: number; nickname: string; total: number; hints: number };
type News = { kind: NewsKind; id: number; period?: number; day?: string; amount: number; rank?: number | null; podium?: PodiumRow[] | null };

/** Ask for this after something may have paid pieces (명제 바둑's result screen does). */
export const PIECE_NEWS_EVENT = 'puzzlthink:piece-news';
export const checkPieceNews = () => window.dispatchEvent(new Event(PIECE_NEWS_EVENT));

const onGamePage = (path: string) => path !== '/' && ['/hell', ...GAMES.map((g) => g.href)].some((href) => href !== '/' && (path === href || path.startsWith(`${href}/`)));
/** Another dialog is up (nickname, new icon, tester recruitment): wait for it. */
const otherDialogOpen = () => !!document.querySelector('[aria-labelledby="nickname-title"],[aria-labelledby="icon-unlock-title"],[data-tester-recruit]');

/** m:ss.s */
export const fmtMs = (ms: number) => { const s = ms / 1000; return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`; };

/**
 * One popup per server-recorded news item, shown once across devices (my_piece_news → mark_piece_news_seen):
 *  - exchange: "피스 N개를 현자의 징표 N개로 교환해 드렸어요" when a week ended (1W: two lines on what changed);
 *  - prop_fast: "챌린지 달성! 피스 +1" (명제 바둑 within 5 minutes; shown on its result screen);
 *  - prop_top: "어제 명제 바둑 N위! 피스 +5" with yesterday's podium.
 * The site-wide instance never opens on a game page or over another dialog; 명제 바둑 mounts its own on its entry and
 * result screens (`only` + `onGame`).
 */
export default function PieceNews({ only = ['exchange', 'prop_top'], onGame = false }: { only?: NewsKind[]; onGame?: boolean }) {
  const { user } = useAuth();
  const path = usePathname();
  const [queue, setQueue] = useState<News[]>([]);
  const [tick, setTick] = useState(0);
  const key = only.join(',');
  const allowed = !!user && (onGame || !onGamePage(path));

  const check = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.rpc('my_piece_news');
    const kinds = key.split(',');
    const fresh = (Array.isArray(data) ? (data as News[]) : []).filter((n) => kinds.includes(n.kind));
    if (!fresh.length) return;
    if (otherDialogOpen()) { window.setTimeout(() => setTick((v) => v + 1), 1500); return; }
    setQueue((cur) => [...cur, ...fresh.filter((n) => !cur.some((c) => c.kind === n.kind && c.id === n.id))]);
    supabase.rpc('mark_piece_news_seen', {
      p_periods: fresh.filter((n) => n.kind === 'exchange').map((n) => n.id),
      p_grants: fresh.filter((n) => n.kind !== 'exchange').map((n) => n.id),
    }).then(() => walletChanged());
  }, [key]);

  useEffect(() => {
    if (!allowed) return;
    const timer = window.setTimeout(check, tick ? 0 : 1200);
    const onCheck = () => window.setTimeout(check, 300);
    window.addEventListener(PIECE_NEWS_EVENT, onCheck);
    return () => { window.clearTimeout(timer); window.removeEventListener(PIECE_NEWS_EVENT, onCheck); };
  }, [allowed, check, tick]);

  const head = queue[0];
  if (!head || !user) return null;
  return createPortal(<NewsCard news={head} name={user.user_metadata?.nickname ?? ''} onClose={() => setQueue((q) => q.slice(1))} />, document.body);
}

export function NewsCard({ news, name, onClose }: { news: News; name: string; onClose: () => void }) {
  const t = useTranslations('Tokens');
  const exchange = news.kind === 'exchange';
  const kicker = exchange ? t('newsExchangeKicker') : news.kind === 'prop_fast' ? t('newsFastKicker') : t('newsTopKicker');
  const title = exchange ? t('newsExchangeTitle', { n: news.amount }) : news.kind === 'prop_fast' ? t('newsFastTitle', { n: news.amount }) : t('newsTopTitle', { rank: news.rank ?? 1, n: news.amount });
  return (
    <div data-piece-news={news.kind} className="fixed inset-0 z-[114] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="piece-news-title">
      {!exchange && <Fireworks />}
      <div className="hall-pop relative my-auto w-full max-w-sm overflow-hidden rounded-[30px] border border-white/15 bg-gradient-to-b from-[#2a1670] via-[#170c45] to-[#0b0624] px-6 pb-6 pt-7 text-center text-white" style={{ boxShadow: '0 0 120px rgba(169,139,255,.4), inset 0 1px 0 rgba(255,255,255,.12)' }}>
        <button type="button" onClick={onClose} aria-label={t('close')} className="absolute right-4 top-4 z-10 text-white/40 hover:text-white"><X size={18} /></button>
        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-[#ffd35c] px-3 py-1 font-mono text-[10px] font-black tracking-[0.2em] text-[#2a1460]"><Sparkles size={11} />{kicker}</span>
        <h2 id="piece-news-title" className="relative mt-3 break-keep text-[23px] font-black leading-tight tracking-[-0.03em]">{title}</h2>

        {exchange ? (
          <>
            <div className="mt-5"><TokenExchange n={news.amount} size={96} /></div>
            {news.period === 1 ? (
              <div className="mt-4 space-y-1.5 text-left">
                <p className="break-keep rounded-2xl bg-white/[0.07] px-3.5 py-2.5 text-[12.5px] leading-5 text-white/80">{t('newsExchangeLine1')}</p>
                <p className="break-keep rounded-2xl bg-white/[0.07] px-3.5 py-2.5 text-[12.5px] leading-5 text-white/80">{t('newsExchangeLine2')}</p>
              </div>
            ) : (
              <p className="mt-4 break-keep text-xs leading-5 text-white/65">{t('newsExchangeWeek', { n: news.period ?? 2 })}</p>
            )}
          </>
        ) : news.kind === 'prop_top' && news.podium?.length ? (
          <>
            <MiniPodium rows={news.podium} me={name} />
            <p className="mt-3 break-keep text-xs leading-5 text-white/65">{t('newsTopDesc', { n: news.amount })}</p>
          </>
        ) : (
          <>
            <div className="relative mx-auto mt-5 flex h-[120px] w-[120px] items-center justify-center">
              <span className="icon-ring absolute inset-2 rounded-full border-2 border-[#ffd35c]" />
              <span className="icon-rise relative flex items-center gap-1 font-mono text-3xl font-black text-[#ffe08a]"><Piece size={30} />+{news.amount}</span>
            </div>
            <p className="mt-2 break-keep text-xs leading-5 text-white/65">{t('newsFastDesc')}</p>
          </>
        )}
        <button type="button" onClick={onClose} className="relative mt-5 w-full rounded-[14px] bg-[#ffd35c] py-3 text-sm font-black text-[#2a1460] transition hover:brightness-105">{t('ok')}</button>
      </div>
    </div>
  );
}

/** A small 2nd · 1st · 3rd podium for the popup (stones with their icons, time, 💡 marks). */
function MiniPodium({ rows, me }: { rows: PodiumRow[]; me: string }) {
  const order = [2, 1, 3].map((p) => rows.find((r) => r.rank === p));
  return (
    <div className="mt-5 grid grid-cols-3 items-end gap-2">
      {order.map((r, i) => {
        const place = [2, 1, 3][i];
        if (!r) return <div key={place} />;
        const block = place === 1 ? 'h-16 bg-gradient-to-b from-[#ffd45c] to-[#e8a33c]' : place === 2 ? 'h-11 bg-gradient-to-b from-[#e7e9ee] to-[#b9bec8]' : 'h-8 bg-gradient-to-b from-[#f0c39a] to-[#c98a55]';
        return (
          <div key={place} className="flex min-w-0 flex-col items-center">
            <span className={`rounded-full ${r.nickname === me ? 'ring-2 ring-[#ffd35c] ring-offset-2 ring-offset-[#170c45]' : ''}`}><Stone name={r.nickname} size={place === 1 ? 52 : 40} /></span>
            <span className="mt-1 w-full truncate text-[11px] font-black">{r.nickname}</span>
            <span className="font-mono text-[10px] font-bold text-white/60">{fmtMs(r.total)}{r.hints > 0 && ` ${'💡'.repeat(Math.min(r.hints, 3))}`}</span>
            <span className={`mt-1 flex w-full justify-center rounded-t-xl pt-1 text-lg font-black text-white/90 ${block}`}>{place}</span>
          </div>
        );
      })}
    </div>
  );
}
