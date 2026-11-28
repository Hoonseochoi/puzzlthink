"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DoorOpen, Plus, Swords } from 'lucide-react';
import { listAllOpenRooms, listLiveRooms } from '@/lib/openRooms';

/** Asks the home's OpenMatchCard to open its create / join dialog (it listens for this event). */
export const OPEN_DIALOG_EVENT = 'puzzlthink:open-dialog';
export const openDialog = (which: 'create' | 'join') => window.dispatchEvent(new CustomEvent(OPEN_DIALOG_EVENT, { detail: which }));

/**
 * The thin 오픈 대전 bar under the home's event banners: make a room, the rooms open now, the matches in progress.
 * Counts refresh every minute while the page is visible.
 */
export default function OpenBar({ className = '' }: { className?: string }) {
  const t = useTranslations('HomeApp');
  const [rooms, setRooms] = useState<number | null>(null);
  const [live, setLive] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => {
      if (document.visibilityState !== 'visible') return;
      listAllOpenRooms().then((list) => { if (alive && list) setRooms(list.length); });
      listLiveRooms().then((list) => { if (alive && list) setLive(list.reduce((n, r) => n + r.open + r.friend, 0)); });
    };
    load();
    const timer = window.setInterval(load, 60_000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);
  const toList = () => document.getElementById('open-match')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const n = (v: number | null) => (v === null ? '–' : v.toLocaleString());
  return (
    <div className={`flex h-11 items-center gap-1.5 rounded-[14px] bg-[linear-gradient(135deg,#1b1f4a_0%,#0e1020_75%)] py-1 pl-3 pr-1 text-white ${className}`}>
      <span className="flex shrink-0 items-center gap-1 text-[10px] font-black tracking-[0.12em] text-[#8f9bff]"><Swords size={13} /><span className="max-[360px]:hidden">{t('openBarTitle')}</span></span>
      <button type="button" onClick={() => openDialog('join')} className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[10px] px-1.5 py-1.5 text-[11.5px] font-black hover:bg-white/10 active:scale-95">
        <DoorOpen size={12} className="shrink-0 text-[#b9c1ff]" /><span className="truncate">{t('openBarRooms', { n: n(rooms) })}</span>
      </button>
      <button type="button" onClick={toList} className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[10px] px-1.5 py-1.5 text-[11.5px] font-black hover:bg-white/10 active:scale-95">
        <span className="relative flex h-2 w-2 shrink-0"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3fd67a] opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#3fd67a]" /></span>
        <span className="truncate">{t('openBarLive', { n: n(live) })}</span>
      </button>
      <button type="button" onClick={() => openDialog('create')} className="flex shrink-0 items-center gap-1 rounded-[10px] bg-[#8f9bff] px-2.5 py-1.5 text-[11.5px] font-black text-[#0e1020] active:scale-95">
        <Plus size={13} strokeWidth={3} />{t('openBarCreate')}
      </button>
    </div>
  );
}
