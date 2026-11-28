"use client";

import { useSyncExternalStore } from 'react';
import { useLocale } from 'next-intl';
import { Circle, CircleUserRound } from 'lucide-react';

/**
 * "게임 돌에 아이콘 표시": a viewer preference for this device. On (the default), board pieces are drawn as each
 * player's own profile stone (PieceStone); off, every board draws the game's own plain pieces for every seat.
 * It changes only what this browser draws: nothing in game state, nothing for the opponent. Name plates, the VS
 * intro and the result winner keep their icons. Saved in localStorage and followed across tabs.
 */
const KEY = 'puzzlthink:board-stone-icons';
const EVENT = 'puzzlthink:board-stone-icons';

const read = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } };
const subscribe = (fn: () => void) => {
  const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === null) fn(); };
  window.addEventListener(EVENT, fn);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(EVENT, fn); window.removeEventListener('storage', onStorage); };
};

/** Whether board pieces show players' icons on this device (true until the player turns it off). */
export function useBoardStoneIcons() {
  return useSyncExternalStore(subscribe, read, () => true);
}

export function setBoardStoneIcons(on: boolean) {
  try { if (on) localStorage.removeItem(KEY); else localStorage.setItem(KEY, 'off'); } catch { /* private mode: this tab only */ }
  window.dispatchEvent(new Event(EVENT));
}

const COPY = {
  ko: { short: '아이콘', turnOff: '아이콘 끄기', turnOn: '아이콘 켜기', label: '게임 돌에 아이콘 표시', note: '끄면 벽바둑·오목·모리스 등 게임판의 돌이 모두 기본 돌로 보여요. 이 기기에서만 바뀌고, 상대 화면에는 영향이 없어요.' },
  en: { short: 'Icons', turnOff: 'Icons off', turnOn: 'Icons on', label: 'Show icons on game stones', note: 'Off, every board (Wallgo, gomoku games, Morris…) draws plain stones for both sides. Only on this device; your opponent sees no change.' },
};

/** Header button for a board game (next to GameUpdates / BugReport): switches icon stones on the board on or off. */
export default function StoneIconToggle({ dark = true }: { dark?: boolean }) {
  const t = useLocale() === 'en' ? COPY.en : COPY.ko;
  const on = useBoardStoneIcons();
  const label = on ? t.turnOff : t.turnOn;
  const base = 'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-2 py-2 text-[11px] font-extrabold transition sm:gap-1.5 sm:px-2.5 sm:text-xs';
  const tone = dark
    ? on ? 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10' : 'border-white/10 bg-transparent text-white/45 hover:bg-white/5'
    : on ? 'border-black/10 bg-white/70 text-black/70 hover:bg-white' : 'border-black/10 bg-transparent text-black/40 hover:bg-white/60';
  return (
    <button type="button" onClick={() => setBoardStoneIcons(!on)} aria-pressed={!on} aria-label={label} title={label} className={`${base} ${tone}`}>
      <span className="relative inline-flex">
        {on ? <CircleUserRound size={14} /> : <Circle size={14} />}
        {!on && <span aria-hidden className="absolute left-1/2 top-1/2 h-[1.5px] w-[17px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />}
      </span>
      <span>{t.short}</span>
      <span className={`rounded px-1 py-px text-[9px] font-black leading-none ${on ? (dark ? 'bg-white/15 text-white' : 'bg-black/10 text-black/70') : (dark ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/35')}`}>{on ? 'ON' : 'OFF'}</span>
    </button>
  );
}

/** The same preference as a labelled switch, for 기록실's icon settings. */
export function StoneIconSwitch({ className = '' }: { className?: string }) {
  const t = useLocale() === 'en' ? COPY.en : COPY.ko;
  const on = useBoardStoneIcons();
  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 ${className}`}>
      <div className="min-w-0">
        <p className="break-keep text-[12.5px] font-black text-[#17201e]">{t.label}</p>
        <p className="mt-0.5 break-keep text-[11px] font-bold leading-4 text-black/45">{t.note}</p>
      </div>
      <button type="button" role="switch" aria-checked={on} aria-label={t.label} onClick={() => setBoardStoneIcons(!on)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-[#17201e]' : 'bg-black/15'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
