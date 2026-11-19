import { Cinzel } from 'next/font/google';

export const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });

export const PLAYER_COLORS = ['#e0283a', '#6f86b8', '#9aa1ad'];
export const TERRITORY_TINTS = ['rgba(224, 40, 58, 0.16)', 'rgba(111, 134, 184, 0.16)', 'rgba(154, 161, 173, 0.14)'];
// 벽바둑 II, after the broadcast set: a coral board in a grey wooden frame, red / blue / gold pieces.
export const V2_PLAYER_COLORS = ['#e2474f', '#2b9fd8', '#e0ab2c'];
export const V2_TERRITORY_TINTS = ['rgba(226, 71, 79, 0.42)', 'rgba(43, 159, 216, 0.42)', 'rgba(224, 171, 44, 0.45)'];

export const FOG = 'radial-gradient(ellipse 70% 45% at 50% 18%, rgba(120, 110, 150, 0.22), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 105%, rgba(140, 18, 30, 0.22), transparent 70%)';
export const STEEL_TEXT = 'bg-gradient-to-b from-[#f4f6fb] via-[#aab2c4] to-[#5a6070] bg-clip-text text-transparent';
export const PANEL = 'rounded-[14px] border border-white/10 bg-[#121217]/85 p-4 backdrop-blur';
export const PANEL_TITLE = 'text-[10px] font-black uppercase tracking-[0.18em] text-white/40';
