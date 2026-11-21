"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, Layers2, RotateCcw, SquareStack } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, DIAMOND, HEADING, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, WELL, accentVars, fog, seg } from '@/components/ui/gameUi';
import { reportGame } from '@/lib/stats';
import {
  TSP_AI_TARGET, type TspCard, type TspFace, type TspLevel, type TspLog, type TspRound, type TspState, applyTspAction, chooseTspAiAction,
  newTspGame, startTspHand, tspBackOdds, tspCommitted, tspOptions, tspPot,
} from '@/lib/twoSidedPoker';
import { TSP_ACCENT, TSP_GLOW_RGB, TSP_INK, type TspCopy, tspCopy } from './copy';
import { Bubble, ChipPile, PokerChip, TwoFaceCard } from './TwoSidedPokerParts';

const CHIP_STEPS = [1, 2, 5, 10];
const faceValue = (card: TspCard, face: TspFace) => (face === 'both' ? `${card.front}·${card.back}` : String(card[face]));

function bubbleText(t: TspCopy, entry: TspLog | undefined) {
  if (!entry) return null;
  if (entry.kind === 'fold') return t.bubble.fold;
  if (entry.kind === 'call') return t.bubble.call;
  if (entry.kind === 'raise') return t.bubble.raise(entry.level);
  return entry.face === 'both' ? t.bubble.double(entry.level) : t.bubble.bet(t.face[entry.face ?? 'front'], entry.level);
}

