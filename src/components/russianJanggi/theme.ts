export const SIDE_COLORS = ['#ff4d5e', '#2fd67a'] as const; // red (bottom/you), green
export const SIDE_NAMES = ['RED', 'GREEN'] as const;
export const SIDE_SOFT = ['rgba(255, 77, 94, 0.14)', 'rgba(47, 214, 122, 0.12)'] as const;
export const ACCENT = '#f2b84b';
export const RJ_FOG = 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(47, 214, 122, 0.15), transparent 70%), radial-gradient(ellipse 70% 45% at 50% 100%, rgba(255, 77, 94, 0.16), transparent 70%)';
export const RJ_PANEL = 'rounded-[16px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur';
export const RJ_TITLE = 'text-[10px] font-black uppercase tracking-[0.18em] text-white/40';
export const ACCENT_TEXT = 'bg-gradient-to-b from-[#fff1cf] via-[#f2b84b] to-[#a8701d] bg-clip-text text-transparent';
// Glossy domes, like the cups on the show's board.
export const DOME = [
  'radial-gradient(circle at 34% 28%, #ffd0d4 0%, #ff6b78 22%, #e2283c 58%, #8f1020 100%)',
  'radial-gradient(circle at 34% 28%, #d4ffe4 0%, #5ff09a 22%, #1fb560 58%, #0b6b35 100%)',
] as const;
export const SIZE_SCALE = [0.46, 0.66, 0.88] as const;
