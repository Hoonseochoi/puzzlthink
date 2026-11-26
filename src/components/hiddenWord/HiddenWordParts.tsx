"use client";

import type { ReactNode } from 'react';
import { Check, KeyRound, LockKeyhole, X } from 'lucide-react';
import { type HwLevel, HW_LEVELS, hwHeat } from '@/lib/hiddenWord';
import { PANEL_TITLE } from '../ui/gameUi';
import { HW_GOLD, type HwCopy } from './copy';

const pct = (score: number) => (score >= 100 ? '100' : score.toFixed(1));

/** One word on the clue board with its similarity gauge; the notch marks the cut. `right` = my correct answer, `caught` = the AI found my word. */
export function SimRow({ word, score, cut, tag, tone = 'hint', delay = 0 }: {
  word: string; score: number; cut: number; tag?: ReactNode; tone?: 'hint' | 'wrong' | 'right' | 'caught'; delay?: number;
}) {
  const color = tone === 'right' ? '#a8ef70' : tone === 'caught' ? '#ff5d73' : hwHeat(score, cut);
  const hot = tone === 'hint' && score >= cut;
  return (
    <li className={`relative overflow-hidden rounded-[12px] border px-3 py-2.5 [animation:hwRowIn_.35s_ease-out_both] ${hot ? 'border-[#ff5d73]/50 bg-[#ff5d73]/[0.07]' : tone === 'wrong' ? 'border-white/10 bg-white/[0.02]' : tone === 'right' ? 'border-(--accent)/50 bg-(--accent)/10' : tone === 'caught' ? 'border-[#ff5d73]/55 bg-[#ff5d73]/10' : 'border-white/10 bg-black/30'}`} style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-baseline gap-2">
          <strong lang="ko" className={`truncate text-[17px] font-black tracking-[-0.02em] sm:text-lg ${tone === 'wrong' ? 'text-white/55 line-through decoration-white/30' : 'text-[#f2f5ee]'}`}>{word}</strong>
          {tag && <span className="shrink-0 text-[10px] font-black tracking-[0.04em] text-white/45">{tag}</span>}
        </span>
        <span className="shrink-0 font-mono text-[15px] font-black tabular-nums sm:text-base" style={{ color }}>{pct(score)}<span className="ml-0.5 text-[10px] opacity-70">%</span></span>
      </div>
      <div className="relative mt-1.5 h-1.5 rounded-full bg-white/[0.07]">
        <span className="absolute inset-y-0 left-0 origin-left rounded-full [animation:hwFill_.7s_cubic-bezier(.2,.8,.2,1)_both]" style={{ width: `${Math.max(2, score)}%`, background: `linear-gradient(90deg, ${color}55, ${color})`, boxShadow: hot ? `0 0 12px ${color}` : undefined, animationDelay: `${delay + 0.1}s` }} />
        <span aria-hidden className="absolute -top-0.5 h-2.5 w-px bg-white/40" style={{ left: `${cut}%` }} />
      </div>
    </li>
  );
}

