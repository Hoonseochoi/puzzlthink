"use client";

import { useEffect } from 'react';
import { type ChatStatus, setGameChatStatus } from '@/lib/roomChat';

/**
 * A game's adapter for the room chat's live status line (src/components/RoomChat.tsx): call it from the room view with
 * what the player needs while chatting — whether it is my move, whose move it is, the score, the last move. Undefined
 * fields keep the room's defaults (in play or not, the turn clock). Pass null while there is nothing to show.
 */
export function useChatStatus(status: ChatStatus | null) {
  const key = status ? JSON.stringify(status) : '';
  useEffect(() => { setGameChatStatus(key ? JSON.parse(key) as ChatStatus : null); }, [key]);
  useEffect(() => () => setGameChatStatus(null), []);
}
