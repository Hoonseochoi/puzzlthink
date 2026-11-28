"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, Sparkles, Zap } from 'lucide-react';
import {
  FLIP_CHARGES, SIZE, canFlip, coordinateLabel, flipsFor, forbiddenPoints, isFlipped, isForbidden, other, owner,
  type Board, type Cell, type Charges, type FlipMove, type Line, type Player, voidFive,
} from '@/lib/flipOmok';
import PieceStone, { usePieceOwner } from '../PieceStone';

export const FLIP_ACCENT = '#67e8ff';
export const FLIP_INK = '#06202a';
const GOLD = '#ffd76b';
/** Player colours: two neon characters. */
export const STONE_HEX: Record<Player, string> = { 1: '#ff4d6d', 2: '#3fb8ff' };

// Indexed by player (1, 2).
const FACE_COLORS = [undefined, STONE_HEX[1], STONE_HEX[2]];

const MARGIN = 4.2;
const pos = (v: number) => MARGIN + v * ((100 - MARGIN * 2) / (SIZE - 1));
const STARS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];

/**
 * One face of a character stone: glossy colour body with two eyes (squinting while it is being flipped).
 * Eyes are white on a stone its owner placed, the other side's colour on a stone that was flipped over.
 */
function Face({ p, marked = false, dizzy = false, back = false }: { p: Player; marked?: boolean; dizzy?: boolean; back?: boolean }) {
  const hex = STONE_HEX[p];
  const eye = marked ? STONE_HEX[other(p)] : 'rgba(255,255,255,.95)';
  const mine = usePieceOwner(p);
  // A player's own 바둑알; a flipped-over stone keeps a dot of the other colour.
  // The glow sits on an inner span: a filter on the face itself stops backface-visibility from hiding it
  // mid-flip on some phones, so the character would show through the whole turn.
  // A flipped-over character keeps a ring and a dot of the other colour, top left (icons wear their own badge
  // bottom right).
  if (mine && !dizzy) return <span className={`absolute inset-0 [backface-visibility:hidden] ${back ? '[transform:rotateY(180deg)]' : ''}`}>
    <span className="absolute inset-0" style={{ filter: `drop-shadow(0 0 5px ${hex}88)` }}>
      <PieceStone seat={p} colors={FACE_COLORS} overlay={marked ? <>
        <span className="pointer-events-none absolute -inset-[4%] rounded-full border-[2px]" style={{ borderColor: STONE_HEX[other(p)], boxShadow: `0 0 6px ${STONE_HEX[other(p)]}` }} />
        <span className="absolute left-[2%] top-[2%] h-[28%] w-[28%] rounded-full border-[1.5px] border-white" style={{ background: STONE_HEX[other(p)] }} />
      </> : null}>{null}</PieceStone>
    </span>
  </span>;
  return <span className={`absolute inset-0 rounded-full border border-white/25 [backface-visibility:hidden] ${back ? '[transform:rotateY(180deg)]' : ''}`}
    style={{ background: `radial-gradient(circle at 34% 28%, color-mix(in srgb, ${hex} 55%, white) 0%, ${hex} 48%, color-mix(in srgb, ${hex} 60%, black) 100%)`, boxShadow: `0 4px 10px rgba(0,0,0,.6), 0 0 10px ${hex}88` }}>
    {dizzy ? <>
      <span className="absolute left-[24%] top-[34%] text-[0.5em] font-black leading-none" style={{ color: eye }}>&gt;</span>
      <span className="absolute right-[24%] top-[34%] text-[0.5em] font-black leading-none" style={{ color: eye }}>&lt;</span>
    </> : <>
      <span className="absolute left-[29%] top-[33%] h-[17%] w-[12%] rounded-full" style={{ background: eye, boxShadow: marked ? '0 0 0 1px rgba(255,255,255,.85)' : undefined }} />
      <span className="absolute right-[29%] top-[33%] h-[17%] w-[12%] rounded-full" style={{ background: eye, boxShadow: marked ? '0 0 0 1px rgba(255,255,255,.85)' : undefined }} />
    </>}
  </span>;
}

