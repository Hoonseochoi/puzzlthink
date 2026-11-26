"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { SIZE, coordinateLabel, isFlipped, isGap, other, owner, play, type Board, type Cell, type Line, type Player, voidFive } from '@/lib/flipOmok';
import PieceStone, { usePieceOwner } from '../PieceStone';

export const FLIP_ACCENT = '#67e8ff';
export const FLIP_INK = '#06202a';
/** Player colours: two neon characters. */
export const STONE_HEX: Record<Player, string> = { 1: '#ff4d6d', 2: '#3fb8ff' };

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
  // A player's own 바둑알 inside a ring of their colour; a flipped-over stone keeps a dot of the other colour.
  if (mine && !dizzy) return <span className={`absolute inset-0 [backface-visibility:hidden] ${back ? '[transform:rotateY(180deg)]' : ''}`} style={{ filter: `drop-shadow(0 0 5px ${hex}88)` }}>
    <PieceStone seat={p} color={hex} overlay={marked ? <span className="absolute bottom-[3%] right-[3%] h-[26%] w-[26%] rounded-full border border-white/90" style={{ background: STONE_HEX[other(p)] }} /> : null}>{null}</PieceStone>
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
  return <span className={`relative block h-full w-full [container-type:size] ${latest ? 'scale-110' : ''} transition-transform`} style={{ fontSize: '100cqw' }}>
    <span className={`relative block h-full w-full [transform-style:preserve-3d] ${loop ? 'flip-omok-loop-turn' : flip ? 'flip-omok-turn' : ''}`} style={flip ? { animationDelay: `${delay}ms` } : undefined}>
      <Face p={p} marked={isFlipped(cell)} />
      {(flip || loop) && <Face p={other(p)} dizzy back />}
    </span>
    {latest && <span className="pointer-events-none absolute -inset-[14%] rounded-full border-2 border-[#ffd76b] shadow-[0_0_10px_#ffd76b]" />}
  </span>;
}

/** Small coloured dot for a player (scores, player rows). */
export function Dot({ p, size = 12 }: { p: Player; size?: number }) {
  return <i className="inline-block shrink-0 rounded-full" style={{ width: size, height: size, background: STONE_HEX[p], boxShadow: `0 0 6px ${STONE_HEX[p]}` }} />;
}

