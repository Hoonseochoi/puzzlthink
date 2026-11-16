import type { CSSProperties } from 'react';
import type { Chip } from '@/lib/heavy13';
import { PANEL, PANEL_TITLE, accentVars, fog } from '../ui/gameUi';

export const STAND: Record<Chip, { main: string; soft: string; deep: string }> = {
  r: { main: '#f0524f', soft: 'rgba(240,82,79,0.14)', deep: '#7a1d1b' },
  g: { main: '#34c47c', soft: 'rgba(52,196,124,0.13)', deep: '#15563a' },
  b: { main: '#4f7cf0', soft: 'rgba(79,124,240,0.14)', deep: '#1c3375' },
  w: { main: '#ffffff', soft: 'rgba(255,255,255,0.08)', deep: '#333' },
};
export const RAINBOW = 'conic-gradient(from 210deg, #f0524f, #f5b041, #34c47c, #4f7cf0, #a463f2, #f0524f)';
export const H_PANEL = PANEL;
export const H_TITLE = PANEL_TITLE;
export const SAND = '#e6c48a';
export const SAND_INK = '#1a1408';
/** Page-root style: sand accent on the shared 벽바둑 stage. */
export const H_ROOT_STYLE: CSSProperties = { ...accentVars(SAND, SAND_INK), backgroundImage: fog('230, 196, 138') };
export const SHARD_TINT = '#4a3a1c';
