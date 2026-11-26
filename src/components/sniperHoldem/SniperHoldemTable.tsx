"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronUp, Hand, History, Minus, Plus, ShieldCheck, Volume2, VolumeX, X } from 'lucide-react';
import {
  type ShCat, type ShEvent, type ShTarget, type SniperHoldem, SH_CATS, SH_SEATS,
  shCanAct, shEvaluate, shHandOf, shMinTop, shPossibleTargets, shPot, shSameTarget, shTargetOf, shVisible,
} from '@/lib/sniperHoldem';
import { SH_PERSONA } from '@/lib/sniperHoldemAi';
import { type SniperHoldemRoom, type SniperHoldemRoomAction, SH_SHOWDOWN_MS, SH_WARN_SEC, shWaitingOn } from '@/lib/sniperHoldemRoom';
import { DIAMOND, PANEL, PANEL_TITLE, accentVars } from '../ui/gameUi';
import { SH_ACCENT, SH_GOLD, SH_INK, type ShCopy } from './copy';
import { Scope, ShAvatar, ShCard, ShChip } from './SniperHoldemParts';
import { playCard, playChips, playHit, playSnipe, playWin, setShSound, shSoundOn } from './sound';

type Props = { room: SniperHoldemRoom; mySeat: number | null; onAction: (action: SniperHoldemRoomAction) => void; t: ShCopy; locale: string };
type Persona = (typeof SH_PERSONA)[keyof typeof SH_PERSONA];
const NEVER = Number.MAX_SAFE_INTEGER / 2;

function buzz(pattern: number | number[]) {
  try { if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(pattern); } catch { /* optional */ }
}

function useCountdown(deadline: number, on: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [on]);
  return on && deadline < NEVER ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;
}

/** Bets, snipes and the showdown make sounds; my turn and a snipe on me buzz. */
function useTableFeedback(g: SniperHoldem, mySeat: number | null, myTurn: boolean) {
  const seen = useRef(g.seq);
  const last = g.log[0];
  useEffect(() => {
    if (seen.current === g.seq || !last) return;
    seen.current = g.seq;
    if (last.k === 'raise' || last.k === 'call') playChips();
    else if (last.k === 'board' || last.k === 'round') playCard();
    else if (last.k === 'snipe') { playSnipe(); buzz(18); }
    else if (last.k === 'win' || last.k === 'safe' || last.k === 'out') {
      const sd = g.showdown;
      if (sd?.entries.some((e) => e.sniped)) playHit();
      if (mySeat !== null && (sd?.winners.includes(mySeat) || sd?.safe.includes(mySeat))) { window.setTimeout(playWin, 350); buzz([30, 40, 30]); }
      if (mySeat !== null && sd?.entries.some((e) => e.seat === mySeat && e.sniped)) buzz([80, 40, 80]);
    }
  }, [g.seq, last, g.showdown, mySeat]);
  const was = useRef(false);
  useEffect(() => { if (myTurn && !was.current) buzz(28); was.current = myTurn; }, [myTurn]);
}

export default function SniperHoldemTable({ room, mySeat, onAction, t, locale }: Props) {
  const g = room.game;
  const en = locale === 'en';
  const nameOf = (s: number) => {
    if (s === mySeat) return t.you;
    const style = room.ai[s] && room.seats[s]?.id.startsWith('ai-') ? room.style[s] : null;
    return style ? (en ? SH_PERSONA[style].nameEn : SH_PERSONA[style].name) : room.seats[s]?.name ?? `P${s + 1}`;
  };
  const personaOf = (s: number) => (room.seats[s]?.id.startsWith('ai-') && room.style[s] ? SH_PERSONA[room.style[s]!] : null);
  const waiting = shWaitingOn(g);
  const myTurn = mySeat !== null && room.phase === 'playing' && waiting.includes(mySeat) && !room.ai[mySeat];
  const seconds = useCountdown(room.deadline, room.phase === 'playing' && !!room.turnSec);
  useTableFeedback(g, mySeat, myTurn);
  const absentKey = (g.absent ?? []).join();
  const others = useMemo(() => Array.from({ length: SH_SEATS }, (_, i) => ((mySeat ?? -1) + 1 + i) % SH_SEATS).filter((s) => s !== mySeat && !g.absent?.[s]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mySeat, absentKey]);
  const othersGrid = others.length <= 1 ? 'mx-auto w-full max-w-[50%] grid-cols-1' : others.length === 2 ? 'grid-cols-2' : others.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

  // The latest move, stamped on that player's seat for a moment.
  const last = g.log[0];
  const [stamp, setStamp] = useState<{ seq: number; event: ShEvent } | null>(null);
  const seenSeq = useRef(g.seq);
  const hideTimer = useRef<number | null>(null);
  useEffect(() => {
    if (seenSeq.current === g.seq) return;
    seenSeq.current = g.seq;
    const stampable = !!last && 'seat' in last && (last.k === 'call' || last.k === 'raise' || last.k === 'fold' || last.k === 'snipe' || last.k === 'pass');
    const shown = stampable ? { seq: g.seq, event: last } : null;
    const show = window.setTimeout(() => setStamp(shown), 0);
    if (shown) {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setStamp((cur) => (cur?.seq === shown.seq ? null : cur)), last.k === 'snipe' ? 2200 : 1500);
    }
    return () => window.clearTimeout(show);
  }, [g.seq, last]);
  useEffect(() => () => { if (hideTimer.current !== null) window.clearTimeout(hideTimer.current); }, []);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [sound, setSound] = useState(() => (typeof window === 'undefined' ? true : shSoundOn()));
  const toggleSound = () => { setShSound(!sound); setSound(!sound); };
  const stampFor = (s: number) => (stamp && 'seat' in stamp.event && stamp.event.seat === s ? stamp : null);

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-2.5 pb-[calc(env(safe-area-inset-bottom)+104px)] sm:gap-3 lg:pb-6">
        <BoardPanel g={g} t={t} nameOf={nameOf} sound={sound} onSound={toggleSound} onHistory={() => setHistoryOpen(true)} />
        <DealerLine className="hidden sm:flex" g={g} t={t} waiting={waiting} nameOf={nameOf} seconds={seconds} />
        <div className={`grid ${othersGrid} gap-1.5 sm:gap-2`}>
          {others.map((s) => (
            <Seat key={s} g={g} seat={s} name={nameOf(s)} persona={personaOf(s)} t={t} mySeat={mySeat}
              acting={room.phase === 'playing' && waiting.includes(s)} away={!!room.away?.[s]} stamp={stampFor(s)} />
          ))}
        </div>
        {mySeat !== null && !g.absent?.[mySeat] && <MyHand g={g} seat={mySeat} t={t} acting={myTurn} stamp={stampFor(mySeat)} />}
        <section className={`${PANEL} lg:hidden`}><LogList g={g} t={t} nameOf={nameOf} /></section>
      </div>
      <aside className="hidden flex-col gap-3 lg:flex">
        <section className={PANEL}><LogList g={g} t={t} nameOf={nameOf} /></section>
        <section className={PANEL}><Ladder t={t} /></section>
      </aside>
      <Layer>
        {mySeat !== null && room.phase !== 'finished' && !g.absent?.[mySeat] && (
          <Dock g={g} room={room} seat={mySeat} myTurn={myTurn} seconds={seconds} t={t} act={onAction} waiting={waiting} nameOf={nameOf} onHistory={() => setHistoryOpen(true)} />
        )}
        <AnimatePresence>{historyOpen && <HistorySheet key="history" g={g} t={t} nameOf={nameOf} mySeat={mySeat} onClose={() => setHistoryOpen(false)} />}</AnimatePresence>
        <AnimatePresence>{g.phase === 'showdown' && g.showdown && <ShowdownSheet key={g.round} g={g} t={t} nameOf={nameOf} mySeat={mySeat} />}</AnimatePresence>
      </Layer>
    </div>
  );
}

