"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Palette, Sparkles } from 'lucide-react';
import { SLITHER_THEMES, type SlitherTheme, useSlitherPrefs } from '@/lib/slitherTheme';
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
export default function SlitherThemePicker() {
  const t = useTranslations('Slitherlink');
  const { theme, setTheme, effects, setEffects, reducedMotion } = useSlitherPrefs();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const hasFx = theme.effects.snow || theme.effects.celebrate;
  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="dialog" aria-label={t('themeButton')} title={t('themeButton')} data-testid="slither-theme"
        className="inline-flex items-center gap-1.5 rounded-md border border-(--accent)/50 bg-(--accent)/15 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-(--accent)/25">
        <Palette size={14} /><span className="hidden sm:inline">{t('themeButton')}</span>
      </button>
      {open && (
        <div role="dialog" aria-label={t('themeTitle')} className="absolute right-0 top-full z-50 mt-2 w-[min(300px,calc(100vw-24px))] rounded-[14px] border border-white/15 bg-[#14161b]/95 p-3 text-left shadow-2xl backdrop-blur">
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
        </div>
      )}
    </div>
  );
}
