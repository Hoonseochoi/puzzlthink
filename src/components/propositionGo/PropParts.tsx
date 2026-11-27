"use client";

// 명제 바둑's look: the coloured 바둑알 characters (with moods), the region chip (a mini 4×4 go board with the
// points lit), a proposition line (chips mixed into a few words) and the tactile proposition card.
// Everything is plain SVG/CSS: no filters, transforms only, so a full board and eight cards stay smooth on a phone.
import { memo, type ReactNode, useId } from 'react';
import { Check, Gem, HelpCircle, VenetianMask, X } from 'lucide-react';
import { REGION_MASK, type Prop, type RegionId, STONES, type Truth } from '@/lib/propositionGo';
import { joinsPrev, propTokens } from '@/lib/propositionGoText';

export const PG_ACCENT = '#9b7bff';
export const PG_INK = '#12062e';

export type Mood = 'idle' | 'happy' | 'worried' | 'shock' | 'look' | 'proud';

/** Gradients for the five stones, once per page (the stones anywhere on the page point at them). */
export function PgDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        {STONES.map((s) => (
          <radialGradient key={s.id} id={`pg-${s.id}`} cx="34%" cy="28%" r="78%">
            <stop offset="0%" stopColor={s.hi} />
            <stop offset="52%" stopColor={s.mid} />
            <stop offset="100%" stopColor={s.lo} />
          </radialGradient>
        ))}
      </defs>
      <style>{PG_CSS}</style>
    </svg>
  );
}

/** Keyframes shared by the game (all of them stop under prefers-reduced-motion). */
const PG_CSS = `
@keyframes pg-blink { 0%, 93%, 100% { transform: scaleY(1) } 96% { transform: scaleY(.12) } }
@keyframes pg-hop { 0% { transform: translateY(0) } 35% { transform: translateY(-18%) scale(1.04, .96) } 70% { transform: translateY(0) scale(.97, 1.03) } 100% { transform: none } }
@keyframes pg-shake { 0%, 100% { transform: none } 20% { transform: translateX(-7%) rotate(-6deg) } 45% { transform: translateX(6%) rotate(5deg) } 70% { transform: translateX(-3%) } }
@keyframes pg-pop { 0% { transform: scale(.96) } 55% { transform: scale(1.035) } 100% { transform: none } }
@keyframes pg-nudge { 0%, 100% { transform: none } 25% { transform: translateX(-3px) } 60% { transform: translateX(3px) } }
@keyframes pg-stamp { 0% { transform: scale(2.2) rotate(-14deg); opacity: 0 } 60% { transform: scale(.92) rotate(-9deg); opacity: 1 } 100% { transform: scale(1) rotate(-9deg); opacity: 1 } }
@keyframes pg-rise { 0% { transform: translateY(14px); opacity: 0 } 100% { transform: none; opacity: 1 } }
@keyframes pg-spark { 0% { transform: translate(0, 0) scale(.4); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: 0 } }
@keyframes pg-glow { 0%, 100% { opacity: .35 } 50% { opacity: .9 } }
@keyframes pg-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
.pg-eyes { transform-box: fill-box; transform-origin: center; animation: pg-blink 4.6s infinite; }
.pg-hop { animation: pg-hop .42s cubic-bezier(.3,.7,.4,1); }
.pg-shake { animation: pg-shake .42s ease-in-out; }
.pg-pop { animation: pg-pop .34s cubic-bezier(.3,.7,.4,1); }
.pg-nudge { animation: pg-nudge .3s ease-in-out; }
.pg-stamp { animation: pg-stamp .5s cubic-bezier(.2,.9,.3,1.2) both; }
.pg-rise { animation: pg-rise .38s cubic-bezier(.2,.8,.3,1) both; }
.pg-spark { animation: pg-spark .9s ease-out forwards; }
.pg-glow { animation: pg-glow 1.8s ease-in-out infinite; }
.pg-float { animation: pg-float 2.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .pg-eyes, .pg-hop, .pg-shake, .pg-pop, .pg-nudge, .pg-rise, .pg-spark, .pg-glow, .pg-float { animation: none !important; }
  .pg-stamp { animation: none !important; transform: rotate(-9deg); }
  .pg-move { transition: none !important; }
}
`;

