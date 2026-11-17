import type { CSSProperties } from 'react';
import { PANEL, PANEL_TITLE, accentVars, fog } from '../ui/gameUi';

// Red vs blue, readable with red-green colour blindness (the red leans orange and is kept bright, so it
// does not turn dark for protan viewers). Pieces also carry a side mark: red "+", blue "○".
export const SIDE_COLORS = ['#ff5a4e', '#3d8bff'] as const; // red (bottom/you), blue
export const SIDE_NAMES = ['RED', 'BLUE'] as const;
export const SIDE_SOFT = ['rgba(255, 90, 78, 0.14)', 'rgba(61, 139, 255, 0.14)'] as const;
export const ACCENT = '#f2b84b';
export const RJ_FOG = fog('242, 184, 75');
/** Page-root style: amber accent with dark ink, over the shared fog. */
export const RJ_ROOT: CSSProperties = { ...accentVars(ACCENT, '#1a1204'), backgroundImage: RJ_FOG };
export const RJ_SHARD = '#5a3d0c';
export const RJ_PANEL = PANEL;
export const RJ_TITLE = PANEL_TITLE;
export const ACCENT_TEXT = 'bg-gradient-to-b from-[#fff1cf] via-[#f2b84b] to-[#a8701d] bg-clip-text text-transparent';
// Glossy domes, like the cups on the show's board.
export const DOME = [
  'radial-gradient(circle at 34% 28%, #ffd6cf 0%, #ff7a66 22%, #ec3b2c 58%, #8a1a12 100%)',
  'radial-gradient(circle at 34% 28%, #dceaff 0%, #7fb2ff 22%, #2f6fe8 58%, #0d2f78 100%)',
] as const;
export const SIZE_SCALE = [0.5, 0.7, 0.9] as const; // cup width as a share of the cell
