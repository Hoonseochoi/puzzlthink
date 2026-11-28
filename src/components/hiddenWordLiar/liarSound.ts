"use client";

// 히든 워드: 라이어 sound: everything is synthesised with Web Audio (no files). Two switches, kept in localStorage:
//   효과음 (SFX + vibration), on by default; 배경음 (BGM), off by default. Nothing makes a sound before the player has
//   touched the page (browsers refuse anyway; we also wait for the first pointerdown ourselves).
// BGM: a very quiet pad with a slow pluck. 'calm' while clues go round, 'tense' (lower, with a heartbeat) for the vote,
// last words and the decision, 'none' in the lobby and after the game. Master volume: SFX 0.5, BGM 0.04.

type Mood = 'none' | 'calm' | 'tense';
const SFX_KEY = 'puzzlthink_liar_sfx';
const BGM_KEY = 'puzzlthink_liar_bgm';
const read = (k: string, dflt: boolean) => { try { const v = localStorage.getItem(k); return v == null ? dflt : v === '1'; } catch { return dflt; } };
const write = (k: string, on: boolean) => { try { localStorage.setItem(k, on ? '1' : '0'); } catch { /* optional */ } };
const EVENT = 'hwl-sound';

export const sfxOn = () => read(SFX_KEY, true);
export const bgmOn = () => read(BGM_KEY, false);
export const setSfx = (on: boolean) => { write(SFX_KEY, on); window.dispatchEvent(new Event(EVENT)); };
export const setBgm = (on: boolean) => { write(BGM_KEY, on); window.dispatchEvent(new Event(EVENT)); if (on) unlock(); syncBgm(); };
export const onSoundChange = (fn: () => void) => { window.addEventListener(EVENT, fn); return () => window.removeEventListener(EVENT, fn); };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;
function audio() {
  if (typeof window === 'undefined' || !unlocked) return null;
  const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!C) return null;
  if (!ctx) { ctx = new C(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination); }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
/** Call from a user gesture (the room listens for the first pointerdown). */
export function unlock() { unlocked = true; audio(); syncBgm(); }

function tone(f: number, dur: number, vol: number, type: OscillatorType = 'sine', delay = 0, slideTo?: number) {
  const c = audio();
  if (!c || !master || !sfxOn()) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02);
}
/** A short buzz on phones (only with 효과음 on). */
export function buzz(pattern: number | number[]) { if (!unlocked || !sfxOn()) return; try { navigator.vibrate?.(pattern); } catch { /* optional */ } }

export const sfx = {
  myTurn: () => { tone(523, 0.12, 0.09, 'triangle'); tone(784, 0.2, 0.09, 'triangle', 0.1); buzz([20, 40, 20]); },
  clue: (hot: boolean) => hot ? [0, 0.07, 0.14].forEach((d, i) => tone(620 + i * 180, 0.14, 0.07, 'triangle', d)) : tone(540, 0.1, 0.06),
  mark: () => tone(880, 0.07, 0.05, 'sine', 0, 1320),
  tick: (last: boolean) => { tone(last ? 880 : 660, 0.06, 0.06, 'triangle'); buzz(last ? 40 : 15); },
  tally: (n: number) => { for (let i = 0; i < Math.min(n, 8); i++) tone(150, 0.12, 0.12, 'sine', i * 0.09, 90); },
  flip: (liar: boolean) => liar ? (tone(330, 0.25, 0.1, 'sawtooth', 0, 165), tone(990, 0.3, 0.05, 'triangle', 0.12)) : tone(1200, 0.04, 0.05, 'square'),
  caught: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 0.08, 'triangle', i * 0.09)); buzz([30, 60, 90]); },
  failed: () => { [440, 349, 294].forEach((f, i) => tone(f, 0.35, 0.08, 'sawtooth', i * 0.14)); buzz([120, 60, 120]); },
  banner: () => tone(392, 0.18, 0.05, 'triangle', 0, 523),
};

// ── BGM ──
let mood: Mood = 'none';
let loop: number | null = null;
let bgmGain: GainNode | null = null;
let beat = 0;
export function setMood(m: Mood) { if (m === mood) return; mood = m; syncBgm(); }
function syncBgm() {
  const c = audio();
  const want = !!c && bgmOn() && mood !== 'none' && (typeof document === 'undefined' || document.visibilityState === 'visible');
  if (!want) { if (loop != null) { window.clearInterval(loop); loop = null; } if (bgmGain && c) bgmGain.gain.setTargetAtTime(0, c.currentTime, 0.3); return; }
  if (!bgmGain) { bgmGain = c.createGain(); bgmGain.gain.value = 0; bgmGain.connect(c.destination); }
  bgmGain.gain.setTargetAtTime(0.04, c.currentTime, 0.8);
  if (loop == null) loop = window.setInterval(step, 600);
}
function note(f: number, dur: number, vol: number, type: OscillatorType = 'sine') {
  const c = audio();
  if (!c || !bgmGain) return;
  const t = c.currentTime;
  const o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 1400;
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.4, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(lp).connect(g).connect(bgmGain); o.start(t); o.stop(t + dur + 0.05);
}
// calm: A minor pad + a slow pluck; tense: a low D drone + a heartbeat
const CALM = [220, 261.6, 329.6, 392, 329.6, 261.6, 246.9, 293.7];
function step() {
  beat++;
  if (mood === 'calm') {
    if (beat % 8 === 1) { note(110, 4.6, 0.5, 'triangle'); note(164.8, 4.6, 0.32); }
    note(CALM[beat % CALM.length] * 2, 0.9, beat % 2 ? 0.18 : 0.26, 'triangle');
  } else if (mood === 'tense') {
    if (beat % 8 === 1) { note(73.4, 4.8, 0.6, 'sawtooth'); note(110, 4.8, 0.25); }
    note(55, 0.22, 0.9); window.setTimeout(() => note(55, 0.18, 0.6), 170);   // lub-dub
    if (beat % 4 === 3) note(587, 0.5, 0.12, 'triangle');
  }
}
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => syncBgm());
