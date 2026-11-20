"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { SUPPORT_URL, trackSupportClick } from './SupportLink';

const SEEN_KEY = 'puzzlthink_dev_letter_v1';

type Stage = 'hidden' | 'arrive' | 'stone' | 'open';

/** The little black stone with our eyes, holding a letter. */
function LetterStone({ size = 52 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block overflow-visible" aria-hidden>
      <defs>
        <radialGradient id="dl-stone" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#5a5d66" />
          <stop offset="55%" stopColor="#1d1f25" />
          <stop offset="100%" stopColor="#050507" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="54" r="44" fill="rgba(0,0,0,.25)" />
      <circle cx="50" cy="50" r="44" fill="url(#dl-stone)" stroke="#000" strokeWidth="2" />
      <rect x="35" y="33" width="9" height="17" rx="4.5" fill="#fff" />
      <rect x="56" y="33" width="9" height="17" rx="4.5" fill="#fff" />
      {/* the letter, tucked in at the bottom right */}
      <g transform="translate(58 58) rotate(-12)">
        <rect x="0" y="0" width="34" height="24" rx="4" fill="#fff6e2" stroke="#e8a33c" strokeWidth="2.5" />
        <path d="M2 3 L17 14 L32 3" fill="none" stroke="#e8a33c" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="17" cy="15" r="3.4" fill="#ff5b6e" />
      </g>
    </svg>
  );
}

/**
 * 개발자의 편지: on the first visit to home a dynamic-island pill slides down ("개발자의 편지가 도착했어요");
 * a tap anywhere else folds it into a stone that floats in the corner. Tapping the pill or the stone opens the
 * letter, growing out of the island. After the first time only the stone shows.
 */
