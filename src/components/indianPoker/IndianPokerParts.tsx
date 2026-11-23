"use client";

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { BTN, BTN_ACCENT, HEADING, KICKER } from '@/components/ui/gameUi';
import { type PokerRound, type PokerSide, maxMatchableBet } from '@/lib/indianPoker';
import type { IndianPokerRoom, PokerLastAct } from '@/lib/indianPokerRoom';

/** One card. `hidden` shows its back (your own forehead card); a hidden → shown change flips it over. */
export function PokerCard({ value, hidden = false, label, compact = false, dealKey, wobble = false, tone = 'plain' }: {
  value: number; hidden?: boolean; label?: string; compact?: boolean; dealKey?: string; wobble?: boolean; tone?: 'plain' | 'win' | 'lose';
}) {
  const size = compact ? 'h-16 w-11 text-2xl' : 'h-32 w-[5.5rem] text-6xl sm:h-44 sm:w-28';
  const ring = tone === 'win' ? 'ring-2 ring-[#ffcf3f] shadow-[0_0_34px_rgba(255,207,63,.65)]' : tone === 'lose' ? 'opacity-55 saturate-50' : 'shadow-[0_12px_32px_rgba(0,0,0,.38)]';
  return (
    <div className="text-center [perspective:700px]">
      <motion.div key={dealKey} initial={dealKey ? { y: -40, opacity: 0, rotate: -8 } : false} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
        <div className={wobble ? 'ip-wobble' : undefined}>
          <motion.div key={hidden ? 'back' : 'front'} initial={hidden || compact ? false : { rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ duration: 0.38, ease: 'easeOut' }}
            className={`relative flex items-center justify-center rounded-[14px] border font-black transition-[opacity,box-shadow] duration-500 ${size} ${ring} ${hidden
              ? 'border-[#e6b94f]/55 bg-[repeating-linear-gradient(45deg,#3b2a0c_0_7px,#291d08_7px_14px)] text-[#e6b94f]'
              : 'bg-[linear-gradient(145deg,#fffdf6,#dfd7c7)] text-[#18191d]'}`}>
            {hidden ? <span className={`flex items-center justify-center rounded-[10px] border border-[#e6b94f]/40 bg-black/35 ${compact ? 'h-10 w-7 text-xl' : 'h-20 w-14 text-4xl sm:h-28 sm:w-[4.5rem] sm:text-5xl'}`}>?</span> : value}
            {!hidden && !compact && <><span className="absolute left-2 top-1.5 text-sm">{value}</span><span className="absolute bottom-1.5 right-2 rotate-180 text-sm">{value}</span></>}
          </motion.div>
        </div>
      </motion.div>
      {label && <p className="mt-2 max-w-28 truncate text-[10px] font-black text-white/50">{label}</p>}
    </div>
  );
}

/** Eases a number to its new value, so won chips visibly pour in. */
function useCountUp(value: number, reduced: boolean) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const a = from.current;
    const tick = (now: number) => {
      const p = reduced ? 1 : Math.min(1, (now - start) / 700);
      const v = Math.round(a + (value - a) * (1 - (1 - p) ** 3));
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);
  return shown;
}

export function ChipStack({ count, tone = 'gold', reduced = false, bare = false }: { count: number; tone?: 'gold' | 'red'; reduced?: boolean; bare?: boolean }) {
  const shown = useCountUp(count, reduced);
  const color = tone === 'gold' ? '#ffcf3f' : '#ff5568';
  return <span className="relative inline-block h-7 w-9" title={String(count)}>{Array.from({ length: Math.min(8, Math.max(1, Math.ceil(shown / 3))) }).map((_, i) => <i key={i} className="absolute left-0 h-2 w-9 rounded-full border border-black/40" style={{ bottom: i * 2.4, background: color, opacity: shown ? 1 : 0.25 }} />)}{!bare && <b className="absolute -right-7 top-1 font-mono text-xs text-white">{shown}</b>}</span>;
}