/** A stone; when `flip` is set it spins over from the opponent's colour to its own (after `delay` ms). */
export function Stone({ cell, latest = false, flip = false, delay = 0, loop = false }: { cell: Cell; latest?: boolean; flip?: boolean; delay?: number; loop?: boolean }) {
  const p = owner(cell) as Player;
  // cqw must be read inside the container (an element cannot query itself: it would fall back to the screen
  // width and blow the squinting eyes up across the board mid-flip).
  return <span className={`relative block h-full w-full [container-type:size] ${latest ? 'scale-110' : ''} transition-transform`}>
    <span className={`relative block h-full w-full [transform-style:preserve-3d] ${loop ? 'flip-omok-loop-turn' : flip ? 'flip-omok-turn' : ''}`} style={{ fontSize: '100cqw', ...(flip ? { animationDelay: `${delay}ms` } : {}) }}>
      <Face p={p} marked={isFlipped(cell)} />
      {(flip || loop) && <Face p={other(p)} dizzy back />}
    </span>
    {latest && <span className="pointer-events-none absolute -inset-[14%] rounded-full border-2 border-[#ffd76b] shadow-[0_0_10px_#ffd76b]" />}
  </span>;
}

/** Every point of a winning line, from start to end. */
function lineCells(line: Line): number[] {
  const r0 = Math.floor(line.start / SIZE), c0 = line.start % SIZE, r1 = Math.floor(line.end / SIZE), c1 = line.end % SIZE;
  const dr = Math.sign(r1 - r0), dc = Math.sign(c1 - c0), n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
  return Array.from({ length: n + 1 }, (_, i) => (r0 + dr * i) * SIZE + c0 + dc * i);
}

/** Small coloured dot for a player (scores, player rows). */
export function Dot({ p, size = 12 }: { p: Player; size?: number }) {
  return <i className="inline-block shrink-0 rounded-full" style={{ width: size, height: size, background: STONE_HEX[p], boxShadow: `0 0 6px ${STONE_HEX[p]}` }} />;
}

/** The 🔒 badge on a flipped stone: it is locked and can never flip again. */
export function LockBadge() {
  return <span className="pointer-events-none absolute -bottom-[14%] -right-[14%] z-[1] flex h-[52%] w-[52%] items-center justify-center rounded-full border border-[#ffd76b]/80 bg-[#14110a]" aria-hidden>
    <Lock className="h-[66%] w-[66%] text-[#ffd76b]" strokeWidth={3} />
  </span>;
}

/** A point the player has tapped where a 뒤집기 is on offer (or the stones COCO is about to flip): shown before it lands. */
export interface FlipPending { at: number; flips: number[]; who: Player }

/**
 * The neon 15×15 board. A tap on an empty point goes to `onTap`; `pending` shows a stone about to be placed with the
 * stones its 뒤집기 would turn (gold targets). The last move's flips spin over, with a jolt and a shockwave.
 */
