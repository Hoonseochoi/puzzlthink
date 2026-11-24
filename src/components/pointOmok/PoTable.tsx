"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Clock3, Crosshair, Eye, Flag, Hourglass, Loader2, Lock, RotateCcw, ShieldCheck, Trophy, X } from 'lucide-react';
import { KICKER, HEADING, MAIN, MODAL, MODAL_BACKDROP, MODAL_CLOSE, NOTE, PANEL, PANEL_TITLE, STAGE, BTN, BTN_ACCENT, STEEL_TEXT } from '@/components/ui/gameUi';
import { PO_SECONDS, carryOf, extensions, fiveLines, isLegalTriple, lineOrder, sum } from '@/lib/pointOmok';
import { type PoAction, type PoRoom, PO_SHOW_MS, budgetOf, isPlaying, knowsBudget, poBidsCheck } from '@/lib/pointOmokRoom';
import { BidRow, BudgetStrip, POINT_MARKS, PoBoardView, PoStone } from './PoParts';
import { useBidLock } from './useBidLock';

/**
 * The 포인트 오목 table, shared by the AI game and 1:1 rooms. It renders only public facts plus this player's own
 * points and bids: the other player's bids and points never reach the page until the match is over.
 */
export default function PoTable({ state, mySeat, dispatch, names, resultActions, asideExtra, onResign }: {
  state: PoRoom;
  mySeat: 0 | 1 | null;
  dispatch: (action: PoAction) => void;
  names: [string, string];
  resultActions?: ReactNode;
  asideExtra?: ReactNode;
  onResign?: () => void;
}) {
  const t = useTranslations('PointOmok');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const tick = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(tick); }, []);
  const bid = useBidLock(state, mySeat, dispatch);
  const [picked, setPicked] = useState<{ key: string; cells: number[] }>({ key: '', cells: [] });
  const [closedFor, setClosedFor] = useState(''); // the result window was closed for this match
  const panelRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLElement>(null);

  const viewer = mySeat ?? 0; // a spectator sees seat 0's side
  const opp = (1 - viewer) as 0 | 1;
  const playing = isPlaying(state);
  const finished = state.phase === 'finished';
  const iChoose = state.phase === 'choose' && mySeat === state.chooser;
  const pickKey = `${state.sid}-${state.round}`;
  const cells = picked.key === pickKey ? picked.cells : [];
  const hints = iChoose && cells.length ? extensions(state.board, cells) : [];
  const legal = cells.length === 3 && isLegalTriple(state.board, cells);
  const last = state.rounds.at(-1);
  const showing = !!last && now - state.shownAt < PO_SHOW_MS && state.shownAt > 0;
  const seconds = Math.max(0, Math.min(PO_SECONDS, Math.ceil((state.deadline - now) / 1000)));
  const lines = useMemo(() => (finished ? fiveLines(state.board) : null), [finished, state.board]);
  const verified = finished && mySeat !== null && !!state.secret?.salts ? poBidsCheck(state, opp) : null;
  const myName = (seat: number) => (seat === mySeat ? t('you') : names[seat]);
  const bidding = state.phase === 'bid' && mySeat !== null; // phones: compact table, smaller board

  // When it is time to bid on a phone, the board shrinks to fit the screen with the steppers: bring both into view.
  useEffect(() => {
    if (state.phase !== 'bid' || mySeat === null || window.innerWidth >= 1024) return;
    const timer = window.setTimeout(() => boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.round, mySeat]);
  // When it is this player's turn to pick on a phone, bring the board back up once the last reveal has played.
  useEffect(() => {
    if (!iChoose || window.innerWidth >= 1024) return;
    const timer = window.setTimeout(() => boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), Math.max(300, state.shownAt + PO_SHOW_MS - Date.now()));
    return () => window.clearTimeout(timer);
  }, [iChoose, state.round, state.shownAt]);

  const tap = (cell: number) => {
    if (!iChoose) return;
    const has = cells.includes(cell);
    let next = has ? cells.filter((c) => c !== cell) : [...cells, cell];
    if (next.length > 3) next = [cell];
    // A pick that cannot be part of any line with the others starts a new pick.
    if (!has && next.length > 1 && !extensions(state.board, next.slice(0, -1)).includes(cell)) next = [cell];
    setPicked({ key: pickKey, cells: next });
  };
  const confirmPick = () => { if (legal) dispatch({ t: 'choose', cells: lineOrder(cells)! }); };

  const spent = sum(bid.bets);
  const left = bid.budget - spent;
  const carry = carryOf(bid.budget, spent);
  const myBudget = mySeat !== null && knowsBudget(state, mySeat) ? budgetOf(state, mySeat) : null;
  const myBets = mySeat !== null ? state.secret?.bets[mySeat] ?? [] : [];

  const heading = finished
    ? state.winner === 'draw' ? t('draw') : mySeat === null ? t('winnerIs', { name: names[state.winner as number] }) : state.winner === mySeat ? t('youWin') : t('youLose')
    : state.phase === 'choose' ? (iChoose ? t('chooseYou') : t('chooseThem', { name: names[state.chooser] }))
      : state.phase === 'bid' ? (mySeat === null ? t('bidWatch') : bid.locked ? t('bidLocked') : t('bidYou'))
        : t('revealing');

  const status = (seat: 0 | 1) => {
    if (!playing) return null;
    if (state.phase === 'choose') return seat === state.chooser ? t('statusChoosing') : null;
    if (state.phase === 'bid') return state.commits[seat] !== null ? t('statusLocked') : t('statusBidding');
    return t('statusRevealing');
  };

  const actionPanel = (
    <div className="space-y-3">
      {showing && last && mySeat !== null && !bidding && (
        <section key={state.shownAt} className="po-card-in rounded-[14px] border border-(--accent)/45 bg-(--accent)/[.08] p-4">
          <p className={KICKER}>{t('roundResult', { n: state.rounds.length })}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {last.triple.map((cell, i) => {
              const mine = last.owners[i] === mySeat;
              return (
                <div key={cell} className={`rounded-[10px] border p-2 text-center ${mine ? 'border-(--accent)/60 bg-black/30' : 'border-white/10 bg-black/40'}`}>
                  <span className="font-mono text-xs font-black text-white/60">{POINT_MARKS[i]}</span>
                  <div className="mx-auto mt-1 h-8 w-8"><PoStone seat={last.owners[i]} /></div>
                  <p className={`mt-1 text-[11px] font-black ${mine ? 'text-(--accent)' : 'text-white/45'}`}>{mine ? t('took') : t('lostPoint')}</p>
                  {myBets[state.rounds.length - 1] && <p className="font-mono text-[10px] text-white/45">{t('myBid', { n: myBets[state.rounds.length - 1][i] })}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {state.phase === 'choose' && iChoose && (
        <section className={PANEL}>
          <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('pickTitle')}</p><span className="font-mono text-xs font-black text-white/60">{cells.length}/3</span></div>
          <p className="mt-2 break-keep text-xs leading-5 text-white/55">{t('pickHint')}</p>
          {cells.length > 0 && !legal && cells.length === 3 && <p className="mt-2 text-xs font-bold text-[#ff8a8a]">{t('pickInvalid')}</p>}
          <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
            <button type="button" onClick={() => setPicked({ key: pickKey, cells: [] })} disabled={!cells.length} className={`${BTN} px-4 py-3 disabled:opacity-30`}><RotateCcw size={14} />{t('pickClear')}</button>
            <button type="button" onClick={confirmPick} disabled={!legal} className={`${BTN_ACCENT} py-3 text-sm`}><Crosshair size={16} />{t('pickConfirm')}</button>
          </div>
        </section>
      )}

      {state.phase === 'choose' && !iChoose && (
        <section className={PANEL}>
          <p className="flex items-center gap-2 text-sm font-bold text-white/70"><Hourglass size={15} className="text-(--accent)" />{t('waitChoose', { name: names[state.chooser] })}</p>
          {myBudget !== null && <p className="mt-2 text-xs text-white/50">{t('nextBudget', { n: myBudget })}</p>}
        </section>
      )}

      {state.phase === 'bid' && mySeat !== null && state.triple && (
        <section className={`${PANEL} !p-2.5 sm:!p-4`}>
          {!bid.ready ? <p className="flex items-center gap-2 text-sm text-white/55"><Loader2 size={15} className="animate-spin" />{t('syncing')}</p> : <>
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="flex items-baseline gap-1.5"><span className={PANEL_TITLE}>{t('myPoints')}</span><span className="font-mono text-xl font-black text-white">{bid.budget}</span><span className="text-[10px] font-bold text-white/40">P</span></p>
              <p className="text-right font-mono text-[11px] font-bold leading-4 text-white/60">{t('spentLeft', { spent, left })} · <span className="font-black text-[#7ff0bf]">{t('carryNext', { n: carry })}</span></p>
            </div>
            <div className="mt-1.5 px-1"><BudgetStrip budget={bid.budget} bets={bid.bets} /></div>
            <div className="mt-2 space-y-1.5">
              {state.triple.map((cell, i) => (
                <BidRow key={cell} index={i} cell={cell} value={bid.bets[i]} locked={bid.locked}
                  max={bid.bets[i] + left} onChange={(v) => bid.setBet(i, v)}
                  labels={{ minus: t('minus'), plus: t('plus'), rest: t('allRest'), point: t('point') }} />
              ))}
            </div>
            {bid.locked
              ? <p className="mt-2 flex items-center justify-center gap-2 rounded-md border border-[#7ff0bf]/35 bg-[#7ff0bf]/10 py-3 text-sm font-black text-[#9ff5cf]"><Lock size={15} />{state.commits[opp] !== null ? t('bothLocked') : t('waitBid', { name: names[opp] })}</p>
              : (
                <div className="mt-2 grid grid-cols-[auto_auto_1fr] gap-1.5">
                  <button type="button" onClick={() => bid.setAll([1, 1, 1])} className={`${BTN} px-2.5 py-3 text-[11px]`}>{t('presetMin')}</button>
                  <button type="button" onClick={() => { const b = Math.floor(bid.budget / 3); const r = bid.budget - b * 3; bid.setAll([b + (r > 0 ? 1 : 0), b + (r > 1 ? 1 : 0), b]); }} className={`${BTN} px-2.5 py-3 text-[11px]`}>{t('presetEven')}</button>
                  <button type="button" onClick={bid.lock} className={`${BTN_ACCENT} py-3 text-sm`}><Lock size={16} />{t('lockBid')}</button>
                </div>
              )}
            <p className="mt-2 px-1 text-[11px] leading-4 text-white/40 max-lg:hidden">{t('bidRule')}</p>
            <p className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[10px] text-white/40 lg:hidden"><span>{t('bidRuleShort')}</span><span className={state.commits[opp] !== null ? 'font-bold text-[#7ff0bf]' : ''}>{names[opp]} · {state.commits[opp] !== null ? t('statusLocked') : t('statusBidding')}</span></p>
          </>}
        </section>
      )}

      {state.phase === 'bid' && mySeat === null && <section className={PANEL}><p className="text-sm text-white/60">{t('bidWatch')}</p></section>}
      {state.phase === 'reveal' && <section className={PANEL}><p className="flex items-center gap-2 text-sm font-bold text-white/70"><Loader2 size={15} className="animate-spin text-(--accent)" />{t('revealing')}</p></section>}

      {finished && (
        <section className={PANEL}>
          <p className={PANEL_TITLE}>{t('finalTitle')}</p>
          <p className="mt-2 text-lg font-black">{heading}</p>
          <p className="mt-1 text-xs text-white/55">{state.reason === 'resign' ? t('byResign') : state.reason === 'timeout' ? t('byTimeout') : state.reason === 'full' ? t('byFull') : t('fivesScore', { a: state.fives[viewer], b: state.fives[opp] })}</p>
          {verified !== null && state.rounds.some((r) => r.hashes?.[opp]) && (
            <p className={`mt-3 flex items-center gap-1.5 text-[11px] font-bold ${verified ? 'text-[#7ff0bf]' : 'text-[#ff8a8a]'}`}><ShieldCheck size={13} />{verified ? t('verified') : t('verifyFailed')}</p>
          )}
          <button type="button" onClick={() => setClosedFor('')} className={`${BTN} mt-3 w-full py-2.5`}><Trophy size={14} />{t('showResult')}</button>
        </section>
      )}
    </div>
  );

  return (
    <main className={MAIN}>
      <section ref={boardRef} className={`${STAGE} scroll-mt-2`}>
        <div className="mb-2 flex items-end justify-between gap-3 px-1 sm:mb-3 sm:px-2">
          <div className="min-w-0">
            <p className={KICKER}>{finished ? t('resultKicker') : state.phase === 'lobby' ? 'LOBBY' : t('roundKicker', { n: state.round })}</p>
            <h1 className={`mt-1 ${HEADING}`}>{heading}</h1>
          </div>
          {playing && <div className={`flex min-w-[72px] items-center justify-center gap-1.5 rounded-md px-3 py-2 font-mono text-sm font-bold ${seconds <= 10 ? 'animate-pulse bg-(--accent) text-(--accent-ink)' : 'border border-white/15 bg-black/60 text-[#c9cfdc]'}`}><Clock3 size={14} />{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</div>}
        </div>
        {playing && <div className="mx-1 mb-2 h-1 overflow-hidden rounded-full bg-white/10 sm:mx-2"><div className="h-full bg-(--accent) transition-[width] duration-300" style={{ width: `${(seconds / PO_SECONDS) * 100}%` }} /></div>}

        {/* Both players: colour, who chooses, and only this player's own points. */}
        <div className={`mb-2 grid grid-cols-2 gap-2 sm:mb-3 ${bidding ? 'max-lg:hidden' : ''}`}>
          {([viewer, opp] as const).map((seat) => (
            <div key={seat} className={`flex items-center gap-2 rounded-[10px] border px-2.5 py-2 ${playing && state.chooser === seat ? 'border-(--accent)/55 bg-(--accent)/[.07]' : 'border-white/10 bg-black/30'}`}>
              <span className="h-6 w-6 shrink-0"><PoStone seat={seat} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black">{myName(seat)}</p>
                <p className="truncate text-[10px] text-white/45">{playing && state.chooser === seat ? t('chooserBadge') : status(seat) ?? (seat === mySeat || !playing ? '' : t('pointsHidden'))}{playing && state.chooser === seat && status(seat) && state.phase !== 'choose' ? ` · ${status(seat)}` : ''}</p>
              </div>
              {seat === mySeat && myBudget !== null && playing && <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-black">{myBudget}P</span>}
              {state.phase === 'bid' && state.commits[seat] !== null && <Check size={14} className="shrink-0 text-[#7ff0bf]" />}
            </div>
          ))}
        </div>

        {/* While bidding on a phone the board shrinks so the steppers fit on the same screen. */}
        <div className={`mx-auto w-full transition-[max-width] duration-500 ${bidding ? 'max-lg:max-w-[var(--po-board)]' : ''}`} style={{ ['--po-board' as string]: 'max(200px, min(100%, calc(100svh - 418px)))' }}>
        <PoBoardView
          board={state.board}
          triple={state.phase === 'bid' || state.phase === 'reveal' ? state.triple : null}
          picked={iChoose ? cells : []}
          hints={hints}
          interactive={iChoose}
          dropped={showing && last ? { cells: last.triple, key: String(state.shownAt) } : null}
          lines={lines}
          onTap={tap}
          stoneLabel={(seat) => (seat === 0 ? t('black') : t('white'))}
        />
        </div>
        {mySeat === null && state.phase !== 'lobby' && <p className="mt-3 flex items-center justify-center gap-2 text-xs text-white/45"><Eye size={14} />{t('spectating')}</p>}
        <div ref={panelRef} className={`${bidding ? 'mt-2' : 'mt-3'} lg:hidden`}>{actionPanel}</div>
      </section>

      <aside className="flex flex-col gap-4">
        <div className="hidden lg:block">{actionPanel}</div>
        {asideExtra}
        {state.rounds.length > 0 && (
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('historyTitle')}</p>
            <ol className="mt-3 max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
              {state.rounds.map((round, r) => {
                const mine = myBets[r];
                const theirs = finished ? state.secret?.bets[opp]?.[r] : undefined;
                return (
                  <li key={r} className="flex items-center gap-2 rounded-md bg-black/30 px-2 py-1.5 text-[11px]">
                    <span className="w-7 shrink-0 font-mono font-black text-white/45">R{r + 1}</span>
                    <span className="flex shrink-0 gap-0.5">{round.owners.map((o, i) => <span key={i} className="h-3.5 w-3.5"><PoStone seat={o} /></span>)}</span>
                    <span className="min-w-0 flex-1 truncate text-white/55">{t('chose', { name: myName(round.chooser) })}{round.auto?.[viewer] ? ` · ${t('autoBid')}` : ''}</span>
                    {mine && <span className="shrink-0 font-mono text-white/75">{mine.join('·')}</span>}
                    {theirs && <span className="shrink-0 font-mono text-white/40">/ {theirs.join('·')}</span>}
                  </li>
                );
              })}
            </ol>
            {!finished && <p className="mt-2 text-[10px] leading-4 text-white/35">{t('historyHidden')}</p>}
            {finished && <p className="mt-2 text-[10px] leading-4 text-white/35">{t('historyShown')}</p>}
          </section>
        )}
        <section className={NOTE}>
          <h2 className={PANEL_TITLE}>{t('quickRules')}</h2>
          <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-white/65">{(t.raw('quick') as string[]).map((rule, i) => <li key={rule} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{rule}</span></li>)}</ol>
        </section>
        {playing && mySeat !== null && onResign && <button type="button" onClick={onResign} className={`py-2.5 ${BTN} text-white/45`}><Flag size={13} />{t('resign')}</button>}
      </aside>

      {finished && closedFor !== `${state.sid}-${state.rounds.length}` && (
        <div className={MODAL_BACKDROP} role="dialog" aria-modal="true" aria-labelledby="po-result-title">
          <div className={MODAL}>
            <button type="button" onClick={() => setClosedFor(`${state.sid}-${state.rounds.length}`)} className={MODAL_CLOSE} aria-label={t('close')}><X size={18} /></button>
            <div className="mx-auto flex justify-center gap-2">{state.winner === 'draw' ? [0, 1].map((s) => <span key={s} className="h-14 w-14"><PoStone seat={s} /></span>) : <span className="h-16 w-16"><PoStone seat={state.winner as number} /></span>}</div>
            <p className={`${KICKER} mt-5`}>{t('resultKicker')}</p>
            <h2 id="po-result-title" className={`mt-1 text-3xl font-black tracking-tight ${STEEL_TEXT}`}>{heading}</h2>
            <p className="mt-2 text-sm text-white/55">{state.reason === 'resign' ? t('byResign') : state.reason === 'timeout' ? t('byTimeout') : state.reason === 'full' ? t('byFull') : t('fivesScore', { a: state.fives[viewer], b: state.fives[opp] })}</p>
            <p className="mt-1 text-xs text-white/40">{t('roundsPlayed', { n: state.rounds.length })}</p>
            {resultActions}
          </div>
        </div>
      )}
    </main>
  );
}