const noop = () => () => {};
/** The dock and sheets go straight into <body>, above the site's floating widgets. */
function Layer({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;
  return createPortal(<div style={accentVars(SH_ACCENT, SH_INK)} className="relative z-[70] text-[#e6e9f0]">{children}</div>, document.body);
}

/* ------------------------------------------------------------------ board */

function BoardPanel({ g, t, nameOf, sound, onSound, onHistory }: { g: SniperHoldem; t: ShCopy; nameOf: (s: number) => string; sound: boolean; onSound: () => void; onHistory: () => void }) {
  const pot = shPot(g);
  const boardHand = g.shown >= 2 ? shEvaluate(g.board.slice(0, g.shown).filter((c): c is number => c !== null)) : null;
  return (
    <section className="relative overflow-hidden rounded-[16px] border border-[#2f6b4f]/50 bg-[radial-gradient(ellipse_at_50%_20%,#1d4a36,#0d1f17_75%)] p-2.5 shadow-[inset_0_0_40px_rgba(0,0,0,.5)] sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] font-black tracking-[0.2em] text-(--accent)">{t.round(g.round)} <span className="text-white/35">· {t.phase[g.phase] ?? ''}</span></p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onHistory} aria-label={t.handsButton} className="flex items-center gap-1 rounded-md border border-white/15 bg-black/30 px-1.5 py-[3px] text-[10px] font-black text-white/70 active:scale-95"><History size={12} />{t.handsButton}</button>
          <button type="button" onClick={onSound} aria-label={sound ? t.soundOff : t.soundOn} className="grid h-[22px] w-[24px] place-items-center rounded-md border border-white/15 bg-black/30 text-white/60">{sound ? <Volume2 size={12} /> : <VolumeX size={12} />}</button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5 sm:gap-2.5">
        {[0, 1, 2, 3].map((i) => <ShCard key={`${g.round}-${i}-${i < g.shown}`} value={i < g.shown ? g.board[i] ?? null : null} size="board" delay={i * 0.06} />)}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[9px] font-bold text-white/45">
        <span className="rounded bg-black/30 py-1">{t.first}<b className="block truncate px-1 text-[11px] text-white">{nameOf(g.first)}</b></span>
        <span className="rounded bg-black/30 py-1">{t.cap}<b className="block font-mono text-[12px] text-white">{g.cap}</b></span>
        <span className="rounded bg-black/30 py-1"><ShieldCheck size={10} className="mx-auto inline -mt-0.5" /> {t.safe}<b className="block font-mono text-[12px] text-[#7ef0b0]">{g.target}</b></span>
        <span className="rounded border border-[#ffd36b]/30 bg-[#ffd36b]/[0.08] py-1 text-[#ffd36b]">{t.pot}<motion.b key={pot} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="block font-mono text-[13px]">{pot}</motion.b></span>
      </div>
      {boardHand && <p className="mt-1.5 text-center text-[10px] font-bold text-white/40">{t.boardOnly(t.label(shTargetOf(boardHand)))}</p>}
    </section>
  );
}

function DealerLine({ g, t, waiting, nameOf, seconds, className = '' }: { g: SniperHoldem; t: ShCopy; waiting: number[]; nameOf: (s: number) => string; seconds: number | null; className?: string }) {
  const text = dealerText(g, t, nameOf);
  const snipe = g.phase === 'snipe';
  return (
    <div className={`${className} relative items-center gap-2.5 overflow-hidden rounded-[12px] border px-3 py-2.5 ${snipe ? 'border-(--accent)/50 bg-(--accent)/[0.08]' : 'border-white/10 bg-black/40'}`}>
      <span className="relative font-mono text-[9px] font-black tracking-[0.2em] text-white/35">{t.dealer}</span>
      <AnimatePresence mode="wait">
        <motion.p key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="relative min-w-0 flex-1 truncate text-[13px] font-extrabold text-white/85">
          {snipe && <Scope size={13} className="mr-1.5 inline -mt-0.5 text-(--accent)" />}{text}
        </motion.p>
      </AnimatePresence>
      {seconds !== null && waiting.length > 0 && <span className={`font-mono text-xs font-black ${seconds <= 5 ? 'animate-pulse text-(--accent)' : 'text-white/50'}`}>{seconds}s</span>}
    </div>
  );
}