/** One stone character in a 100×100 box. `colour` indexes STONES. */
export const PgStone = memo(function PgStone({ colour, size, mood = 'idle', className = '', blinkDelay = 0, title }: {
  colour: number; size: number; mood?: Mood; className?: string; blinkDelay?: number; title?: string;
}) {
  const s = STONES[colour];
  const eye = s.eye;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <ellipse cx="50" cy="90" rx="34" ry="7" fill="#000" opacity=".22" />
      <circle cx="50" cy="50" r="42" fill={`url(#pg-${s.id})`} stroke={s.lo} strokeWidth="2" />
      <ellipse cx="34" cy="27" rx="11" ry="6" fill="#fff" opacity=".55" transform="rotate(-32 34 27)" />
      <Face mood={mood} eye={eye} blinkDelay={blinkDelay} />
    </svg>
  );
});

function Face({ mood, eye, blinkDelay }: { mood: Mood; eye: string; blinkDelay: number }) {
  if (mood === 'happy' || mood === 'proud') {
    return (
      <g fill="none" stroke={eye} strokeWidth="6" strokeLinecap="round">
        <path d="M27 50 Q35 39 43 50" /><path d="M57 50 Q65 39 73 50" />
        {mood === 'proud' && <path d="M40 64 Q50 72 60 64" strokeWidth="4.5" />}
      </g>
    );
  }
  if (mood === 'worried') {
    return (
      <g fill={eye}>
        <rect x="31" y="37" width="9" height="19" rx="4.5" transform="rotate(24 35.5 46.5)" />
        <rect x="60" y="37" width="9" height="19" rx="4.5" transform="rotate(-24 64.5 46.5)" />
        <path d="M75 30 q5 8 0 11 q-5-3 0-11z" fill="#bfe4ff" opacity=".9" />
      </g>
    );
  }
  if (mood === 'shock') {
    return (
      <g>
        <circle cx="36" cy="46" r="8.5" fill="#fff" stroke={eye} strokeWidth="2.5" /><circle cx="36" cy="46" r="3.6" fill={eye} />
        <circle cx="64" cy="46" r="8.5" fill="#fff" stroke={eye} strokeWidth="2.5" /><circle cx="64" cy="46" r="3.6" fill={eye} />
        <ellipse cx="50" cy="67" rx="4.5" ry="5.5" fill={eye} />
      </g>
    );
  }
  const dy = mood === 'look' ? 7 : 0;
  return (
    <g className="pg-eyes" style={{ animationDelay: `${blinkDelay}s` }} fill={eye}>
      <rect x="31" y={36 + dy} width="9.5" height="19" rx="4.75" />
      <rect x="59.5" y={36 + dy} width="9.5" height="19" rx="4.75" />
    </g>
  );
}