export default function TwoSidedPokerGame({ locale }: { locale: string }) {
  const t = tspCopy(locale);
  const [level, setLevel] = useState<TspLevel>('normal');
  // Only rendered after the player starts (#play), never on the server, so the shuffle can happen at init.
  const [state, setState] = useState<TspState>(() => newTspGame('normal'));
  const [faceSel, setFaceSel] = useState<{ hand: number; face: TspFace } | null>(null);
  const [betSel, setBetSel] = useState<{ key: string; level: number } | null>(null);

  // AI turn, with a short think.
  useEffect(() => {
    if (state.phase !== 'bet' || state.turn !== 1) return;
    const id = window.setTimeout(() => setState((s) => (s.phase === 'bet' && s.turn === 1 ? applyTspAction(s, 1, chooseTspAiAction(s, 1)) : s)), 900 + Math.random() * 700);
    return () => window.clearTimeout(id);
  }, [state]);

  // Every finished match goes to the records; normal/hard wins count for the Hall of Fame, hard wins earn the certificate.
  useEffect(() => {
    if (state.phase !== 'finished') return;
    reportGame(`two-sided-poker-ai-${state.sid}`, 'two_sided_poker', 'ai', state.winner === 0 ? 'win' : 'loss', { difficulty: state.level, hands: state.hand, chips: state.chips[0] });
  }, [state]);

  const myTurn = state.phase === 'bet' && state.turn === 0;
  const opts = tspOptions(state, 0);
  const me = state.cards[0];
  const ai = state.cards[1];
  const bestSingle: TspFace = me.front >= me.back ? 'front' : 'back';
  const face: TspFace = state.faces[0]
    ?? (faceSel?.hand === state.hand && opts.faces.includes(faceSel.face) ? faceSel.face : opts.faces.includes(bestSingle) ? bestSingle : opts.faces[0] ?? 'front');
  const max = opts.maxLevel(face);
  const minLevel = opts.canCall ? opts.callLevel : Math.min(1, max);
  const turnKey = `${state.hand}-${state.log.length}`;
  const betLevel = Math.max(minLevel, Math.min(max, betSel?.key === turnKey ? betSel.level : minLevel));
  const cost = opts.cost(face, betLevel);
  const isCall = opts.canCall && betLevel === opts.callLevel;
  const answeredOnce = state.log.some((l) => l.side === 0);

  const last = state.rounds.at(-1);
  const settled = state.phase !== 'bet' && last;
  const aiShown = !!settled && last.reason === 'showdown';
  const aiLog = [...state.log].reverse().find((l) => l.side === 1);
  const potNow = state.phase === 'bet' ? tspPot(state) : 0;

  const status = state.phase === 'finished' ? (state.winner === 0 ? t.status.gameWin : t.status.gameLose)
    : settled ? (last.winner === 'draw' ? t.status.draw : last.winner === 0 ? t.status.win : t.status.lose)
      : !myTurn ? t.status.aiThinking : !opts.canCall ? t.status.myOpen : answeredOnce ? t.status.myRaise : t.status.myAnswer;

  const act = (action: Parameters<typeof applyTspAction>[2]) => setState((s) => applyTspAction(s, 0, action));
  const nextHand = () => setState((s) => startTspHand(s));
  const newGame = () => { setFaceSel(null); setBetSel(null); setState(newTspGame(level)); };

  const odds = tspBackOdds(state, 0, ai.front);
  const oddsTotal = odds.reduce((s, o) => s + o.copies, 0) || 1;

  const seat = (side: 0 | 1) => {
    const mine = side === 0;
    return (
      <div className="flex w-full items-center justify-between gap-2">
        <span className="flex items-center gap-2.5">
          <span className={`flex h-9 w-9 items-center justify-center rounded-md text-[11px] font-black ${mine ? 'bg-(--accent)/15 text-(--accent)' : 'bg-[#ff8a5c]/15 text-[#ff8a5c]'}`}>{mine ? t.you : t.ai}</span>
          <ChipPile count={state.chips[side]} tone={mine ? 'me' : 'ai'} showZero most={4} />
          {state.first === side && state.phase === 'bet' && <span className="rounded border border-white/15 px-1.5 py-0.5 text-[9px] font-black text-white/55">{t.firstMark}</span>}
        </span>
        {!mine && <Bubble text={state.phase === 'bet' || settled ? bubbleText(t, aiLog) : null} id={`${state.hand}-${state.log.length}-${aiLog?.kind}`} />}
      </div>
    );
  };

  const betZone = (side: 0 | 1) => {
    const f = state.faces[side];
    const committed = tspCommitted(state, side);
    return (
      <div className="flex min-h-[38px] items-center justify-center gap-2.5">
        {f ? <span className={`rounded-md px-2 py-1 text-[10px] font-black ${f === 'both' ? 'bg-(--accent) text-(--accent-ink) shadow-[0_0_16px_var(--accent-glow)]' : 'border border-(--accent)/45 bg-(--accent)/12 text-(--accent)'}`}>{t.face[f]}{f === 'both' && ' ×2'}</span> : null}
        {state.phase === 'bet' && <ChipPile count={committed} tone={side === 0 ? 'me' : 'ai'} size={18} />}
      </div>
    );
  };

  return (
    <div className={SHELL} style={{ ...accentVars(TSP_ACCENT, TSP_INK), backgroundImage: fog(TSP_GLOW_RGB) }}>
      <GameHeader backHref="/two-sided-poker" backLabel={t.back} title={t.title} subtitle={t.subtitle}><LanguageSwitcher compact dark /></GameHeader>
      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
            <div><p className={KICKER}>{t.hand(state.hand)}</p><h1 className={`mt-1 ${HEADING}`}>{status}</h1></div>
            <ChipRace chips={state.chips} />
          </div>

          {/* Table */}
          <div className="relative overflow-hidden rounded-[12px] border border-(--accent)/20 bg-[radial-gradient(ellipse_at_center,#221b43,#0d0b18_75%)] p-3 shadow-[inset_0_0_80px_rgba(0,0,0,.6)] sm:p-5">
            <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1.2px)', backgroundSize: '18px 18px' }} />
            <div className="relative flex flex-col items-center gap-2.5">
              {seat(1)}
              <TwoFaceCard card={ai} showBack={aiShown} chosen={state.faces[1]} dimUnchosen={aiShown} flipKey={aiShown ? `ai-${state.hand}` : undefined} dealKey={`ai-${state.hand}`} />
              {betZone(1)}
            </div>

            {/* Pot and shoe */}
            <div className="relative my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:my-3">
              <span className="flex items-center gap-1.5 justify-self-start text-[10px] font-bold text-white/35"><span className="relative h-7 w-5 rounded-[4px] border border-(--accent)/40 bg-[linear-gradient(150deg,#3a2f6e,#17122e)] shadow-[2px_2px_0_#2a2350,4px_4px_0_#1d1838]" /><span><b className="block font-mono text-sm text-white/70">{state.shoe.length}</b>{t.shoe}</span></span>
              <div className="flex min-w-[110px] flex-col items-center">
                <p className="text-[9px] font-black tracking-[.24em] text-white/35">{t.pot}</p>
                <div className="mt-1 flex items-center gap-2"><PokerChip tone="pot" size={22} /><motion.b key={potNow + state.carry} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="font-mono text-3xl font-black text-[#f2c14e] drop-shadow-[0_0_14px_rgba(242,193,78,.45)]">{potNow + state.carry}</motion.b></div>
                {state.carry > 0 && <p className="mt-0.5 font-mono text-[10px] text-[#f2c14e]/70">{t.carry(state.carry)}</p>}
              </div>
              <span />
            </div>

            <AnimatePresence>{settled && <RoundBanner key={`r-${state.rounds.length}`} t={t} round={last} carry={state.carry} />}</AnimatePresence>

            <div className="relative flex flex-col items-center gap-2.5">
              {betZone(0)}
              <TwoFaceCard card={me} showBack chosen={state.phase === 'bet' && !state.faces[0] && myTurn ? face : state.faces[0]} size="lg" dimUnchosen={!!settled} dealKey={`me-${state.hand}`} />
              {seat(0)}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-3">
            {state.phase === 'bet' && (
              <div className={`${WELL} p-2.5 sm:p-3 ${myTurn ? '' : 'pointer-events-none opacity-40'}`}>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {(['front', 'back', 'both'] as TspFace[]).map((f) => {
                    const allowed = state.faces[0] ? state.faces[0] === f : opts.faces.includes(f);
                    const on = face === f;
                    const Icon = f === 'both' ? Layers2 : SquareStack;
                    return (
                      <button key={f} type="button" aria-pressed={on} disabled={!allowed} onClick={() => setFaceSel({ hand: state.hand, face: f })}
                        title={state.faces[0] ? t.faceLocked : f === 'both' && state.faces[1] === 'both' ? t.doubleBlocked : undefined}
                        className={`rounded-md border p-2 text-left transition sm:p-2.5 ${on ? 'border-(--accent) bg-(--accent)/15 shadow-[inset_0_0_18px_var(--accent-soft)]' : 'border-white/10 bg-white/[0.03] hover:border-white/25'} disabled:cursor-not-allowed disabled:opacity-30`}>
                        <span className="flex items-center justify-between gap-1"><span className={`flex items-center gap-1.5 text-sm font-black ${on ? 'text-white' : 'text-white/70'}`}><Icon size={14} className={f === 'back' ? 'rotate-180' : ''} />{t.face[f]}</span><b className={`font-mono text-base font-black sm:text-lg ${on ? 'text-(--accent)' : 'text-white/45'}`}>{faceValue(me, f)}</b></span>
                        <span className="mt-0.5 hidden text-[10px] leading-4 text-white/40 sm:block">{t.faceHint[f]}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 flex flex-col gap-2.5 border-t border-white/10 pt-2.5 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="min-w-[78px]">
                      <p className="text-[9px] font-black tracking-[.16em] text-white/35">{t.betLabel}</p>
                      <p className="font-mono text-2xl font-black leading-tight text-white">{betLevel}<span className="ml-1 text-[10px] font-bold text-white/40">{face === 'both' ? t.perFace(betLevel) : ''}</span></p>
                      <p className="text-[10px] text-white/40">{t.cost(cost)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {CHIP_STEPS.map((n) => (
                        <button key={n} type="button" disabled={betLevel >= max} onClick={() => setBetSel({ key: turnKey, level: Math.min(max, betLevel + n) })} className="transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30" aria-label={`+${n}`}>
                          <PokerChip tone="me" size={36} label={`+${n}`} />
                        </button>
                      ))}
                      <button type="button" onClick={() => setBetSel({ key: turnKey, level: minLevel })} className={`${BTN} px-2 py-1.5 text-[10px]`}>{t.reset}</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_1.4fr] gap-2 sm:w-[260px]">
                    <button type="button" onClick={() => act({ t: 'fold' })} className={`${BTN} py-3 text-sm ${state.faces[1] === 'both' ? 'text-[#ff9aa4]' : ''}`}>{state.faces[1] === 'both' ? t.foldDouble : t.fold}</button>
                    <button type="button" onClick={() => act({ t: 'bet', face, level: betLevel })} className={`${BTN_ACCENT} py-3 text-sm`}>{isCall ? t.call(cost) : opts.canCall ? t.raise(betLevel) : t.bet(betLevel)}</button>
                  </div>
                </div>
              </div>
            )}
            {state.phase === 'reveal' && <button type="button" onClick={nextHand} className={`${BTN_ACCENT} w-full py-3 text-sm`}>{t.next}</button>}
            {state.phase === 'finished' && <button type="button" onClick={newGame} className={`${BTN_ACCENT} w-full py-3 text-sm`}><RotateCcw size={14} />{t.again}</button>}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <p className={`flex items-center gap-1.5 ${PANEL_TITLE}`}><BrainCircuit size={12} className="text-(--accent)" />{t.counting}</p>
            <p className="mt-2 break-keep text-xs leading-5 text-white/55">{t.countingDesc(ai.front)}</p>
            <div className="mt-3 space-y-1.5">
              {odds.map((o) => {
                const pct = Math.round((o.copies / oddsTotal) * 100);
                const real = aiShown && ai.back === o.back;
                return (
                  <div key={o.back} className="flex items-center gap-2">
                    <span className={`w-6 text-right font-mono text-sm font-black ${real ? 'text-[#f2c14e]' : o.copies ? 'text-(--accent)' : 'text-white/20 line-through'}`}>{o.back}</span>
                    <span className="relative h-4 flex-1 overflow-hidden rounded-sm bg-white/[0.05]"><motion.span className={`absolute inset-y-0 left-0 ${real ? 'bg-[#f2c14e]/70' : 'bg-(--accent)/55'}`} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 200, damping: 26 }} /></span>
                    <span className="w-16 text-right font-mono text-[10px] text-white/45">{t.copies(o.copies)} · {pct}%</span>
                  </div>
                );
              })}
            </div>
            {state.faces[1] === 'back' && state.phase === 'bet' && <p className="mt-2.5 rounded-md bg-(--accent)/10 px-2.5 py-1.5 text-[11px] leading-4 text-(--accent)">{t.countingHint}</p>}
          </section>
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t.difficulty}</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">{(['easy', 'normal', 'hard'] as TspLevel[]).map((l) => <button key={l} type="button" onClick={() => setLevel(l)} className={`py-2.5 ${seg(level === l)}`}>{t.levels[l]}<span className="mt-0.5 block text-[9px] opacity-55">~{TSP_AI_TARGET[l]}%</span></button>)}</div>
            <p className="mt-2 text-[10px] leading-4 text-white/40">{level !== state.level ? `${t.levelLocked} · ` : ''}{t.targetNote}</p>
          </section>
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t.history}</p>
            <div className="mt-3 flex max-h-[260px] flex-col gap-1.5 overflow-y-auto pr-1">
              {state.rounds.length === 0 && <p className="text-xs text-white/35">{t.noHistory}</p>}
              {[...state.rounds].reverse().map((r, i) => <HistoryRow key={state.rounds.length - i} t={t} n={state.rounds.length - i} r={r} />)}
            </div>
          </section>
          <section className={NOTE}>
            <p className={PANEL_TITLE}>{t.rules}</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-white/60">{t.ruleLines.map((line) => <li key={line} className="flex gap-2.5"><i className={DIAMOND} /><span className="break-keep">{line}</span></li>)}</ul>
          </section>
        </aside>
      </main>
    </div>
  );
}

