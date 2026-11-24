"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { CircleHelp, X } from 'lucide-react';
import { TipList, TipsButton, TipsModal } from '@/components/ui/TipsModal';
import { PO_GRANT, carryOf, sum } from '@/lib/pointOmok';
import type { PoRoom } from '@/lib/pointOmokRoom';
import { POINT_MARKS, PoStone } from './PoParts';

/** The in-game "? 규칙" button: every rule and how to pick and bid, over the board. */
export function PoRulesTip() {
  const t = useTranslations('PointOmok');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" title={t('tipButton')}
        className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-black text-white/75 ring-1 ring-white/10 hover:bg-(--accent) hover:text-(--accent-ink)">
        <CircleHelp size={13} />{t('tipButton')}
      </button>
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-label={t('rulesTitle')} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center [--accent:#ff5d8f] [--accent-ink:#22060f]" onClick={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[22px] border border-white/10 bg-[#14161c] p-5 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-black">{t('rulesTitle')}</p>
              <button type="button" onClick={() => setOpen(false)} aria-label={t('close')} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"><X size={16} /></button>
            </div>
            <ol className="mt-3 space-y-2 text-[13px] leading-6 text-white/75">
              {(t.raw('fullRules') as string[]).map((rule, i) => <li key={rule} className="flex gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink)">{i + 1}</span><span className="break-keep">{rule}</span></li>)}
            </ol>
            <p className="mt-4 text-[11px] font-black tracking-[0.12em] text-white/40">{t('tipHelp')}</p>
            <ul className="mt-1.5 space-y-1.5 text-[12px] leading-5 text-white/60">
              {(t.raw('helpControls') as string[]).map((line) => <li key={line} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-(--accent)" /><span className="break-keep">{line}</span></li>)}
            </ul>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/** Budget a seat had in each round, from its bids. */
function budgets(history: number[][]): number[] {
  const out: number[] = [];
  let budget = PO_GRANT;
  for (const bets of history) { out.push(budget); budget = PO_GRANT + carryOf(budget, sum(bets)); }
  return out;
}

/**
 * "필승 꿀팁" after a loss: the round that decided it, with both sides' bids (all bids are public once the match is over),
 * what it would have taken to keep each point, how many points this player let go to waste, and general tips.
 */
export function PoLossTips({ state, mySeat }: { state: PoRoom; mySeat: 0 | 1 }) {
  const t = useTranslations('PointOmok');
  const [open, setOpen] = useState(false);
  const opp = (1 - mySeat) as 0 | 1;
  const mine = state.secret?.bets[mySeat] ?? [];
  const theirs = state.secret?.bets[opp] ?? [];
  const r = state.rounds.length - 1;
  const last = state.rounds[r];
  const myBudgets = budgets(mine);
  // Points left unspent that the carry rule threw away (the half that did not carry over, rounded).
  const wasted = mine.reduce((total, bets, i) => { const left = myBudgets[i] - sum(bets); return total + left - Math.floor(left / 2); }, 0);
  const savedRounds = mine.filter((bets, i) => myBudgets[i] - sum(bets) >= 2).length;
  const decided = state.reason === 'five' && last && mine[r] && theirs[r];
  const iChose = last?.chooser === mySeat;
  return (
    <>
      <TipsButton label={t('tipsButton')} onOpen={() => setOpen(true)} />
      {open && (
        <TipsModal title={t('tipsTitle')} closeLabel={t('close')} onClose={() => setOpen(false)}>
          {decided ? (
            <section className="mt-4 rounded-[12px] border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs font-black text-white/70">{t('tipsRound', { n: r + 1, who: iChose ? t('you') : t('them') })} · {t('tipsBudget', { n: myBudgets[r] })}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {last.triple.map((cell, i) => {
                  const lost = last.owners[i] === opp;
                  const need = theirs[r][i] + (iChose ? 1 : 0); // a tie goes to the player who did not choose
                  return (
                    <div key={cell} className={`rounded-[10px] border p-2 text-center ${lost ? 'border-(--accent)/50 bg-(--accent)/[.06]' : 'border-white/10 bg-black/30'}`}>
                      <p className="font-mono text-[11px] font-black text-white/55">{POINT_MARKS[i]}</p>
                      <span className="mx-auto mt-1 block h-6 w-6"><PoStone seat={last.owners[i]} /></span>
                      <p className="mt-1 font-mono text-[11px] text-white/70">{t('tipsBids', { me: mine[r][i], them: theirs[r][i] })}</p>
                      {lost && <p className="mt-0.5 text-[10px] font-bold text-(--accent)">{t('tipsNeed', { n: need })}</p>}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 break-keep text-[12px] leading-5 text-white/60">{iChose ? t('tipsChoseNote') : t('tipsTheyChoseNote')}</p>
            </section>
          ) : <p className="mt-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/55">{t('tipsNoRound')}</p>}
          <p className="mt-3 break-keep rounded-md bg-black/30 px-3 py-2.5 text-[12px] leading-5 text-white/60">{t('tipsWaste', { wasted, saved: savedRounds, rounds: mine.length })}</p>
          <TipList heading={t('tipsGeneral')} tips={t.raw('tipsList') as { title: string; body: string }[]} />
        </TipsModal>
      )}
    </>
  );
}
