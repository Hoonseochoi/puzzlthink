// Host handoff notices: when a room's host leaves and another player takes over, every browser in the room
// shows a short toast (src/components/RoomHostNotice.tsx, mounted once in the locale layout).

export type HostNotice = { id: number; name: string; mine: boolean; restarted: boolean };

let notices: HostNotice[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => { for (const fn of listeners) fn(); };

export const subscribeHostNotices = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const hostNoticesSnapshot = () => notices;
const NONE: HostNotice[] = [];
export const hostNoticesServer = () => NONE;

/** `restarted`: the game could not carry on (the old host held hidden cards) and went back to the lobby or a fresh deal. */
export function pushHostNotice(name: string, mine: boolean, restarted: boolean) {
  const id = ++seq;
  notices = [...notices.slice(-1), { id, name, mine, restarted }];
  emit();
  window.setTimeout(() => { notices = notices.filter((n) => n.id !== id); emit(); }, 6000);
}