/** Both stacks as one bar: who is ahead at a glance (80 chips in play). */
function ChipRace({ chips }: { chips: [number, number] }) {
  const share = chips[0] / Math.max(1, chips[0] + chips[1]);
  return (
    <div className="w-28 sm:w-40">
      <div className="flex justify-between font-mono text-[10px] font-black"><span className="text-(--accent)">{chips[0]}</span><span className="text-[#ff8a5c]">{chips[1]}</span></div>
      <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-[#ff8a5c]/80"><motion.span className="h-full bg-(--accent)" animate={{ width: `${share * 100}%` }} transition={{ type: 'spring', stiffness: 160, damping: 24 }} /></div>
    </div>
  );
}

function RoundBanner({ t, round, carry }: { t: TspCopy; round: TspRound; carry: number }) {
  const mine = round.delta[0];
  const [f0, f1] = round.faces;
  const shown = round.reason === 'showdown' && f0 && f1;
  let badge: string | null = null;
  if (round.bonus > 0) badge = round.winner === 0 ? t.result.doubleWin(round.bonus) : round.reason === 'fold' ? t.result.doubleFold(round.bonus) : t.result.aiDouble(round.bonus);
  else if (round.reason === 'showdown' && (f0 === 'both' || f1 === 'both')) badge = f0 === 'both' ? t.result.doubleLose : t.result.aiDoubleLose;
  const big = round.bonus > 0 || !!badge;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`relative mx-auto mb-2.5 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg border px-4 py-2 text-center ${big ? 'border-(--accent)/60 bg-(--accent)/15 shadow-[0_0_30px_var(--accent-glow)]' : 'border-white/10 bg-black/50'}`}>
      {shown
        ? <span className="font-mono text-sm font-black text-white">{faceValue(round.cards[0], f0)} <span className="text-white/30">{t.result.vs}</span> {faceValue(round.cards[1], f1)}</span>
        : round.reason === 'fold' ? <span className="text-xs font-bold text-white/70">{round.winner === 0 ? t.result.foldWin : t.result.foldLose}</span> : null}
      {round.winner === 'draw'
        ? <span className="text-xs font-bold text-[#f2c14e]">{t.result.carried(carry)}</span>
        : <span className={`font-mono text-xl font-black ${mine > 0 ? 'text-(--accent)' : 'text-[#ff8a5c]'}`}>{mine > 0 ? '+' : ''}{mine}</span>}
      {badge && <span className="rounded-md bg-(--accent) px-2 py-0.5 text-[11px] font-black text-(--accent-ink)">{badge}</span>}
    </motion.div>
  );
}

function HistoryRow({ t, n, r }: { t: TspCopy; n: number; r: TspRound }) {
  const folder = r.reason === 'fold' && r.winner !== 'draw' ? (r.winner === 0 ? 1 : 0) : null;
  const side = (i: 0 | 1) => {
    const f = r.faces[i];
    if (folder === i) return <span className="text-white/45">{t.fold}</span>;
    if (!f) return <span className="text-white/30">—</span>;
    const visible = i === 0 || r.reason === 'showdown';
    return <>{t.face[f]}{visible && <b className="ml-1 font-mono text-white">{faceValue(r.cards[i], f)}</b>}</>;
  };
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-white/[.06] bg-black/25 px-2.5 py-1.5 text-[11px]">
      <span className="font-mono text-white/35">H{n}</span>
      <span className="min-w-0 truncate font-bold text-white/70">{side(0)}<span className="mx-1.5 text-white/30">vs</span>{side(1)}</span>
      <span className={`font-mono font-black ${r.delta[0] > 0 ? 'text-(--accent)' : r.delta[0] < 0 ? 'text-[#ff8a5c]' : 'text-white/40'}`}>{r.delta[0] > 0 ? '+' : ''}{r.delta[0]}</span>
    </div>
  );
}
