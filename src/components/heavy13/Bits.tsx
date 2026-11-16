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

/** A small stone cube placed on a stand. */
export function Cube({ value, color, fresh = false }: { value: number; color: string; fresh?: boolean }) {
  return (
    <span className={`flex h-6 w-full items-center justify-center rounded-[6px] text-xs font-black sm:h-8 sm:rounded-[7px] sm:text-sm text-[#2a2118] shadow-[inset_0_-3px_0_rgba(0,0,0,.18),0_3px_8px_rgba(0,0,0,.35)] ${fresh ? 'ring-2 ring-white/80' : ''}`}
      style={{ background: `linear-gradient(180deg, #e9dcc3, #bfa883)`, borderLeft: `4px solid ${color}` }}>
      {value}
    </span>
  );
}
