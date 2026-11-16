import { Noto_Serif_KR } from 'next/font/google';
import { PANEL, PANEL_TITLE, STEEL_TEXT, fog } from '../ui/gameUi';

// Bold serif for the hanja on the tiles. CJK fonts are split by unicode-range, so no subset/preload.
export const hanjaFont = Noto_Serif_KR({ weight: ['900'], preload: false, display: 'swap' });

export const SIDE_COLORS = ['#ff5b3a', '#17c39a'] as const; // vermilion (bottom/you), jade
export const SIDE_SOFT = ['rgba(255, 91, 58, 0.14)', 'rgba(23, 195, 154, 0.12)'] as const;
export const GOLD = '#e8c170';
export const JANGGI_FOG = fog('232, 193, 112');
export const J_PANEL = PANEL;
export const J_TITLE = PANEL_TITLE;
export const GOLD_TEXT = STEEL_TEXT;
