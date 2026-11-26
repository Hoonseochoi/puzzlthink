"use client";

// 바둑알 경매: what each auction puts up for sale, and how players and their winnings look. The stones are drawn in
// the site's own 바둑알 style (the glossy disc with two eyes, src/components/StoneAvatar.tsx); people sit as their
// profile stone, the AI as a stone in its persona colour, as in 스나이퍼 홀덤. Purely visual: the rules are the
// broadcast's, a won stone is the victory token.
import { useEffect, useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TA_COUNTDOWN_MS } from '@/lib/timeAuction';
import { TA_PERSONA } from '@/lib/timeAuctionAi';
import type { TaRoom } from '@/lib/timeAuctionRoom';
import { useMyNickname } from '../PieceStone';
import { Stone } from '../StoneAvatar';

type Tone = { hi: string; mid: string; lo: string; rim: string; eye: string };
export type Lot = { id: string; ko: string; en: string; tone: Tone; gold?: boolean };

// The site's stone colours (StoneAvatar TONES), in the order the auctions put them up; the last auction is gold.
const LOTS: Lot[] = [
  { id: 'black', ko: '흑돌', en: 'black stone', tone: { hi: '#5a5d66', mid: '#1d1f25', lo: '#050507', rim: '#000000', eye: '#ffffff' } },
  { id: 'white', ko: '백돌', en: 'white stone', tone: { hi: '#ffffff', mid: '#eceae4', lo: '#b9b5aa', rim: '#9b978c', eye: '#17201e' } },
  { id: 'red', ko: '빨간 바둑알', en: 'red stone', tone: { hi: '#ff9a8a', mid: '#ff5b45', lo: '#b8291a', rim: '#8f1f12', eye: '#ffffff' } },
  { id: 'blue', ko: '파란 바둑알', en: 'blue stone', tone: { hi: '#9cc7ff', mid: '#3f8cff', lo: '#1b54b8', rim: '#143f8c', eye: '#ffffff' } },
  { id: 'yellow', ko: '노란 바둑알', en: 'yellow stone', tone: { hi: '#fff0a0', mid: '#ffd23f', lo: '#c99a08', rim: '#9c7705', eye: '#17201e' } },
  { id: 'green', ko: '초록 바둑알', en: 'green stone', tone: { hi: '#a8f0b4', mid: '#3fcf6a', lo: '#1c8a3d', rim: '#156a2e', eye: '#ffffff' } },
  { id: 'purple', ko: '보라 바둑알', en: 'purple stone', tone: { hi: '#c9b0ff', mid: '#8b5cf6', lo: '#5326b8', rim: '#3f1c8c', eye: '#ffffff' } },
  { id: 'orange', ko: '주황 바둑알', en: 'orange stone', tone: { hi: '#ffc58a', mid: '#ff8a2b', lo: '#b9560c', rim: '#8e4208', eye: '#ffffff' } },
  { id: 'teal', ko: '청록 바둑알', en: 'teal stone', tone: { hi: '#9cf2ea', mid: '#21c2b5', lo: '#0d7d74', rim: '#0a5f58', eye: '#ffffff' } },
  { id: 'pink', ko: '분홍 바둑알', en: 'pink stone', tone: { hi: '#ffb3dc', mid: '#f05aa8', lo: '#b0216b', rim: '#861851', eye: '#ffffff' } },
  { id: 'brown', ko: '갈색 바둑알', en: 'brown stone', tone: { hi: '#d7c2a4', mid: '#a47b4f', lo: '#64431f', rim: '#4b3116', eye: '#ffffff' } },
  { id: 'slate', ko: '회색 바둑알', en: 'slate stone', tone: { hi: '#cfd8e3', mid: '#7f8ea3', lo: '#4a5668', rim: '#36404f', eye: '#ffffff' } },
];
const GOLD: Lot = { id: 'gold', ko: '황금 바둑알', en: 'gold stone', gold: true, tone: { hi: '#fff3b8', mid: '#e8b730', lo: '#9c6c0a', rim: '#7d5306', eye: '#3b2604' } };

/** The stone auction `round` puts up (1-based); the last auction of a match is always the gold one. */
export const lotFor = (round: number, rounds: number): Lot => (round === rounds ? GOLD : LOTS[(round - 1) % LOTS.length]);
export const lotName = (lot: Lot, en: boolean) => (en ? lot.en : lot.ko);

