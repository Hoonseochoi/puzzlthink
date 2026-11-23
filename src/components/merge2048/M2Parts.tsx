"use client";

import { type ReactNode, type RefObject, useEffect, useId, useRef } from 'react';
import { type Dir, SIZE, type Tile } from '@/lib/merge2048';

export const M2_ACCENT = '#ff8fa3';
export const M2_INK = '#2a0f17';

/**
 * Block characters. Small numbers are 네모 characters (a soft rounded square with two eyes, like the 벽바둑 pieces);
 * from 128 they grow into 바둑알 characters (a glossy stone, like the ranking avatars). 2048 is the gold stone with
 * a crown, then the black stone and the white stone; past that an aurora stone.
 */
type Look = { shape: 'square' | 'stone'; hi: string; mid: string; lo: string; ink: string; eye: string; crown?: boolean; aurora?: boolean };
const LOOKS: Record<number, Look> = {
  2: { shape: 'square', hi: '#fffaf0', mid: '#ffefc2', lo: '#f2d58a', ink: '#7a5a12', eye: '#5c4310' }, // butter
  4: { shape: 'square', hi: '#fff1e8', mid: '#ffd6bf', lo: '#f0a985', ink: '#8a4425', eye: '#6b3018' }, // peach
  8: { shape: 'square', hi: '#ffc6b6', mid: '#ff8f73', lo: '#e0603f', ink: '#ffffff', eye: '#ffffff' }, // coral
  16: { shape: 'square', hi: '#ffb3c4', mid: '#ff6f91', lo: '#d9426a', ink: '#ffffff', eye: '#ffffff' }, // watermelon
  32: { shape: 'square', hi: '#ffa6dc', mid: '#f45bb5', lo: '#c42f88', ink: '#ffffff', eye: '#ffffff' }, // magenta
  64: { shape: 'square', hi: '#d9c4ff', mid: '#a77bff', lo: '#7449dd', ink: '#ffffff', eye: '#ffffff' }, // lavender
  128: { shape: 'stone', hi: '#c3c9ff', mid: '#6c7bff', lo: '#3c45c4', ink: '#ffffff', eye: '#ffffff' }, // periwinkle
  256: { shape: 'stone', hi: '#a9d4ff', mid: '#3f9dff', lo: '#1a5fc0', ink: '#ffffff', eye: '#ffffff' }, // sky
  512: { shape: 'stone', hi: '#a6f3e9', mid: '#20c3b0', lo: '#0c7a6e', ink: '#ffffff', eye: '#ffffff' }, // mint
  1024: { shape: 'stone', hi: '#b5f5c4', mid: '#35c46a', lo: '#167d3b', ink: '#ffffff', eye: '#ffffff' }, // green
  2048: { shape: 'stone', hi: '#fff6c4', mid: '#f2c53d', lo: '#a8740c', ink: '#3b2604', eye: '#3b2604', crown: true }, // gold
  4096: { shape: 'stone', hi: '#5a5d66', mid: '#1d1f25', lo: '#050507', ink: '#ffffff', eye: '#ffffff' }, // black stone
  8192: { shape: 'stone', hi: '#ffffff', mid: '#eceae4', lo: '#b9b5aa', ink: '#17201e', eye: '#17201e' }, // white stone
};
const AURORA: Look = { shape: 'stone', hi: '#ffffff', mid: '#b48cff', lo: '#4b3ab8', ink: '#ffffff', eye: '#ffffff', aurora: true };
export const lookOf = (v: number) => LOOKS[v] ?? AURORA;
/** The evolution chain shown in the block collection. */
export const CHAIN = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];

const fontFor = (v: number, stone: boolean) => {
  const n = String(v).length;
  const base = n <= 2 ? 34 : n === 3 ? 29 : n === 4 ? 23 : 18;
  return stone ? base * 0.92 : base;
};

