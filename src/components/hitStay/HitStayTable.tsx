"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronUp, Eye, EyeOff, Hand, Layers, Minus, Plus, ScanEye, Timer } from 'lucide-react';
import { type HitStay, type HsEvent, HS_PERSONA, HS_PLAYERS, hsAnte, hsPot, hsTotal, hsVisible } from '@/lib/hitStay';
import { type HitStayRoom, type HitStayRoomAction, HS_SHOWDOWN_MS, HS_TURN_SEC, HS_WARN_SEC, hsWaitingOn } from '@/lib/hitStayRoom';
import { DIAMOND, PANEL, PANEL_TITLE } from '../ui/gameUi';
import { HS_ACCENT, HS_HIT, HS_INK, type HsCopy } from './copy';
import { accentVars } from '../ui/gameUi';
import { HsAvatar, HsCard, HsChip, HsDie } from './HitStayParts';
import HitStayHands from './HitStayHands';

type Props = {
  room: HitStayRoom;
  mySeat: number | null;
  onAction: (action: HitStayRoomAction) => void;
  t: HsCopy;
  locale: string;
};

const NEVER = Number.MAX_SAFE_INTEGER / 2;

/** A short buzz on phones; browsers only allow it after the player has tapped the page. */
function buzz(pattern: number | number[]) {
  try { if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(pattern); } catch { /* optional */ }
}

/** Seconds left on the turn clock, or null when there is none. */
function useCountdown(deadline: number, on: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [on]);
  return on && deadline < NEVER ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;
}

export default function HitStayTable({ room, mySeat, onAction, t, locale }: Props) {
  const g = room.game;
  const en = locale === 'en';
  const nameOf = (s: number) => {
    if (s === mySeat) return t.you;
    const style = room.ai[s] && room.seats[s]?.id.startsWith('ai-') ? room.style[s] : null;
    return style ? (en ? HS_PERSONA[style].nameEn : HS_PERSONA[style].name) : room.seats[s]?.name ?? `P${s + 1}`;
  };
  const personaOf = (s: number) => (room.seats[s]?.id.startsWith('ai-') && room.style[s] ? HS_PERSONA[room.style[s]!] : null);
  const waiting = hsWaitingOn(g);
  const myTurn = mySeat !== null && room.phase === 'playing' && waiting.includes(mySeat) && !room.ai[mySeat];
  // Picking the face-up card is timed in every mode; bets and HIT/STAY only in rooms.
  const seconds = useCountdown(room.deadline, room.phase === 'playing' && (!!room.turnSec || g.phase === 'pick'));
  const pot = hsPot(g);
  // Empty seats (a room played without AI) are left out, and the opponents' row narrows to fit.
  const absentKey = (g.absent ?? []).join();
  const others = useMemo(() => Array.from({ length: HS_PLAYERS }, (_, i) => ((mySeat ?? -1) + 1 + i) % HS_PLAYERS).filter((s) => s !== mySeat && !g.absent?.[s]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mySeat, absentKey]);
  const othersGrid = others.length <= 1 ? 'mx-auto w-full max-w-[50%] grid-cols-1' : others.length === 2 ? 'grid-cols-2' : others.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

  // Fresh round: the die rolls, so the table holds the reveal briefly.
  const [rollKey, setRollKey] = useState(g.round);
  if (rollKey !== g.round) setRollKey(g.round);

  // The latest move, shown as a stamp on that player's seat.
  const last = g.log[0];
  const [stamp, setStamp] = useState<{ seq: number; event: HsEvent } | null>(null);
  const seenSeq = useRef(g.seq);
  // The hide timer outlives later moves: the next move used to cancel it and leave the stamp up for good.
  const hideTimer = useRef<number | null>(null);
  useEffect(() => {
    if (seenSeq.current === g.seq) return;
    seenSeq.current = g.seq;
    const stampable = !!last && 'seat' in last && last.k !== 'open' && last.k !== 'out';
    const shown = stampable ? { seq: g.seq, event: last } : null;
    // A move without a stamp (a new round, a card shown, the showdown) clears the old one right away.
    const show = window.setTimeout(() => setStamp(shown), 0);
    if (shown) {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setStamp((cur) => (cur?.seq === shown.seq ? null : cur)), 1500);
    }
    return () => window.clearTimeout(show);
  }, [g.seq, last]);
  useEffect(() => () => { if (hideTimer.current !== null) window.clearTimeout(hideTimer.current); }, []);

  // A tap on the phone when it becomes your turn.
  const wasMyTurn = useRef(false);
  useEffect(() => {
    if (myTurn && !wasMyTurn.current) buzz(28);
    wasMyTurn.current = myTurn;
  }, [myTurn]);

  const act = (action: Parameters<typeof onAction>[0]) => onAction(action);
  // The card picked to show (tapped in the hand, confirmed in the dock).
  const [chosen, setChosen] = useState<{ round: number; index: number } | null>(null);
  const pick = chosen?.round === g.round ? chosen.index : null;
  const [handsOpen, setHandsOpen] = useState(false);
  const openHands = () => setHandsOpen(true);
  const showdown = g.phase === 'showdown' || g.phase === 'finished' ? g.showdown : null;

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-2.5 pb-[calc(env(safe-area-inset-bottom)+96px)] sm:gap-3 lg:pb-6">
        {/* Bet board (top left) and the limit die */}
        <div className="grid grid-cols-[minmax(0,1fr)_118px] gap-2 sm:grid-cols-[minmax(0,1fr)_170px] sm:gap-2.5">
          <BetBoard g={g} room={room} nameOf={nameOf} mySeat={mySeat} waiting={waiting} t={t} pot={pot} onHands={openHands} />
          <LimitPanel g={g} rollKey={rollKey} t={t} />
        </div>

        <DealerLine className="hidden sm:flex" g={g} t={t} waiting={waiting} nameOf={nameOf} myTurn={myTurn} seconds={seconds} />

        <div className={`grid ${othersGrid} gap-1.5 sm:gap-2`}>
          {others.map((s) => (
            <Seat key={s} g={g} seat={s} name={nameOf(s)} persona={personaOf(s)} t={t} mySeat={mySeat}
              acting={room.phase === 'playing' && waiting.includes(s)} away={!!room.away?.[s]} stamp={stamp?.event.k !== 'round' && stamp && 'seat' in stamp.event && stamp.event.seat === s ? stamp : null} />
          ))}
        </div>

        {mySeat !== null && <MyHand g={g} seat={mySeat} t={t} myTurn={myTurn} pick={pick} onChoose={(index) => setChosen({ round: g.round, index })} stamp={stamp && 'seat' in stamp.event && stamp.event.seat === mySeat ? stamp : null} />}

        <section className={`${PANEL} lg:hidden`}><LogList g={g} t={t} nameOf={nameOf} /></section>
      </div>

      <aside className="hidden flex-col gap-3 lg:flex">
        <section className={PANEL}><LogList g={g} t={t} nameOf={nameOf} /></section>
        <section className={PANEL}>
          <p className={PANEL_TITLE}>{t.rules}</p>
          <ol className="mt-3 space-y-2.5 text-[11.5px] leading-relaxed text-white/60">{t.quick.map((line, i) => <li key={i} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        </section>
      </aside>

      <Layer>
        {mySeat !== null && room.phase !== 'finished' && <Dock g={g} room={room} seat={mySeat} myTurn={myTurn} seconds={seconds} t={t} act={act} waiting={waiting} nameOf={nameOf} pick={pick} onHands={openHands} />}
        <AnimatePresence>{handsOpen && <HitStayHands key="hands" g={g} mySeat={mySeat} t={t} nameOf={nameOf} colorOf={(s) => personaOf(s)?.color} onClose={() => setHandsOpen(false)} />}</AnimatePresence>
        <AnimatePresence>{showdown && g.phase === 'showdown' && <ShowdownSheet key={g.round} g={g} t={t} nameOf={nameOf} mySeat={mySeat} />}</AnimatePresence>
      </Layer>
    </div>
  );
}

