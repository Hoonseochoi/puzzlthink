// Small synthesized sounds for 스나이퍼 홀덤 (chips, the turn card, a snipe and a hit). Off with the table's toggle.
type WebkitWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
let ctx: AudioContext | null = null;
const KEY = 'puzzlthink_sniper_holdem_mute';

export function shSoundOn() { try { return localStorage.getItem(KEY) !== '1'; } catch { return true; } }
export function setShSound(on: boolean) { try { localStorage.setItem(KEY, on ? '0' : '1'); } catch { /* optional */ } }

function context() {
  if (typeof window === 'undefined' || !shSoundOn()) return null;
  try { if (!navigator.userActivation?.hasBeenActive) return null; } catch { /* old browsers */ }
  const C = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!C) return null;
  ctx ??= new C();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
function tone(c: AudioContext, f: number, d: number, v: number, type: OscillatorType = 'sine', delay = 0, to?: number) {
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + d);
}

/** Chips on the felt. */
export function playChips() { const c = context(); if (!c) return; [0, 0.05, 0.1].forEach((d, i) => tone(c, 2400 - i * 300, 0.05, 0.035, 'triangle', d)); }
/** A card turned over. */
export function playCard() { const c = context(); if (!c) return; tone(c, 900, 0.06, 0.04, 'triangle'); tone(c, 500, 0.08, 0.03, 'sine', 0.03); }
/** A snipe is declared: a scope click and a crack. */
export function playSnipe() { const c = context(); if (!c) return; tone(c, 1800, 0.03, 0.05, 'square'); tone(c, 220, 0.25, 0.12, 'sawtooth', 0.06, 60); }
/** A sniped hand at the showdown. */
export function playHit() { const c = context(); if (!c) return; tone(c, 660, 0.12, 0.06, 'square'); tone(c, 330, 0.3, 0.06, 'square', 0.1, 140); }
/** Winning a pot / reaching safety. */
export function playWin() { const c = context(); if (!c) return; [523, 659, 784].forEach((f, i) => tone(c, f, 0.22, 0.05, 'triangle', i * 0.09)); }
