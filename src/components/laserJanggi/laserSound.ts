// Soft synthesised sounds for 레이저 장기 (no audio files): a click for the move, a rising charge, the zap, a tick on
// each mirror, a crunch on a hit and a low boom for a king. Muted with the header toggle (stored per browser), and
// silent until the player has touched the page.
type WebkitWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
const MUTE_KEY = 'puzzlthink_laser_janggi_mute';
let audio: AudioContext | null = null;

export const laserSoundOn = () => { try { return localStorage.getItem(MUTE_KEY) !== '1'; } catch { return true; } };
export const setLaserSound = (on: boolean) => { try { localStorage.setItem(MUTE_KEY, on ? '0' : '1'); } catch { /* optional */ } };

function ctx() {
  if (typeof window === 'undefined' || !laserSoundOn()) return null;
  try { if (!navigator.userActivation?.hasBeenActive) return null; } catch { /* old browsers */ }
  const C = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!C) return null;
  audio ??= new C();
  if (audio.state === 'suspended') void audio.resume();
  return audio;
}

function tone(c: AudioContext, f: number, d: number, v: number, type: OscillatorType, delay = 0, to?: number) {
  const at = c.currentTime + delay / 1000, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, at);
  if (to) o.frequency.exponentialRampToValueAtTime(to, at + d);
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(v, at + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, at + d);
  o.connect(g).connect(c.destination); o.start(at); o.stop(at + d + 0.02);
}

function noise(c: AudioContext, d: number, v: number, delay = 0, lowpass = 1800) {
  const at = c.currentTime + delay / 1000;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * d), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  src.buffer = buf; f.type = 'lowpass'; f.frequency.value = lowpass; g.gain.value = v;
  src.connect(f).connect(g).connect(c.destination); src.start(at);
}

/** One turn's sounds, scheduled on the same clock as the board animation (all times in ms from the action). */
export function playShotSound(t: { fire: number; bounces: number[]; splits: number[]; hits: number[]; king: number | null; slide: boolean }) {
  const c = ctx();
  if (!c) return;
  if (t.slide) tone(c, 380, 0.05, 0.04, 'triangle');
  tone(c, 220, t.fire / 1000 + 0.04, 0.025, 'sawtooth', Math.max(0, t.fire - 260), 880); // charge
  tone(c, 1400, 0.18, 0.05, 'square', t.fire, 300); // zap
  for (const at of t.bounces.slice(0, 8)) tone(c, 1800, 0.06, 0.025, 'triangle', at);
  for (const at of t.splits.slice(0, 4)) { tone(c, 1200, 0.1, 0.03, 'triangle', at); tone(c, 1800, 0.1, 0.025, 'triangle', at + 20); }
  for (const at of t.hits.slice(0, 4)) { noise(c, 0.22, 0.18, at, 2600); tone(c, 160, 0.18, 0.12, 'sine', at, 60); }
  if (t.king !== null) { noise(c, 0.9, 0.3, t.king, 900); tone(c, 90, 1.1, 0.3, 'sine', t.king, 32); tone(c, 660, 0.5, 0.05, 'triangle', t.king + 300, 990); }
}

export function playTick() { const c = ctx(); if (c) tone(c, 900, 0.04, 0.025, 'triangle'); }
