import type { ReactNode } from 'react';

export type InlineStep = { label?: string; title: string; desc: string; visual: ReactNode };

/** A tutorial laid out on the page: every step as a card, in order. Used on each game's entry screen. */
export default function InlineSteps({ steps, tone = 'dark' }: { steps: InlineStep[]; tone?: 'dark' | 'light' }) {
  const dark = tone === 'dark';
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {steps.map((step, i) => (
        <li key={step.title} className={`flex flex-col rounded-[14px] border p-4 ${dark ? 'border-white/10 bg-[#121217]/85' : 'border-black/10 bg-white/70'}`}>
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-(--accent) px-2 py-0.5 text-[9px] font-black tracking-[0.16em] text-(--accent-ink)">{step.label ?? `STEP ${i + 1}`}</span>
            <span className={`font-mono text-[10px] ${dark ? 'text-white/30' : 'text-black/30'}`}>{i + 1} / {steps.length}</span>
          </div>
          <div className="flex min-h-[150px] items-center justify-center overflow-hidden py-4">{step.visual}</div>
          <h3 className={`text-base font-black tracking-tight ${dark ? 'text-[#eef1f7]' : 'text-[#17201e]'}`}>{step.title}</h3>
          <p className={`mt-1.5 text-[13px] leading-6 ${dark ? 'text-white/55' : 'text-black/55'}`}>{step.desc}</p>
        </li>
      ))}
    </ol>
  );
}
