import type { CSSProperties } from 'react';

/**
 * Shared game-page design language, taken from 벽바둑 (WallGo):
 * near-black stage, solid charcoal panels with 14px corners, square-ish (rounded-md) controls,
 * tiny uppercase panel labels, mono kicker in the accent color, steel-gradient titles and diamond bullets.
 *
 * Each game only picks its accent. Put `accentVars(...)` on the page root; every token below reads
 * `--accent` (fill), `--accent-ink` (text on the fill) and `--accent-glow` (shadow) and `--accent-soft` (faint inner tint) from it.
 */
export function accentVars(accent: string, ink = '#ffffff'): CSSProperties {
  return { '--accent': accent, '--accent-ink': ink, '--accent-glow': `${accent}66`, '--accent-soft': `${accent}17` } as CSSProperties;
}

/** Background haze: a cool glow at the top and the accent at the bottom, like 벽바둑's fog. */
export const fog = (rgb: string) =>
  `radial-gradient(ellipse 70% 45% at 50% 18%, rgba(120, 110, 150, 0.2), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 105%, rgba(${rgb}, 0.2), transparent 70%)`;

export const SHELL = 'relative min-h-screen overflow-hidden bg-[#0b0b0e] text-[#e6e9f0]';
export const HEADER = 'relative z-10 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/50 px-4 py-2 backdrop-blur md:px-8';
export const MAIN = 'relative z-10 mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-4 px-3 py-3 sm:gap-6 sm:px-4 sm:py-5 lg:grid-cols-[minmax(0,760px)_320px] lg:px-6 lg:py-8';

/** The big card that holds the board. */
export const STAGE = 'rounded-[14px] border border-white/10 bg-[#121217]/85 p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur sm:p-5';
export const PANEL = 'rounded-[14px] border border-white/10 bg-[#121217]/85 p-4 backdrop-blur';
export const PANEL_TITLE = 'text-[10px] font-black uppercase tracking-[0.18em] text-white/40';
/** Accent-bordered panel (play with a friend). */
export const CALLOUT = 'rounded-[14px] border border-(--accent)/40 bg-(--accent)/[0.06] p-4';
/** Dark rules panel. */
export const NOTE = 'rounded-[14px] border border-(--accent)/30 bg-black/60 p-5';
/** Inset well inside a panel or stage. */
export const WELL = 'rounded-[10px] border border-white/10 bg-black/40';

export const KICKER = 'font-mono text-[10px] font-bold tracking-[0.25em] text-(--accent)';
export const HEADING = 'text-base font-extrabold tracking-tight text-[#eef1f7] sm:text-xl';
export const STEEL_TEXT = 'bg-gradient-to-b from-[#f4f6fb] via-[#aab2c4] to-[#5a6070] bg-clip-text text-transparent';
export const SUBTITLE = 'hidden text-[9px] font-bold tracking-[0.16em] text-(--accent)/70 sm:inline';

export const BTN = 'inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 transition hover:bg-white/10 hover:text-white';
export const BTN_ACCENT = 'inline-flex items-center justify-center gap-2 rounded-md bg-(--accent) px-3 py-2 text-xs font-extrabold text-(--accent-ink) shadow-[0_0_18px_var(--accent-glow)] transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none';
/** Outline button that lights up in the accent on hover (secondary actions inside a callout). */
export const BTN_OUTLINE = 'rounded-md border border-white/15 bg-white/5 text-xs font-extrabold text-white/85 transition hover:border-(--accent)/60 hover:bg-(--accent)/15';

/** Segmented option (difficulty, first player, ...). */
export const seg = (on: boolean) => `rounded-md text-xs font-extrabold transition ${on
  ? 'bg-(--accent) text-(--accent-ink) shadow-[0_0_14px_var(--accent-glow)]'
  : 'border border-white/10 bg-white/[0.03] text-white/50 hover:text-white'}`;

export const CHIP = 'inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60';
/** Turn clock; `urgent` pulses in the accent. */
export const timer = (urgent: boolean) => `flex min-w-[76px] items-center justify-center gap-2 rounded-md px-3 py-2 font-mono text-sm font-bold sm:text-base ${urgent
  ? 'animate-pulse bg-(--accent) text-(--accent-ink) shadow-[0_0_20px_var(--accent-glow)]'
  : 'border border-white/15 bg-black/60 text-[#c9cfdc]'}`;
/** Row in a player list; `on` marks whose turn it is. */
export const playerRow = (on: boolean) => `flex items-center gap-3 rounded-[10px] border p-3 ${on
  ? 'border-(--accent)/50 bg-white/[0.04] shadow-[inset_0_0_20px_var(--accent-soft)]'
  : 'border-transparent'}`;

export const DIAMOND = 'mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)';
export const INPUT = 'min-w-0 flex-1 rounded-md border border-white/10 bg-[#0b0b0e] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-(--accent)/60';

// Scrolls when the dialog is taller than the screen (result screens carry a sponsor card); centred otherwise.
export const MODAL_BACKDROP = 'fixed inset-0 z-50 flex flex-col items-center overflow-y-auto overscroll-contain bg-black/80 p-4 backdrop-blur-sm [&>*]:my-auto [&>*]:shrink-0';
export const MODAL = 'relative w-full max-w-sm rounded-[16px] border border-white/10 bg-[#121217] p-7 text-center shadow-[0_0_80px_var(--accent-glow)]';
export const MODAL_CLOSE = 'absolute right-3 top-3 rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white';
/** `primaryClass` for ResultActions. */
export const RESULT_PRIMARY = 'rounded-md bg-(--accent) text-(--accent-ink) shadow-[0_0_20px_var(--accent-glow)] hover:brightness-110';
