"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { Lightbulb, Loader2, X } from 'lucide-react';
import { showInterstitial } from '@/lib/ads';

/**
 * Runs `judge` over `indices` one by one, yielding to the browser between positions, and stops at
 * the first non-null result. Used to find the losing move after a game without freezing the page.
 */
export function useFirstMatch<T>(indices: number[], judge: (index: number) => T | null, enabled: boolean) {
  const [state, setState] = useState<{ done: boolean; result: T | null; checked: number }>({ done: false, result: null, checked: 0 });
  const key = indices.join(',');
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      for (let k = 0; k < indices.length; k += 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (cancelled) return;
        const result = judge(indices[k]);
        if (cancelled) return;
        if (result) { setState({ done: true, result, checked: k + 1 }); return; }
        setState({ done: false, result: null, checked: k + 1 });
      }
      if (!cancelled) setState((s) => ({ ...s, done: true }));
    })();
    return () => { cancelled = true; };
    // `judge` closes over the finished game, which does not change while the modal is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  return state;
}

/** "필승 꿀팁 보기" button for a result popup. Shows an interstitial (when ads are wired up) first. */
export function TipsButton({ label, adName, onOpen }: { label: string; adName: string; onOpen: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button" disabled={busy}
      onClick={async () => { setBusy(true); try { await showInterstitial(adName); } finally { setBusy(false); onOpen(); } }}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-(--accent) py-3 text-sm font-extrabold text-(--accent-ink) shadow-[0_0_18px_var(--accent-glow)] hover:brightness-110 disabled:opacity-60"
    >
      <Lightbulb size={15} />{label}
    </button>
  );
}

/** Full-screen panel over the result popup. */
export function TipsModal({ title, closeLabel, onClose, children }: { title: string; closeLabel: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[16px] border border-white/10 bg-[#121217] p-6 text-left text-[#e6e9f0] shadow-[0_0_80px_var(--accent-glow)]">
        <button onClick={onClose} aria-label={closeLabel} className="absolute right-3 top-3 rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X size={16} /></button>
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)"><Lightbulb size={12} />WINNING TIPS</p>
        <h2 className="mt-1.5 text-xl font-black tracking-tight">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Analyzing({ label }: { label: string }) {
  return <p className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 text-xs font-bold text-white/60"><Loader2 size={14} className="animate-spin" />{label}</p>;
}

/** Numbered list of general tips under the analysis. */
export function TipList({ heading, tips }: { heading: string; tips: { title: string; body: string }[] }) {
  return (
    <section className="mt-6 border-t border-white/10 pt-4">
      <h3 className="text-xs font-black tracking-[0.14em] text-white/45">{heading}</h3>
      <ol className="mt-3 space-y-3">
        {tips.map((tip, i) => (
          <li key={tip.title} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink)">{i + 1}</span>
            <div><p className="text-[13px] font-extrabold">{tip.title}</p><p className="mt-0.5 text-[12px] leading-5 text-white/55">{tip.body}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
