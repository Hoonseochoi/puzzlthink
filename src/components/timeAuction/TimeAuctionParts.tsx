"use client";

// 바둑알 경매: what each auction puts up for sale, and how players and their winnings look. The stones are drawn in
// the site's own 바둑알 style (the glossy disc with two eyes, src/components/StoneAvatar.tsx); people sit as their
// profile stone, the AI as a stone in its persona colour, as in 스나이퍼 홀덤. Purely visual: the rules are the
// broadcast's, a won stone is the victory token.
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TA_COUNTDOWN_MS, taLotValue } from '@/lib/timeAuction';
import { TA_PERSONA } from '@/lib/timeAuctionAi';
import type { TaRoom } from '@/lib/timeAuctionRoom';
import { useMyNickname } from '../PieceStone';
import { Stone } from '../StoneAvatar';

/** One auctioned piece: a real profile icon id (drawn by the site's own renderer) with its name and point value. */
export type Lot = { id: string; ko: string; en: string; value: number };

/**
 * The pieces each auction can put up, by value (taLotValue). They are the site's own profile icons, named as the
 * icon collection names them; winning one is only points in this game — the icon itself is never granted.
 * - 3 points (the last auction): the most coveted — 오픈 대전 1위, 플레이 100시간, 피스 2W 1위, HIDDEN MISSION TOP 10,
 *   시간 경매 1위 (this game's crown), 131072.
 * - 2 points (every third auction): mid-tier badges — 플레이 50·30시간, 오픈 대전 승리, 친구 대전 승리,
 *   시간 경매 어려움 클리어, 오픈 대전 3위, 8192.
 * - 1 point: the starter pieces — the four basic colours, 플레이 10·20시간, 2048.
 * Minus stones are the 블랙피스 헬모드 pieces (인페르노, 블러드 문, 잿불).
 */
const TIERS: Record<1 | 2 | 3, Lot[]> = {
  3: [
    { id: 'o-1', ko: '오픈대전 1위', en: 'Open match #1', value: 3 },
    { id: 't100', ko: '플레이 100시간', en: '100 hours played', value: 3 },
    { id: 'w2-1', ko: '피스 2W 1위', en: 'Piece week 2 #1', value: 3 },
    { id: 'hm-rank', ko: 'HIDDEN MISSION · TOP 10', en: 'HIDDEN MISSION · TOP 10', value: 3 },
    { id: 'c-time_auction', ko: '시간 경매 1위', en: 'Time Auction #1', value: 3 },
    { id: 'm131072', ko: '131072 달성', en: 'Reached 131072', value: 3 },
  ],
  2: [
    { id: 't50', ko: '플레이 50시간', en: '50 hours played', value: 2 },
    { id: 'ow', ko: '오픈 대전 승리', en: 'Open match win', value: 2 },
    { id: 'x-time_auction', ko: '시간 경매 어려움 클리어', en: 'Time Auction Hard clear', value: 2 },
    { id: 't30', ko: '플레이 30시간', en: '30 hours played', value: 2 },
    { id: 'fw', ko: '친구 대전 승리', en: 'Friend match win', value: 2 },
    { id: 'o-3', ko: '오픈대전 3위', en: 'Open match #3', value: 2 },
    { id: 'm8192', ko: '8192 달성', en: 'Reached 8192', value: 2 },
  ],
  1: [
    { id: 'black', ko: '흑돌', en: 'Black stone', value: 1 },
    { id: 'white', ko: '백돌', en: 'White stone', value: 1 },
    { id: 'red', ko: '빨간 돌', en: 'Red stone', value: 1 },
    { id: 'blue', ko: '파란 돌', en: 'Blue stone', value: 1 },
    { id: 't10', ko: '플레이 10시간', en: '10 hours played', value: 1 },
    { id: 't20', ko: '플레이 20시간', en: '20 hours played', value: 1 },
    { id: 'm2048', ko: '2048 달성', en: 'Reached 2048', value: 1 },
  ],
};
const HELL: Lot[] = [
  { id: 'h1-1', ko: '인페르노', en: 'Inferno', value: -1 },
  { id: 'h1-2', ko: '블러드 문', en: 'Blood Moon', value: -1 },
  { id: 'h1-3', ko: '잿불', en: 'Ember', value: -1 },
];

const hash = (text: string) => { let h = 2166136261; for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619); return h >>> 0; };

/**
 * The piece auction `round` (1-based) puts up: its tier comes from its value (taLotValue: the last 3, every third
 * 2, else 1); which piece of the tier depends on the match (`gid`), so every browser in a room sees the same.
 */
export function lotFor(round: number, rounds: number, gid = ''): Lot {
  const tier = TIERS[taLotValue(round, rounds) as 1 | 2 | 3];
  return tier[(hash(gid) + round * 7) % tier.length];
}
/** The 헬모드 piece a minus stone of auction `round` shows. */
export const minusLot = (round: number, gid = ''): Lot => HELL[(hash(gid) + round) % HELL.length];
export const lotName = (lot: Lot, en: boolean) => `${en ? lot.en : lot.ko} (${lot.value > 0 ? '+' : ''}${lot.value}${en ? '' : '점'})`;