export default function DevLetter() {
  const t = useTranslations('DevLetter');
  const [stage, setStage] = useState<Stage>('hidden');
  const [shown, setShown] = useState(false); // drives the open/close transition of the island and the card
  const islandRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch { /* private mode */ }
    const id = window.setTimeout(() => { setStage(seen ? 'stone' : 'arrive'); requestAnimationFrame(() => setShown(true)); }, seen ? 400 : 900);
    return () => window.clearTimeout(id);
  }, []);

  const markSeen = () => { try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* optional */ } };

  const fold = () => {
    markSeen();
    setShown(false);
    window.setTimeout(() => { setStage('stone'); requestAnimationFrame(() => setShown(true)); }, 320);
  };
  const open = () => {
    markSeen();
    setShown(false);
    window.setTimeout(() => { setStage('open'); requestAnimationFrame(() => setShown(true)); }, stage === 'arrive' ? 120 : 0);
  };
  const close = () => {
    setShown(false);
    window.setTimeout(() => { setStage('stone'); requestAnimationFrame(() => setShown(true)); }, 280);
  };

  // While the pill is out, a tap anywhere but on it folds it away.
  useEffect(() => {
    if (stage !== 'arrive') return;
    const onDown = (e: PointerEvent) => { if (!islandRef.current?.contains(e.target as Node)) fold(); };
    const auto = window.setTimeout(() => fold(), 12000);
    window.addEventListener('pointerdown', onDown, true);
    return () => { window.removeEventListener('pointerdown', onDown, true); window.clearTimeout(auto); };
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps -- fold only touches setters

  useEffect(() => {
    if (stage !== 'open') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage]);

  if (stage === 'hidden') return null;

  if (stage === 'arrive') {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-[calc(0.5rem+env(safe-area-inset-top))] z-[110] flex justify-center px-3">
        <button
          ref={islandRef}
          type="button"
          onClick={open}
          className={`pointer-events-auto flex items-center gap-2.5 overflow-hidden rounded-full bg-black py-2 pl-2 pr-4 text-white shadow-[0_12px_34px_rgba(0,0,0,.35)] ring-1 ring-white/10 transition-all duration-500 ease-[cubic-bezier(.2,.9,.25,1.15)] ${shown ? 'max-w-[min(92vw,420px)] translate-y-0 opacity-100' : 'max-w-[56px] -translate-y-3 opacity-0'}`}
        >
          <span className="shrink-0 animate-[devBob_2.4s_ease-in-out_infinite]"><LetterStone size={30} /></span>
          <span className={`min-w-0 truncate text-[13px] font-black transition-opacity duration-300 ${shown ? 'opacity-100 delay-200' : 'opacity-0'}`}>{t('arrived')}</span>
          <span className={`shrink-0 rounded-full bg-[#ffcc4d] px-2 py-0.5 text-[10px] font-black text-[#2a1d05] transition-opacity ${shown ? 'opacity-100 delay-300' : 'opacity-0'}`}>{t('read')}</span>
        </button>
      </div>
    );
  }

  if (stage === 'stone') {
    return (
      <button
        type="button"
        onClick={open}
        aria-label={t('openLabel')}
        className={`fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 z-30 [body:has([data-gate-bar])_&]:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] rounded-full transition-all duration-500 ease-[cubic-bezier(.2,.9,.25,1.15)] hover:scale-110 ${shown ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
      >
        <span className="block animate-[devBob_3s_ease-in-out_infinite] drop-shadow-[0_8px_14px_rgba(0,0,0,.3)]"><LetterStone size={52} /></span>
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#ff5b6e] ring-2 ring-[#f3f0e8]" />
      </button>
    );
  }

  // open: the island grows into the letter
  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center px-3 pt-[calc(4.5rem+env(safe-area-inset-top))]" role="dialog" aria-modal="true" aria-label={t('title')}>
      <button type="button" aria-label={t('close')} onClick={close} className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`relative w-full overflow-hidden bg-[#0e0f12] text-white shadow-[0_30px_80px_rgba(0,0,0,.5)] ring-1 ring-white/10 transition-all duration-500 ease-[cubic-bezier(.2,.9,.25,1.12)] ${shown ? 'max-h-[min(78vh,720px)] max-w-[440px] rounded-[30px] opacity-100' : 'max-h-[52px] max-w-[240px] rounded-[26px] opacity-0'}`}>
        <div className="max-h-[min(78vh,720px)] overflow-y-auto overscroll-contain px-5 pb-5 pt-4 sm:px-6">
          <div className="flex items-center gap-3">
            <LetterStone size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black tracking-[0.2em] text-[#ffcc4d]/80">LETTER FROM DEV</p>
              <h2 className="text-lg font-black">{t('title')}</h2>
            </div>
            <button type="button" onClick={close} aria-label={t('close')} className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"><X size={18} /></button>
          </div>

          <div className={`mt-4 space-y-4 break-keep text-[13.5px] leading-[1.75] text-white/80 transition-opacity duration-300 ${shown ? 'opacity-100 delay-200' : 'opacity-0'}`}>
            <p className="text-[15px] font-black text-white">{t('hello')}</p>
            <section>
              <h3 className="mb-1 text-[13px] font-black text-[#ffcc4d]">{t('closedTitle')}</h3>
              <p>{t('closedBody')}</p>
            </section>
            <section>
              <h3 className="mb-1 text-[13px] font-black text-[#ffcc4d]">{t('hobbyTitle')}</h3>
              <p>{t('hobbyBody')}</p>
              <p className="mt-2">{t('promise')}</p>
            </section>
            <section className="rounded-2xl bg-white/[.06] p-4 ring-1 ring-white/10">
              <h3 className="mb-1 text-[13px] font-black text-[#ffcc4d]">{t('supportTitle')}</h3>
              <p>{t('supportBody')}</p>
              <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSupportClick('letter')} className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#ffcc4d] px-4 py-2.5 text-sm font-black text-[#2a1d05] transition hover:brightness-105">☕ {t('supportCta')}</a>
            </section>
            <p className="text-center font-black text-white">{t('bye')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
