import type { Chip } from '@/lib/heavy13';

export const STAND: Record<Chip, { main: string; soft: string; deep: string }> = {
  r: { main: '#f0524f', soft: 'rgba(240,82,79,0.14)', deep: '#7a1d1b' },
  g: { main: '#34c47c', soft: 'rgba(52,196,124,0.13)', deep: '#15563a' },
  b: { main: '#4f7cf0', soft: 'rgba(79,124,240,0.14)', deep: '#1c3375' },
  w: { main: '#ffffff', soft: 'rgba(255,255,255,0.08)', deep: '#333' },
};
export const RAINBOW = 'conic-gradient(from 210deg, #f0524f, #f5b041, #34c47c, #4f7cf0, #a463f2, #f0524f)';
export const QUARRY_BG = 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(214,180,120,0.14), transparent 70%), radial-gradient(ellipse 70% 40% at 50% 100%, rgba(240,82,79,0.12), transparent 70%)';
export const H_PANEL = 'rounded-[16px] border border-white/10 bg-white/[0.035] p-4';
export const H_TITLE = 'text-[10px] font-black uppercase tracking-[0.18em] text-white/40';
export const SAND = '#e6c48a';
