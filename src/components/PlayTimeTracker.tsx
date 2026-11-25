"use client";

import { useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { checkNewIcons } from './IconUnlock';

const FLUSH_SEC = 60; // report about once a minute
const IDLE_SEC = 120; // no tap, click or key for this long = not playing

/** True while a game is on screen: a started game (#play), a friend/open room, or the 블랙피스 hell board. */
function inGame() {
  const { pathname, hash } = window.location;
  return hash === '#play' || /\/room\/[a-z0-9]+\/?$/i.test(pathname) || /\/hell\/?$/.test(pathname);
}

/**
 * Counts active play time for the 플레이 타임 icons (10 … 100 hours): a second counts while a game is open, the tab
 * is visible and the player did something in the last two minutes. Sent to add_play_time() about once a minute
 * (the server caps each report by the time since the last one).
 */
export default function PlayTimeTracker() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    let lastInput = Date.now();
    let pending = 0;
    const onInput = () => { lastInput = Date.now(); };
    const flush = () => {
      if (pending < 5) return;
      const seconds = Math.round(pending);
      pending = 0;
      getSupabase()?.rpc('add_play_time', { p_seconds: seconds }).then(({ data }) => {
        // Crossed a 10-hour mark: show the new icon.
        if (typeof data === 'number' && Math.floor(data / 36000) > Math.floor((data - seconds) / 36000)) checkNewIcons(500);
      });
    };
    const tick = window.setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastInput < IDLE_SEC * 1000 && inGame()) pending += 1;
      if (pending >= FLUSH_SEC) flush();
    }, 1000);
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    const events = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;
    events.forEach((e) => window.addEventListener(e, onInput, { passive: true }));
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.clearInterval(tick);
      events.forEach((e) => window.removeEventListener(e, onInput));
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [user]);
  return null;
}