/** The neon 15×15 board. Hovering an empty point shows which stones it would flip. */
export function FlipOmokBoard({ board, last, flipped, flipKey, win, turn, interactive, banned, onPlace, overlay }: {
  board: Board;
  last: number | null;
  flipped: number[]; // stones the last move flipped (they animate)
  flipKey: number; // changes every move, so the flip animation replays
  win: Line | null;
  turn: Player; // whose stone a hover previews
  interactive: boolean;
  banned: Set<number>; // 쌍삼 points for the player to move
  onPlace: (at: number) => void;
  overlay?: ReactNode;
}) {
  const t = useTranslations('FlipOmok');
  const [hover, setHover] = useState<number | null>(null);
  const [toast, setToast] = useState<{ n: number; who: Player; key: number; void: boolean } | null>(null);
  const seen = useRef(flipKey);

  // "N개 뒤집기!" for every move that flipped something.
  useEffect(() => {
    if (seen.current === flipKey) return;
    seen.current = flipKey;
    if (!flipped.length || last === null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a toast per move, keyed by the move
    const isVoid = voidFive(board, last, flipped);
    setToast({ n: flipped.length, who: owner(board[last]) as Player, key: flipKey, void: isVoid });
    const timer = window.setTimeout(() => setToast(null), isVoid ? 2400 : 1400);
    return () => window.clearTimeout(timer);
  }, [flipKey, flipped, last, board]);

  const preview = interactive && hover !== null && !board[hover] && !banned.has(hover) ? play(board, hover, turn).flipped : [];
  const previewSet = new Set(preview);
  const gap = interactive && hover !== null && !board[hover] && !banned.has(hover) && isGap(board, hover, turn);
  const flippedSet = new Set(flipped);

  return <>
    <div className="relative mx-auto aspect-square w-full max-w-[700px] rounded-[10px] bg-gradient-to-br from-[#ff4d6d] via-[#26313f] to-[#3fb8ff] p-[3px] shadow-[0_24px_60px_rgba(0,0,0,.78),0_0_30px_rgba(63,184,255,.14)]">
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
          const canPlace = interactive && !cell && !banned.has(at);
          return (
            <button key={at} type="button" disabled={!canPlace} aria-label={coordinateLabel(at)} title={!cell && banned.has(at) && interactive ? t('banned') : undefined}
              onClick={() => onPlace(at)} onMouseEnter={() => setHover(at)}
              className={`absolute z-10 h-[6.2%] w-[6.2%] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none [perspective:300px] ${canPlace ? 'cursor-pointer' : ''}`}
              style={{ left: `${pos(c)}%`, top: `${pos(r)}%` }}>
              {cell ? <span className={`relative block h-full w-full ${previewSet.has(at) ? 'animate-pulse rounded-full opacity-55 ring-2 ring-[#ffd76b]' : ''}`}>
                {/* the key changes on a flip so the animation replays */}
                <Stone key={`${cell}-${flippedSet.has(at) ? flipKey : 0}`} cell={cell} latest={at === last} flip={flippedSet.has(at)} delay={last === null ? 0 : (Math.max(Math.abs(r - Math.floor(last / SIZE)), Math.abs(c - (last % SIZE))) - 1) * 110} />
              </span>
                : banned.has(at) && interactive ? <svg viewBox="0 0 10 10" className="h-full w-full p-[22%]" aria-hidden><path d="M1 1L9 9M9 1L1 9" stroke="#ff4d6d" strokeOpacity=".75" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  : hover === at && canPlace ? <span className="block h-full w-full rounded-full opacity-45 shadow-[0_0_12px_currentColor]" style={{ background: STONE_HEX[turn], color: STONE_HEX[turn] }} /> : null}
            </button>
          );
        })}
        {win && <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden><g className="flip-omok-win">
          <line x1={pos(win.start % SIZE)} y1={pos(Math.floor(win.start / SIZE))} x2={pos(win.end % SIZE)} y2={pos(Math.floor(win.end / SIZE))} stroke={STONE_HEX[win.owner]} strokeWidth="1.6" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 2px ${STONE_HEX[win.owner]})` }} />
          <line x1={pos(win.start % SIZE)} y1={pos(Math.floor(win.start / SIZE))} x2={pos(win.end % SIZE)} y2={pos(Math.floor(win.end / SIZE))} stroke="#fff" strokeWidth=".4" strokeLinecap="round" />
        </g></svg>}
        {toast && <div key={toast.key} className="flip-omok-toast pointer-events-none absolute left-1/2 top-[44%] z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/75 px-5 py-2.5 text-lg font-black text-white shadow-2xl sm:text-2xl">
          <Sparkles size={18} className="mr-1.5 inline" style={{ color: STONE_HEX[toast.who] }} />{t('flipToast', { n: toast.n })}{toast.void && <span className="ml-2 text-sm text-[#ffd166] sm:text-base">{t('voidFiveToast')}</span>}
        </div>}
        {overlay}
      </div>
    </div>
    <p className={`mt-2 min-h-4 text-center text-[11px] font-bold ${preview.length || gap ? '' : 'invisible'}`}>
      {preview.length > 0 && <span className="text-[#ffd76b]">{t('previewHint', { n: preview.length })}</span>}
      {preview.length > 0 && gap && <span className="text-white/30"> · </span>}
      {gap && <span className="text-[#7dffc4]">{t('gapHint')}</span>}
    </p>
  </>;
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
        return <span key={`${r}${c}`} className="absolute -translate-x-1/2 -translate-y-1/2 [perspective:200px]" style={style}><Stone cell={cell} latest={!!ring && ring[0] === r && ring[1] === c} loop={loops} /></span>;
      }))}
    </div>
  </div>;
}