export function FlipOmokBoard({ board, last, flipped, flipKey, win, pending = null, ghost, interactive, banned, onTap, overlay, callout }: {
  board: Board;
  last: number | null;
  flipped: number[]; // stones the last move flipped (they animate)
  flipKey: number; // changes every move, so the flip animation replays
  win: Line | null;
  pending?: FlipPending | null;
  ghost: Player; // whose stone a hover shows
  interactive: boolean;
  banned: Set<number>; // 쌍삼 points for the player to move
  onTap: (at: number) => void;
  overlay?: ReactNode;
  callout?: ReactNode;
}) {
  const t = useTranslations('FlipOmok');
  const [hover, setHover] = useState<number | null>(null);
  const flippedSet = new Set(flipped), winSet = new Set(win ? lineCells(win) : []), pendSet = new Set(pending?.flips ?? []);
  const shake = flipped.length > 0 && flipKey > 0;
  return <div key={shake ? `shake-${flipKey}` : 'still'} className={`relative mx-auto aspect-square w-full max-w-[700px] rounded-[10px] bg-gradient-to-br from-[#ff4d6d] via-[#26313f] to-[#3fb8ff] p-[3px] shadow-[0_24px_60px_rgba(0,0,0,.78),0_0_30px_rgba(63,184,255,.14)] ${shake ? 'flip-next-shake' : ''}`}>
    <div className="relative h-full w-full overflow-hidden rounded-[7px] border border-[#67e8ff]/20 bg-[#080c12] shadow-[inset_0_0_55px_rgba(0,0,0,.9),inset_0_0_24px_rgba(71,213,255,.08)]" style={{ backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(72,213,255,.09), transparent 50%), linear-gradient(145deg,#0c121a,#06080d)' }} onMouseLeave={() => setHover(null)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: SIZE }, (_, i) => <g key={i}>
          <line x1={pos(i)} y1={pos(0)} x2={pos(i)} y2={pos(SIZE - 1)} stroke="#67e8ff" strokeOpacity=".3" strokeWidth=".22" />
          <line x1={pos(0)} y1={pos(i)} x2={pos(SIZE - 1)} y2={pos(i)} stroke="#67e8ff" strokeOpacity=".3" strokeWidth=".22" />
        </g>)}
        {STARS.map(([r, c]) => <circle key={`${r}${c}`} cx={pos(c)} cy={pos(r)} r=".65" fill="#b8f6ff" style={{ filter: 'drop-shadow(0 0 1.2px #56ddff)' }} />)}
      </svg>
      {board.map((cell, at) => {
        const r = Math.floor(at / SIZE), c = at % SIZE;
        const canTap = interactive && !cell && !banned.has(at);
        const dist = last === null ? 0 : Math.max(Math.abs(r - Math.floor(last / SIZE)), Math.abs(c - (last % SIZE))) - 1;
        return (
          <button key={at} type="button" data-v={cell} disabled={!canTap} aria-label={coordinateLabel(at)} title={!cell && banned.has(at) && interactive ? t('banned') : undefined}
            onClick={() => onTap(at)} onMouseEnter={() => setHover(at)}
            className={`absolute z-10 h-[6.2%] w-[6.2%] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none [perspective:300px] ${canTap ? 'cursor-pointer' : ''}`}
            style={{ left: `${pos(c)}%`, top: `${pos(r)}%` }}>
            {cell ? <span className="relative block h-full w-full">
              {winSet.has(at) && <span className="end-reveal-pulse pointer-events-none absolute -inset-[10%] rounded-full" style={{ ['--reveal' as string]: STONE_HEX[win!.owner] }} />}
              {/* the key changes on a flip so the animation replays */}
              <Stone key={`${cell}-${flippedSet.has(at) ? flipKey : 0}`} cell={cell} latest={at === last} flip={flippedSet.has(at)} delay={120 + Math.max(0, dist) * 90} />
              {isFlipped(cell) && <LockBadge />}
              {pendSet.has(at) && <span className="flip-next-target pointer-events-none absolute -inset-[16%] z-[2] rounded-full border-2" style={{ borderColor: GOLD, boxShadow: `0 0 10px ${GOLD}, inset 0 0 8px ${STONE_HEX[pending!.who]}` }}>
                <span className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: STONE_HEX[pending!.who], boxShadow: `0 0 6px ${STONE_HEX[pending!.who]}` }} />
              </span>}
            </span>
              : pending?.at === at ? <span className="flip-next-ghost block h-full w-full rounded-full border-2 border-white/70" style={{ background: STONE_HEX[pending.who], boxShadow: `0 0 14px ${STONE_HEX[pending.who]}` }} />
                : banned.has(at) && interactive ? <svg viewBox="0 0 10 10" className="h-full w-full p-[22%]" aria-hidden><path d="M1 1L9 9M9 1L1 9" stroke="#ff4d6d" strokeOpacity=".75" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  : hover === at && canTap ? <span className="block h-full w-full rounded-full opacity-40 shadow-[0_0_12px_currentColor]" style={{ background: STONE_HEX[ghost], color: STONE_HEX[ghost] }} /> : null}
          </button>
        );
      })}
      {shake && last !== null && <span key={`wave-${flipKey}`} className="flip-next-wave pointer-events-none absolute z-20 aspect-square w-[40%] rounded-full border-[3px]"
        style={{ left: `${pos(last % SIZE)}%`, top: `${pos(Math.floor(last / SIZE))}%`, borderColor: GOLD }} />}
      {win && <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden><g className="flip-omok-win">
        <line x1={pos(win.start % SIZE)} y1={pos(Math.floor(win.start / SIZE))} x2={pos(win.end % SIZE)} y2={pos(Math.floor(win.end / SIZE))} stroke={STONE_HEX[win.owner]} strokeWidth="1.6" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 2px ${STONE_HEX[win.owner]})` }} />
        <line x1={pos(win.start % SIZE)} y1={pos(Math.floor(win.start / SIZE))} x2={pos(win.end % SIZE)} y2={pos(Math.floor(win.end / SIZE))} stroke="#fff" strokeWidth=".4" strokeLinecap="round" />
      </g></svg>}
      {callout}
      {overlay}
    </div>
  </div>;
}

/** Each player's 뒤집기 as 벽바둑 II shows its wall break: lit diamonds while left, dim once spent. */
export function ChargeDiamonds({ left, color, size = 9 }: { left: number; color: string; size?: number }) {
  return <span className="inline-flex items-center gap-[3px]" role="img" aria-label={`${left}/${FLIP_CHARGES}`}>
    {Array.from({ length: FLIP_CHARGES }, (_, i) => <i key={i} className="inline-block rotate-45 rounded-[1px] transition-all duration-300"
      style={{ width: size, height: size, background: i < left ? color : 'rgba(255,255,255,.14)', boxShadow: i < left ? `0 0 7px ${color}` : undefined }} />)}
  </span>;
}

/**
 * What the player to move can do at a point: a tap places at once, unless a 뒤집기 is on offer there; then the point is
 * held (`pending`) and the panel offers 놓기 (the default; tapping the same point again does it too) or 놓고 뒤집기.
 */
export function useFlipPicker({ board, turn, charges, active, onMove }: { board: Board; turn: Player; charges: Charges; active: boolean; onMove: (move: FlipMove) => void }) {
  const [pending, setPending] = useState<number | null>(null);
  const banned = useMemo(() => new Set(active ? forbiddenPoints(board, turn, charges) : []), [board, turn, charges, active]);
  const held = active && pending !== null && !board[pending] ? pending : null;
  const flips = held !== null && canFlip(board, held, turn, charges) ? flipsFor(board, held, turn) : [];
  const quietOk = held !== null && !isForbidden(board, held, turn, false);
  const flipOk = held !== null && flips.length > 0 && !isForbidden(board, held, turn, true);
  const tap = (at: number) => {
    if (!active || board[at] || banned.has(at)) return;
    if (held === at) { if (quietOk) { setPending(null); onMove({ at, flip: false }); } return; }
    if (canFlip(board, at, turn, charges)) { setPending(at); return; }
    setPending(null);
    onMove({ at, flip: false });
  };
  const choose = (flip: boolean) => { if (held === null) return; setPending(null); onMove({ at: held, flip }); };
  const cancel = () => setPending(null);
  return { banned, tap, choose, cancel, held, flips, quietOk, flipOk, preview: held !== null && flips.length ? { at: held, flips, who: turn } : null };
}

/** Under the board: the 뒤집기 panel (as 벽바둑 II's wall break), which turns into the 놓기 / 놓고 뒤집기 choice. */
export function FlipPanel({ picker, left, color, show = true }: { picker: ReturnType<typeof useFlipPicker>; left: number; color: string; show?: boolean }) {
  const t = useTranslations('FlipOmok');
  const quietRef = useRef<HTMLButtonElement>(null);
  const held = picker.held !== null && picker.flips.length > 0;
  useEffect(() => { if (held) quietRef.current?.focus({ preventScroll: true }); }, [held, picker.held]);
  if (!show) return null;
  if (held) return <div className="mx-auto mt-3 max-w-[680px] rounded-[12px] border border-[#ffd76b]/50 bg-black/60 p-2.5 shadow-[0_0_24px_rgba(255,215,107,.15)]">
    <p className="mb-2 flex items-center justify-between gap-2 px-1 text-[11px] font-bold text-white/60">
      <span>{t('chooseHint', { n: picker.flips.length })}</span>
      <button type="button" onClick={picker.cancel} className="rounded px-2 py-1 text-white/45 hover:text-white">{t('chooseCancel')}</button>
    </p>
    {/* Two wide buttons a thumb apart; the safe one (놓기) is on the left and focused. */}
    <div className="grid grid-cols-2 gap-3">
      <button ref={quietRef} type="button" disabled={!picker.quietOk} onClick={() => picker.choose(false)}
        className="min-h-[56px] rounded-[10px] border-2 border-white/70 bg-white/10 px-2 py-2.5 text-sm font-black text-white outline-none ring-(--accent) focus-visible:ring-2 disabled:opacity-30">
        {t('quiet')}<span className="mt-0.5 block text-[10px] font-bold text-white/50">{picker.quietOk ? t('quietSub') : t('banned')}</span>
      </button>
      <button type="button" disabled={!picker.flipOk} onClick={() => picker.choose(true)}
        className="min-h-[56px] rounded-[10px] px-2 py-2.5 text-sm font-black text-[#1a1200] shadow-[0_0_18px_rgba(255,215,107,.55)] disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${GOLD}, #ffb03b)` }}>
        <span className="inline-flex items-center gap-1"><Zap size={14} />{t('flipChoice', { n: picker.flips.length })}</span>
        <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-bold text-[#1a1200]/70">{picker.flipOk ? t('flipSub') : t('banned')} <ChargeDiamonds left={Math.max(0, left - 1)} color="#7a2a00" size={7} /></span>
      </button>
    </div>
  </div>;
  return <div className="mx-auto mt-3 flex max-w-[680px] items-center gap-3 rounded-[10px] border border-white/10 bg-black/40 p-3">
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#0b0b0e]">
      <Zap size={18} className={left ? 'text-[#ffd76b]' : 'text-white/20'} />
      <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0b0b0e] ${left ? 'bg-[#ffd76b] shadow-[0_0_8px_rgba(255,215,107,.9)]' : 'bg-white/20'}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-2 text-xs font-extrabold">{t('panelTitle')} <ChargeDiamonds left={left} color={color} /></p>
      <p className="text-[11px] leading-4 text-white/45">{left ? t('panelHint', { n: left }) : t('panelEmpty')}</p>
    </div>
  </div>;
}

