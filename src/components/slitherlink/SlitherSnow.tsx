"use client";

import { useEffect, useRef } from 'react';

/**
 * Gentle snowfall behind the board: one fixed canvas under the page content (pointer-events off, so input is never
 * touched). Cheap on purpose: a few dozen flakes scaled to the screen, ~30 frames a second, device-pixel ratio capped
 * at 1.5, and it stops entirely while the tab is hidden. Render it only when effects may move (see useSlitherPrefs).
 */
export default function SlitherSnow() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let w = 0, h = 0, raf = 0, last = 0;
    type Flake = { x: number; y: number; r: number; vy: number; drift: number; phase: number; a: number };
    let flakes: Flake[] = [];
    const make = (y?: number): Flake => ({ x: Math.random() * w, y: y ?? Math.random() * h, r: 0.8 + Math.random() * 2.2, vy: 14 + Math.random() * 26, drift: 6 + Math.random() * 14, phase: Math.random() * 6.28, a: 0.35 + Math.random() * 0.5 });
    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(18, (w * h) / 16000)));
      flakes = Array.from({ length: count }, (_, i) => flakes[i] ?? make());
    };
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (t - last < 32) return; // ~30 fps is plenty for snow
      const dt = Math.min(0.1, (t - (last || t)) / 1000);
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      for (const f of flakes) {
        f.y += f.vy * dt; f.phase += dt * 0.9;
        const x = f.x + Math.sin(f.phase) * f.drift;
        if (f.y - f.r > h) Object.assign(f, make(-4));
        ctx.globalAlpha = f.a;
        ctx.beginPath(); ctx.arc(x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
      }
    };
    const start = () => { if (!raf && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVis = () => (document.hidden ? stop() : start());
    resize(); start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