/** One auctioned piece, drawn exactly like the profile icon. `dim`: a piece nobody won (void or no bids). */
export function LotStone({ lot, size, dim = false, label }: { lot: Lot; size: number; dim?: boolean; label?: string }) {
  return (
    <span className={`inline-flex shrink-0 ${dim ? 'opacity-35 grayscale' : ''}`} title={label ?? lot.ko}>
      <Stone name={label ?? lot.ko} size={size} icon={lot.id} cover={false} />
    </span>
  );
}

/**
 * The minus stone: the site's 헬모드 stone (ProfileIcons' HellStone, the 매우 어려움 weekly #1 look) with a −1 tag,
 * for the shortest bid of an auction (house rule).
 */
export function MinusStone({ size, label = '마이너스 바둑알', lot = HELL[0] }: { size: number; label?: string; lot?: Lot }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }} title={label}>
      <Stone name={label} size={size} icon={lot.id} cover={false} />
      {size >= 14 && <span className="absolute -bottom-0.5 -right-1 rounded-sm bg-[#ff3b30] px-[2px] font-mono font-black leading-none text-white" style={{ fontSize: Math.max(7, size * 0.36) }}>−1</span>}
    </span>
  );
}

/** A seat: people as their own profile stone (looked up by nickname), the AI as its character's icon face. */
export function SeatStone({ room, seat, mySeat, size, label }: { room: TaRoom; seat: number; mySeat: number | null; size: number; label: string }) {
  const myNick = useMyNickname();
  const style = room.style[seat];
  if (room.ai[seat] && style && !room.away?.[seat]) return <Stone name={label} size={size} icon={TA_PERSONA[style].face} cover={false} />;
  const name = (seat === mySeat && myNick) || room.seats[seat]?.name || label;
  return <Stone name={name} size={size} />;
}

/**
 * What an AI says at the table after an auction, if anything: its win or minus line, said about four times in ten
 * (the same on every browser: decided from the match id, the auction and the seat).
 */
export function taTalk(room: TaRoom, seat: number, en: boolean): string | null {
  const g = room.game;
  const last = g.log[g.log.length - 1];
  const style = room.style[seat];
  if (!last || !room.ai[seat] || room.away?.[seat] || !style || (g.phase !== 'reveal' && g.phase !== 'finished')) return null;
  const event = last.outcome === 'won' && last.winner === seat ? 'win' : last.minus === seat ? 'minus' : null;
  if (!event || (hash(`${g.gid}:${last.round}:${seat}`) % 10) >= 4) return null;
  const line = TA_PERSONA[style][event];
  return en ? line.en : line.ko;
}

/** The stones a seat has won, in order, with empty dents up to the safe line. */
export function Tray({ room, seat, size = 18, safe = 0, en }: { room: TaRoom; seat: number; size?: number; safe?: number; en: boolean }) {
  const won = room.game.log.filter((r) => r.outcome === 'won' && r.winner === seat);
  const minus = room.game.log.filter((r) => r.minus === seat);
  const empty = Math.max(0, safe - won.length);
  return (
    <span className="flex flex-wrap items-center gap-0.5 rounded-full bg-black/40 px-1.5 py-1 shadow-[inset_0_1px_3px_rgba(0,0,0,.6)]">
      {won.map((r) => <LotStone key={r.round} lot={lotFor(r.round, room.game.rounds, room.game.gid)} size={size} label={lotName(lotFor(r.round, room.game.rounds, room.game.gid), en)} />)}
      {minus.map((r) => <MinusStone key={`m${r.round}`} lot={minusLot(r.round, room.game.gid)} size={size} label={en ? 'minus stone' : '마이너스 바둑알'} />)}
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
  const lot = lotFor(round, g.rounds, g.gid);
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
        <span className={`absolute -right-3 -top-1 rounded-full px-1.5 py-0.5 font-mono text-[11px] font-black shadow ${lot.value === 3 ? 'bg-[#f2c53d] text-black' : lot.value === 2 ? 'bg-[#dfe3ea] text-black' : 'bg-white/15 text-white'}`}>+{lot.value}{en ? '' : '점'}</span>
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
          <span className="relative"><SeatStone room={room} seat={minus} mySeat={mySeat} size={30} label={minusLabel ?? ''} /><span className="absolute -bottom-1 -right-1"><MinusStone size={16} lot={minusLot(round, g.gid)} /></span></span>
        </motion.div>
      )}
      <Schedule rounds={g.rounds} current={round} en={en} gid={g.gid} />
      <p className="absolute left-3 top-2 max-w-[45%] text-left text-[11px] font-bold leading-tight text-white/55">{outcomeLabel}</p>
    </div>
  );
}

/** Every auction's stone in order, public from the start: past ones dimmed, the current one ringed. */
export function Schedule({ rounds, current, en, gid }: { rounds: number; current: number; en: boolean; gid: string }) {
  const size = rounds > 13 ? 9 : 11;
  return (
    <div className="absolute right-2 top-2 flex max-w-[52%] flex-wrap justify-end gap-[3px]" aria-label={en ? 'Stones still to come' : '경매 순서'}>
      {Array.from({ length: rounds }, (_, i) => {
        const r = i + 1, lot = lotFor(r, rounds, gid);
        return (
          <span key={r} className={`rounded-full ${r === current ? 'ring-2 ring-(--accent) ring-offset-1 ring-offset-black' : ''} ${r < current ? 'opacity-30' : ''}`}>
            <LotStone lot={lot} size={size} label={`${r} · ${lotName(lot, en)}`} />
          </span>
        );
      })}
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
