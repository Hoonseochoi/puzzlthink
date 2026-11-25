// Small shared state between site-wide widgets that live apart in the layout: the online count (measured by
// OnlineCount), the lounge's unread count (owned by LoungeChat) and "open the lounge" (asked by the tab bar).
import { useSyncExternalStore } from 'react';
import { GAMES } from '@/lib/gameCatalog';

let online: number | null = null;
let unread = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((fn) => fn());
const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };

export function setOnlineCount(n: number | null) { if (n !== online) { online = n; emit(); } }
export function setLoungeUnread(n: number) { if (n !== unread) { unread = n; emit(); } }
/** Browsers online right now (null until the first count arrives). */
export const useOnlineCount = () => useSyncExternalStore(subscribe, () => online, () => null);
export const useLoungeUnread = () => useSyncExternalStore(subscribe, () => unread, () => 0);

export const LOUNGE_OPEN_EVENT = 'puzzlthink:lounge-open';
export const openLounge = () => window.dispatchEvent(new Event(LOUNGE_OPEN_EVENT));

/** A game's own pages (its board, rooms, guide): the phone tab bar stays out of these. */
export const isGamePath = (pathname: string) => GAMES.some((g) => pathname === g.href || pathname.startsWith(`${g.href}/`));
