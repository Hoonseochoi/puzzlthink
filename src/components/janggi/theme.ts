import { Noto_Serif_KR } from 'next/font/google';

// Bold serif for the hanja on the tiles. CJK fonts are split by unicode-range, so no subset/preload.
export const hanjaFont = Noto_Serif_KR({ weight: ['900'], preload: false, display: 'swap' });

export const SIDE_COLORS = ['#ff5b3a', '#17c39a'] as const; // vermilion (bottom/you), jade
export const SIDE_SOFT = ['rgba(255, 91, 58, 0.14)', 'rgba(23, 195, 154, 0.12)'] as const;
export const GOLD = '#e8c170';
export const JANGGI_FOG = 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(23, 195, 154, 0.16), transparent 70%), radial-gradient(ellipse 70% 45% at 50% 100%, rgba(255, 91, 58, 0.16), transparent 70%)';
export const J_PANEL = 'rounded-[16px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur';
export const J_TITLE = 'text-[10px] font-black uppercase tracking-[0.18em] text-white/40';
export const GOLD_TEXT = 'bg-gradient-to-b from-[#fff4d6] via-[#e8c170] to-[#9a7434] bg-clip-text text-transparent';