// ---- the flip moment: a short thump-whoosh-ding, a buzz, and the 「뒤집기!」 call-out ----
type WebkitWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
const MUTE_KEY = 'puzzlthink_flip_omok_mute';
let audio: AudioContext | null = null;
export const flipSoundOn = () => { try { return localStorage.getItem(MUTE_KEY) !== '1'; } catch { return true; } };
export const setFlipSound = (on: boolean) => { try { localStorage.setItem(MUTE_KEY, on ? '0' : '1'); } catch { /* optional */ } };
function ctx() {
  if (typeof window === 'undefined' || !flipSoundOn()) return null;
  try { if (!navigator.userActivation?.hasBeenActive) return null; } catch { /* old browsers */ }
  const C = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!C) return null;
  audio ??= new C();
  if (audio.state === 'suspended') void audio.resume();
  return audio;
}
function tone(c: AudioContext, f: number, d: number, v: number, type: OscillatorType, delay = 0, to?: number) {
  const at = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, at);
  if (to) o.frequency.exponentialRampToValueAtTime(to, at + d);
  g.gain.setValueAtTime(v, at); g.gain.exponentialRampToValueAtTime(0.0001, at + d);
  o.connect(g).connect(c.destination); o.start(at); o.stop(at + d);
}
function playFlipSound(n: number) {
  const c = ctx();
  if (!c) return;
  tone(c, 140, 0.32, 0.22, 'sine', 0, 55);
  tone(c, 300, 0.22, 0.05, 'sawtooth', 0, 1200);
  for (let i = 0; i < Math.min(n, 6); i++) tone(c, 660 * 2 ** (i / 5), 0.12, 0.06, 'triangle', 0.12 + i * 0.09);
}
function playPlaceSound() { const c = ctx(); if (c) tone(c, 420, 0.06, 0.05, 'triangle'); }

