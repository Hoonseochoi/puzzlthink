import { PANEL, PANEL_TITLE, accentVars, fog } from '../ui/gameUi';

export const RR_ACCENT = '#65e5ff';
/** Page root style: cyan accent tokens + 벽바둑-style fog tinted cyan. */
export const RR_ROOT_STYLE = { ...accentVars(RR_ACCENT, '#04161c'), backgroundImage: fog('101, 229, 255') };
export const RR_SHARD_TINT = '#0d3a47';
export const RR_PANEL = PANEL;
export const RR_TITLE = PANEL_TITLE;
/** MODAL from gameUi without its size/padding, so the wider roulette dialogs can set their own. */
export const RR_MODAL = 'relative w-full rounded-[16px] border border-white/10 bg-[#121217] text-center shadow-[0_0_80px_var(--accent-glow)]';