const CHIP_COLOR = { gold: '#ffcf3f', red: '#ff5568', pot: '#f2c14e' } as const;
/** X positions (percent of the table) of the two seats and the pot: the viewer sits left. */
const SEAT_X: Record<PokerSide | 'pot', number> = { 0: 17, 1: 83, pot: 50 };

/** A handful of chips sliding across the felt from one spot to another, in a small arc. */
function ChipFlight({ from, to, n, tone, delay = 0 }: { from: PokerSide | 'pot'; to: PokerSide | 'pot'; n: number; tone: keyof typeof CHIP_COLOR; delay?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <motion.i key={i} className="absolute -ml-2 -mt-2 block h-4 w-4 rounded-full border-2 border-dashed border-white/75 shadow-[0_2px_6px_rgba(0,0,0,.5)]" style={{ background: CHIP_COLOR[tone] }}
          initial={{ left: `${SEAT_X[from] + (i % 3) * 2 - 2}%`, top: '58%', opacity: 0, scale: 0.6 }}
          animate={{ left: `${SEAT_X[to] + (i % 3) * 2 - 2}%`, top: ['58%', `${34 - (i % 4) * 4}%`, '52%'], opacity: [0, 1, 1, 0], scale: [0.6, 1.1, 1, 0.8] }}
          transition={{ duration: 0.75, delay: delay + i * 0.07, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

function Bubble({ text, tone = 'plain' }: { text: string; tone?: 'plain' | 'hot' | 'cold' }) {
  const look = tone === 'hot' ? 'border-[#ff5568]/70 bg-[#ff3d5a] text-white shadow-[0_0_24px_rgba(255,61,90,.55)]' : tone === 'cold' ? 'border-white/15 bg-[#2a2d36] text-white/70' : 'border-[#ffcf3f]/50 bg-[#fff4cf] text-[#2a2118]';
  return (
    <motion.span initial={{ opacity: 0, y: 8, scale: 0.7 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className={`absolute -top-4 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-black ${look}`}>{text}</motion.span>
  );
}

function Thinking({ label }: { label: string }) {
  return <span className="flex items-center gap-1 text-[10px] font-black text-white/60">{label}{[0, 1, 2].map((i) => <i key={i} className="ip-dot inline-block h-1 w-1 rounded-full bg-white/70" style={{ animationDelay: `${i * 0.18}s` }} />)}</span>;
}

/** Everything the table needs, seen from one seat: index 0 is always the viewer, 1 the rival. */
export type PokerView = {
  phase: IndianPokerRoom['phase'];
  reason: IndianPokerRoom['reason'];
  cards: [number, number];
  bets: [number, number];
  chips: [number, number];
  carry: number;
  opened: boolean;
  turn: PokerSide;
  first: PokerSide;
  lastAct: PokerLastAct | null;
  rounds: PokerRound[];
  winner: PokerSide | 'draw' | null;
  max: number;
};

export function pokerView(state: IndianPokerRoom, seat: PokerSide): PokerView {
  const sw = <T,>(p: readonly [T, T]): [T, T] => (seat === 0 ? [p[0], p[1]] : [p[1], p[0]]);
  const rel = (s: PokerSide): PokerSide => (s === seat ? 0 : 1);
  return {
    phase: state.phase, reason: state.reason, cards: sw(state.cards), bets: sw(state.bets), chips: sw(state.chips), carry: state.carry, opened: state.opened,
    turn: rel(state.turn), first: rel(state.first),
    lastAct: state.lastAct ? { ...state.lastAct, side: rel(state.lastAct.side) } : null,
    rounds: state.rounds.map((r) => ({ ...r, cards: sw(r.cards), bets: sw(r.bets), first: rel(r.first), winner: r.winner === 'draw' ? 'draw' : rel(r.winner) })),
    winner: state.winner === null || state.winner === 'draw' ? state.winner : rel(state.winner),
    max: maxMatchableBet(state.chips, state.bets),
  };
}

/** Hand wins in a row for `side`, counted back from the latest hand. */
export function pokerStreak(rounds: PokerRound[], side: PokerSide) {
  let n = 0;
  for (let i = rounds.length - 1; i >= 0 && rounds[i].winner === side; i -= 1) n += 1;
  return n;
}

/**
 * Showdown pacing: 0 = suspense (your card still face down), 1 = your card flips, 2 = the pot moves.
 * A fold flips sooner, since there is nothing left to wait for. Reduced motion skips straight to 2.
 */
function useRevealStep(key: string | null, fold: boolean, reduced: boolean) {
  const [step, setStep] = useState<{ key: string | null; n: number }>({ key: null, n: 2 });
  useEffect(() => {
    if (!key) return;
    const at = reduced ? [0, 0] : fold ? [450, 1150] : [1100, 1900];
    const ids = [window.setTimeout(() => setStep({ key, n: 1 }), at[0]), window.setTimeout(() => setStep({ key, n: 2 }), at[1])];
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [key, fold, reduced]);
  return key && step.key !== key ? 0 : step.n;
}

const buzz = (pattern: number | number[]) => { try { navigator.vibrate?.(pattern); } catch { /* not supported */ } };

/**
 * The felt, the cards, the pot and the bet buttons, seen from `view` (side 0 = viewer).
 * The AI game and the room view both use it; they supply names, the clock and what sits under it.
 */
export function PokerStage({ view, names, canAct, onBet, onFold, kicker, waitText, clock, footer }: {
  view: PokerView; names: [string, string]; canAct: boolean; onBet: (total: number) => void; onFold: () => void;
  kicker: string; waitText: string; clock?: ReactNode; footer?: ReactNode;
}) {
  const t = useTranslations('IndianPoker');
  const reduced = useReducedMotion() ?? false;
  const { phase, cards, bets, carry, rounds, lastAct } = view;
  const last = rounds.at(-1) ?? null;
  const settled = phase === 'reveal' || (phase === 'finished' && view.reason === 'chips') ? last : null;
  const step = useRevealStep(settled ? `${rounds.length}` : null, settled?.reason === 'fold', reduced);
  const handNo = rounds.length + (phase === 'playing' ? 1 : 0);
  const folder: PokerSide | null = settled?.reason === 'fold' ? (settled.winner === 0 ? 1 : 0) : null;

  // Stacks stay as they were until the pot actually slides over (step 2), then count up.
  const [held, setHeld] = useState<[number, number] | null>(null);
  if (phase === 'playing' && (!held || held[0] !== view.chips[0] || held[1] !== view.chips[1])) setHeld(view.chips);
  const chips = settled && step < 2 && held ? held : view.chips;

  const livePot = bets[0] + bets[1] + carry;
  const pot = settled ? (step < 2 ? settled.pot : settled.winner === 'draw' ? carry : 0) : phase === 'playing' ? livePot : 0;
  const myTurn = canAct && phase === 'playing' && view.turn === 0;
  const allInLive = phase === 'playing' && lastAct?.kind === 'allIn';
  const bigPot = livePot >= 16 && phase === 'playing';
  const tension = allInLive || bigPot || (settled?.reason === 'showdown' && step < 2 && settled.pot >= 16);
  const myHidden = phase === 'playing' || (!!settled && step < 1);
  const shownRounds = settled && step < 2 ? rounds.slice(0, -1) : rounds;
  const streaks: [number, number] = [pokerStreak(shownRounds, 0), pokerStreak(shownRounds, 1)];

  const actKey = lastAct ? `${handNo}-${lastAct.side}-${lastAct.kind}-${lastAct.total}` : '';
  const actText = (a: PokerLastAct) => a.kind === 'fold' ? t('fx.fold') : a.kind === 'call' ? t('fx.call') : a.kind === 'allIn' ? t('fx.allIn') : a.kind === 'raise' ? t('fx.raise', { n: a.total }) : t('fx.open', { n: a.total });

  // Haptics on phones that have them: a rival all-in on your turn, and your own folded 10.
  useEffect(() => { if (allInLive && lastAct?.side === 1 && canAct) buzz(35); }, [actKey, allInLive, lastAct?.side, canAct]);
  const myTenFold = !!settled?.tenPenalty && folder === 0 && step >= 1;
  useEffect(() => { if (myTenFold) buzz([50, 60, 50]); }, [myTenFold]);

  const status = phase === 'finished' ? (view.winner === 'draw' ? t('draw') : view.winner === 0 ? t('win') : t('lose'))
    : settled ? (step < 2 ? (settled.reason === 'fold' ? (folder === 0 ? t('fx.youFolded') : t('fx.theyFolded')) : t('fx.showdown'))
      : settled.winner === 'draw' ? t('handDraw') : settled.winner === 0 ? t('handWin') : t('handLose'))
      : myTurn ? t('yourTurn') : waitText;

  const cardTone = (side: PokerSide) => (!settled || step < 1 || settled.winner === 'draw' ? 'plain' : settled.winner === side ? 'win' : 'lose');
  const penalty = settled?.penalty ?? (settled?.tenPenalty ? 10 : 0);

  const seat = (side: PokerSide) => (
    <div className="relative flex flex-col items-center gap-3">
      {lastAct?.side === side && (phase === 'playing' || (settled && step < 2)) && <Bubble key={actKey} text={actText(lastAct)} tone={lastAct.kind === 'allIn' ? 'hot' : lastAct.kind === 'fold' ? 'cold' : 'plain'} />}
      <div className={`relative rounded-[16px] ${phase === 'playing' && view.turn === side ? 'ip-turn' : ''}`}>
        <PokerCard value={cards[side]} hidden={side === 0 && myHidden} label={names[side]} dealKey={`${side}-${handNo}`} wobble={side === 0 && !!settled && settled.reason === 'showdown' && step === 0} tone={cardTone(side)} />
        {settled?.tenPenalty && folder === side && step >= 1 && (
          <motion.div initial={{ scale: 2.2, opacity: 0, rotate: -24 }} animate={{ scale: 1, opacity: 1, rotate: -12 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            className="absolute left-1/2 top-[38%] z-20 -ml-[4.5rem] w-36 rounded-md border-2 border-[#ff5568] bg-[#2a0c12]/90 px-1.5 py-1 text-center shadow-[0_0_30px_rgba(255,85,104,.55)]">
            <p className="text-[11px] font-black leading-tight text-[#ff8a96]">{t('fx.tenFold')}</p>
            <p className="font-mono text-lg font-black leading-tight text-white">{side === 0 ? `−${penalty}` : `+${penalty}`}</p>
          </motion.div>
        )}
      </div>
      <div className="flex items-center gap-2"><ChipStack count={chips[side]} tone={side === 0 ? 'gold' : 'red'} reduced={reduced} /></div>
      <div className="flex h-4 items-center">
        {phase === 'playing' && view.turn === side && side === 1 ? <Thinking label={t('fx.thinking')} />
          : streaks[side] >= 2 ? <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-black ${side === 0 ? 'bg-[#ff8a00]/20 text-[#ffb35c]' : 'bg-[#ff5568]/15 text-[#ff8a96]'}`}><Flame size={11} className="hype-flame" />{t('fx.streak', { n: streaks[side] })}</span> : null}
      </div>
    </div>
  );

  let banner: ReactNode = null;
  if (settled && step >= 2) {
    const text = settled.winner === 'draw' ? (carry > 0 ? t('fx.carry', { n: settled.pot }) : t('fx.split', { n: settled.pot }))
      : settled.winner === 0 ? t('fx.gain', { n: settled.pot + (folder === 1 ? penalty : 0) }) : t('fx.lose', { n: settled.pot + (folder === 0 ? penalty : 0) });
    banner = (
      <motion.div key={`b-${rounds.length}`} initial={{ opacity: 0, scale: 0.7, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        className={`rounded-full border px-4 py-1.5 text-sm font-black ${settled.winner === 0 ? 'border-[#ffcf3f]/70 bg-[#ffcf3f] text-[#2a2118] shadow-[0_0_30px_rgba(255,207,63,.5)]' : settled.winner === 1 ? 'border-[#ff5568]/50 bg-[#ff5568]/20 text-[#ffb0b8]' : 'border-white/25 bg-white/10 text-white'}`}>
        {text}
      </motion.div>
    );
  } else if (settled?.reason === 'showdown' && step < 2) {
    banner = <motion.p key="sd" initial={{ opacity: 0, scale: 1.6 }} animate={{ opacity: 1, scale: 1 }} className="text-xs font-black tracking-[.4em] text-[#ffcf3f] drop-shadow-[0_0_12px_rgba(255,207,63,.6)]">SHOWDOWN</motion.p>;
  }

  const current = Math.max(...bets);
  const max = view.max;
  const toCall = Math.max(0, current - bets[0]);
  const targets = view.opened ? [current, current + 1, current + 3, max] : [current + 1, current + 2, current + 4, max];
  const uniqueTargets = [...new Set(targets.filter((n) => n >= (view.opened ? current : current + 1) && n <= max))];
  const needPct = toCall > 0 ? Math.round((toCall / (livePot + toCall)) * 100) : 0;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
        <div className="min-w-0"><p className={KICKER}>{kicker}</p><h1 className={`mt-1 ${HEADING}`}>{status}</h1></div>
        {clock}
      </div>
      <div className="space-y-3">
        <div title={t('tooltips.table')} className={`relative overflow-hidden rounded-[28px] border border-[#bd8d38]/35 bg-[radial-gradient(ellipse_at_center,#195744,#0b2c26_72%)] px-3 pb-5 pt-8 shadow-[inset_0_0_70px_rgba(0,0,0,.55),0_18px_50px_rgba(0,0,0,.25)] sm:px-8 sm:pb-7 sm:pt-11 ${tension ? 'ip-tension' : ''}`}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
            {seat(0)}
            <div className="flex min-w-[84px] flex-col items-center text-center">
              {(allInLive || bigPot) && <span className={`mb-1 rounded-full px-2 py-0.5 text-[9px] font-black tracking-[.18em] ${allInLive ? 'bg-[#ff3d5a] text-white' : 'bg-[#ffcf3f]/20 text-[#ffcf3f]'}`}>{allInLive ? 'ALL-IN' : 'BIG POT'}</span>}
              <p className="text-[10px] font-black tracking-[.2em] text-white/40">POT</p>
              <motion.p key={pot} initial={{ scale: 1.35 }} animate={{ scale: 1 }} className={`font-mono text-3xl font-black text-[#ffcf3f] drop-shadow-[0_0_14px_rgba(242,193,78,.45)] sm:text-4xl ${tension ? 'ip-beat' : ''}`}>{pot}</motion.p>
              {phase === 'playing' && <p className="mt-1 font-mono text-[10px] text-white/45"><span className="text-[#ffcf3f]">{bets[0]}</span> : <span className="text-[#ff8a96]">{bets[1]}</span></p>}
              {carry > 0 && phase === 'playing' && <p className="mt-0.5 text-[10px] font-bold text-[#ffcf3f]/75">{t('fx.carryNote', { n: carry })}</p>}
            </div>
            {seat(1)}
          </div>
          <div className="mt-3 flex h-9 items-center justify-center">{banner}</div>
          {!reduced && phase === 'playing' && lastAct && lastAct.add > 0 && <ChipFlight key={`f-${actKey}`} from={lastAct.side} to="pot" n={Math.min(6, lastAct.add)} tone={lastAct.side === 0 ? 'gold' : 'red'} />}
          {!reduced && settled && lastAct?.kind === 'call' && step < 2 && lastAct.add > 0 && <ChipFlight key={`c-${rounds.length}`} from={lastAct.side} to="pot" n={Math.min(6, lastAct.add)} tone={lastAct.side === 0 ? 'gold' : 'red'} />}
          {!reduced && settled && step >= 2 && settled.winner !== 'draw' && <ChipFlight key={`w-${rounds.length}`} from="pot" to={settled.winner} n={Math.min(10, Math.max(3, Math.ceil(settled.pot / 2)))} tone="pot" />}
          {!reduced && settled && step >= 2 && folder !== null && penalty > 0 && <ChipFlight key={`p-${rounds.length}`} from={folder} to={folder === 0 ? 1 : 0} n={6} tone="red" delay={0.35} />}
        </div>

        {phase === 'playing' && (
          <div className={`grid grid-cols-3 gap-1.5 rounded-[14px] border px-2 py-2 text-center transition sm:px-3 ${myTurn ? 'border-(--accent)/45 bg-(--accent)/10' : 'border-white/10 bg-black/25 opacity-70'}`}>
            <div><p className="text-[9px] font-black tracking-[.14em] text-white/40">{t('fx.potLabel')}</p><p className="font-mono text-lg font-black text-[#ffcf3f]">{livePot}</p></div>
            <div><p className="text-[9px] font-black tracking-[.14em] text-white/40">{view.opened ? t('fx.toCallLabel') : t('fx.openLabel')}</p><p className="font-mono text-lg font-black text-white">{view.opened ? (toCall > 0 ? `+${toCall}` : '0') : `${current + 1}~${max}`}</p></div>
            <div><p className="text-[9px] font-black tracking-[.14em] text-white/40">{toCall > 0 ? t('fx.needLabel') : t('fx.maxLabel')}</p><p className="font-mono text-lg font-black text-white">{toCall > 0 ? `${needPct}%` : max}</p></div>
          </div>
        )}

        {phase === 'playing' && (myTurn ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {uniqueTargets.map((total) => {
              const isCall = view.opened && total === current;
              const isAllIn = !isCall && total === max;
              return (
                <motion.button key={total} whileTap={{ scale: 0.94 }} title={t(isCall ? 'tooltips.call' : isAllIn ? 'tooltips.allIn' : 'tooltips.bet')}
                  onClick={() => { if (isAllIn) buzz(20); onBet(total); }}
                  className={`${isCall ? BTN_ACCENT : isAllIn ? 'ip-allin flex items-center justify-center gap-1.5 rounded-md border border-[#ff8a96]/60 font-black text-white' : BTN} py-3 text-xs`}>
                  {isCall ? t('call', { n: toCall }) : isAllIn ? t('allIn', { n: total - bets[0] }) : t('bet', { n: total })}
                </motion.button>
              );
            })}
            {view.opened && toCall > 0 && <motion.button whileTap={{ scale: 0.94 }} title={t('tooltips.fold')} onClick={onFold} className={`${BTN} py-3 text-xs text-[#ff9aa4]`}>{t('fold')}</motion.button>}
          </div>
        ) : <div className="flex min-h-[46px] items-center justify-center rounded-[14px] border border-dashed border-white/10"><Thinking label={waitText} /></div>)}
        {footer}
      </div>
    </MotionConfig>
  );
}

export function PokerHistory({ rounds, names }: { rounds: PokerRound[]; names: [string, string] }) {
  const start = Math.max(0, rounds.length - 10);
  return (
    <div className="flex flex-wrap gap-1.5">{rounds.slice(start).map((round, i) => {
      const latest = start + i === rounds.length - 1;
      return (
        <motion.span key={start + i} initial={latest ? { opacity: 0, scale: 0.6 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: latest ? 1.9 : 0 }}
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold ${round.winner === 0 ? 'border-[#ffcf3f]/35 bg-[#ffcf3f]/10 text-[#ffcf3f]' : round.winner === 1 ? 'border-white/10 bg-black/25 text-white/50' : 'border-white/15 bg-white/5 text-white/60'}`}>
          <b className="text-white">{round.cards[0]}:{round.cards[1]}</b>{round.winner === 'draw' ? '=' : names[round.winner]}
          {round.tenPenalty && <span className="rounded bg-[#ff5568]/25 px-1 text-[#ff8a96]">10F</span>}
        </motion.span>
      );
    })}</div>
  );
}