const dealerText = (g: SniperHoldem, t: ShCopy, nameOf: (s: number) => string) => (
  g.phase === 'snipe' ? t.dealerSnipe(nameOf(g.turn))
    : g.phase === 'bet1' || g.phase === 'bet2' ? t.dealerBet(nameOf(g.turn))
      : g.phase === 'showdown' ? t.dealerShow : t.phase.finished);

/* ------------------------------------------------------------------ seats */

function stampText(event: ShEvent, t: ShCopy): { text: string; tone: 'bet' | 'fold' | 'snipe' } | null {
  switch (event.k) {
    case 'raise': return { text: event.open ? t.bet(event.to) : `${t.raise} ${event.to}`, tone: 'bet' };
    case 'call': return { text: t.call(event.to), tone: 'bet' };
    case 'fold': return { text: t.fold, tone: 'fold' };
    case 'snipe': return { text: t.label(event.target), tone: 'snipe' };
    case 'pass': return { text: t.passed, tone: 'fold' };
    default: return null;
  }
}
const STAMP_TONE = {
  bet: 'border-[#ffd36b] bg-[#2a2310] text-[#ffe39a]',
  fold: 'border-white/30 bg-[#1b1b20] text-white/60',
  snipe: 'border-(--accent) bg-(--accent) text-white shadow-[0_0_26px_var(--accent-glow)]',
};
function Stamp({ stamp, t, big = false }: { stamp: { seq: number; event: ShEvent }; t: ShCopy; big?: boolean }) {
  const s = stampText(stamp.event, t);
  if (!s) return null;
  return (
    <motion.span key={stamp.seq} initial={{ scale: 2.2, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: -5 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 520, damping: 18 }}
      className={`pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-md border-2 px-2 py-1 font-black ${big ? 'text-base' : 'text-[11px] sm:text-sm'} ${STAMP_TONE[s.tone]}`}>
      {s.tone === 'snipe' && <Scope size={big ? 16 : 12} />}{s.text}
    </motion.span>
  );
}

function SnipeBadge({ g, seat, t }: { g: SniperHoldem; seat: number; t: ShCopy }) {
  const said = g.snipes[seat];
  if (!said || (g.phase !== 'snipe' && g.phase !== 'showdown')) return null;
  return said === 'pass'
    ? <span className="truncate text-[9px] font-bold text-white/35">{t.passed}</span>
    : <span className="flex min-w-0 items-center gap-0.5 truncate rounded bg-(--accent)/15 px-1 text-[9px] font-black text-[#ff9aa4]"><Scope size={9} className="shrink-0" />{t.label(said)}</span>;
}

function Seat({ g, seat, name, persona, t, mySeat, acting, away, stamp }: {
  g: SniperHoldem; seat: number; name: string; persona: Persona | null; t: ShCopy; mySeat: number | null; acting: boolean; away: boolean; stamp: { seq: number; event: ShEvent } | null;
}) {
  const out = g.out[seat];
  const safe = g.safe[seat];
  const folded = g.folded[seat] && !out && !safe;
  const visible = shVisible(g, mySeat, seat);
  const entry = g.showdown?.entries.find((e) => e.seat === seat);
  const showing = (g.phase === 'showdown' || g.phase === 'finished') && !!entry;
  const won = showing && g.showdown!.winners.includes(seat);
  return (
    <article className={`relative min-w-0 overflow-hidden rounded-[12px] border p-1.5 transition sm:p-2.5 ${won ? 'border-[#ffd36b]/70 bg-[#ffd36b]/[0.08]' : acting ? 'border-(--accent)/60 bg-(--accent)/[0.07] shadow-[0_0_18px_var(--accent-glow)]' : 'border-white/10 bg-[#121217]/85'} ${out ? 'opacity-35 grayscale' : safe ? 'opacity-60' : folded ? 'opacity-55' : ''}`}>
      <div className="flex items-center gap-1.5">
        <ShAvatar name={name} color={persona?.color} size={22} active={acting} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-black leading-4 text-white sm:text-[12px]">{name}</p>
          <ShChip n={g.chips[seat]} className="text-[10px] leading-3 text-white/70" />
        </div>
      </div>
      <div className="mt-1.5 flex min-h-[30px] items-center gap-[3px] sm:min-h-[40px]">
        {safe ? <span className="flex items-center gap-1 text-[10px] font-black text-[#7ef0b0]"><ShieldCheck size={12} />{t.safe}</span>
          : out ? <span className="text-[10px] font-black text-white/50">{t.out}</span>
            : g.hands[seat].map((c, i) => <ShCard key={`${g.round}-${i}`} value={visible ? c : null} size="seat" dim={folded} mark={showing && entry?.sniped ? 'hit' : undefined} delay={i * 0.05} />)}
      </div>
      <div className="mt-1 flex min-h-[14px] items-center justify-between gap-1 text-[9.5px] font-bold">
        {showing && entry ? <span className={`truncate ${entry.sniped ? 'text-[#ff7a85] line-through' : won ? 'text-[#ffd36b]' : 'text-white/60'}`}>{t.label(shTargetOf(entry.hand))}</span>
          : folded ? <span className="text-white/40">{t.folded}</span>
            : <SnipeBadge g={g} seat={seat} t={t} />}
        {!out && !safe && g.bets[seat] > 0 && <span className="ml-auto shrink-0 font-mono text-[10px] text-[#ffd36b]">{g.bets[seat]}</span>}
      </div>
      <p className="mt-0.5 flex items-center gap-1 text-[8px] font-black">
        {seat === g.first && !out && !safe && <span className="rounded-[3px] bg-[#ffd36b] px-1 leading-[12px] text-[#2a1d00]">{t.first}</span>}
        {away && <span className="text-white/35">AI</span>}
        {g.place[seat] && safe && <span className="text-[#7ef0b0]/70">#{g.place[seat]}</span>}
      </p>
      {acting && <span className="absolute right-2 top-2 flex gap-0.5">{[0, 1, 2].map((d) => <motion.i key={d} className="h-1 w-1 rounded-full bg-(--accent)" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }} />)}</span>}
      <AnimatePresence>{stamp && <Stamp stamp={stamp} t={t} />}</AnimatePresence>
    </article>
  );
}