/** The board's look: near-black with neon violet lines (a wide faint stroke under a thin bright one: a glow without filters). */
export const NEON = { line: '#c9b6ff', glow: '#8b5cff', node: '#5ff0ff', label: '#9b7bff' };
export const BOARD_BG = 'bg-[radial-gradient(120%_120%_at_30%_0%,#1d1638_0%,#0d0a1c_55%,#06050b_100%)] ring-1 ring-[#9b7bff]/45 shadow-[0_0_28px_rgba(139,92,255,.28),0_14px_34px_rgba(0,0,0,.6),inset_0_0_30px_rgba(139,92,255,.12)]';
const GRID = 'M12.5 12.5H87.5M12.5 37.5H87.5M12.5 62.5H87.5M12.5 87.5H87.5M12.5 12.5V87.5M37.5 12.5V87.5M62.5 12.5V87.5M87.5 12.5V87.5';
/** The 4×4 points in a 100×100 box: neon lines, a brighter frame, glowing corner nodes; `labels` adds 1–4 on two sides. */
export function NeonGrid({ labels = false, lit = 0 }: { labels?: boolean; lit?: number }) {
  return (
    <>
      <path d={GRID} stroke={NEON.glow} strokeWidth="2.6" strokeOpacity=".32" strokeLinecap="round" />
      <path d={GRID} stroke={NEON.line} strokeWidth=".7" strokeOpacity=".9" />
      <rect x="12.5" y="12.5" width="75" height="75" fill="none" stroke={NEON.glow} strokeWidth="4" strokeOpacity=".3" />
      <rect x="12.5" y="12.5" width="75" height="75" fill="none" stroke="#e4dbff" strokeWidth="1.1" />
      {Array.from({ length: 16 }, (_, c) => {
        const x = 12.5 + (c & 3) * 25, y = 12.5 + (c >> 2) * 25, corner = (c === 0 || c === 3 || c === 12 || c === 15);
        return (lit >> c) & 1
          ? <g key={c}><circle cx={x} cy={y} r="10.5" fill={NEON.node} opacity=".14" /><circle cx={x} cy={y} r="10.5" fill="none" stroke={NEON.node} strokeWidth=".9" opacity=".85" /></g>
          : <circle key={c} cx={x} cy={y} r={corner ? 1.5 : 1.1} fill={corner ? NEON.node : NEON.line} opacity={corner ? 0.95 : 0.7} />;
      })}
      {labels && [0, 1, 2, 3].map((i) => <text key={`r${i}`} x="4.2" y={14 + i * 25} fontSize="4.2" fontWeight="900" fill={NEON.label} textAnchor="middle">{i + 1}</text>)}
      {labels && [0, 1, 2, 3].map((i) => <text key={`c${i}`} x={12.5 + i * 25} y="6.2" fontSize="4.2" fontWeight="900" fill={NEON.label} textAnchor="middle">{i + 1}</text>)}
    </>
  );
}

/** A mini 4×4 go board with the region's points lit (the chip in a proposition). */
export const RegionIcon = memo(function RegionIcon({ r, size = 14, on = NEON.node }: { r: RegionId; size?: number; on?: string }) {
  const m = REGION_MASK[r];
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" className="shrink-0">
      <rect x=".5" y=".5" width="19" height="19" rx="3.5" fill="#0d0a1c" stroke="#9b7bff" strokeOpacity=".7" strokeWidth=".8" />
      <path d="M4 4H16M4 8H16M4 12H16M4 16H16M4 4V16M8 4V16M12 4V16M16 4V16" stroke="#9b7bff" strokeOpacity=".75" strokeWidth=".7" />
      {Array.from({ length: 16 }, (_, c) => ((m >> c) & 1 ? <circle key={c} cx={4 + (c & 3) * 4} cy={4 + (c >> 2) * 4} r="1.8" fill={on} /> : null))}
    </svg>
  );
});

/** A proposition as chips and words. `stones` maps the puzzle's stone index to its colour. */
export function PropLine({ prop, stones, locale, chip = 15 }: { prop: Prop; stones: number[]; locale: 'ko' | 'en'; chip?: number }) {
  const toks = propTokens(prop, stones, locale);
  const out: ReactNode[] = [];
  toks.forEach((t, i) => {
    const gap = i > 0 && !joinsPrev(t, locale) ? ' ' : '';
    if (t.k === 'w') { out.push(<span key={i}>{gap}{t.v.trimStart()}</span>); return; }
    if (gap) out.push(<span key={`g${i}`}> </span>);
    if (t.k === 'stone') {
      const s = STONES[t.colour];
      out.push(
        <span key={i} className="inline-flex items-baseline whitespace-nowrap">
          <PgStone colour={t.colour} size={chip} className="mr-[1px] self-center" />
          <b className="font-black" style={{ color: s.mid }}>{locale === 'ko' ? s.ko : s.en}</b>
        </span>,
      );
    } else {
      out.push(
        <span key={i} className="inline-flex items-center gap-[2px] whitespace-nowrap align-[-1px] font-black text-[#d9ccff]">
          <RegionIcon r={t.r} size={chip - 1} />{t.label}
        </span>,
      );
    }
  });
  return <>{out}</>;
}