const noop = () => () => {};
/**
 * The dock, the dealer's question and the showdown sheet go straight into <body>: the page's blurred,
 * z-indexed wrappers would otherwise keep them under the site's floating widgets.
 */
function Layer({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;
  return createPortal(<div style={accentVars(HS_ACCENT, HS_INK)} className="relative z-[70] text-[#e6e9f0]">{children}</div>, document.body);
}

/* ------------------------------------------------------------------ bet board */

function BetBoard({ g, room, nameOf, mySeat, waiting, t, pot, onHands }: {
  g: HitStay; room: HitStayRoom; nameOf: (s: number) => string; mySeat: number | null; waiting: number[]; t: HsCopy; pot: number; onHands: () => void;
}) {
  const order = Array.from({ length: HS_PLAYERS }, (_, i) => (g.first + i) % HS_PLAYERS).filter((s) => !g.absent?.[s]);
  return (
    <section className="rounded-[14px] border border-white/10 bg-[#121217]/90 p-2 backdrop-blur sm:p-3">
      <div className="mb-1 flex items-center justify-between gap-1"><p className={PANEL_TITLE}>{t.betBoard}</p><button type="button" onClick={onHands} className="flex items-center gap-1 rounded-md border border-(--accent)/40 bg-(--accent)/10 px-1.5 py-[3px] text-[10px] font-black text-[#c9cfff] active:scale-95"><ScanEye size={12} />{t.handsButton}</button></div>
      <ul className="space-y-[3px]">
        {order.map((s) => {
          const acting = room.phase === 'playing' && waiting.includes(s) && g.phase !== 'pick';
          const gone = g.out[s];
          return (
            <li key={s} className={`flex items-center gap-1.5 rounded-md px-1.5 py-[2px] text-[11px] font-bold transition sm:py-[3px] ${acting ? 'bg-(--accent)/15 text-white shadow-[inset_0_0_0_1px_var(--accent-glow)]' : 'text-white/70'} ${gone ? 'opacity-35' : ''}`}>
              <span className={`w-2 shrink-0 text-[9px] ${acting ? 'text-(--accent)' : 'text-transparent'}`}>▶</span>
              <span className={`min-w-0 flex-1 truncate ${g.folded[s] && !gone ? 'line-through decoration-white/40' : ''} ${s === mySeat ? 'text-(--accent)' : ''}`}>{nameOf(s)}</span>
              {s === g.first && !gone && <span className="rounded-[3px] bg-[#ffd36b] px-1 text-[8px] font-black leading-[13px] text-[#2a1d00]">{t.first}</span>}
              <span className="w-7 shrink-0 text-right font-mono text-[12px] font-black text-white">{gone ? '—' : g.bets[s]}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-1.5 flex items-center justify-between rounded-md border border-[#ffd36b]/25 bg-[#ffd36b]/[0.07] px-2 py-1">
        <span className="font-mono text-[10px] font-black tracking-[0.2em] text-[#ffd36b]">{t.pot}</span>
        <motion.span key={pot} initial={{ scale: 1.35, color: '#fff3c4' }} animate={{ scale: 1, color: '#ffd36b' }} className="font-mono text-xl font-black leading-none">{pot}</motion.span>
      </div>
    </section>
  );
}

function LimitPanel({ g, rollKey, t }: { g: HitStay; rollKey: number; t: HsCopy }) {
  return (
    <section className="relative flex flex-col items-center justify-between overflow-hidden rounded-[14px] border border-(--accent)/30 bg-[radial-gradient(circle_at_50%_38%,rgba(111,125,255,.28),rgba(18,18,23,.92)_70%)] p-2 text-center sm:p-2.5">
      <p className="font-mono text-[9px] font-black tracking-[0.2em] text-(--accent)">{t.round(g.round)}</p>
      <div className="my-0.5"><HsDie value={g.limit} rollKey={rollKey} size={58} /></div>
      <p className="text-[9px] font-black tracking-[0.18em] text-white/45">{t.limit} <b className="font-mono text-sm text-white">{g.limit}</b></p>
      <div className="mt-1 grid w-full grid-cols-2 gap-1 text-[9px] font-bold text-white/45">
        <span className="rounded bg-white/[0.05] py-0.5">{t.ante}<b className="block font-mono text-[12px] text-white">{g.ante}{g.ante < hsAnte(g.round) && <s className="ml-1 text-[9px] font-bold text-white/35">{hsAnte(g.round)}</s>}</b></span>
        <span className="rounded bg-white/[0.05] py-0.5">{t.deck}<b className="block font-mono text-[12px] text-white">{g.deck.length}</b></span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ dealer line */

const dealerText = (g: HitStay, t: HsCopy, nameOf: (s: number) => string, myTurn: boolean) => (
  g.phase === 'pick' ? (myTurn ? t.dealerPick : t.dealerPickWait)
    : g.phase === 'hit' ? t.dealerAsk(nameOf(g.turn))
      : g.phase === 'bet1' || g.phase === 'bet2' ? t.dealerBet(nameOf(g.turn))
        : t.dealerShow);

function DealerLine({ g, t, waiting, nameOf, myTurn, seconds, className = '' }: {
  g: HitStay; t: HsCopy; waiting: number[]; nameOf: (s: number) => string; myTurn: boolean; seconds: number | null; className?: string;
}) {
  const text = dealerText(g, t, nameOf, myTurn);
  const hit = g.phase === 'hit';
  return (
    <div className={`${className} relative items-center gap-2.5 overflow-hidden rounded-[12px] border px-3 py-2.5 ${hit ? 'border-[#ff4d6d]/40 bg-[#ff4d6d]/[0.07]' : 'border-white/10 bg-black/40'}`}>
      {hit && <motion.span aria-hidden className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#ff4d6d]/15 to-transparent" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }} />}
      <span className="relative font-mono text-[9px] font-black tracking-[0.2em] text-white/35">{t.dealer}</span>
      <AnimatePresence mode="wait">
        <motion.p key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className={`relative min-w-0 flex-1 truncate text-[13px] font-extrabold ${hit ? 'text-white' : 'text-white/80'}`}>
          {hit ? <HitStayText text={text} /> : text}
        </motion.p>
      </AnimatePresence>
      {seconds !== null && waiting.length > 0 && <span className={`relative flex items-center gap-1 font-mono text-xs font-black ${seconds <= 5 ? 'animate-pulse text-[#ff4d6d]' : 'text-white/50'}`}><Timer size={12} />{seconds}</span>}
    </div>
  );
}

/** "Name, HIT or STAY?" with HIT and STAY in their colors. */
function HitStayText({ text }: { text: string }) {
  const parts = text.split(/(HIT|STAY)/);
  return <>{parts.map((part, i) => part === 'HIT' ? <b key={i} className="text-[#ff4d6d]">HIT</b> : part === 'STAY' ? <b key={i} className="text-[#b9c3ff]">STAY</b> : <span key={i}>{part}</span>)}</>;
}

/* ------------------------------------------------------------------ seats */

function stampText(event: HsEvent, t: HsCopy): { text: string; tone: 'hit' | 'stay' | 'bet' | 'fold' } | null {
  switch (event.k) {
    case 'hit': return { text: `HIT ${event.card > 0 ? '+' : ''}${event.card}`, tone: 'hit' };
    case 'stay': return { text: 'STAY', tone: 'stay' };
    case 'raise': return { text: `${t.raise} ${event.to}`, tone: 'bet' };
    case 'call': return { text: t.call(event.to), tone: 'bet' };
    case 'check': return { text: t.call(0), tone: 'bet' };
    case 'fold': return { text: t.fold, tone: 'fold' };
    default: return null;
  }
}

const STAMP_TONE = {
  hit: 'border-[#ff4d6d] bg-[#ff4d6d] text-white shadow-[0_0_24px_rgba(255,77,109,.6)]',
  stay: 'border-[#b9c3ff] bg-[#1a1e45] text-[#dfe4ff] shadow-[0_0_20px_rgba(111,125,255,.5)]',
  bet: 'border-[#ffd36b] bg-[#2a2310] text-[#ffe39a]',
  fold: 'border-white/30 bg-[#1b1b20] text-white/60',
};

function Stamp({ stamp, t, big = false }: { stamp: { seq: number; event: HsEvent }; t: HsCopy; big?: boolean }) {
  const s = stampText(stamp.event, t);
  if (!s) return null;
  return (
    <motion.span
      key={stamp.seq} initial={{ scale: 2.4, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 1, rotate: -6 }} exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 520, damping: 18 }}
      className={`pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border-2 px-2.5 py-1 font-mono font-black tracking-[0.08em] ${big ? 'text-lg' : 'text-sm'} ${STAMP_TONE[s.tone]}`}
    >{s.text}</motion.span>
  );
}

function Seat({ g, seat, name, persona, t, mySeat, acting, away, stamp }: {
  g: HitStay; seat: number; name: string; persona: (typeof HS_PERSONA)[keyof typeof HS_PERSONA] | null; t: HsCopy; mySeat: number | null;
  acting: boolean; away: boolean; stamp: { seq: number; event: HsEvent } | null;
}) {
  const hand = g.hands[seat];
  const out = g.out[seat];
  const folded = g.folded[seat] && !out;
  const visible = hand.map((c, i) => (hsVisible(g, mySeat, seat, i) ? c : null));
  const shownSum = hsTotal(visible);
  const allShown = visible.every((c) => c !== null) && hand.length > 0;
  const entry = g.showdown?.entries.find((e) => e.seat === seat);
  const won = (g.phase === 'showdown' || g.phase === 'finished') && g.showdown?.winners.includes(seat);
  const asking = acting && g.phase === 'hit';
  return (
    <article className={`relative min-w-0 overflow-hidden rounded-[12px] border p-1.5 transition sm:p-2.5 ${won ? 'border-[#ffd36b]/70 bg-[#ffd36b]/[0.08] shadow-[0_0_24px_rgba(255,211,107,.25)]' : asking ? 'border-[#ff4d6d]/60 bg-[#ff4d6d]/[0.06] shadow-[0_0_22px_rgba(255,77,109,.28)]' : acting ? 'border-(--accent)/60 bg-(--accent)/[0.07] shadow-[0_0_18px_var(--accent-glow)]' : 'border-white/10 bg-[#121217]/85'} ${out ? 'opacity-35 grayscale' : folded ? 'opacity-55' : ''}`}>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <HsAvatar name={name} color={persona?.color} size={22} active={acting} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-black leading-4 text-white sm:text-[12px]">{name}</p>
          <HsChip n={g.chips[seat]} className="text-[10px] leading-3 text-white/70" />
        </div>
      </div>
      <p className="mt-1 flex items-center gap-1 truncate text-[9px] font-bold leading-3">
        {seat === g.first && !out && <span className="rounded-[3px] bg-[#ffd36b] px-1 text-[8px] leading-[12px] text-[#2a1d00]">{t.first}</span>}
      </p>
      <div className="mt-1.5 flex min-h-[30px] flex-wrap gap-[2px] sm:gap-[3px]">
        {hand.map((c, i) => <HsCard key={`${g.round}-${i}`} value={visible[i]} size="seat" delay={i < 3 ? i * 0.05 : 0} />)}
      </div>
      <p className="mt-1 flex items-center justify-between gap-1 truncate text-[9.5px] font-bold sm:text-[10px]">
        <span className={entry?.bust && allShown ? 'text-[#ff7a8f]' : 'text-white/50'}>{out ? t.out : folded ? t.fold : allShown ? `${hsTotal(visible)}${entry?.bust ? ` · ${t.bust}` : ''}` : t.openSum(shownSum)}</span>
        {g.stayed[seat] && !folded && g.phase === 'hit' && <span className="text-[#b9c3ff]">STAY</span>}
        {away && <span className="text-white/35">AI</span>}
      </p>
      {asking && (
        <motion.span className="absolute right-1 top-1 rounded-[4px] bg-[#ff4d6d] px-1 py-[1px] font-mono text-[8px] font-black text-white" animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>HIT?</motion.span>
      )}
      {acting && g.phase !== 'hit' && g.phase !== 'pick' && (
        <span className="absolute right-2 top-2 flex gap-0.5">{[0, 1, 2].map((d) => <motion.i key={d} className="h-1 w-1 rounded-full bg-(--accent)" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }} />)}</span>
      )}
      <AnimatePresence>{stamp && <Stamp stamp={stamp} t={t} />}</AnimatePresence>
    </article>
  );
}

/* ------------------------------------------------------------------ my hand */

function MyHand({ g, seat, t, myTurn, pick, onChoose, stamp }: {
  g: HitStay; seat: number; t: HsCopy; myTurn: boolean; pick: number | null; onChoose: (index: number) => void; stamp: { seq: number; event: HsEvent } | null;
}) {
  const hand = g.hands[seat];
  const total = hsTotal(hand);
  const picking = myTurn && g.phase === 'pick';
  const out = g.out[seat];
  const diff = g.limit - total;
  const scale = Math.max(g.limit + 4, total + 1, 8);
  const negative = Math.min(0, total);

  return (
    <section className="relative overflow-hidden rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(111,125,255,.09),rgba(18,18,23,.92)_55%)] px-3 py-2.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-[4px] bg-(--accent) px-1.5 py-[2px] font-mono text-[9px] font-black text-(--accent-ink)">YOU</span>
          <b className="text-sm font-black text-white">{t.myHand}</b>
          {seat === g.first && <span className="rounded-[3px] bg-[#ffd36b] px-1 text-[9px] font-black leading-[14px] text-[#2a1d00]">{t.first}</span>}
          <HsChip n={g.chips[seat]} className="text-xs text-white/75" />
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black tracking-[0.14em] text-white/40">{t.myTotal}</p>
          <p className="font-mono leading-none"><motion.b key={total} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className={`inline-block text-3xl font-black ${diff < 0 ? 'text-[#ff4d6d]' : diff === 0 ? 'text-[#ffd36b]' : 'text-white'}`}>{out ? '—' : total}</motion.b><span className="text-sm font-black text-white/35"> / {g.limit}</span></p>
        </div>
      </div>

      <div className="mt-2 flex min-h-[96px] flex-wrap items-end justify-center gap-1.5 sm:mt-3 sm:min-h-[128px] sm:gap-2.5">
        {hand.map((c, i) => {
          const opened = g.openIdx[seat] === i;
          const tag = i >= 3 ? undefined : opened ? undefined : g.openIdx[seat] !== null ? '🔒' : undefined;
          const card = <HsCard value={c} size="hand" lifted={picking && pick === i} tag={tag} delay={i < 3 ? i * 0.08 : 0} />;
          return picking ? (
            <button key={`${g.round}-${i}`} type="button" onClick={() => onChoose(i)} aria-label={`${c}`} className="rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-(--accent)">{card}</button>
          ) : (
            <span key={`${g.round}-${i}`} className="relative">{card}{opened && <Eye size={12} className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-(--accent) p-0.5 text-(--accent-ink)" />}</span>
          );
        })}
      </div>

      {/* Sum against the limit: the line marks the limit */}
      <div className="relative mt-2.5 h-2 rounded-full bg-white/[0.07] sm:mt-3">
        <motion.i className={`absolute inset-y-0 left-0 rounded-full ${diff < 0 ? 'bg-[#ff4d6d]' : 'bg-[linear-gradient(90deg,var(--accent),#b9c3ff)]'}`} animate={{ width: `${Math.max(2, ((total - negative) / (scale - negative)) * 100)}%` }} transition={{ type: 'spring', stiffness: 200, damping: 24 }} />
        <span className="absolute -top-1 h-4 w-[3px] rounded-full bg-[#ffd36b] shadow-[0_0_8px_#ffd36b]" style={{ left: `${((g.limit - negative) / (scale - negative)) * 100}%` }} />
      </div>
      <p className={`mt-1.5 text-center text-[11px] font-bold ${diff < 0 ? 'text-[#ff7a8f]' : diff === 0 ? 'text-[#ffd36b]' : 'text-white/50'}`}>{out ? t.out : diff < 0 ? t.over(-diff) : diff === 0 ? t.exact : t.toLimit(diff)}</p>

      {picking && <p className="mt-1.5 break-keep text-center text-[11px] leading-4 text-white/45">{t.pickHint}</p>}
      <AnimatePresence>{stamp && <Stamp stamp={stamp} t={t} big />}</AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ action dock */

function Dock({ g, room, seat, myTurn, seconds, t, act, waiting, nameOf, pick, onHands }: {
  g: HitStay; room: HitStayRoom; seat: number; myTurn: boolean; seconds: number | null; t: HsCopy;
  act: (action: HitStayRoomAction) => void; waiting: number[]; nameOf: (s: number) => string; pick: number | null; onHands: () => void;
}) {
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [raiseTo, setRaiseTo] = useState(0);
  const [peek, setPeek] = useState<number | null>(null); // the seq at which the HIT/STAY screen was tucked away
  const betting = myTurn && (g.phase === 'bet1' || g.phase === 'bet2');
  const hitting = myTurn && g.phase === 'hit';
  const picking = myTurn && g.phase === 'pick';
  const owe = g.level - g.bets[seat];
  const canRaise = g.level < g.cap;
  const minRaise = g.level + 1;
  const target = Math.min(g.cap, Math.max(minRaise, raiseTo));
  const overlay = hitting && peek !== g.seq;
  if (!betting && raiseOpen) setRaiseOpen(false);
  // Rooms: the last seconds of a bet or HIT/STAY warn that the AI is about to take the seat.
  const warning = (betting || hitting) && !!room.turnSec && seconds !== null && seconds <= HS_WARN_SEC;
  const warned = useRef(false);
  useEffect(() => {
    if (warning && !warned.current) buzz([60, 60, 60]);
    warned.current = warning;
  }, [warning]);

  const openRaise = () => { setRaiseTo(Math.min(g.cap, g.level + Math.max(1, g.ante))); setRaiseOpen(true); };
  const send = (action: Parameters<typeof act>[0]) => { setRaiseOpen(false); act(action); };

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0b0e]/92 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-md">
        <div className="mx-auto max-w-[760px]">
          <AnimatePresence>{warning && <IdleWarning key="warn" seconds={seconds!} t={t} />}</AnimatePresence>
          {picking ? (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-black text-(--accent)">{t.dealerPick}</p>
                <p className="text-[10px] font-bold text-white/40">{pick === null ? t.pickTap : t.pickReady}{seconds !== null && <b className={`ml-1.5 font-mono ${seconds <= 3 ? 'animate-pulse text-[#ff4d6d]' : 'text-white/60'}`}>· {t.autoPickIn(seconds)}</b>}</p>
              </div>
              <button type="button" disabled={pick === null} onClick={() => pick !== null && act({ t: 'act', action: { kind: 'open', index: pick } })} className="h-14 shrink-0 rounded-[12px] bg-(--accent) px-5 text-sm font-black text-(--accent-ink) shadow-[0_0_18px_var(--accent-glow)] transition active:scale-[.98] disabled:opacity-35 disabled:shadow-none">{t.pickConfirm}</button>
            </div>
          ) : betting ? (
            <>
              <AnimatePresence>
                {raiseOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mb-2.5 rounded-[12px] border border-[#ffd36b]/25 bg-[#ffd36b]/[0.05] p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black tracking-[0.12em] text-white/45">{t.raiseTotal}</span>
                        <span className="text-[10px] font-bold text-white/35">{t.capNote(g.cap)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button type="button" onClick={() => setRaiseTo(Math.max(minRaise, target - 1))} disabled={target <= minRaise} className="grid h-11 w-11 place-items-center rounded-md border border-white/15 bg-white/5 text-white disabled:opacity-30"><Minus size={18} /></button>
                        <motion.span key={target} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="flex-1 text-center font-mono text-3xl font-black text-[#ffd36b]">{target}</motion.span>
                        <button type="button" onClick={() => setRaiseTo(Math.min(g.cap, target + 1))} disabled={target >= g.cap} className="grid h-11 w-11 place-items-center rounded-md border border-white/15 bg-white/5 text-white disabled:opacity-30"><Plus size={18} /></button>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1.5">
                        {[2, 5, 10].map((n) => <button key={n} type="button" onClick={() => setRaiseTo(Math.min(g.cap, target + n))} disabled={target >= g.cap} className="rounded-md border border-white/10 bg-white/[0.04] py-2 font-mono text-xs font-black text-white/75 disabled:opacity-30">+{n}</button>)}
                        <button type="button" onClick={() => setRaiseTo(g.cap)} className="rounded-md border border-[#ffd36b]/40 bg-[#ffd36b]/10 py-2 font-mono text-xs font-black text-[#ffd36b]">{t.max}</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
                <span className="text-(--accent)">{t.myBetTurn} · {t.phase[g.phase]}</span>
                <span className="flex items-center gap-2 text-white/50">{t.owe(owe)}{seconds !== null && <b className={`font-mono ${seconds <= 5 ? 'text-[#ff4d6d]' : 'text-white/70'}`}>{seconds}s</b>}</span>
              </div>
              <div className="grid grid-cols-[1fr_1.3fr_1.3fr] gap-2">
                <button type="button" onClick={() => send({ t: 'act', action: { kind: 'fold' } })} className="h-14 rounded-[12px] border border-white/15 bg-white/[0.04] text-sm font-black text-white/70 active:scale-[.98]">{t.fold}</button>
                <button type="button" onClick={() => send({ t: 'act', action: { kind: 'call' } })} className="h-14 rounded-[12px] border border-(--accent)/50 bg-(--accent)/15 text-sm font-black text-white active:scale-[.98]">{t.call(owe)}</button>
                {raiseOpen ? (
                  <button type="button" onClick={() => send({ t: 'act', action: { kind: 'raise', to: target } })} className="h-14 rounded-[12px] bg-[#ffd36b] text-sm font-black text-[#241900] shadow-[0_0_20px_rgba(255,211,107,.35)] active:scale-[.98]">{t.raiseTo(target)}</button>
                ) : (
                  <button type="button" disabled={!canRaise} onClick={openRaise} className="flex h-14 items-center justify-center gap-1 rounded-[12px] border border-[#ffd36b]/50 bg-[#ffd36b]/10 text-sm font-black text-[#ffd36b] active:scale-[.98] disabled:opacity-30">{t.raise}<ChevronUp size={15} /></button>
                )}
              </div>
            </>
          ) : hitting ? (
            <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
              <button type="button" onClick={() => setPeek(null)} className="flex h-14 flex-col items-center justify-center rounded-[12px] border border-white/15 bg-white/5 px-3 text-[10px] font-black text-white/60"><Layers size={16} />{t.backToDealer}</button>
              <button type="button" onClick={() => act({ t: 'act', action: { kind: 'stay' } })} className="h-14 rounded-[12px] border border-[#b9c3ff]/50 bg-[#1a1e45] font-mono text-lg font-black tracking-[0.12em] text-[#dfe4ff]">STAY</button>
              <button type="button" onClick={() => act({ t: 'act', action: { kind: 'hit' } })} className="h-14 rounded-[12px] font-mono text-lg font-black tracking-[0.12em] text-white shadow-[0_0_24px_rgba(255,77,109,.45)]" style={{ background: HS_HIT }}>HIT</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="min-w-0 flex-1"><WaitBar g={g} room={room} seat={seat} t={t} waiting={waiting} nameOf={nameOf} seconds={seconds} /></div>
              <button type="button" onClick={onHands} className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-[12px] border border-(--accent)/40 bg-(--accent)/10 text-[10px] font-black text-[#c9cfff] active:scale-95"><ScanEye size={17} />{t.handsButton}</button>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>{overlay && <DealerAsk key={`ask-${g.seq}`} g={g} seat={seat} t={t} seconds={seconds} warning={warning} onHit={() => act({ t: 'act', action: { kind: 'hit' } })} onStay={() => act({ t: 'act', action: { kind: 'stay' } })} onPeek={() => setPeek(g.seq)} />}</AnimatePresence>
    </>
  );
}

function WaitBar({ g, room, seat, t, waiting, nameOf, seconds }: {
  g: HitStay; room: HitStayRoom; seat: number; t: HsCopy; waiting: number[]; nameOf: (s: number) => string; seconds: number | null;
}) {
  if (g.phase === 'showdown') {
    return (
      <div className="flex items-center gap-3 py-2">
        <span className="shrink-0 text-xs font-black text-white/50">{t.nextRound}</span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><motion.span key={g.round} className="block h-full origin-left rounded-full bg-(--accent)" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: HS_SHOWDOWN_MS / 1000, ease: 'linear' }} /></span>
      </div>
    );
  }
  const who = g.phase === 'pick' ? (g.openIdx[seat] === null ? t.dealerPick : t.pickWait) : waiting.length ? dealerText(g, t, nameOf, false) : '';
  const hit = g.phase === 'hit';
  return (
    <div className={`relative flex h-14 items-center gap-3 overflow-hidden rounded-[12px] border px-3 ${hit ? 'border-[#ff4d6d]/40 bg-[#ff4d6d]/[0.07]' : 'border-white/10 bg-white/[0.03]'}`}>
      {hit && <motion.span aria-hidden className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#ff4d6d]/15 to-transparent" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }} />}
      <span className="relative shrink-0 font-mono text-[9px] font-black tracking-[0.2em] text-white/35"><Hand size={15} className="sm:hidden" /><span className="hidden sm:inline">{t.dealer}</span></span>
      <AnimatePresence mode="wait"><motion.p key={who} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="relative min-w-0 flex-1 truncate text-sm font-bold text-white/75">{room.ai[seat] ? 'AI' : hit ? <HitStayText text={who} /> : who}</motion.p></AnimatePresence>
      <span className="flex gap-1">{[0, 1, 2].map((d) => <motion.i key={d} className="h-1.5 w-1.5 rounded-full bg-white/40" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }} />)}</span>
      {seconds !== null && <b className={`font-mono text-xs ${seconds <= 5 ? 'text-[#ff4d6d]' : 'text-white/45'}`}>{seconds}s</b>}
    </div>
  );
}

/* ------------------------------------------------------------------ the dealer's question */

function DealerAsk({ g, seat, t, seconds, warning, onHit, onStay, onPeek }: {
  g: HitStay; seat: number; t: HsCopy; seconds: number | null; warning: boolean; onHit: () => void; onStay: () => void; onPeek: () => void;
}) {
  const hand = g.hands[seat];
  const total = hsTotal(hand);
  const diff = g.limit - total;
  const ring = seconds !== null && g.turn === seat ? seconds : null;
  const word = (text: string, color: string, delay: number) => (
    <span className="inline-flex">{text.split('').map((ch, i) => (
      <motion.span key={i} initial={{ y: -40, opacity: 0, rotateX: 90 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} transition={{ delay: delay + i * 0.05, type: 'spring', stiffness: 420, damping: 20 }} style={{ color }}>{ch}</motion.span>
    ))}</span>
  );
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.18 } }} className="fixed inset-0 z-50 flex flex-col bg-[#05060c]/88 backdrop-blur-[3px]">
      {/* Spotlight */}
      <motion.div aria-hidden className="pointer-events-none absolute left-1/2 top-[-20%] h-[90vh] w-[120vw] max-w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,77,109,.22),rgba(111,125,255,.12)_40%,transparent_70%)]" animate={{ opacity: [0.65, 1, 0.65] }} transition={{ duration: 1.6, repeat: Infinity }} />
      <div className="relative mx-auto flex w-full max-w-[520px] flex-1 flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-[calc(env(safe-area-inset-top)+28px)]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-black tracking-[0.3em] text-white/40">{t.dealer} · {t.round(g.round)}</span>
          <button type="button" onClick={onPeek} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-black text-white/65"><EyeOff size={12} />{t.peek}</button>
        </div>

        <div className="mt-[6vh] text-center" style={{ perspective: 600 }}>
          <p className="whitespace-nowrap font-black leading-[0.95] tracking-[-0.04em]" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 'clamp(44px, 14vw, 88px)' }}>
            {word('HIT', HS_HIT, 0.1)}<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mx-2 align-middle text-[0.32em] italic text-white/45">or</motion.span>{word('STAY', '#dfe4ff', 0.45)}<motion.span initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="text-white/60">?</motion.span>
          </p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-3 text-[12px] font-bold text-white/45">{t.extraPublic} · {t.deck} {g.deck.length}</motion.p>
        </div>

        <div className="mt-auto">
          <div className="relative mx-auto mb-5 grid h-[118px] w-[118px] place-items-center">
            {ring !== null && (
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" />
                <motion.circle cx="50" cy="50" r="46" fill="none" stroke={ring <= 5 ? HS_HIT : '#6f7dff'} strokeWidth="5" strokeLinecap="round" strokeDasharray={289} animate={{ strokeDashoffset: 289 * (1 - Math.min(1, ring / HS_TURN_SEC)) }} />
              </svg>
            )}
            <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: diff <= 2 ? 0.55 : 0.9, repeat: Infinity }} className="text-center">
              <p className="text-[9px] font-black tracking-[0.18em] text-white/40">{t.myTotal}</p>
              <p className="font-mono leading-none"><b className={`text-[40px] font-black ${diff < 0 ? 'text-[#ff4d6d]' : diff === 0 ? 'text-[#ffd36b]' : 'text-white'}`}>{total}</b><span className="text-base font-black text-white/35">/{g.limit}</span></p>
              {ring !== null && <p className={`mt-0.5 font-mono text-[11px] font-black ${ring <= 5 ? 'text-[#ff4d6d]' : 'text-white/50'}`}>{t.secondsLeft(ring)}</p>}
            </motion.div>
          </div>
          <div className="mb-5 flex justify-center gap-1.5">{hand.map((c, i) => <HsCard key={i} value={c} size="md" delay={0.15 + i * 0.05} />)}</div>
          <AnimatePresence>{warning && seconds !== null && <IdleWarning key="warn" seconds={seconds} t={t} />}</AnimatePresence>
          <p className={`mb-4 text-center text-xs font-bold ${diff < 0 ? 'text-[#ff7a8f]' : diff === 0 ? 'text-[#ffd36b]' : 'text-white/55'}`}>{diff < 0 ? t.over(-diff) : diff === 0 ? t.exact : t.toLimit(diff)}</p>
          <div className="grid grid-cols-2 gap-3">
            <motion.button type="button" onClick={onStay} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }} whileTap={{ scale: 0.96 }} className="flex h-[84px] flex-col items-center justify-center rounded-[16px] border-2 border-[#b9c3ff]/50 bg-[linear-gradient(180deg,#232a66,#141842)]">
              <span className="font-mono text-2xl font-black tracking-[0.16em] text-[#e4e8ff]">STAY</span><span className="mt-0.5 text-[11px] font-bold text-white/50">{t.staySub}</span>
            </motion.button>
            <motion.button type="button" onClick={onHit} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1, boxShadow: ['0 0 18px rgba(255,77,109,.35)', '0 0 38px rgba(255,77,109,.7)', '0 0 18px rgba(255,77,109,.35)'] }} transition={{ delay: 0.65, boxShadow: { duration: 1.2, repeat: Infinity } }} whileTap={{ scale: 0.96 }} className="flex h-[84px] flex-col items-center justify-center rounded-[16px] bg-[linear-gradient(180deg,#ff5b78,#d92d50)]">
              <span className="font-mono text-2xl font-black tracking-[0.16em] text-white">HIT</span><span className="mt-0.5 text-[11px] font-bold text-white/80">{t.hitSub}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Rooms: "choose now or the AI takes over", in the last seconds of a turn. */