/** How readable my hand is from the shared cards alone (the point of the game). */
function readability(g: SniperHoldem, seat: number): 'board' | 'hidden' | 'part' | null {
  const mine = shHandOf(g, seat);
  if (!mine) return null;
  const board = g.board.slice(0, g.shown).filter((c): c is number => c !== null);
  const fromBoard = shEvaluate(board);
  if (shSameTarget(shTargetOf(fromBoard), shTargetOf(mine))) return 'board';
  const [a, b] = g.hands[seat] as number[];
  if (a === b && mine.key[0] === a && !board.includes(a)) return 'hidden';
  return 'part';
}

function MyHand({ g, seat, t, acting, stamp }: { g: SniperHoldem; seat: number; t: ShCopy; acting: boolean; stamp: { seq: number; event: ShEvent } | null }) {
  const out = g.out[seat];
  const safe = g.safe[seat];
  const folded = g.folded[seat] && !out && !safe;
  const mine = !out && !safe ? shHandOf(g, seat) : null;
  const read = !out && !safe ? readability(g, seat) : null;
  const entry = g.showdown?.entries.find((e) => e.seat === seat);
  const sniped = (g.phase === 'showdown' || g.phase === 'finished') && entry?.sniped;
  return (
    <section className={`relative overflow-hidden rounded-[14px] border px-3 py-2.5 sm:p-4 ${acting ? 'border-(--accent)/60 shadow-[0_0_22px_var(--accent-glow)]' : 'border-white/10'} bg-[linear-gradient(180deg,rgba(255,79,94,.08),rgba(18,18,23,.92)_55%)]`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-[4px] bg-(--accent) px-1.5 py-[2px] font-mono text-[9px] font-black text-(--accent-ink)">YOU</span>
          <b className="text-sm font-black text-white">{t.myHand}</b>
          {seat === g.first && !out && !safe && <span className="rounded-[3px] bg-[#ffd36b] px-1 text-[9px] font-black leading-[14px] text-[#2a1d00]">{t.first}</span>}
        </div>
        <div className="flex items-center gap-2">
          {g.bets[seat] > 0 && !out && !safe && <span className="font-mono text-[11px] font-black text-[#ffd36b]">{t.myBet(g.bets[seat])}</span>}
          <ShChip n={g.chips[seat]} className="text-sm text-white" />
        </div>
      </div>
      {safe ? (
        <p className="mt-3 flex items-center justify-center gap-2 py-4 text-lg font-black text-[#7ef0b0]"><ShieldCheck size={20} />{t.placeSafe(g.place[seat] ?? 0)}</p>
      ) : out ? (
        <p className="mt-3 py-4 text-center text-lg font-black text-white/50">{t.youOut}</p>
      ) : (
        <div className="mt-2 flex items-center gap-3 sm:gap-5">
          <div className="flex shrink-0 gap-1.5">{g.hands[seat].map((c, i) => <ShCard key={`${g.round}-${i}`} value={c} size="hand" dim={folded} mark={sniped ? 'hit' : undefined} delay={i * 0.08} />)}</div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black tracking-[0.14em] text-white/40">{t.myBest}</p>
            {mine && <motion.p key={`${mine.cat}-${mine.key[0]}`} initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-xl font-black leading-tight sm:text-2xl ${sniped ? 'text-[#ff7a85] line-through' : 'text-white'}`}>{t.label(shTargetOf(mine))}</motion.p>}
            {read && !folded && <p className={`mt-1 break-keep text-[10.5px] font-bold leading-4 ${read === 'board' ? 'text-[#ff9aa4]' : read === 'hidden' ? 'text-[#7ef0b0]' : 'text-white/45'}`}>{read === 'board' ? t.boardStrength : read === 'hidden' ? t.hiddenStrength : t.partStrength}</p>}
            {folded && <p className="mt-1 text-[11px] font-bold text-white/40">{t.folded}</p>}
            <div className="mt-1"><SnipeBadge g={g} seat={seat} t={t} /></div>
          </div>
        </div>
      )}
      <AnimatePresence>{stamp && <Stamp stamp={stamp} t={t} big />}</AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ dock */

function Dock({ g, room, seat, myTurn, seconds, t, act, waiting, nameOf, onHistory }: {
  g: SniperHoldem; room: SniperHoldemRoom; seat: number; myTurn: boolean; seconds: number | null; t: ShCopy;
  act: (action: SniperHoldemRoomAction) => void; waiting: number[]; nameOf: (s: number) => string; onHistory: () => void;
}) {
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [raiseTo, setRaiseTo] = useState(0);
  const [snipeOpen, setSnipeOpen] = useState<number | null>(null); // the seq the picker was opened at
  const betting = myTurn && (g.phase === 'bet1' || g.phase === 'bet2');
  const sniping = myTurn && g.phase === 'snipe';
  const owe = g.level - g.bets[seat];
  const canCall = shCanAct(g, seat, { kind: 'call' });
  const canRaise = g.level < g.cap;
  const minRaise = g.level + 1;
  const target = Math.min(g.cap, Math.max(minRaise, raiseTo));
  if (!betting && raiseOpen) setRaiseOpen(false);
  const warning = (betting || sniping) && !!room.turnSec && seconds !== null && seconds <= SH_WARN_SEC;
  const warned = useRef(false);
  useEffect(() => { if (warning && !warned.current) buzz([60, 60, 60]); warned.current = warning; }, [warning]);
  const send = (action: SniperHoldemRoomAction) => { setRaiseOpen(false); setSnipeOpen(null); act(action); };
  const pot = shPot(g);
  const openRaise = () => { setRaiseTo(Math.min(g.cap, g.level + Math.max(1, Math.ceil(pot / 2)))); setRaiseOpen(true); };
  const pickerOpen = sniping && snipeOpen !== null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0b0e]/92 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-md">
        <div className="mx-auto max-w-[760px]">
          <AnimatePresence>{warning && <IdleWarning key="warn" seconds={seconds!} t={t} />}</AnimatePresence>
          {betting ? (
            <>
              <AnimatePresence>
                {raiseOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mb-2.5 rounded-[12px] border border-[#ffd36b]/25 bg-[#ffd36b]/[0.05] p-3">
                      <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[0.12em] text-white/45">{t.raiseTotal}</span><span className="text-[10px] font-bold text-white/35">{t.capNote(g.cap)}</span></div>
                      <div className="mt-2 flex items-center gap-2">
                        <button type="button" onClick={() => setRaiseTo(Math.max(minRaise, target - 1))} disabled={target <= minRaise} className="grid h-11 w-11 place-items-center rounded-md border border-white/15 bg-white/5 text-white disabled:opacity-30" aria-label="-1"><Minus size={18} /></button>
                        <motion.span key={target} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="flex-1 text-center font-mono text-3xl font-black text-[#ffd36b]">{target}</motion.span>
                        <button type="button" onClick={() => setRaiseTo(Math.min(g.cap, target + 1))} disabled={target >= g.cap} className="grid h-11 w-11 place-items-center rounded-md border border-white/15 bg-white/5 text-white disabled:opacity-30" aria-label="+1"><Plus size={18} /></button>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1.5">
                        {[2, 5, 10].map((n) => <button key={n} type="button" onClick={() => setRaiseTo(Math.min(g.cap, target + n))} disabled={target >= g.cap} className="rounded-md border border-white/10 bg-white/[0.04] py-2 font-mono text-xs font-black text-white/75 disabled:opacity-30">+{n}</button>)}
                        <button type="button" onClick={() => setRaiseTo(g.cap)} className="rounded-md border border-[#ffd36b]/40 bg-[#ffd36b]/10 py-2 text-xs font-black text-[#ffd36b]">{t.allIn}</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
                <span className="text-(--accent)">{t.myBetTurn} · {t.phase[g.phase]}</span>
                <span className="flex items-center gap-2 text-white/50">{canCall ? t.owe(owe) : t.openNote}{seconds !== null && <b className={`font-mono ${seconds <= 5 ? 'text-(--accent)' : 'text-white/70'}`}>{seconds}s</b>}</span>
              </div>
              <div className="grid grid-cols-[1fr_1.3fr_1.3fr] gap-2">
                <button type="button" onClick={() => send({ t: 'act', action: { kind: 'fold' } })} className="h-14 rounded-[12px] border border-white/15 bg-white/[0.04] text-sm font-black text-white/70 active:scale-[.98]">{t.fold}</button>
                {canCall
                  ? <button type="button" onClick={() => send({ t: 'act', action: { kind: 'call' } })} className="h-14 rounded-[12px] border border-(--accent)/50 bg-(--accent)/15 text-sm font-black text-white active:scale-[.98]">{t.call(owe)}</button>
                  : <button type="button" disabled={!canRaise} onClick={() => send({ t: 'act', action: { kind: 'raise', to: minRaise } })} className="h-14 rounded-[12px] border border-(--accent)/50 bg-(--accent)/15 text-sm font-black text-white active:scale-[.98] disabled:opacity-30">{t.bet(minRaise - g.bets[seat])}</button>}
                {raiseOpen
                  ? <button type="button" onClick={() => send({ t: 'act', action: { kind: 'raise', to: target } })} className="h-14 rounded-[12px] bg-[#ffd36b] text-sm font-black text-[#241900] shadow-[0_0_20px_rgba(255,211,107,.35)] active:scale-[.98]">{target === g.cap ? `${t.allIn} ${target}` : t.raiseTo(target)}</button>
                  : <button type="button" disabled={!canRaise || target <= minRaise && !canCall && g.cap <= minRaise} onClick={openRaise} className="flex h-14 items-center justify-center gap-1 rounded-[12px] border border-[#ffd36b]/50 bg-[#ffd36b]/10 text-sm font-black text-[#ffd36b] active:scale-[.98] disabled:opacity-30">{t.raise}<ChevronUp size={15} /></button>}
              </div>
            </>
          ) : sniping ? (
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <button type="button" onClick={() => send({ t: 'act', action: { kind: 'pass' } })} className="h-14 rounded-[12px] border border-white/15 bg-white/[0.04] text-sm font-black text-white/70 active:scale-[.98]">{t.snipePass}</button>
              <motion.button type="button" onClick={() => setSnipeOpen(g.seq)} animate={{ boxShadow: ['0 0 14px rgba(255,79,94,.3)', '0 0 30px rgba(255,79,94,.65)', '0 0 14px rgba(255,79,94,.3)'] }} transition={{ duration: 1.3, repeat: Infinity }}
                className="flex h-14 items-center justify-center gap-2 rounded-[12px] bg-(--accent) text-sm font-black text-white active:scale-[.98]"><Scope size={18} />{t.snipeOpen}{seconds !== null && <b className="font-mono text-xs text-white/80">{seconds}s</b>}</motion.button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="min-w-0 flex-1"><WaitBar g={g} room={room} seat={seat} t={t} waiting={waiting} nameOf={nameOf} seconds={seconds} /></div>
              <button type="button" onClick={onHistory} className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-[12px] border border-white/15 bg-white/[0.04] text-[10px] font-black text-white/70 active:scale-95"><History size={17} />{t.handsButton}</button>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>{pickerOpen && <SnipePicker key="picker" g={g} seat={seat} t={t} nameOf={nameOf} seconds={seconds} warning={warning}
        onClose={() => setSnipeOpen(null)} onPass={() => send({ t: 'act', action: { kind: 'pass' } })} onSnipe={(target) => send({ t: 'act', action: { kind: 'snipe', target } })} />}</AnimatePresence>
    </>
  );
}

function WaitBar({ g, room, seat, t, waiting, nameOf, seconds }: { g: SniperHoldem; room: SniperHoldemRoom; seat: number; t: ShCopy; waiting: number[]; nameOf: (s: number) => string; seconds: number | null }) {
  if (g.phase === 'showdown') {
    return (
      <div className="flex h-14 items-center gap-3">
        <span className="shrink-0 text-xs font-black text-white/50">{t.nextRound}</span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><motion.span key={g.round} className="block h-full origin-left rounded-full bg-(--accent)" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: SH_SHOWDOWN_MS / 1000, ease: 'linear' }} /></span>
      </div>
    );
  }
  const who = waiting.length ? dealerText(g, t, nameOf) : '';
  return (
    <div className={`relative flex h-14 items-center gap-3 overflow-hidden rounded-[12px] border px-3 ${g.phase === 'snipe' ? 'border-(--accent)/40 bg-(--accent)/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
      <span className="relative shrink-0 text-white/35">{g.phase === 'snipe' ? <Scope size={15} /> : <Hand size={15} />}</span>
      <AnimatePresence mode="wait"><motion.p key={who} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="relative min-w-0 flex-1 truncate text-sm font-bold text-white/75">{room.ai[seat] ? 'AI' : who}</motion.p></AnimatePresence>
      <span className="flex gap-1">{[0, 1, 2].map((d) => <motion.i key={d} className="h-1.5 w-1.5 rounded-full bg-white/40" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }} />)}</span>
      {seconds !== null && <b className={`font-mono text-xs ${seconds <= 5 ? 'text-(--accent)' : 'text-white/45'}`}>{seconds}s</b>}
    </div>
  );
}

function IdleWarning({ seconds, t }: { seconds: number; t: ShCopy }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" role="alert">
      <p className="mb-2 flex items-center gap-2 rounded-[10px] border border-[#ffb547]/60 bg-[#ffb547]/15 px-3 py-2 text-xs font-black text-[#ffd79a]">
        <Bot size={15} className="shrink-0 text-[#ffb547]" /><span className="min-w-0 flex-1 break-keep">{t.idleWarn(seconds)}</span><b className="font-mono text-base text-[#ffb547]">{seconds}</b>
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ snipe picker */

/**
 * The snipe picker: pick a hand type, then its top number. Only hands that can exist on this board are offered
 * (plus my own, marked). Two taps and a confirm; earlier snipes are listed on top.
 */
function SnipePicker({ g, seat, t, nameOf, seconds, warning, onClose, onPass, onSnipe }: {
  g: SniperHoldem; seat: number; t: ShCopy; nameOf: (s: number) => string; seconds: number | null; warning: boolean;
  onClose: () => void; onPass: () => void; onSnipe: (target: ShTarget) => void;
}) {
  const board = g.board.slice(0, 4) as number[];
  const mineCards = g.hands[seat] as number[];
  // Cheap (55 pairs): no memo needed.
  const possible = shPossibleTargets(board, mineCards);
  const mine = shHandOf(g, seat);
  const myTarget = mine ? shTargetOf(mine) : null;
  const said = g.snipes.map((x, s) => ({ s, x })).filter((e) => e.x !== null && e.x !== 'pass' && !g.folded[e.s]) as { s: number; x: ShTarget }[];
  const cats = SH_CATS.filter((c) => possible.some((p) => p.cat === c));
  const [cat, setCat] = useState<ShCat | null>(null);
  const [n, setN] = useState<number | null>(null);
  const chosen: ShTarget | null = cat !== null && n !== null ? { cat, n } : null;
  const isPossible = (c: ShCat, k: number) => possible.some((p) => p.cat === c && p.n === k);
  const alreadySaid = (x: ShTarget) => said.some((e) => shSameTarget(e.x, x));
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-[2px] sm:items-center" onClick={onClose}>
      <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] rounded-t-[18px] border border-(--accent)/30 bg-[#121217] p-4 pb-[calc(env(safe-area-inset-bottom)+14px)] sm:rounded-[18px]">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-black text-white"><Scope size={16} className="text-(--accent)" />{t.snipeTitle} · {t.round(g.round)}</p>
          <div className="flex items-center gap-2">{seconds !== null && <b className={`font-mono text-xs ${seconds <= 5 ? 'text-(--accent)' : 'text-white/50'}`}>{seconds}s</b>}<button type="button" onClick={onClose} aria-label={t.close} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-white/60"><X size={15} /></button></div>
        </div>
        <p className="mt-1 break-keep text-[11px] leading-4 text-white/45">{t.snipeHint}</p>
        <AnimatePresence>{warning && seconds !== null && <div className="mt-2"><IdleWarning seconds={seconds} t={t} /></div>}</AnimatePresence>
        <div className="mt-2.5 flex items-center gap-1.5">{board.map((c, i) => <ShCard key={i} value={c} size="sm" />)}<span className="mx-1 h-6 w-px bg-white/15" />{mineCards.map((c, i) => <ShCard key={i} value={c} size="sm" />)}{myTarget && <span className="ml-1 truncate text-[11px] font-black text-white/70">{t.label(myTarget)}</span>}</div>
        <div className="mt-2.5 rounded-[10px] border border-white/10 bg-black/30 px-2.5 py-1.5">
          <p className="text-[9px] font-black tracking-[0.14em] text-white/35">{t.snipesSoFar}</p>
          {said.length ? <div className="mt-1 flex flex-wrap gap-1">{said.map((e) => <span key={e.s} className="flex items-center gap-1 rounded bg-(--accent)/15 px-1.5 py-0.5 text-[11px] font-black text-[#ff9aa4]">{nameOf(e.s)} <Scope size={10} />{t.label(e.x)}</span>)}</div>
            : <p className="text-[11px] font-bold text-white/40">{t.noSnipeYet}</p>}
        </div>
        <p className="mt-3 text-[10px] font-black tracking-[0.14em] text-white/40">{t.snipeCats}</p>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {SH_CATS.map((c) => {
            const ok = cats.includes(c);
            return <button key={c} type="button" disabled={!ok} onClick={() => { setCat(c); if (n !== null && !isPossible(c, n)) setN(null); }}
              className={`min-h-11 rounded-md px-1 text-[12px] font-black leading-tight transition disabled:opacity-20 ${cat === c ? 'bg-(--accent) text-white shadow-[0_0_14px_var(--accent-glow)]' : 'border border-white/10 bg-white/[0.04] text-white/80'}`}>{t.catShort(c)}</button>;
          })}
        </div>
        <p className="mt-3 flex items-center justify-between text-[10px] font-black tracking-[0.14em] text-white/40"><span>{t.snipeNumber}</span>{cat === 5 && <span className="tracking-normal text-white/35">{t.snipeFullNote}</span>}</p>
        <div className="mt-1.5 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((k) => {
            const ok = cat !== null && k >= shMinTop(cat) && isPossible(cat, k);
            const isMine = !!myTarget && cat !== null && myTarget.cat === cat && myTarget.n === k;
            return <button key={k} type="button" disabled={!ok} onClick={() => setN(k)}
              className={`relative h-11 rounded-md font-mono text-base font-black transition disabled:opacity-15 ${n === k && ok ? 'bg-white text-black' : 'border border-white/10 bg-white/[0.04] text-white'}`}>
              {k}{isMine && <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded bg-[#7ef0b0] px-1 font-sans text-[8px] font-black leading-3 text-black">{t.snipeMine}</span>}
            </button>;
          })}
        </div>
        {chosen && shSameTarget(chosen, myTarget) && <p className="mt-2 break-keep text-[11px] font-bold text-[#ffb547]">{t.snipeSelf}</p>}
        {chosen && alreadySaid(chosen) && <p className="mt-2 text-[11px] font-bold text-white/45">{t.snipeSaid}</p>}
        <div className="mt-3 grid grid-cols-[1fr_2fr] gap-2">
          <button type="button" onClick={onPass} className="h-14 rounded-[12px] border border-white/15 bg-white/[0.04] text-sm font-black text-white/70">{t.snipePass}</button>
          <button type="button" disabled={!chosen} onClick={() => chosen && onSnipe(chosen)} className="flex h-14 items-center justify-center gap-2 rounded-[12px] bg-(--accent) text-base font-black text-white shadow-[0_0_22px_var(--accent-glow)] disabled:opacity-30 disabled:shadow-none"><Scope size={18} />{chosen ? t.snipeConfirm(t.label(chosen)) : t.snipeOpen}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ showdown */

function ShowdownSheet({ g, t, nameOf, mySeat }: { g: SniperHoldem; t: ShCopy; nameOf: (s: number) => string; mySeat: number | null }) {
  const sd = g.showdown!;
  const safeEvents = g.log.filter((e): e is Extract<ShEvent, { k: 'safe' }> => e.k === 'safe').slice(0, sd.safe.length).reverse();
  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} className="fixed inset-x-0 bottom-0 z-[45] px-3 pb-[calc(env(safe-area-inset-bottom)+78px)]">
      <div className="mx-auto max-h-[70vh] max-w-[560px] overflow-y-auto rounded-[16px] border border-[#ffd36b]/30 bg-[#121217]/97 p-4 shadow-[0_-20px_60px_rgba(0,0,0,.6)] backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-black tracking-[0.2em] text-[#ffd36b]">{t.roundResult(g.round)}</p>
          <ShChip n={sd.pot} className="text-sm text-[#ffd36b]" />
        </div>
        <p className="mt-1 text-lg font-black text-white">{sd.winners.map(nameOf).join(' · ')} <span className="text-[#ffd36b]">{sd.allSniped ? t.split : sd.winners.length > 1 ? t.split : t.winner}</span></p>
        {sd.byFold ? <p className="mt-1 text-xs font-bold text-white/45">{t.byFold}</p> : (
          <>
            {sd.allSniped && <p className="mt-1 text-xs font-bold text-[#ff9aa4]">{t.allSniped}</p>}
            <div className="mt-2 flex justify-center gap-1">{g.board.map((c, i) => <ShCard key={i} value={c} size="sm" />)}</div>
            <ul className="mt-3 space-y-1.5">
              {sd.entries.map((e, i) => {
                const won = sd.winners.includes(e.seat);
                const said = g.snipes[e.seat];
                return (
                  <motion.li key={e.seat} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.14 }} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${won ? 'bg-[#ffd36b]/10' : 'bg-white/[0.03]'}`}>
                    <span className={`w-14 shrink-0 truncate text-xs font-black ${e.seat === mySeat ? 'text-(--accent)' : 'text-white'}`}>{nameOf(e.seat)}</span>
                    <span className="flex shrink-0 gap-[2px]">{e.cards.map((c, k) => <ShCard key={k} value={c} size="xs" />)}</span>
                    <span className={`min-w-0 flex-1 truncate text-[12px] font-black ${e.sniped ? 'text-[#ff7a85] line-through' : won ? 'text-[#ffd36b]' : 'text-white/75'}`}>{t.label(shTargetOf(e.hand))}</span>
                    {e.sniped && <span className="flex shrink-0 items-center gap-0.5 rounded bg-(--accent) px-1 text-[9px] font-black text-white"><Scope size={9} />{t.sniped}</span>}
                    {said && said !== 'pass' && <span className="hidden shrink-0 text-[9px] font-bold text-white/35 min-[400px]:inline">🎯{t.label(said)}</span>}
                    {sd.payouts[e.seat] > 0 && <span className="shrink-0 font-mono text-xs font-black text-[#ffd36b]">+{sd.payouts[e.seat]}</span>}
                  </motion.li>
                );
              })}
            </ul>
          </>
        )}
        {safeEvents.map((e) => {
          const gifts = e.gifts.map((n, s) => ({ n, s })).filter((x) => x.n > 0).map((x) => `${nameOf(x.s)} +${x.n}`).join(', ');
          return (
            <div key={e.seat} className="mt-2 rounded-md border border-[#7ef0b0]/30 bg-[#7ef0b0]/10 px-2 py-1.5 text-xs font-black text-[#a8f5cb]">
              <p className="flex items-center gap-1"><ShieldCheck size={13} />{t.safeNow(nameOf(e.seat), e.paid)}</p>
              {gifts && <p className="mt-0.5 text-[11px] font-bold text-[#a8f5cb]/70">{t.gifts(gifts)}</p>}
            </div>
          );
        })}
        {sd.out.map((s) => <p key={s} className="mt-2 rounded-md border border-(--accent)/30 bg-(--accent)/10 px-2 py-1.5 text-xs font-black text-[#ff9aa4]">{t.eliminated(nameOf(s))}</p>)}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ history */

function HistorySheet({ g, t, nameOf, mySeat, onClose }: { g: SniperHoldem; t: ShCopy; nameOf: (s: number) => string; mySeat: number | null; onClose: () => void }) {
  const rounds = [...g.rounds].reverse().slice(0, 15);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onClick={(e) => e.stopPropagation()} className="max-h-[80vh] w-full max-w-[560px] overflow-y-auto rounded-t-[18px] border border-white/10 bg-[#121217] p-4 pb-[calc(env(safe-area-inset-bottom)+14px)] sm:rounded-[18px]">
        <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t.handsTitle}</p><button type="button" onClick={onClose} aria-label={t.close} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-white/60"><X size={15} /></button></div>
        {!rounds.length && <p className="mt-4 text-center text-sm text-white/40">{t.handsEmpty}</p>}
        <ul className="mt-3 space-y-3">
          {rounds.map((r) => (
            <li key={r.round} className="rounded-[10px] border border-white/10 bg-black/30 p-2.5">
              <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-black text-(--accent)">{t.round(r.round)}</span><span className="flex gap-[2px]">{r.board.map((c, i) => <ShCard key={i} value={c} size="xs" />)}</span><ShChip n={r.pot} className="text-xs text-[#ffd36b]" /></div>
              <ul className="mt-2 space-y-1">
                {r.hands.map((h, s) => (h ? (
                  <li key={s} className={`flex items-center gap-2 text-[11px] ${r.winners.includes(s) ? 'text-[#ffd36b]' : 'text-white/65'}`}>
                    <span className={`w-14 truncate font-black ${s === mySeat ? 'text-(--accent)' : ''}`}>{nameOf(s)}</span>
                    <span className="flex gap-[2px]">{h.map((c, k) => <ShCard key={k} value={c} size="xs" />)}</span>
                    <span className={`min-w-0 flex-1 truncate font-bold ${r.sniped[s] ? 'line-through text-[#ff7a85]' : ''}`}>{r.hand[s] ? t.label(shTargetOf(r.hand[s]!)) : ''}</span>
                    {r.snipes[s] && r.snipes[s] !== 'pass' && <span className="shrink-0 text-[10px] text-white/40">🎯{t.label(r.snipes[s] as ShTarget)}</span>}
                    {r.payouts[s] > 0 && <span className="font-mono font-black">+{r.payouts[s]}</span>}
                  </li>
                ) : null))}
                {r.hands.every((h) => !h) && <li className="text-[11px] text-white/45">{r.winners.map(nameOf).join(', ')} · {t.byFold}</li>}
              </ul>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ log & ladder */

function LogList({ g, t, nameOf }: { g: SniperHoldem; t: ShCopy; nameOf: (s: number) => string }) {
  const line = (e: ShEvent) => {
    switch (e.k) {
      case 'round': return t.logRound(e.round, nameOf(e.first), e.cap);
      case 'board': return t.logBoard(e.cards[0], e.cards[1]);
      case 'call': return t.logCall(nameOf(e.seat), e.to);
      case 'raise': return t.logRaise(nameOf(e.seat), e.to, e.open);
      case 'fold': return t.logFold(nameOf(e.seat));
      case 'snipe': return t.logSnipe(nameOf(e.seat), t.label(e.target));
      case 'pass': return t.logPass(nameOf(e.seat));
      case 'win': return t.logWin(e.seats.map(nameOf).join(', '), e.pot, e.split, e.allSniped);
      case 'safe': return t.logSafe(nameOf(e.seat), e.place);
      case 'out': return t.logOut(nameOf(e.seat));
    }
  };
  return (
    <>
      <p className={PANEL_TITLE}>{t.log}</p>
      <div className="mt-3 max-h-[220px] space-y-1.5 overflow-y-auto lg:max-h-[360px]">
        {g.log.slice(0, 30).map((e, i) => (
          <p key={`${g.seq}-${i}`} className={`flex gap-2 text-[11px] leading-relaxed ${e.k === 'round' ? 'mt-2 font-black text-(--accent)' : e.k === 'win' ? 'font-bold text-[#ffd36b]' : e.k === 'safe' ? 'font-bold text-[#7ef0b0]' : e.k === 'out' ? 'font-bold text-[#ff9aa4]' : e.k === 'snipe' ? 'font-bold text-[#ffb3ba]' : 'text-white/55'}`}>
            <i className={i === 0 ? DIAMOND : 'mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-white/15'} />{line(e)}
          </p>
        ))}
      </div>
    </>
  );
}

export function Ladder({ t }: { t: ShCopy }) {
  return (
    <>
      <p className={PANEL_TITLE}>{t.ranking}</p>
      <ol className="mt-2.5 space-y-1">{t.ladder.map(([name, desc], i) => <li key={name} className="flex gap-2 text-[11.5px] leading-snug"><span className="w-4 font-mono font-black" style={{ color: i < 3 ? SH_GOLD : undefined }}>{i + 1}</span><b className="w-[74px] shrink-0 text-white/85">{name}</b><span className="text-white/50">{desc}</span></li>)}</ol>
      <p className={`${PANEL_TITLE} mt-4`}>{t.tieTitle}</p>
      <ol className="mt-2 space-y-1 text-[11px] leading-snug text-white/55">{t.ties.map((line, i) => <li key={i} className="flex gap-2"><span className="font-mono text-(--accent)">{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
    </>
  );
}
