"use client";

import { useSyncExternalStore } from 'react';
import { GAMES } from '@/lib/gameCatalog';
import { PLAY_APP_HIDDEN_GAMES, isPlayApp } from '@/lib/playApp';

const noop = () => () => {};

/**
 * Whether the page runs inside the Google Play app (src/lib/playApp.ts), for rendering. False on the server and
 * during hydration (so the markup matches), true right after. Hidden items are already hidden by CSS before that,
 * so this is for things CSS cannot do, such as counts or picking the next game in a list.
 */
export function usePlayApp(): boolean {
  return useSyncExternalStore(noop, isPlayApp, () => false);
}

/** The catalog without the games hidden in the Play app (the full catalog on the web). */
export function useAppGames(): typeof GAMES {
  const app = usePlayApp();
  return app ? GAMES.filter((g) => !PLAY_APP_HIDDEN_GAMES.includes(g.id)) : GAMES;
}