/**
 * Plays the flip moment when a new move arrives (`moveKey` changes): sound, a buzz and the 「뒤집기!」 call-out for a move
 * that flipped, a soft tick for a quiet one. Returns the call-out to lay over the board. `name` labels the mover.
 */
export function useFlipMoment({ board, last, flipped, moveKey, name, enabled = true }: { board: Board; last: number | null; flipped: number[]; moveKey: string | number; name: (p: Player) => string; enabled?: boolean }) {
  const t = useTranslations('FlipOmok');
  const [callout, setCallout] = useState<{ who: Player; n: number; key: string | number; void: boolean; top: string } | null>(null);
  const seen = useRef(moveKey);
  useEffect(() => {
    if (seen.current === moveKey) return;
    seen.current = moveKey;
    if (!enabled || last === null) return;
    if (!flipped.length) { playPlaceSound(); return; }
    const who = owner(board[last]) as Player;
    // The call-out stands in the half of the board away from the stones that just turned, so they stay visible.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one call-out per move, keyed by the move
    setCallout({ who, n: flipped.length, key: moveKey, void: voidFive(board, last, flipped), top: Math.floor(last / SIZE) < SIZE / 2 ? '76%' : '22%' });
    playFlipSound(flipped.length);
    try { navigator.vibrate?.([30, 40, 60]); } catch { /* optional */ }
  }, [moveKey, enabled, last, flipped, board]);
  useEffect(() => {
    if (!callout) return;
    const timer = window.setTimeout(() => setCallout(null), callout.void ? 2600 : 1500);
    return () => window.clearTimeout(timer);
  }, [callout]);
  return callout && <div key={callout.key} className="flip-next-callout pointer-events-none absolute left-1/2 z-30 whitespace-nowrap text-center" style={{ top: callout.top }}>
    <p className="text-[42px] font-black italic leading-none tracking-tight sm:text-6xl" style={{ color: '#fff', textShadow: `0 0 18px ${STONE_HEX[callout.who]}, 0 0 4px ${STONE_HEX[callout.who]}, 0 3px 0 #000` }}>{t('callout')}</p>
    <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-black/75 px-3 py-1 text-xs font-black text-white"><Sparkles size={12} style={{ color: GOLD }} />{t('calloutSub', { name: name(callout.who), n: callout.n })}</p>
    {callout.void && <p className="mt-1.5 rounded-full bg-black/80 px-3 py-1 text-[11px] font-black text-[#ffd166]">{t('voidFiveToast')}</p>}
  </div>;
}

