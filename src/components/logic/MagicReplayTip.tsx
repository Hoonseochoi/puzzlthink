"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lightbulb, X } from 'lucide-react';
import LogicReplayButton from './LogicReplay';

const KEY = 'puzzlthink_magicswap_replay_tip';

/** 마방진 스왑 practice: a tip over the board pointing at the solve replay, until it is opened (next visit) or dismissed. */
export default function MagicReplayTip() {
  const t = useTranslations('Logic');
  const [show, setShow] = useState(false);
  useEffect(() => {
    let gone = false;
    try { gone = localStorage.getItem(KEY) === '1'; } catch { /* storage blocked: show it */ }
    if (!gone) setShow(true); // eslint-disable-line react-hooks/set-state-in-effect -- read once from storage
  }, []);
  const remember = () => { try { localStorage.setItem(KEY, '1'); } catch { /* optional */ } };
  // Opening the replay only remembers it (the tip owns the replay dialog, so it stays until the next visit); ✕ hides it now.
  const hide = () => { setShow(false); remember(); };
  if (!show) return null;
  return (
    <div role="note" className="relative mx-auto mb-3 flex max-w-[560px] items-center gap-3 rounded-2xl border border-(--accent)/40 bg-(--accent)/10 py-2.5 pl-3.5 pr-9 animate-[logic-pop_.35s_ease]">
      <Lightbulb size={18} className="shrink-0 text-(--accent)" />
      <p className="min-w-0 flex-1 break-keep text-[12px] font-bold leading-5 text-white/80">{t('magicReplayTip')}</p>
      <span className="shrink-0"><LogicReplayButton game="magicswap" variant="chip" onOpen={remember} /></span>
      <button type="button" onClick={hide} aria-label={t('tipClose')} className="absolute right-1.5 top-1.5 rounded-full p-1 text-white/45 hover:bg-white/10 hover:text-white"><X size={14} /></button>
      <span aria-hidden className="absolute -bottom-[7px] left-8 h-3 w-3 rotate-45 border-b border-r border-(--accent)/40 bg-[#2a1830]" />
    </div>
  );
}