export type CardState = Truth | 'lie' | 'held';
const CARD_TONE: Record<CardState, string> = {
  open: 'border-white/[0.09] bg-[#1b1a26]',
  true: 'border-[#3fd67a]/55 bg-[linear-gradient(135deg,rgba(63,214,122,.16),rgba(63,214,122,.05))]',
  false: 'border-[#ff4d5e]/60 bg-[linear-gradient(135deg,rgba(255,77,94,.18),rgba(255,77,94,.05))]',
  lie: 'border-[#ff4d5e] border-dashed bg-[repeating-linear-gradient(135deg,rgba(255,77,94,.18)_0_8px,rgba(255,77,94,.08)_8px_16px)]',
  held: 'border-white/[0.09] bg-[#1b1a26]',
};

/**
 * One proposition card. The left mark shows its state: ✓ true, ✗ false, ? not decided yet, a mask for the exposed lie.
 * `hint`: bought with a 피스 (gold rim, always true). Pressing a card lights its stones and region on the board.
 * `flash` remounts the inner part so the pop / nudge plays once each time the card changes state.
 */
export const PropCard = memo(function PropCard({ prop, stones, locale, state, hint, focused, flash, onPress, label }: {
  prop: Prop; stones: number[]; locale: 'ko' | 'en'; state: CardState; hint?: boolean; focused?: boolean; flash: number; onPress?: () => void; label?: string;
}) {
  const mark = state === 'true' ? <Check size={12} strokeWidth={3.4} /> : state === 'false' ? <X size={12} strokeWidth={3.4} /> : state === 'lie' ? <VenetianMask size={12} strokeWidth={2.6} /> : <HelpCircle size={12} strokeWidth={2.4} />;
  const markTone = state === 'true' ? 'bg-[#3fd67a] text-[#06231a]' : state === 'false' || state === 'lie' ? 'bg-[#ff4d5e] text-white' : 'bg-white/10 text-white/45';
  const anim = flash ? (state === 'true' ? 'pg-pop' : state === 'false' ? 'pg-nudge' : '') : '';
  return (
    <button type="button" onClick={onPress} aria-pressed={focused} aria-label={label}
      className={`relative w-full overflow-hidden rounded-[11px] border text-left transition-[border-color,background-color,box-shadow] duration-200 ${CARD_TONE[state]} ${hint ? 'ring-1 ring-[#ffd36e]/70' : ''} ${focused ? 'shadow-[0_0_0_2px_#9b7bff,0_6px_18px_rgba(155,123,255,.25)]' : 'shadow-[0_2px_0_rgba(0,0,0,.35)]'} active:translate-y-[1px]`}>
      <span key={flash} className={`flex min-h-[38px] items-center gap-1.5 px-2 py-1 ${anim}`}>
        <span className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${markTone}`}>{mark}</span>
        <span className="min-w-0 flex-1 break-keep text-[12px] font-bold leading-[16px] text-white/[0.88]"><PropLine prop={prop} stones={stones} locale={locale} chip={13} />{hint && <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-[#ffd36e]/20 px-1 align-[1px] text-[8.5px] font-black tracking-[0.06em] text-[#ffd36e]"><Gem size={8} />PIECE</span>}</span>
      </span>
      {state === 'lie' && <span className="pg-stamp pointer-events-none absolute right-1.5 top-1/2 -mt-[11px] rounded-[4px] border-2 border-[#ff4d5e] bg-[#1b0a10]/90 px-1.5 text-[12px] font-black leading-[18px] tracking-[0.04em] text-[#ff6b7a]">{locale === 'ko' ? '거짓!' : 'LIE!'}</span>}
    </button>
  );
});

/** The series mark: PUZZLTHINK ORIGINAL. `size` sm for headers and tiles, md for the home row and the landing page. */
export function OriginalMark({ size = 'sm', className = '' }: { size?: 'xs' | 'sm' | 'md'; className?: string }) {
  const box = size === 'md' ? 'h-7 gap-1.5 pl-1 pr-2.5 text-[11px]' : size === 'sm' ? 'h-5 gap-1 pl-[3px] pr-1.5 text-[8.5px]' : 'h-4 gap-[3px] pl-[2px] pr-1 text-[7px]';
  const stone = size === 'md' ? 20 : size === 'sm' ? 14 : 11;
  const gid = `pg-om${useId().replace(/:/g, '')}`; // its own gradient: a copy inside a hidden header would hide the others'
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full bg-[linear-gradient(135deg,#1a0f3a,#2c1470)] font-black leading-none tracking-[0.14em] text-white ring-1 ring-[#c9b6ff]/60 ${box} ${className}`}>
      <svg viewBox="0 0 24 24" width={stone} height={stone} aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill={`url(#${gid})`} />
        <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe29a" /><stop offset=".5" stopColor="#c9b6ff" /><stop offset="1" stopColor="#9b7bff" /></linearGradient></defs>
        <rect x="7.3" y="7.5" width="3" height="6.2" rx="1.5" fill="#1a0f3a" /><rect x="13.7" y="7.5" width="3" height="6.2" rx="1.5" fill="#1a0f3a" />
        <path d="M7.5 16.6 Q12 19.4 16.5 16.6" fill="none" stroke="#1a0f3a" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span><span className="text-[#c9b6ff]">PUZZLTHINK</span> ORIGINAL</span>
    </span>
  );
}

