"use client";

import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { EMOTE_MS } from '@/lib/openRooms';
import type { Peer } from '@/lib/room';
import { EmoteButtons } from './OpenRoomPanel';

/**
 * Quick reactions inside a game room: a small button at the bottom left opens ㅎㅇ · ㄱㄷ · ㅇㅋ · ㅈㅈ · ㅂㅂ,
 * and recent reactions pop up as "name: ㅇㅋ" at the top left. No chat log is kept.
 */
export default function RoomEmotes({ peers, onEmote }: { peers: Peer[]; onEmote: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(tick);
  }, []);
  const recent = peers.filter((peer) => peer.emote && peer.emoteAt && now - peer.emoteAt < EMOTE_MS).sort((a, b) => (a.emoteAt ?? 0) - (b.emoteAt ?? 0));
  return (
    <>
      <div className="pointer-events-none fixed left-3 top-20 z-40 flex flex-col items-start gap-1.5">
        {recent.map((peer) => (
          <span key={`${peer.id}-${peer.emoteAt}`} className="bw-result rounded-full border border-white/10 bg-[#0d0d11]/90 px-3 py-1 text-xs font-bold text-white shadow-lg">
            <span className="text-white/55">{peer.name}</span> <b className="text-(--accent)">{peer.emote}</b>
          </span>
        ))}
      </div>
      <div className="fixed bottom-20 left-3 z-40 flex items-end gap-2">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label="emotes" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0d0d11]/90 text-white/80 shadow-lg hover:text-(--accent)">
          {open ? <X size={16} /> : <MessageCircle size={16} />}
        </button>
        {open && <div className="w-[230px] rounded-[12px] border border-white/10 bg-[#0d0d11]/95 p-2 shadow-xl"><EmoteButtons onEmote={(text) => { onEmote(text); setOpen(false); }} /></div>}
      </div>
    </>
  );
}
