type WebkitWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

let sharedContext: AudioContext | null = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!AudioContextClass) return null;
  sharedContext ??= new AudioContextClass();
  if (sharedContext.state === 'suspended') void sharedContext.resume();
  return sharedContext;
}

function tone(context: AudioContext, frequency: number, duration: number, volume: number, type: OscillatorType = 'sine', delay = 0) {
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

function noise(context: AudioContext, duration: number, volume: number, delay = 0) {
  const start = context.currentTime + delay;
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1800, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(start);
}

export function unlockGameAudio() {
  const context = getContext();
  if (context?.state === 'suspended') void context.resume();
}

export function playCylinderSpin() {
  const context = getContext();
  if (!context) return;
  [0, 0.065, 0.13, 0.195].forEach((delay, index) => tone(context, 520 - index * 42, 0.045, 0.05, 'square', delay));
}

export function playDryFire() {
  const context = getContext();
  if (!context) return;
  tone(context, 170, 0.075, 0.08, 'square');
  tone(context, 1150, 0.025, 0.025, 'triangle', 0.015);
}

export function playRevolverShot() {
  const context = getContext();
  if (!context) return;
  noise(context, 0.42, 0.42);
  tone(context, 76, 0.5, 0.38, 'sine');
  tone(context, 155, 0.18, 0.16, 'sawtooth');
  noise(context, 0.2, 0.12, 0.08);
}