function IdleWarning({ seconds, t }: { seconds: number; t: HsCopy }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" role="alert">
      <motion.p animate={{ backgroundColor: ['rgba(255,181,71,.10)', 'rgba(255,181,71,.24)', 'rgba(255,181,71,.10)'] }} transition={{ duration: 1, repeat: Infinity }}
        className="mb-2 flex items-center gap-2 rounded-[10px] border border-[#ffb547]/60 px-3 py-2 text-xs font-black text-[#ffd79a]">
        <Bot size={15} className="shrink-0 text-[#ffb547]" /><span className="min-w-0 flex-1 break-keep">{t.idleWarn(seconds)}</span><b className="font-mono text-base text-[#ffb547]">{seconds}</b>
      </motion.p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ showdown */

function ShowdownSheet({ g, t, nameOf, mySeat }: { g: HitStay; t: HsCopy; nameOf: (s: number) => string; mySeat: number | null }) {
  const sd = g.showdown!;
  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} className="fixed inset-x-0 bottom-0 z-[45] px-3 pb-[calc(env(safe-area-inset-bottom)+74px)]">
      <div className="mx-auto max-w-[560px] rounded-[16px] border border-[#ffd36b]/30 bg-[#121217]/97 p-4 shadow-[0_-20px_60px_rgba(0,0,0,.6)] backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-black tracking-[0.2em] text-[#ffd36b]">{t.roundResult(g.round)} · {t.limit} {g.limit}</p>
          <HsChip n={sd.pot} className="text-sm text-[#ffd36b]" />
        </div>
        <p className="mt-1 text-lg font-black text-white">{sd.winners.map(nameOf).join(' · ')} <span className="text-[#ffd36b]">{sd.winners.length > 1 ? t.split : t.winner}</span></p>
        {sd.byFold ? <p className="mt-1 text-xs font-bold text-white/45">{t.byFold}</p> : (
          <ul className="mt-3 space-y-1.5">
            {sd.entries.map((e, i) => {
              const won = sd.winners.includes(e.seat);
              return (
                <motion.li key={e.seat} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${won ? 'bg-[#ffd36b]/10' : 'bg-white/[0.03]'}`}>
                  <span className={`w-4 font-mono text-xs font-black ${won ? 'text-[#ffd36b]' : 'text-white/35'}`}>{i + 1}</span>
                  <span className={`w-16 truncate text-xs font-black ${e.seat === mySeat ? 'text-(--accent)' : 'text-white'}`}>{nameOf(e.seat)}</span>
                  <span className="flex min-w-0 flex-1 gap-[2px] overflow-hidden">{g.hands[e.seat].map((c, k) => <HsCard key={k} value={c} size="xs" />)}</span>
                  <span className={`font-mono text-sm font-black ${e.bust ? 'text-[#ff7a8f]' : 'text-white'}`}>{e.total}</span>
                  <span className="w-10 text-right text-[10px] font-bold text-white/40">{e.bust ? t.bust : t.cardsN(e.count)}</span>
                  {sd.payouts[e.seat] > 0 && <span className="font-mono text-xs font-black text-[#ffd36b]">+{sd.payouts[e.seat]}</span>}
                </motion.li>
              );
            })}
          </ul>
        )}
        {sd.out.map((s) => <p key={s} className="mt-2 rounded-md border border-[#ff4d6d]/30 bg-[#ff4d6d]/10 px-2 py-1.5 text-xs font-black text-[#ff8fa3]">{t.knockedOut(nameOf(s), g.place[s] ?? 0, sd.out.length > 1)}</p>)}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ log */

function LogList({ g, t, nameOf }: { g: HitStay; t: HsCopy; nameOf: (s: number) => string }) {
  const line = (e: HsEvent) => {
    switch (e.k) {
      case 'round': return t.logRound(e.round, nameOf(e.first), e.limit, e.ante, e.ante < hsAnte(e.round));
      case 'open': return t.logOpen(nameOf(e.seat), e.card);
      case 'check': return t.logCheck(nameOf(e.seat));
      case 'call': return t.logCall(nameOf(e.seat), e.to);
      case 'raise': return t.logRaise(nameOf(e.seat), e.to);
      case 'fold': return t.logFold(nameOf(e.seat));
      case 'hit': return t.logHit(nameOf(e.seat), e.card);
      case 'stay': return t.logStay(nameOf(e.seat));
      case 'win': return t.logWin(e.seats.map(nameOf).join(', '), e.pot, e.split);
      case 'out': return t.logOut(nameOf(e.seat), e.place);
    }
  };
  return (
    <>
      <p className={PANEL_TITLE}>{t.log}</p>
      <div className="mt-3 max-h-[220px] space-y-1.5 overflow-y-auto lg:max-h-[360px]">
        {g.log.slice(0, 24).map((e, i) => (
          <p key={`${g.seq}-${i}`} className={`flex gap-2 text-[11px] leading-relaxed ${e.k === 'round' ? 'mt-2 font-black text-(--accent)' : e.k === 'win' ? 'font-bold text-[#ffd36b]' : e.k === 'out' ? 'font-bold text-[#ff8fa3]' : 'text-white/55'}`}>
            <i className={i === 0 ? DIAMOND : 'mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-white/15'} />{line(e)}
          </p>
        ))}
      </div>
    </>
  );
}