/** One auctioned stone. `dim`: a stone nobody won (void or no bids). */
export function LotStone({ lot, size, dim = false, label }: { lot: Lot; size: number; dim?: boolean; label?: string }) {
  const id = useId().replace(/:/g, '');
  const t = lot.tone;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`block shrink-0 overflow-visible ${dim ? 'opacity-35 grayscale' : ''}`} role="img" aria-label={label ?? lot.ko}>
      <defs>
        <radialGradient id={`lot-${id}`} cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor={t.hi} /><stop offset="55%" stopColor={t.mid} /><stop offset="100%" stopColor={t.lo} /></radialGradient>
      </defs>
      {lot.gold && <circle cx="50" cy="50" r="51" fill="none" stroke="#f2c53d" strokeOpacity=".45" strokeWidth="4" />}
      <circle cx="50" cy="53" r="46" fill="rgba(0,0,0,.25)" />
      <circle cx="50" cy="50" r="46" fill={`url(#lot-${id})`} stroke={t.rim} strokeWidth="2" />
      <ellipse cx="36" cy="28" rx="12" ry="5.5" fill="#fff" opacity=".35" transform="rotate(-28 36 28)" />
      <rect x="34.8" y="33.9" width="9.2" height="17" rx="4.6" fill={t.eye} />
      <rect x="56" y="33.9" width="9.2" height="17" rx="4.6" fill={t.eye} />
      {lot.gold && <path d="M82 12 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#fff3b8" stroke="#c99a08" strokeWidth="1.2" />}
    </svg>
  );
}

/** The minus stone: a dark stone with a red minus, for the shortest bid of an auction (house rule). */
export function MinusStone({ size, label = '마이너스 바둑알' }: { size: number; label?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={label}>
      <defs><radialGradient id={`mn-${id}`} cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor="#4a2326" /><stop offset="55%" stopColor="#1a0b0c" /><stop offset="100%" stopColor="#050203" /></radialGradient></defs>
      <circle cx="50" cy="53" r="46" fill="rgba(0,0,0,.25)" />
      <circle cx="50" cy="50" r="46" fill={`url(#mn-${id})`} stroke="#ff3b30" strokeWidth="3" />
      <rect x="27" y="44" width="46" height="12" rx="6" fill="#ff3b30" />
    </svg>
  );
}

/** Lighter / darker shade of a #rrggbb colour (t > 0 towards white, t < 0 towards black). */
function shade(hex: string, t: number) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const m = c.map((v) => Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t)));
  return `#${m.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** An AI player's stone in its persona colour. */
function PersonaStone({ color, size, label }: { color: string; size: number; label: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={label}>
      <defs><radialGradient id={`tp-${id}`} cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor={shade(color, 0.45)} /><stop offset="55%" stopColor={color} /><stop offset="100%" stopColor={shade(color, -0.45)} /></radialGradient></defs>
      <circle cx="50" cy="53" r="46" fill="rgba(0,0,0,.22)" />
      <circle cx="50" cy="50" r="46" fill={`url(#tp-${id})`} stroke={shade(color, -0.6)} strokeWidth="2" />
      <rect x="34.8" y="33.9" width="9.2" height="17" rx="4.6" fill="#fff" />
      <rect x="56" y="33.9" width="9.2" height="17" rx="4.6" fill="#fff" />
    </svg>
  );
}

/** A seat: people as their own profile stone (looked up by nickname), the AI as its persona stone. */
export function SeatStone({ room, seat, mySeat, size, label }: { room: TaRoom; seat: number; mySeat: number | null; size: number; label: string }) {
  const myNick = useMyNickname();
  const style = room.style[seat];
  if (room.ai[seat] && style && !room.away?.[seat]) return <PersonaStone color={TA_PERSONA[style].color} size={size} label={label} />;
  const name = (seat === mySeat && myNick) || room.seats[seat]?.name || label;
  return <Stone name={name} size={size} />;
}

/** The stones a seat has won, in order, with empty dents up to the safe line. */
export function Tray({ room, seat, size = 18, safe = 0, en }: { room: TaRoom; seat: number; size?: number; safe?: number; en: boolean }) {
  const won = room.game.log.filter((r) => r.outcome === 'won' && r.winner === seat);
  const minus = room.game.log.filter((r) => r.minus === seat);
  const empty = Math.max(0, safe - won.length);
  return (
    <span className="flex flex-wrap items-center gap-0.5 rounded-full bg-black/40 px-1.5 py-1 shadow-[inset_0_1px_3px_rgba(0,0,0,.6)]">
      {won.map((r) => <LotStone key={r.round} lot={lotFor(r.round, room.game.rounds)} size={size} label={lotName(lotFor(r.round, room.game.rounds), en)} />)}
      {minus.map((r) => <MinusStone key={`m${r.round}`} size={size} label={en ? 'minus stone' : '마이너스 바둑알'} />)}
      {Array.from({ length: empty }, (_, i) => <i key={`e${i}`} className="block rounded-full border border-dashed border-white/15" style={{ width: size - 2, height: size - 2, margin: 1 }} />)}
    </span>
  );
}