/** A few sparks thrown out of a point (the finish and the lie reveal). CSS only, removed by the parent. */
export function Sparks({ n = 10, colours }: { n?: number; colours: string[] }) {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3;
        const d = 46 + (i % 3) * 14;
        return <i key={i} className="pg-spark absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full" style={{ background: colours[i % colours.length], '--dx': `${Math.cos(a) * d}px`, '--dy': `${Math.sin(a) * d}px`, animationDelay: `${(i % 4) * 40}ms` } as React.CSSProperties} />;
      })}
    </span>
  );
}

/** Home / OG tile art: the board with four stones and two cards, one true one false. */
export function PropTile() {
  return (
    <div className="relative flex h-[300px] w-[300px] flex-col items-center justify-center gap-3 bg-[radial-gradient(120%_90%_at_20%_0%,#3b2393,#12062e_70%)]">
      <PgDefs />
      <div className={`relative h-[170px] w-[170px] rounded-[14px] ${BOARD_BG}`}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full"><NeonGrid /></svg>
        {[[0, 0, 0, 'happy'], [1, 2, 1, 'idle'], [2, 1, 3, 'happy'], [3, 3, 2, 'worried']].map(([c, x, y, m]) => (
          <span key={c as number} className="absolute" style={{ left: 21.25 + (x as number) * 42.5 - 17, top: 21.25 + (y as number) * 42.5 - 17 }}><PgStone colour={c as number} size={34} mood={m as Mood} /></span>
        ))}
      </div>
      <div className="flex w-[236px] flex-col gap-1.5">
        <span className="flex items-center gap-1.5 rounded-[9px] border border-[#3fd67a]/60 bg-[#3fd67a]/15 px-2 py-1 text-[13px] font-black text-white"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#3fd67a] text-[#06231a]"><Check size={11} strokeWidth={3.4} /></span><PgStone colour={0} size={15} /><b style={{ color: STONES[0].mid }}>빨강</b>은 <RegionIcon r="corner" size={13} />모서리</span>
        <span className="flex items-center gap-1.5 rounded-[9px] border border-[#ff4d5e]/60 bg-[#ff4d5e]/15 px-2 py-1 text-[13px] font-black text-white"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4d5e] text-white"><X size={11} strokeWidth={3.4} /></span><PgStone colour={1} size={15} /><b style={{ color: STONES[1].mid }}>파랑</b>은 <PgStone colour={2} size={15} /><b style={{ color: STONES[2].mid }}>초록</b>보다 위</span>
      </div>
    </div>
  );
}
