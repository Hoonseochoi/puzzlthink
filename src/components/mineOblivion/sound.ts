// Small synthesized sounds for 망각의 지뢰 (a step, the announced number, a blast, treasure, burying). Off with the toggle.
type WebkitWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
let ctx: AudioContext | null = null;
const KEY = 'puzzlthink_mine_oblivion_mute';

export function moSoundOn() { try { return localStorage.getItem(KEY) !== '1'; } catch { return true; } }
export function setMoSound(on: boolean) { try { localStorage.setItem(KEY, on ? '0' : '1'); } catch { /* optional */ } }

function context() {
  if (typeof window === 'undefined' || !moSoundOn()) return null;
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
function noise(c: AudioContext, d: number, v: number) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * d), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  const src = c.createBufferSource();
  const g = c.createGain();
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 900;
  src.buffer = buf; g.gain.value = v;
  src.connect(lp).connect(g).connect(c.destination);
  src.start();
}

/** A footstep on dirt. */
export function playStep() { const c = context(); if (!c) return; tone(c, 180, 0.07, 0.05, 'triangle'); tone(c, 120, 0.06, 0.04, 'sine', 0.03); }
/** The announced number: higher pitch for more mines. */
export function playNumber(n: number) { const c = context(); if (!c) return; tone(c, 440 + n * 70, 0.16, 0.045, 'sine', 0.08); }
/** A mine goes off. */
export function playBlast() { const c = context(); if (!c) return; noise(c, 0.7, 0.35); tone(c, 140, 0.5, 0.12, 'sawtooth', 0, 40); }
/** Treasure found. */
export function playTreasure() { const c = context(); if (!c) return; [659, 784, 988, 1319].forEach((f, i) => tone(c, f, 0.2, 0.05, 'triangle', i * 0.07)); }
/** A mine buried (or taken out again). */
export function playBury(on: boolean) { const c = context(); if (!c) return; tone(c, on ? 320 : 240, 0.06, 0.04, 'square'); }
/** The game is over and I won. */
export function playWin() { const c = context(); if (!c) return; [523, 659, 784, 1047].forEach((f, i) => tone(c, f, 0.24, 0.05, 'triangle', i * 0.1)); }
/** 탐지기: a sonar ping, then the reading (pitch like an announced number). */
export function playProbe(n: number) { const c = context(); if (!c) return; tone(c, 1320, 0.12, 0.04, 'sine', 0, 880); tone(c, 1320, 0.1, 0.025, 'sine', 0.22, 990); tone(c, 440 + n * 70, 0.16, 0.045, 'sine', 0.55); }
/** 기억 되살리기: a soft shimmer rising, then falling as the mines fade. */
export function playRecall() { const c = context(); if (!c) return; [523, 659, 784].forEach((f, i) => tone(c, f, 0.5, 0.03, 'sine', i * 0.06)); tone(c, 784, 0.6, 0.02, 'triangle', 1.4, 392); }
/** 방폭복 on: two heavy clasps. */
export function playSuit() { const c = context(); if (!c) return; tone(c, 160, 0.09, 0.08, 'square'); tone(c, 220, 0.1, 0.06, 'square', 0.12); tone(c, 880, 0.25, 0.025, 'triangle', 0.24); }
/** A mine goes off on 방폭복: a muffled thud and a bright clang (막았다!). */
export function playSaved() { const c = context(); if (!c) return; noise(c, 0.35, 0.12); tone(c, 988, 0.35, 0.05, 'triangle', 0.08); tone(c, 1319, 0.4, 0.04, 'triangle', 0.16); }
