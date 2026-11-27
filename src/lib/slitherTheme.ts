"use client";

import { type CSSProperties, useCallback, useSyncExternalStore } from 'react';
import { accentVars, fog } from '@/components/ui/gameUi';

/**
 * 슬리더링크 board themes. Each theme is one entry in SLITHER_THEMES: the page colours, the board palette and which
 * drawing styles it uses (numerals, loop line). A later seasonal theme is one more entry here (and its name in
 * messages: Slitherlink.theme_<id>); the board, the share card and the picker read everything from this table.
 *
 * - numerals 'serif': the show's Georgia numbers (Classic). 'cute': the rounded hand-drawn digits in slitherGlyphs.ts.
 * - line 'plain': one solid stroke. 'garland': a cord with fairy-light bulbs that switch on when the loop is solid.
 * - clueStates: colour a clue once its count is met (satisfied) or passed (over). Classic keeps the show's look, without.
 * - effects: what the optional effects layer may do (snowfall behind the board, flourishes, the clear celebration).
 */
export type SlitherThemeId = 'classic' | 'christmas';

export type SlitherTheme = {
  id: SlitherThemeId;
  /** Page accent (buttons, tabs) and the ink on it. */
  accent: string; ink: string;
  /** The page background under the fog (CSS background), and the fog glow colour (r, g, b). */
  page: string | null; fogRgb: string;
  board: {
    bg: string; bg2?: string; dot: string; num: string; line: string; cross: string;
    hint: string; solution: string; track: string; wrong: string;
    /** Clue colours for the satisfied / over states (themes with clueStates). */
    numDone?: string; numOver?: string;
    /** Fairy-light colours along a garland line, in turn. */
    bulbs?: string[];
  };
  numerals: 'serif' | 'cute';
  line: 'plain' | 'garland';
  clueStates: boolean;
  effects: { snow: boolean; celebrate: boolean };
  /** Share card colours: background gradient, accent, text. */
  card: { bg: [string, string]; glow: string; accent: string; text: string; sub: string };
};

export const SLITHER_THEMES: SlitherTheme[] = [
  {
    id: 'christmas',
    accent: '#e23c52', ink: '#ffffff',
    page: 'linear-gradient(180deg, #0c1d19 0%, #0a1411 55%, #0d0f14 100%)', fogRgb: '226, 60, 82',
    board: {
      bg: '#fffaf0', bg2: '#eef5f3', dot: '#2c5747', num: '#d7263d', line: '#1e6b47', cross: '#7f93a6',
      hint: '#e0a21c', solution: '#e0a21c', track: '#4fa8e8', wrong: '#e5484d',
      numDone: '#23935c', numOver: '#3d2b2b',
      bulbs: ['#ff4d5e', '#ffc23d', '#46b4ff', '#ff86c8', '#7be07f'],
    },
    numerals: 'cute', line: 'garland', clueStates: true,
    effects: { snow: true, celebrate: true },
    card: { bg: ['#123528', '#0a1512'], glow: 'rgba(226,60,82,0.38)', accent: '#ffc23d', text: '#fffaf0', sub: 'rgba(255,250,240,0.66)' },
  },
  {
    id: 'classic',
    accent: '#8f7cff', ink: '#ffffff',
    page: null, fogRgb: '120, 100, 220',
    board: {
      bg: '#eceeff', dot: '#5b45c9', num: '#5b45c9', line: '#2c1f78', cross: '#8a83b8',
      hint: '#e0a21c', solution: '#e0a21c', track: '#2fb47c', wrong: '#e5484d',
    },
    numerals: 'serif', line: 'plain', clueStates: false,
    effects: { snow: false, celebrate: false },
    card: { bg: ['#1b1838', '#0b0b0e'], glow: 'rgba(143,124,255,0.42)', accent: '#8f7cff', text: '#f2f4f8', sub: 'rgba(242,244,248,0.6)' },
  },
];

/** Everyone who has not picked a theme gets this one. */
export const DEFAULT_SLITHER_THEME: SlitherThemeId = 'christmas';
export const CLASSIC_THEME = SLITHER_THEMES.find((t) => t.id === 'classic')!;
export const slitherTheme = (id: string | null | undefined) => SLITHER_THEMES.find((t) => t.id === id) ?? SLITHER_THEMES.find((t) => t.id === DEFAULT_SLITHER_THEME)!;

const THEME_KEY = 'puzzlthink_slither_theme';
const FX_KEY = 'puzzlthink_slither_fx';
const EVENT = 'puzzlthink-slither-prefs';

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } window.dispatchEvent(new Event(EVENT)); };

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', cb); };
};
const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

/**
 * The player's theme and effects switch, kept per browser (localStorage). `motion` is whether animated effects may
 * run: the switch is on and the system does not ask for reduced motion.
 */
export function useSlitherPrefs() {
  const themeId = useSyncExternalStore(subscribe, () => read(THEME_KEY), () => null);
  const fxOff = useSyncExternalStore(subscribe, () => read(FX_KEY) === 'off', () => false);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => false);
  const setTheme = useCallback((id: SlitherThemeId) => write(THEME_KEY, id), []);
  const setEffects = useCallback((on: boolean) => write(FX_KEY, on ? 'on' : 'off'), []);
  const theme = slitherTheme(themeId);
  return { theme, setTheme, effects: !fxOff, setEffects, reducedMotion: reduced, motion: !fxOff && !reduced };
}

/** The game page's shell style for a theme: accent variables and the background (Classic: exactly the old look). */
export function themeShellStyle(theme: SlitherTheme): CSSProperties {
  const fogLayer = fog(theme.fogRgb);
  return { ...accentVars(theme.accent, theme.ink), backgroundImage: theme.page ? `${fogLayer}, ${theme.page}` : fogLayer };
}
