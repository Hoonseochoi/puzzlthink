"use client";

// How the betting games show their AI personas: the 바둑알 face, a table tag with name, blurb and a short speech
// bubble, the reveal card on the result screen, and the roster chips for the entry/lobby panels.
import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { type PersonaId, PERSONAS, PERSONA_IDS, personaName } from '@/lib/aiPersona';

function shade(hex: string, t: number) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const m = c.map((v) => Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t)));
  return `#${m.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** The site's 바둑알 (a glossy stone with two eyes) in the persona's colour. */
export function PersonaFace({ id, size = 32, label }: { id: PersonaId; size?: number; label?: string }) {
  const uid = useId().replace(/:/g, '');
  const color = PERSONAS[id].color;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={label ?? PERSONAS[id].nameEn}>
      <defs>
        <radialGradient id={`pf-${uid}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={shade(color, 0.45)} /><stop offset="55%" stopColor={color} /><stop offset="100%" stopColor={shade(color, -0.45)} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="53" r="46" fill="rgba(0,0,0,.22)" />
      <circle cx="50" cy="50" r="46" fill={`url(#pf-${uid})`} stroke={shade(color, -0.6)} strokeWidth="2" />
      <rect x="34.8" y="33.9" width="9.2" height="17" rx="4.6" fill="#fff" />
      <rect x="56" y="33.9" width="9.2" height="17" rx="4.6" fill="#fff" />
    </svg>
  );
}

/** A line of table talk: `key` changes for every new line so the bubble re-appears. */
export type PersonaSay = { text: string; key: number } | null;

/** Speech bubble that fades after a moment (no motion with prefers-reduced-motion). */
export function PersonaBubble({ say, align = 'below' }: { say: PersonaSay; align?: 'below' | 'left' | 'right' }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState<PersonaSay>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new line replaces the old one, then times out
    setShown(say);
    if (!say) return;
    const id = window.setTimeout(() => setShown(null), 2600);
    return () => window.clearTimeout(id);
  }, [say]);
  return (
    <span className={`pointer-events-none absolute z-20 ${align === 'below' ? 'left-0 top-full mt-1.5' : align === 'left' ? 'left-full top-1/2 ml-2 -translate-y-1/2' : 'right-full top-1/2 mr-2 -translate-y-1/2'}`} aria-live="polite">
      <AnimatePresence>
        {shown && (
          <motion.span key={shown.key} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.18 }}
            className="block w-max max-w-[11rem] break-keep rounded-[10px] border border-white/15 bg-[#1c1c24] px-2.5 py-1.5 text-[11px] font-bold leading-4 text-white/85 shadow-lg">
            {shown.text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** At the table: face, name and the one-line blurb; table talk pops out of the face. */
export function PersonaTag({ id, en, say = null, compact = false, className = '' }: { id: PersonaId; en: boolean; say?: PersonaSay; compact?: boolean; className?: string }) {
  const p = PERSONAS[id];
  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <span className="relative shrink-0"><PersonaFace id={id} size={compact ? 24 : 30} /><PersonaBubble say={say} /></span>
      <span className="min-w-0">
        <b className="block truncate text-xs font-black" style={{ color: p.color }}>{personaName(id, en)}</b>
        {!compact && <span className="block truncate text-[10px] leading-4 text-white/45">{en ? p.blurb.en : p.blurb.ko}</span>}
      </span>
    </div>
  );
}

/** On the result screen: who it was, the style, how it plays and how to read it. */
export function PersonaReveal({ id, en, tell, lines = [], className = '' }: { id: PersonaId; en: boolean; tell?: { ko: string; en: string }; lines?: string[]; className?: string }) {
  const p = PERSONAS[id];
  return (
    <section className={`rounded-[14px] border border-white/10 bg-black/30 p-3 ${className}`} style={{ borderColor: `${p.color}55` }}>
      <div className="flex items-center gap-2.5">
        <PersonaFace id={id} size={34} />
        <div className="min-w-0">
          <p className="text-[10px] font-black tracking-[.14em] text-white/40">{en ? 'YOUR OPPONENT WAS' : '오늘의 상대'}</p>
          <p className="text-sm font-black"><span style={{ color: p.color }}>{personaName(id, en)}</span> · {en ? p.style.en : p.style.ko}</p>
        </div>
      </div>
      <p className="mt-2 break-keep text-xs leading-5 text-white/65">{en ? p.plays.en : p.plays.ko}</p>
      {tell && <p className="mt-1.5 break-keep text-xs leading-5 text-white/55"><b className="text-white/75">{en ? 'Tell: ' : '읽는 법: '}</b>{en ? tell.en : tell.ko}</p>}
      {lines.length > 0 && <ul className="mt-2 space-y-0.5 text-[11px] leading-4 text-white/45">{lines.map((l) => <li key={l}>· {l}</li>)}</ul>}
    </section>
  );
}

/** Every persona as chips (entry and lobby panels). */
export function PersonaRoster({ en, ids = PERSONA_IDS, note }: { en: boolean; ids?: readonly PersonaId[]; note?: string }) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <span key={id} title={en ? PERSONAS[id].blurb.en : PERSONAS[id].blurb.ko} className="flex items-center gap-1.5 rounded-full border border-white/10 py-1 pl-1 pr-2.5 text-[11px] font-bold">
            <PersonaFace id={id} size={18} />{personaName(id, en)}
          </span>
        ))}
      </div>
      {note && <p className="mt-2 break-keep text-[10px] leading-4 text-white/40">{note}</p>}
    </div>
  );
}

/** Table talk state for a game: `talk(text)` shows a new line. */
export function usePersonaSay() {
  const [say, setSay] = useState<PersonaSay>(null);
  return [say, (text: string | null) => setSay(text ? { text, key: Date.now() + Math.random() } : null)] as const;
}
