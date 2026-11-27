"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Check, Palette, Sparkles } from 'lucide-react';
import { SLITHER_THEMES, type SlitherTheme, useSlitherPrefs } from '@/lib/slitherTheme';
import { accentVars } from '@/components/ui/gameUi';
import { CUTE_DIGITS, DIGIT_PEN, DIGIT_STRIPE, DIGIT_STRIPE_DASH, bulbIndex } from '@/lib/slitherGlyphs';

/** A 2×2-cell corner of the board in a theme: a "3" with the loop round it. */
function Swatch({ theme }: { theme: SlitherTheme }) {
  const b = theme.board;
  const loop: [boolean, number, number][] = [[true, 0, 0], [true, 0, 1], [false, 0, 2], [true, 1, 0], [true, 1, 1], [false, 0, 0]];
  const garland = theme.line === 'garland';
  return (
    <svg viewBox="0 0 3 3" className="h-14 w-14 shrink-0 rounded-md" style={{ background: b.bg }} aria-hidden>
      {theme.numerals === 'cute'
        ? <g transform="translate(1 1)"><path d={CUTE_DIGITS[3]} fill="none" stroke={b.num} strokeWidth={DIGIT_PEN} strokeLinecap="round" strokeLinejoin="round" /><path d={CUTE_DIGITS[3]} fill="none" stroke="#fff" strokeWidth={DIGIT_STRIPE} strokeLinecap="round" strokeDasharray={DIGIT_STRIPE_DASH} opacity={0.75} /></g>
        : <text x={1} y={1.03} textAnchor="middle" dominantBaseline="middle" fontSize={0.56} fontFamily="Georgia, 'Times New Roman', serif" fontWeight={600} fill={b.num}>3</text>}
      {loop.map(([h, r, c]) => <line key={`${h}${r}${c}`} x1={c + 0.5} y1={r + 0.5} x2={h ? c + 1.5 : c + 0.5} y2={h ? r + 0.5 : r + 1.5} stroke={b.line} strokeWidth={0.1} strokeLinecap="round" />)}
      {garland && loop.map(([h, r, c]) => <circle key={`b${h}${r}${c}`} cx={h ? c + 1 : c + 0.5} cy={h ? r + 0.5 : r + 1} r={0.09} fill={b.bulbs![bulbIndex(h, r, c, b.bulbs!.length)]} stroke="#fff" strokeWidth={0.02} />)}
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={(i % 3) + 0.5} cy={Math.floor(i / 3) + 0.5} r={0.075} fill={b.dot} />)}
    </svg>
  );
}

/** Header button + popover: pick the board theme and switch the festive effects on or off. Saved per browser. */
export default function SlitherThemePicker({ className = '', withLabel = false }: { className?: string; withLabel?: boolean }) {
  const t = useTranslations('Slitherlink');
  const { theme, setTheme, effects, setEffects, reducedMotion } = useSlitherPrefs();
  // Where the popover goes (under the button). It is portalled to <body>: the header is its own stacking context.
  const [open, setOpen] = useState<{ top: number; left: number; width: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const toggle = () => {
    if (open) { setOpen(null); return; }
    const r = box.current!.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 24);
    setOpen({ top: r.bottom + 8, width, left: Math.max(12, Math.min(window.innerWidth - width - 12, r.right - width)) });
  };
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    const onDown = (e: PointerEvent) => { const el = e.target as Node; if (!box.current?.contains(el) && !pop.current?.contains(el)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, { passive: true });
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', close); window.removeEventListener('scroll', close); };
  }, [open]);
  const hasFx = theme.effects.snow || theme.effects.celebrate;
  return (
    <div ref={box} className={`relative ${className}`}>
      <button type="button" onClick={toggle} aria-expanded={!!open} aria-haspopup="dialog" aria-label={t('themeButton')} title={t('themeButton')} data-testid="slither-theme"
        className="inline-flex items-center gap-1.5 rounded-md border border-(--accent)/50 bg-(--accent)/15 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-(--accent)/25">
        <Palette size={14} /><span className={withLabel ? undefined : 'hidden sm:inline'}>{t('themeButton')}</span>
      </button>
      {open && createPortal(
        <div ref={pop} role="dialog" aria-label={t('themeTitle')} style={{ ...accentVars(theme.accent, theme.ink), top: open.top, left: open.left, width: open.width }}
          className="fixed z-[90] rounded-[14px] border border-white/15 bg-[#14161b]/95 p-3 text-left text-[#e6e9f0] shadow-2xl backdrop-blur">
          <p className="px-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{t('themeTitle')}</p>
          <div className="mt-2 space-y-1.5">
            {SLITHER_THEMES.map((th) => {
              const on = th.id === theme.id;
              return (
                <button key={th.id} type="button" onClick={() => setTheme(th.id)} aria-pressed={on} data-theme-option={th.id}
                  className={`flex w-full items-center gap-3 rounded-[10px] border p-2 text-left transition ${on ? 'border-(--accent) bg-(--accent)/15' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}>
                  <Swatch theme={th} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-white">{t(`theme_${th.id}`)}</span>
                    <span className="block break-keep text-[11px] leading-4 text-white/50">{t(`themeDesc_${th.id}`)}</span>
                  </span>
                  {on && <Check size={16} className="shrink-0 text-(--accent)" />}
                </button>
              );
            })}
          </div>
          {hasFx && (
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <Sparkles size={15} className="shrink-0 text-[#ffc23d]" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-black text-white">{t('themeEffects')}</span>
                <span className="block break-keep text-[10px] leading-4 text-white/45">{reducedMotion ? t('themeEffectsReduced') : t('themeEffectsDesc')}</span>
              </span>
              <input type="checkbox" checked={effects} onChange={(e) => setEffects(e.target.checked)} className="h-4 w-4 shrink-0 accent-(--accent)" data-testid="slither-fx" />
            </label>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
