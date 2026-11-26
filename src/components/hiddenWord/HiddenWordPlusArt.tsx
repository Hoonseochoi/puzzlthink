import type { CSSProperties } from 'react';
import { ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';

// 히든 워드 확장판 artwork: violet on midnight with gold foil, the premium sibling of the lime original.
// CSS/SVG only; the motion (.hwp-sheen, .hwp-drift, .hwp-glow in globals.css) stops under prefers-reduced-motion.

/** Words of the 확장 pool that drift up behind the sealed card: [word, left %, top %, delay s, opacity]. */
const DRIFT: [string, number, number, number, number][] = [
  ['설렘', 8, 70, 0, 0.55], ['질투', 70, 76, 1.2, 0.45], ['새벽', 14, 30, 2.6, 0.4], ['박물관', 62, 22, 3.4, 0.5],
  ['그리움', 40, 86, 4.1, 0.4], ['화석', 82, 46, 5.2, 0.45], ['약속', 4, 50, 6, 0.35],
];
const HINTS: [string, number, string][] = [['감정', 96.5, '#ff5d73'], ['연인', 91, '#ffc857'], ['초록', 85, '#b79cff']];

function Drift({ size = 12 }: { size?: number }) {
  return <>{DRIFT.map(([w, x, y, d, o]) => (
    <span key={w} lang="ko" className="hwp-drift pointer-events-none absolute font-black tracking-[-0.02em] text-[#d9ccff]"
      style={{ left: `${x}%`, top: `${y}%`, fontSize: size, animationDelay: `${d}s`, '--hwp-o': o } as CSSProperties}>{w}</span>
  ))}</>;
}

function Sealed({ big = false }: { big?: boolean }) {
  return (
    <div className="relative">
      <div aria-hidden className={`absolute rounded-[12px] border border-[#ffd66b]/25 bg-[#2a2050] ${big ? '-right-2.5 -top-2.5 h-full w-full rotate-[5deg]' : '-right-2 -top-2 h-full w-full rotate-[5deg]'}`} />
      <div className={`relative flex items-center gap-2 overflow-hidden rounded-[12px] border border-[#ffd66b]/60 bg-[linear-gradient(135deg,#2e2358,#140f28)] shadow-[0_0_24px_rgba(255,214,107,.18)] ${big ? 'px-5 py-2.5' : 'px-3.5 py-1.5'}`}>
        <KeyRound size={big ? 17 : 13} className="text-[#ffd66b]" />
        <span className={`font-mono font-black tracking-[0.3em] text-[#ffd66b] ${big ? 'text-2xl' : 'text-base'}`}>???</span>
        <span aria-hidden className="hwp-sheen absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>
    </div>
  );
}

function Gauges({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`relative w-full ${compact ? 'space-y-1.5' : 'space-y-2'}`}>
      {HINTS.map(([word, score, color]) => (
        <li key={word} className="rounded-[9px] border border-[#b79cff]/20 bg-[#0c0a14]/70 px-2.5 py-1.5 backdrop-blur-[2px]">
          <div className="flex items-baseline justify-between"><b lang="ko" className="text-[13px] font-black text-[#f1eaff]">{word}</b><span className="font-mono text-[11px] font-black" style={{ color }}>{score}%</span></div>
          <div className="mt-1 h-1 rounded-full bg-white/10"><span className="block h-full rounded-full" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}66, ${color})` }} /></div>
        </li>
      ))}
    </ul>
  );
}

/** The gold "확장판" ribbon. */
export function PlusBadge({ label, className = '' }: { label: string; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,#ffe9a6,#e0a83a)] px-2 py-0.5 text-[10px] font-black tracking-[0.06em] text-[#2a1a04] shadow-[0_0_14px_rgba(255,214,107,.35)] ${className}`}><Sparkles size={10} />{label}</span>;
}

/** Entry-screen art: drifting words of the pool behind a sealed gold card and three hints. */
export default function HiddenWordPlusPreview({ en = false }: { en?: boolean }) {
  return (
    <div aria-hidden className="relative mx-auto flex h-[300px] w-[260px] flex-col items-center justify-center gap-3.5 overflow-hidden rounded-[20px] border border-[#ffd66b]/25 bg-[radial-gradient(ellipse_at_80%_0%,rgba(255,122,217,.28),transparent_55%),radial-gradient(ellipse_at_50%_30%,rgba(183,156,255,.38),#0c0a14_72%)] px-6 shadow-[0_20px_50px_rgba(40,20,90,.5)] md:w-full">
      <Drift />
      <p className="absolute left-3 top-3 font-mono text-[9px] font-black tracking-[0.25em] text-[#d9ccff]/60">HIDDEN WORD</p>
      <PlusBadge label={en ? 'EXPANSION' : '확장판'} className="absolute right-3 top-2.5" />
      <div className="mt-8"><Sealed big /></div>
      <Gauges />
      <p className="absolute bottom-3 font-mono text-[9px] font-black tracking-[0.2em] text-[#ffd66b]/70">186 WORDS · 30 GROUPS</p>
    </div>
  );
}

/** Home-card picture (the 300px preview box like the other games): foil sheen, drifting words, the 186 · 30 promise. */
export function HiddenWordPlusTile() {
  return (
    <div aria-hidden className="relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-[3px] border-[#1a1233] bg-[radial-gradient(ellipse_at_85%_0%,rgba(255,122,217,.35),transparent_55%),radial-gradient(ellipse_at_50%_28%,#4a3590,#0c0a14_74%)] px-4 shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
      <span className="hwp-glow pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1.5px_rgba(255,214,107,.55),inset_0_0_30px_rgba(183,156,255,.25)]" />
      <Drift size={11} />
      <span className="absolute left-2 top-2 rounded-full bg-[linear-gradient(135deg,#ffe9a6,#e0a83a)] px-1.5 py-px text-[9px] font-black tracking-[0.08em] text-[#2a1a04]">+186</span>
      <Sealed />
      <Gauges compact />
      <span className="hwp-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

/** A banner from one game's entry screen to the other: 히든 워드 → 확장판 (gold, NEW) or back. */
export function HiddenWordCrossLink({ to, en }: { to: 'plus' | 'basic'; en: boolean }) {
  if (to === 'basic') return (
    <Link href="/hidden-word" className="group flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/70 transition hover:border-[#a8ef70]/50 hover:text-white">
      <span className="min-w-0 break-keep"><b className="font-black text-[#a8ef70]">{en ? 'Hidden Word' : '히든 워드'}</b> · {en ? 'the original 60 words, its own ranking' : '기본 60단어, 랭킹은 따로'}</span>
      <ArrowRight size={16} className="shrink-0 transition group-hover:translate-x-0.5" />
    </Link>
  );
  return (
    <Link href="/hidden-word-plus" className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-[#ffd66b]/40 bg-[radial-gradient(ellipse_at_100%_0%,rgba(255,122,217,.25),transparent_60%),linear-gradient(135deg,#2e2358,#120d26)] px-4 py-3.5 text-white shadow-[0_10px_30px_rgba(40,20,90,.35)] transition hover:-translate-y-0.5">
      <span className="hwp-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <span className="relative min-w-0">
        <span className="flex items-center gap-2"><PlusBadge label="NEW" /><b className="break-keep text-[15px] font-black tracking-[-0.02em]">{en ? 'Hidden Word: Expansion' : '히든 워드 확장판'}</b></span>
        <span className="mt-1 block break-keep text-[12px] font-bold text-[#d9ccff]/80">{en ? '186 words in 30 look-alike groups · its own ranking' : '186단어 · 닮은 단어 30묶음 · 랭킹 따로'}</span>
      </span>
      <span className="relative flex shrink-0 items-center gap-1 rounded-full bg-[#ffd66b] px-3 py-1.5 text-[12px] font-black text-[#2a1a04]">{en ? 'Play' : '확장판 하러 가기'}<ArrowRight size={13} className="transition group-hover:translate-x-0.5" /></span>
    </Link>
  );
}