/** A sealed envelope from the dealer room. */
export function Envelope({ n, label, onPick, state }: { n: number; label: string; onPick: () => void; state: 'idle' | 'opening' | 'dim' }) {
  return (
    <button type="button" onClick={onPick} disabled={state !== 'idle'} aria-label={label}
      className={`group relative aspect-[4/3] w-full rounded-[10px] transition duration-300 [perspective:600px] ${state === 'dim' ? 'scale-95 opacity-30' : state === 'opening' ? 'scale-105' : 'hover:-translate-y-1'}`}>
      <span className="absolute inset-0 rounded-[10px] border border-[#e9dcc0]/25 bg-[linear-gradient(160deg,#efe4cb,#d9c9a6)] shadow-[0_10px_24px_rgba(0,0,0,.45)]" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[62%] rounded-b-[10px] bg-[linear-gradient(180deg,#e6d9bb,#cdbb93)] [clip-path:polygon(0_100%,0_18%,50%_62%,100%_18%,100%_100%)]" />
      <span aria-hidden className={`absolute inset-x-0 top-0 h-[58%] origin-top rounded-t-[10px] bg-[linear-gradient(180deg,#f4ead4,#dccba6)] shadow-[0_2px_4px_rgba(0,0,0,.18)] [clip-path:polygon(0_0,100%_0,50%_100%)] ${state === 'opening' ? '[animation:hwFlap_.5s_ease-in_forwards]' : ''}`} />
      <span className={`absolute left-1/2 top-[52%] grid h-[34%] aspect-square -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff8a7a,#c2283a_60%,#8b1626)] font-mono text-sm font-black text-[#ffe9d6] shadow-[0_2px_6px_rgba(0,0,0,.4),inset_0_-2px_3px_rgba(0,0,0,.3)] transition group-hover:scale-110 sm:text-lg ${state === 'opening' ? 'opacity-0' : ''}`}>{n}</span>
    </button>
  );
}

/** A word from my envelope. */
export function WordCard({ word, selected, onClick, index = 0 }: { word: string; selected: boolean; onClick: () => void; index?: number }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={`relative flex h-[84px] items-center justify-center rounded-[12px] border px-2 text-center transition [animation:hwPop_.4s_ease-out_both] sm:h-[104px] ${selected ? 'border-(--accent) bg-(--accent)/15 shadow-[0_0_24px_var(--accent-glow)] -translate-y-1' : 'border-[#e9dcc0]/20 bg-[linear-gradient(165deg,#f3ead6,#dfd0ae)] hover:-translate-y-0.5'}`}
      style={{ animationDelay: `${index * 0.06}s` }}>
      <strong lang="ko" className={`break-keep text-xl font-black tracking-[-0.03em] sm:text-2xl ${selected ? 'text-(--accent)' : 'text-[#2a2415]'}`}>{word}</strong>
      {selected && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-(--accent) text-(--accent-ink)"><Check size={12} strokeWidth={3.5} /></span>}
    </button>
  );
}

/** The word in play: mine (shown) or the AI's (sealed until the turn ends). */
export function SecretCard({ label, word, sealedLabel }: { label: string; word?: string; sealedLabel: string }) {
  return (
    <div className={`relative flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-[14px] border px-3.5 py-3 ${word ? 'border-[#ffc857]/45 bg-[linear-gradient(135deg,rgba(255,200,87,.14),rgba(255,200,87,.03))]' : 'border-white/12 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.035)_0_8px,transparent_8px_16px)]'}`}>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] ${word ? 'bg-[#ffc857]/15 text-[#ffc857]' : 'bg-white/[0.06] text-white/50'}`}>{word ? <KeyRound size={18} /> : <LockKeyhole size={18} />}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-black tracking-[0.14em] text-white/45">{label}</p>
        {word
          ? <strong lang="ko" key={word} className="block truncate text-2xl font-black tracking-[-0.03em] [animation:hwPop_.45s_ease-out_both] sm:text-[28px]" style={{ color: HW_GOLD }}>{word}</strong>
          : <strong className="block font-mono text-2xl font-black tracking-[0.3em] text-white/35 sm:text-[28px]" aria-label={sealedLabel}>???</strong>}
      </div>
    </div>
  );
}

/** 1차 · 2차 · 3차 with the points at stake; past stages show how they went for me. */
export function StageTrack({ labels, points, current, results }: { labels: string[]; points: number[]; current: number; results: ('good' | 'bad' | null)[] }) {
  return (
    <ol className="flex shrink-0 items-stretch gap-1">
      {labels.map((label, i) => {
        const result = results[i]; const on = current === i + 1 && !result;
        return (
          <li key={label} className={`flex w-[46px] flex-col items-center justify-center rounded-[10px] border py-1.5 transition sm:w-[54px] ${result === 'good' ? 'border-(--accent)/50 bg-(--accent)/15' : result === 'bad' ? 'border-[#ff5d73]/40 bg-[#ff5d73]/10' : on ? 'border-white/40 bg-white/10 shadow-[0_0_14px_rgba(255,255,255,.12)]' : 'border-white/10 bg-black/20 opacity-55'}`}>
            <span className="text-[10px] font-black text-white/60">{label}</span>
            <span className={`font-mono text-sm font-black tabular-nums ${result === 'good' ? 'text-(--accent)' : result === 'bad' ? 'text-[#ff8a9a]' : 'text-white/85'}`}>
              {result === 'good' ? <Check size={15} strokeWidth={3.5} className="my-0.5" /> : result === 'bad' ? <X size={15} strokeWidth={3.5} className="my-0.5" /> : `+${points[i]}`}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Seconds left as a ring; red in the last ten. */
export function TimerRing({ seconds, total, label }: { seconds: number; total: number; label: string }) {
  const r = 15; const c = 2 * Math.PI * r; const urgent = seconds <= 10;
  return (
    <span className={`relative grid h-11 w-11 shrink-0 place-items-center ${urgent ? 'animate-pulse' : ''}`} role="timer" aria-label={`${label} ${seconds}`}>
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={urgent ? '#ff5d73' : 'var(--accent)'} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, seconds / total)))} className="transition-[stroke-dashoffset] duration-500 ease-linear" />
      </svg>
      <span className={`font-mono text-[13px] font-black tabular-nums ${urgent ? 'text-[#ff8a9a]' : 'text-white/85'}`}>{seconds}</span>
    </span>
  );
}

/** MORA, the AI opponent: a small lime-eyed face. */
export function MoraFace({ size = 28, thinking = false }: { size?: number; thinking?: boolean }) {
  return (
    <span className="relative inline-grid shrink-0 place-items-center rounded-[32%] bg-[linear-gradient(145deg,#26323a,#12181d)] ring-1 ring-white/15" style={{ width: size, height: size }} aria-hidden>
      <span className="flex gap-[18%]" style={{ width: '56%' }}>
        {[0, 1].map((i) => <span key={i} className={`aspect-square flex-1 rounded-full bg-(--accent) shadow-[0_0_6px_var(--accent)] ${thinking ? '[animation:ipDot_1s_ease-in-out_infinite]' : ''}`} style={{ animationDelay: `${i * 0.18}s` }} />)}
      </span>
    </span>
  );
}

/** 기본 / 확장: a new match of the other level replaces this one (no envelope is open yet, nothing is lost). */
export function LevelPicker({ t, level, disabled, onPick }: { t: HwCopy; level: HwLevel; disabled?: boolean; onPick: (level: HwLevel) => void }) {
  return (
    <div className="mb-5" role="radiogroup" aria-label={t.levelTitle}>
      <p className={`${PANEL_TITLE} text-center`}>{t.levelTitle}</p>
      <div className="mx-auto mt-2 grid max-w-[420px] grid-cols-2 gap-2">
        {HW_LEVELS.map((id) => (
          <button key={id} type="button" role="radio" aria-checked={level === id} disabled={disabled} onClick={() => onPick(id)}
            className={`rounded-[12px] border px-3 py-2.5 text-left transition disabled:opacity-60 ${level === id ? 'border-(--accent) bg-(--accent)/10' : 'border-white/12 bg-black/25 hover:border-white/30'}`}>
            <b className={`block text-sm font-black ${level === id ? 'text-(--accent)' : 'text-white/80'}`}>{t.levelName[id]}</b>
            <span className="mt-0.5 block break-keep text-[11px] leading-4 text-white/50">{t.levelDesc[id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