/**
 * Tiny board for the tutorial: rows of `.` (empty) `R`/`B` (placed) `r`/`b` (flipped) `x` (forbidden).
 * `flip` lists cells (row, col) that keep turning over; `ring` marks the stone just placed.
 */
export function MiniBoard({ rows, flip = [], ring, line }: { rows: string[]; flip?: [number, number][]; ring?: [number, number]; line?: [[number, number], [number, number]] }) {
  const n = rows.length, m = rows[0].length;
  const at = (v: number, size: number) => `${((v + 0.5) / size) * 100}%`;
  return <div className="relative rounded-[10px] border border-[#67e8ff]/25 bg-[#080c12] p-1" style={{ width: m * 28 + 8, height: n * 28 + 8 }}>
    <div className="relative h-full w-full">
      <svg viewBox={`0 0 ${m} ${n}`} className="absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: n }, (_, r) => <line key={`r${r}`} x1={0.5} y1={r + 0.5} x2={m - 0.5} y2={r + 0.5} stroke="#67e8ff" strokeOpacity=".3" strokeWidth=".04" />)}
        {Array.from({ length: m }, (_, c) => <line key={`c${c}`} x1={c + 0.5} y1={0.5} x2={c + 0.5} y2={n - 0.5} stroke="#67e8ff" strokeOpacity=".3" strokeWidth=".04" />)}
        {line && <line x1={line[0][1] + 0.5} y1={line[0][0] + 0.5} x2={line[1][1] + 0.5} y2={line[1][0] + 0.5} stroke="#ffd76b" strokeWidth=".12" strokeLinecap="round" />}
      </svg>
      {rows.flatMap((row, r) => [...row].map((ch, c) => {
        if (ch === '.') return null;
        const style = { left: at(c, m), top: at(r, n), width: `${78 / m}%`, height: `${78 / n}%` };
        if (ch === 'x') return <svg key={`${r}${c}`} viewBox="0 0 10 10" className="absolute -translate-x-1/2 -translate-y-1/2 p-[2px]" style={style} aria-hidden><path d="M1 1L9 9M9 1L1 9" stroke="#ff4d6d" strokeWidth="1.6" strokeLinecap="round" /></svg>;
        const cell = ({ R: 1, B: 2, r: 3, b: 4 } as Record<string, Cell>)[ch];
        const loops = flip.some(([fr, fc]) => fr === r && fc === c);
        return <span key={`${r}${c}`} className="absolute -translate-x-1/2 -translate-y-1/2 [perspective:200px]" style={style}><Stone cell={cell} latest={!!ring && ring[0] === r && ring[1] === c} loop={loops} />{isFlipped(cell) && !loops && <LockBadge />}</span>;
      }))}
    </div>
  </div>;
}