/**
 * The lit auction block: this auction's stone on its pedestal. When the board stops, the winner's stone appears
 * beside it with 낙찰 (or the lot greys out for a void / no bids).
 */
export function AuctionBlock({ room, mySeat, en, winnerLabel, minusLabel, outcomeLabel }: {
  room: TaRoom; mySeat: number | null; en: boolean; winnerLabel: string | null; minusLabel: string | null; outcomeLabel: string;
}) {
  const g = room.game;
  const reduced = useReducedMotion() ?? false;
  const shown = g.phase === 'reveal' || g.phase === 'finished' ? g.log[g.log.length - 1] : null;
  const round = shown?.round ?? g.round;
  const lot = lotFor(round, g.rounds);
  const won = shown?.outcome === 'won' ? shown.winner : null;
  const minus = shown?.minus ?? null;
  const dim = !!shown && won === null;
  return (
    <div className="relative flex h-[118px] items-end justify-center overflow-hidden sm:h-[150px]" aria-live="polite">
      {/* spotlight and pedestal */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_38%_70%_at_50%_0%,rgba(255,240,210,.20),transparent_70%)]" />
      <div aria-hidden className="absolute bottom-1 h-5 w-[150px] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_40%,#3a2a20,#120c09_70%)] shadow-[0_6px_18px_rgba(0,0,0,.7)] sm:w-[180px]" />
      <motion.div key={`${g.gid}-${round}`} className="relative mb-3"
        initial={reduced ? false : { y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1, scale: won !== null ? 0.88 : 1 }} transition={{ duration: reduced ? 0 : 0.45, ease: 'easeOut' }}>
        <div className={won === null && !dim ? 'drop-shadow-[0_0_22px_rgba(255,230,170,.35)]' : ''}>
          <LotStone lot={lot} size={70} dim={dim} label={lotName(lot, en)} />
        </div>
      </motion.div>
      {won !== null && (
        <motion.div className="absolute bottom-2 left-1/2 ml-[46px] flex items-center gap-1.5 sm:ml-[56px]"
          initial={reduced ? false : { x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.15 }}>
          <SeatStone room={room} seat={won} mySeat={mySeat} size={34} label={winnerLabel ?? ''} />
          <span className="rounded-sm bg-(--accent) px-1.5 py-0.5 text-[11px] font-black text-white shadow-[0_0_14px_var(--accent-glow)]">{en ? 'SOLD' : '낙찰'}</span>
        </motion.div>
      )}
      {minus !== null && (
        <motion.div className="absolute bottom-2 right-1/2 mr-[46px] flex items-center gap-1.5 sm:mr-[56px]"
          initial={reduced ? false : { x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.25 }}>
          <span className="rounded-sm border border-[#ff3b30]/70 bg-black/70 px-1.5 py-0.5 text-[11px] font-black text-[#ff7b72]">−1</span>
          <span className="relative"><SeatStone room={room} seat={minus} mySeat={mySeat} size={30} label={minusLabel ?? ''} /><span className="absolute -bottom-1 -right-1"><MinusStone size={16} /></span></span>
        </motion.div>
      )}
      <p className="absolute left-3 top-2 max-w-[45%] text-left text-[11px] font-bold leading-tight text-white/55">{outcomeLabel}</p>
    </div>
  );
}

/**
 * The ring around the hold button. It never shows the player's remaining time (hidden by the rules): it drains
 * over the 5-second countdown, then sweeps once every ten seconds like a stopwatch hand while the button is held.
 */
export function HoldRing({ cdEnd, holding }: { cdEnd: number | null; holding: boolean }) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (cdEnd === null) return;
    let frame = 0;
    const loop = () => { setNow(performance.now()); frame = requestAnimationFrame(loop); };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [cdEnd]);
  const r = 46, c = 2 * Math.PI * r;
  let frac = 1;
  let color = 'rgba(255,255,255,.12)';
  if (cdEnd !== null && now) {
    const left = cdEnd - now;
    if (left > 0) { frac = Math.min(1, left / TA_COUNTDOWN_MS); color = '#ffd166'; }
    else if (holding) { frac = ((now - cdEnd) % 10_000) / 10_000; color = '#ffffff'; }
    else frac = 0;
  }
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute -inset-[14px] -rotate-90" style={{ width: 'calc(100% + 28px)', height: 'calc(100% + 28px)' }} aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="3" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} />
    </svg>
  );
}
