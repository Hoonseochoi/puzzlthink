"use client";

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import { History, Sparkles, X } from 'lucide-react';
import { GAME_UPDATES } from '@/lib/gameUpdates';

const COPY = {
  ko: { tag: '업데이트', title: (name: string) => `${name} 업데이트`, latest: (d: string) => `최근 업데이트 ${d}`, ok: '확인', close: '닫기' },
  en: { tag: 'UPDATE', title: (name: string) => `${name} updates`, latest: (d: string) => `Last updated ${d}`, ok: 'Got it', close: 'Close' },
};

// "Seen" = the player opened the notes since the newest entry was added; until then the badge shows a red dot.
const seenKey = (game: string) => `game-updates-seen:${game}`;
const SEEN_EVENT = 'game-updates-seen';
const subscribe = (fn: () => void) => { window.addEventListener(SEEN_EVENT, fn); return () => window.removeEventListener(SEEN_EVENT, fn); };
const readSeen = (game: string) => { try { return localStorage.getItem(seenKey(game)); } catch { return null; } };

/** "업데이트" badge for a game's header: tap for that game's update notes (src/lib/gameUpdates.ts). Nothing when it has none. */
export default function GameUpdates({ game }: { game: string }) {
  const log = GAME_UPDATES[game];
  const en = useLocale() === 'en';
  const t = en ? COPY.en : COPY.ko;
  const [open, setOpen] = useState(false);
  const stamp = log ? `${log.items[0]?.date}:${log.items.length}` : '';
  const seen = useSyncExternalStore(subscribe, () => readSeen(game), () => stamp);
  if (!log?.items.length) return null;
  const name = en ? log.name.en : log.name.ko;
  const show = () => {
    setOpen(true);
    try { localStorage.setItem(seenKey(game), stamp); } catch { /* private mode: the dot just stays */ }
    window.dispatchEvent(new Event(SEEN_EVENT));
  };
  return <>
    <button type="button" onClick={show} className="relative inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#3ddc97] to-[#2bb8ff] px-2.5 py-1 text-[10px] font-black tracking-[0.12em] text-[#06231a] shadow-[0_0_16px_rgba(61,220,151,.45)] transition hover:brightness-110 active:scale-95">
      {seen !== stamp && <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4d5e] opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4d5e]" /></span>}
      <Sparkles size={11} />{t.tag}
    </button>
    {open && createPortal(
      <div role="dialog" aria-modal="true" aria-label={t.title(name)} className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setOpen(false)}>
        <section onClick={(e) => e.stopPropagation()} className="max-h-[86svh] w-full max-w-md overflow-y-auto rounded-t-[24px] bg-[#f9f7f1] p-5 text-[#17201e] shadow-2xl sm:rounded-[24px] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-lg font-black"><Sparkles size={18} />{t.title(name)}</h3>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-black/40 hover:text-black" aria-label={t.close}><X size={16} /></button>
          </div>
          <p className="mt-1 text-[11px] font-bold text-black/40">{t.latest(log.items[0].date)}</p>
          <ul className="mt-4 space-y-2.5">
            {log.items.map((item, i) => {
              const Icon = item.icon;
              const text = en ? item.en : item.ko;
              return (
                <li key={i} className="flex gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5b45c9] text-white"><Icon size={14} /></span>
                  <div className="min-w-0">
                    <p className="break-keep text-sm font-black"><span className="mr-1.5 inline-block rounded-full bg-[#5b45c9]/10 px-1.5 py-0.5 align-middle text-[10px] font-black leading-none text-[#5b45c9]">{item.date}</span>{text.title}</p>
                    <p className="mt-0.5 break-keep text-xs leading-5 text-black/55">{text.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          {log.note && <p className="mt-3 break-keep text-center text-[11px] font-bold text-black/45">{en ? log.note.en : log.note.ko}</p>}
          <button type="button" onClick={() => setOpen(false)} className="mt-4 flex w-full items-center justify-center rounded-full bg-[#17201e] py-3 text-sm font-black text-white">{t.ok}</button>
        </section>
      </div>,
      document.body,
    )}
  </>;
}

// Catalog ids are camelCase, update logs are keyed by the records id (snake_case): 'colorLinkDuel' → 'color_link_duel'.
const LOG_KEY: Record<string, string> = { blackWhite2: 'black_white_2', nineMensMorris: 'nine_mens_morris' };
const logKey = (catalogId: string) => LOG_KEY[catalogId] ?? catalogId.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

/**
 * The "업데이트" section of a game's entry screen (GameGate): the newest day's notes, and the badge above that opens
 * the whole history in its popup. Nothing for a game without notes.
 */
export function GameUpdatesSection({ game, tone = 'dark' }: { game: string; tone?: 'dark' | 'light' }) {
  const key = logKey(game);
  const log = GAME_UPDATES[key];
  const en = useLocale() === 'en';
  if (!log?.items.length) return null;
  const dark = tone === 'dark';
  const latest = log.items.filter((item) => item.date === log.items[0].date).slice(0, 3);
  return (
    <section className={`mt-3 rounded-[14px] border p-4 sm:p-5 ${dark ? 'border-white/10 bg-[#121217]/85' : 'border-black/10 bg-white/70'}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-black"><History size={17} className="text-(--accent)" />{en ? 'Updates' : '업데이트'}</h3>
        <GameUpdates game={key} />
      </div>
      <ul className="mt-4 space-y-4">
        {latest.map((item, i) => {
          const Icon = item.icon;
          const text = en ? item.en : item.ko;
          return (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--accent) text-(--accent-ink)"><Icon size={14} /></span>
              <div className="min-w-0">
                <p className="break-keep text-sm font-black"><span className={`mr-1.5 text-[11px] ${dark ? 'text-white/45' : 'text-black/45'}`}>{item.date}</span>{text.title}</p>
                <p className={`mt-1 break-keep text-xs leading-5 ${dark ? 'text-white/60' : 'text-black/60'}`}>{text.desc}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
