// '매우 어려움' (hell) difficulty button: dark neon red, set apart from the accent-coloured levels.
// Shared by 십이장기 and 러시아장기.
export const hellSeg = (on: boolean) => `flex items-center justify-center gap-1.5 rounded-md border text-xs font-extrabold transition ${on
  ? 'border-[#ff2a3d] bg-[#2a0509] text-[#ff4d5e] shadow-[0_0_18px_rgba(255,42,61,0.55),inset_0_0_12px_rgba(255,42,61,0.25)]'
  : 'border-[#ff2a3d]/30 bg-[#160306] text-[#ff4d5e]/60 hover:border-[#ff2a3d]/70 hover:text-[#ff4d5e]'}`;
export const HELL_HINT = 'mt-2 text-[10px] leading-4 text-[#ff6b78]/70';