/** One block's face (fills its box). `happy` closes the eyes into smiles for a beat after a merge. */
export function BlockFace({ v, happy = false, plain = false }: { v: number; happy?: boolean; plain?: boolean }) {
  const id = useId().replace(/:/g, '');
  const look = lookOf(v);
  const stone = look.shape === 'stone';
  const cy = look.crown ? 56 : 50;
  const r = look.crown ? 41 : 45;
  const eyeY = stone ? cy - r * 0.42 : 24;
  const eyeX = stone ? [50 - r * 0.3, 50 + r * 0.3] : [37, 63];
  const eye = (x: number) => happy
    ? <path key={x} d={`M${x - 5} ${eyeY + 6} q5 -7 10 0`} fill="none" stroke={look.eye} strokeWidth="3.4" strokeLinecap="round" />
    : <rect key={x} x={x - 3.2} y={eyeY - 1} width="6.4" height="11" rx="3.2" fill={look.eye} />;
  return (
    <svg viewBox="0 0 100 100" className="block h-full w-full overflow-visible" aria-hidden>
      <defs>
        {stone ? (
          <radialGradient id={`g${id}`} cx="35%" cy="28%" r="78%">
            <stop offset="0%" stopColor={look.hi} />
            <stop offset="55%" stopColor={look.mid} />
            <stop offset="100%" stopColor={look.lo} />
          </radialGradient>
        ) : (
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor={look.hi} />
            <stop offset="45%" stopColor={look.mid} />
            <stop offset="100%" stopColor={look.mid} />
          </linearGradient>
        )}
        {look.aurora && (
          <linearGradient id={`a${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7cf2ff" /><stop offset="35%" stopColor="#b48cff" /><stop offset="70%" stopColor="#ff8fd1" /><stop offset="100%" stopColor="#ffd36b" />
          </linearGradient>
        )}
      </defs>
      {stone ? <>
        <circle cx="50" cy={cy + 3.5} r={r} fill="rgba(23,32,30,.22)" />
        <circle cx="50" cy={cy} r={r} fill={look.aurora ? `url(#a${id})` : `url(#g${id})`} stroke={look.lo} strokeWidth="1.6" />
        {look.aurora && <circle cx="50" cy={cy} r={r} fill={`url(#g${id})`} opacity=".35" />}
        <ellipse cx={50 - r * 0.38} cy={cy - r * 0.5} rx={r * 0.22} ry={r * 0.12} fill="#ffffff" opacity=".45" transform={`rotate(-30 ${50 - r * 0.38} ${cy - r * 0.5})`} />
      </> : <>
        <rect x="4" y="8" width="92" height="90" rx="22" fill={look.lo} />
        <rect x="4" y="3" width="92" height="88" rx="22" fill={`url(#g${id})`} />
        <rect x="11" y="8" width="30" height="6" rx="3" fill="#ffffff" opacity=".4" />
      </>}
      {look.crown && (
        <g>
          <path d="M31 22 L35 4 L43 14 L50 1 L57 14 L65 4 L69 22 Z" fill="#ffd23f" stroke="#7d5306" strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="50" cy="12" r="2.8" fill="#ff5b6e" />
        </g>
      )}
      {!plain && <>
        {eyeX.map(eye)}
        {(happy || v >= 2048) && <>
          <ellipse cx={eyeX[0] - 7} cy={eyeY + 11} rx="4" ry="2.4" fill="#ff7a93" opacity=".55" />
          <ellipse cx={eyeX[1] + 7} cy={eyeY + 11} rx="4" ry="2.4" fill="#ff7a93" opacity=".55" />
        </>}
      </>}
      <text x="50" y={stone ? cy + r * 0.42 : 70} textAnchor="middle" dominantBaseline="middle" fontSize={fontFor(v, stone)} fontWeight="900"
        fill={look.ink} style={{ fontFamily: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif', letterSpacing: '-0.04em' }}>{v}</text>
    </svg>
  );
}

const pct = (n: number) => `${n * 100}%`;

/**
 * The board: a cream 4×4 grid in a dark frame (the 벽바둑 board). Blocks slide by transform;
 * `ghosts` are blocks being swallowed this move, drawn under the others until the slide ends.
 */
export function M2Board({ tiles, ghosts = [], merged = [], spawned = null, children, boardRef, small = false, dim = false, eyes = !small }: {
  tiles: Tile[]; ghosts?: Tile[]; merged?: number[]; spawned?: number | null; children?: ReactNode;
  boardRef?: RefObject<HTMLDivElement | null>; small?: boolean; dim?: boolean; eyes?: boolean;
}) {
  const block = (t: Tile, ghost: boolean) => (
    <div key={ghost ? `g${t.id}` : t.id} className={`absolute left-0 top-0 ${small ? '' : 'm2-slide'} ${ghost ? 'z-0' : 'z-10'}`}
      style={{ width: pct(1 / SIZE), height: pct(1 / SIZE), transform: `translate(${t.c * 100}%, ${t.r * 100}%)` }}>
      <div className={`h-full w-full ${small ? 'p-[7%]' : 'p-[6.5%]'} ${!small && !ghost && t.id === spawned ? 'm2-spawn' : ''} ${!small && !ghost && merged.includes(t.id) ? 'm2-pop' : ''}`}>
        <BlockFace v={t.v} happy={!small && !ghost && merged.includes(t.id)} plain={!eyes} />
      </div>
    </div>
  );
  return (
    <div ref={boardRef} className={`relative aspect-square w-full touch-none select-none rounded-[14px] border-[3px] border-[#17201e] bg-[#fbfaf5] shadow-[0_18px_50px_rgba(0,0,0,.45)] ${small ? '!rounded-[8px] !border-2 p-[3%]' : 'p-[2.5%] sm:rounded-[18px] sm:border-4'}`}>
      <div className="relative h-full w-full">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
          {Array.from({ length: SIZE * SIZE }, (_, i) => (
            <span key={i} className={small ? 'p-[7%]' : 'p-[6.5%]'}><span className={`block h-full w-full rounded-[22%] bg-[#17201e]/[0.06] ${small ? '' : 'shadow-[inset_0_2px_4px_rgba(23,32,30,.08)]'}`} /></span>
          ))}
        </div>
        <div className={`absolute inset-0 transition ${dim ? 'opacity-45 grayscale-[.5]' : ''}`}>
          {ghosts.map((t) => block(t, true))}
          {tiles.map((t) => block(t, false))}
        </div>
        {children}
      </div>
    </div>
  );
}

/** A friend's board from a snapshot (16 numbers): no slide animation, faces without eyes. */
export function M2MiniBoard({ cells, dim = false, eyes = false, children }: { cells: number[]; dim?: boolean; eyes?: boolean; children?: ReactNode }) {
  const tiles = cells.flatMap((v, i) => (v ? [{ id: i, v, r: Math.floor(i / SIZE), c: i % SIZE }] : []));
  return <M2Board tiles={tiles} small dim={dim} eyes={eyes}>{children}</M2Board>;
}

/** Arrow keys / WASD anywhere, swipes on the board. */
export function useM2Input(boardRef: RefObject<HTMLDivElement | null>, onDir: (dir: Dir) => void, enabled: boolean) {
  const cb = useRef(onDir);
  useEffect(() => { cb.current = onDir; }, [onDir]);
  useEffect(() => {
    if (!enabled) return;
    const keys: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const dir = keys[e.key];
      if (!dir || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      cb.current(dir);
    };
    window.addEventListener('keydown', onKey);
    const el = boardRef.current;
    let start: { x: number; y: number; id: number } | null = null;
    const down = (e: PointerEvent) => { start = { x: e.clientX, y: e.clientY, id: e.pointerId }; };
    const up = (e: PointerEvent) => {
      if (!start || start.id !== e.pointerId) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      start = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
      cb.current(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
    };
    const cancel = () => { start = null; };
    el?.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('keydown', onKey);
      el?.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [boardRef, enabled]);
}

export const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

/** Score / best / biggest block row above the board. */
export function StatBox({ label, value, accent = false, children }: { label: string; value: ReactNode; accent?: boolean; children?: ReactNode }) {
  return (
    <div className={`relative min-w-0 flex-1 rounded-[10px] border px-2.5 py-2 text-center ${accent ? 'border-(--accent)/40 bg-(--accent)/10' : 'border-white/10 bg-black/40'}`}>
      <p className="truncate text-[9px] font-black tracking-[0.16em] text-white/40">{label}</p>
      <p className={`mt-0.5 truncate font-mono text-lg font-black leading-6 ${accent ? 'text-(--accent)' : 'text-white/90'}`}>{value}</p>
      {children}
    </div>
  );
}

/** The 네모 → 바둑알 evolution chain; blocks not made yet show as silhouettes. */
export function BlockCollection({ best, title, hint }: { best: number; title: string; hint: string }) {
  return (
    <section className="rounded-[14px] border border-white/10 bg-[#121217]/85 p-4 backdrop-blur">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{title}</p>
      <div className="mt-3 grid grid-cols-5 gap-1.5 sm:grid-cols-7 lg:grid-cols-5">
        {CHAIN.map((v) => (
          <div key={v} className={`aspect-square rounded-md bg-[#fbfaf5] p-[8%] transition ${v <= best ? '' : 'opacity-25 grayscale'}`} title={String(v)}>
            <BlockFace v={v} plain={v > best} />
          </div>
        ))}
      </div>
      <p className="mt-2.5 break-keep text-[11px] leading-5 text-white/40">{hint}</p>
    </section>
  );
}
