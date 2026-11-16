import type { Chip } from '@/lib/heavy13';
import { RAINBOW, STAND } from './theme';

/** A colored chip token; rainbow uses a conic gradient. */
export function ChipToken({ chip, size = 28, dim = false, label }: { chip: Chip; size?: number; dim?: boolean; label?: string }) {
  return (
    <span aria-label={label} className={`relative inline-flex shrink-0 items-center justify-center rounded-full ring-2 ring-black/40 ${dim ? 'opacity-25' : ''}`}
      style={{ width: size, height: size, background: chip === 'w' ? RAINBOW : STAND[chip].main, boxShadow: dim ? 'none' : `0 0 12px ${chip === 'w' ? 'rgba(255,255,255,.35)' : STAND[chip].main}66` }}>
      <span className="rounded-full border border-white/50" style={{ width: size * 0.55, height: size * 0.55 }} />
    </span>
  );
}

/** A rock card with its weight. */
export function RockCard({ value, size = 'md', dim = false, selected = false }: { value: number; size?: 'sm' | 'md' | 'lg'; dim?: boolean; selected?: boolean }) {
  const dims = size === 'sm' ? 'h-9 w-7 text-sm rounded-md' : size === 'lg' ? 'h-24 w-[4.5rem] text-4xl rounded-xl' : 'h-14 w-11 text-xl rounded-lg';
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center font-black text-[#2a2118] shadow-[0_6px_14px_rgba(0,0,0,.45)] transition ${dims} ${dim ? 'opacity-20' : ''} ${selected ? '-translate-y-1.5 ring-2 ring-[#e6c48a] shadow-[0_0_20px_rgba(230,196,138,.55)]' : ''}`}
      style={{ background: 'linear-gradient(155deg, #efe3cc 0%, #cdb894 55%, #a8936e 100%)' }}>
      <span className="absolute inset-[3px] rounded-[inherit] border border-black/10" />
      {value}
    </span>
  );
}

/** A stone cube on a stand: a square block with its weight. */
export function Cube({ value, color, fresh = false }: { value: number; color: string; fresh?: boolean }) {
  return (
    <span className={`relative flex aspect-square items-center justify-center rounded-[22%] text-sm font-black text-[#2a2118] sm:text-lg shadow-[inset_0_-4px_0_rgba(0,0,0,.2),inset_0_2px_0_rgba(255,255,255,.55),0_4px_10px_rgba(0,0,0,.4)] ${fresh ? 'ring-2 ring-white/90' : ''}`}
      style={{ background: 'linear-gradient(160deg, #f1e6cf 0%, #cdb791 60%, #ad9671 100%)' }}>
      <span className="absolute left-[12%] top-[12%] h-[14%] w-[14%] rounded-full" style={{ background: color }} />
      {value}
    </span>
  );
}

/** Cubes stack two per row from the bottom, like the porter stands on the show. */
export function CubeStack({ cubes, color, freshLast = false, className = '' }: { cubes: number[]; color: string; freshLast?: boolean; className?: string }) {
  return (
    <div className={`grid grid-cols-[repeat(2,minmax(0,3.25rem))] content-end justify-center gap-1 ${className}`}>
      {/* Bottom-up order: reverse rows so the first cube sits bottom-left. */}
      {Array.from({ length: Math.ceil(cubes.length / 2) }, (_, r) => Math.ceil(cubes.length / 2) - 1 - r).flatMap((row) => [row * 2, row * 2 + 1].map((i) => (
        i < cubes.length ? <Cube key={i} value={cubes[i]} color={color} fresh={freshLast && i === cubes.length - 1} /> : <span key={i} />
      )))}
    </div>
  );
}

/** A small porter stand for diagrams. */
export function StandMini({ color, cubes, label, glow }: { color: 'r' | 'g' | 'b'; cubes: number[]; label: string; glow?: boolean }) {
  const total = cubes.reduce((a, b) => a + b, 0);
  return (
    <div className={`flex w-24 flex-col rounded-[12px] border p-2 ${glow ? 'shadow-[0_0_18px_rgba(240,82,79,.45)]' : ''}`} style={{ borderColor: `${STAND[color].main}66`, background: STAND[color].soft }}>
      <span className="text-[10px] font-black" style={{ color: STAND[color].main }}>{label}</span>
      <span className="font-mono text-xl font-black text-white">{total}<span className="text-[10px] text-white/40">/13</span></span>
      <CubeStack cubes={cubes} color={STAND[color].main} className="mt-1 min-h-[80px]" />
    </div>
  );
}
