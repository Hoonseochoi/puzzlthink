"use client";

import { X } from 'lucide-react';
import { CLD_PROOF_SEC, CLD_TURN_SEC } from '@/lib/colorLinkDuelRoom';
import { MODAL, MODAL_BACKDROP, MODAL_CLOSE, PANEL, PANEL_TITLE } from '../ui/gameUi';
import type { CldCopy } from './copy';

export function RulesPanel({ t }: { t: CldCopy }) {
  return (
    <section className={PANEL}>
      <p className={PANEL_TITLE}>{t.rules}</p>
      <ol className="mt-3 space-y-2.5 text-[12px] leading-relaxed text-white/65">{t.quick.map((line, i) => <li key={i} className="flex gap-2.5"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
      <p className={`${PANEL_TITLE} mt-4`}>{t.turnTime}</p>
      <ul className="mt-2 space-y-1 text-[12px] text-white/60">{t.clockRules(CLD_TURN_SEC / 60, CLD_PROOF_SEC / 60).map((line) => <li key={line} className="break-keep">· {line}</li>)}</ul>
    </section>
  );
}

/** Rules at a glance. */
export function CldRules({ t, onClose }: { t: CldCopy; onClose: () => void }) {
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-w-md text-left text-white`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={PANEL_TITLE}>{t.rules}</p>
        <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/75">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        <p className={`${PANEL_TITLE} mt-5`}>{t.turnTime}</p>
        <ul className="mt-2 space-y-1 text-[12px] text-white/65">{t.clockRules(CLD_TURN_SEC / 60, CLD_PROOF_SEC / 60).map((line) => <li key={line} className="break-keep">· {line}</li>)}</ul>
        <p className="mt-4 break-keep text-[11px] leading-5 text-white/45">{t.aiNote}</p>
        <p className="mt-2 break-keep text-[11px] leading-5 text-white/45">{t.vsColorlink}</p>
      </div>
    </div>
  );
}
