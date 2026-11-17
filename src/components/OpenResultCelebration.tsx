"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowDown, ArrowUp, Crown, Swords, Trophy, X } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { OPEN_RESULT_EVENT, type OpenResultDetail } from '@/lib/stats';
import { Fireworks, GAME_LABEL } from './HallCelebration';

const SHOW_AFTER_MS = 1400; // let the result screen land first
const RANK_FROM = 3; // wins needed to appear in the open ranking

/**
 * After a game against signed-in players: revenge success / failure, and for open matches the ranking
 * change with the places around me (by nickname, with win/loss counts).
 */
export default function OpenResultCelebration() {
  const t = useTranslations('OpenResult');
  const tc = useTranslations('Common');
  const router = useRouter();
  const [shown, setShown] = useState<OpenResultDetail | null>(null);

  useEffect(() => {
    const timers: number[] = [];
    const onResult = (e: Event) => {
      const detail = (e as CustomEvent<OpenResultDetail>).detail;
      timers.push(window.setTimeout(() => setShown(detail), SHOW_AFTER_MS));
    };
    window.addEventListener(OPEN_RESULT_EVENT, onResult);
    return () => { window.removeEventListener(OPEN_RESULT_EVENT, onResult); timers.forEach((id) => window.clearTimeout(id)); };
  }, []);

  if (!shown) return null;
  const close = () => setShown(null);
  const { revenge, before, after, near, open } = shown;
  const game = tc(GAME_LABEL[shown.game]);
  const top5 = after !== null && after <= 5 && (before === null || before > 5);
  const up = after !== null && (before === null || after < before);
  const down = after !== null && before !== null && after > before;
  const myWins = near.find((row) => row.is_me)?.wins ?? 0;
  const party = top5 || revenge?.status === 'success' || (up && after !== null);
  const gold = top5;

  let rankTitle = '', rankDesc = '';
  if (open) {
    if (after === null) { rankTitle = t('notRankedTitle'); rankDesc = t('notRankedDesc', { n: Math.max(1, RANK_FROM - myWins) }); }
    else if (top5) { rankTitle = t('top5Title'); rankDesc = t('top5Desc', { game, rank: after }); }
    else if (before === null) { rankTitle = t('enterTitle'); rankDesc = t('enterDesc', { game, rank: after }); }
    else if (up) { rankTitle = t('upTitle'); rankDesc = t('upDesc', { from: before, to: after }); }
    else if (down) { rankTitle = t('downTitle'); rankDesc = t('downDesc', { from: before, to: after }); }
    else { rankTitle = t('keepTitle'); rankDesc = t('keepDesc', { rank: after }); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      {party && <Fireworks />}
      <div className={`hall-pop relative w-full max-w-sm overflow-hidden rounded-[26px] border p-6 text-center text-white ${gold ? 'border-[#ffd36e]/60 bg-gradient-to-b from-[#3a2c0c] to-[#141109] shadow-[0_0_140px_rgba(255,211,110,.45)]' : 'border-white/10 bg-gradient-to-b from-[#1c1d24] to-[#0d0d11] shadow-[0_0_100px_rgba(0,0,0,.6)]'}`}>
        <button onClick={close} aria-label={t('close')} className="absolute right-4 top-4 text-white/40 hover:text-white"><X size={18} /></button>

        {revenge && (
          <div className={`rounded-2xl px-4 py-4 ${revenge.status === 'success' ? 'bg-[#ff4d5e]/15 ring-1 ring-[#ff4d5e]/40' : 'bg-white/5 ring-1 ring-white/10'}`}>
            <Swords size={28} className={`mx-auto ${revenge.status === 'success' ? 'text-[#ff6b7a]' : 'text-white/40'}`} />
            <p className="mt-2 text-[10px] font-black tracking-[0.3em] text-[#ff8b96]">REVENGE</p>
            <h2 className="mt-1 text-2xl font-black">{revenge.status === 'success' ? t('revengeWin') : t('revengeLose')}</h2>
            <p className="mt-1.5 break-keep text-xs leading-5 text-white/60">{t(revenge.status === 'success' ? 'revengeWinDesc' : 'revengeLoseDesc', { names: revenge.names.join(', ') })}</p>
          </div>
        )}

        {open && (
          <div className={revenge ? 'mt-4' : ''}>
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${gold ? 'bg-[#ffd36e]/20 ring-1 ring-[#ffd36e]/50' : 'bg-white/5 ring-1 ring-white/10'}`}>
              {gold ? <Crown size={26} className="text-[#ffd36e]" /> : up ? <ArrowUp size={24} className="text-[#3ddc97]" /> : down ? <ArrowDown size={24} className="text-[#ff9aa4]" /> : <Trophy size={22} className="text-white/60" />}
            </div>
            <p className={`mt-3 text-[10px] font-black tracking-[0.3em] ${gold ? 'text-[#ffd36e]' : 'text-white/45'}`}>{t('eyebrow', { game })}</p>
            <h2 className={`mt-1 font-black ${gold ? 'text-3xl text-[#ffd36e]' : 'text-xl'}`}>{rankTitle}</h2>
            <p className="mt-1.5 break-keep text-xs leading-5 text-white/60">{rankDesc}</p>

            {near.some((row) => row.rank !== null) && (
              <ol className="mt-4 space-y-1.5 text-left">
                {near.filter((row) => row.rank !== null).map((row) => (
                  <li key={`${row.rank}-${row.is_me}`} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${row.is_me ? 'bg-[#ffd36e] text-[#2a2118]' : 'bg-white/[.05]'}`}>
                    <span className="w-8 font-mono text-sm font-black">{row.rank}</span>
                    <span className={`min-w-0 flex-1 truncate text-sm ${row.is_me ? 'font-black' : 'font-bold'}`}>{row.nickname ?? t('me')}{row.is_me ? ` (${t('me')})` : ''}</span>
                    <span className={`font-mono text-xs font-black ${row.is_me ? '' : 'text-white/70'}`}>{t('wl', { w: row.wins, l: row.losses })}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        <div className="mt-5 grid gap-2">
          {open && <button onClick={() => { close(); router.push('/records#open-ranking'); }} className={`rounded-[12px] py-3 text-sm font-black ${gold ? 'bg-[#ffd36e] text-[#2a2118] hover:bg-[#ffe09a]' : 'bg-white text-[#17201e] hover:bg-white/90'}`}>{t('viewRanking')}</button>}
          <button onClick={close} className="rounded-[12px] border border-white/15 bg-white/5 py-3 text-xs font-bold text-white/75 hover:bg-white/10">{t('close')}</button>
        </div>
      </div>
    </div>
  );
}
