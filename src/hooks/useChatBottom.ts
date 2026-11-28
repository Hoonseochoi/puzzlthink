"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

const NEAR = 32;        // px from the bottom that still counts as "at the bottom"
const GESTURE = 1500;   // ms after a finger / wheel / key that a scroll is still the player's (iOS momentum included)

/**
 * Keeps a chat list scrolled to its newest line. Scrolls the list box itself (never scrollIntoView, so iOS Safari
 * does not move the page) and never touches focus.
 *
 * Sticks to the bottom on every new line (`last` = the newest line's key, which changes even when the list is capped
 * and its length stays the same), on every size change of the box or its content (keyboard, chat mode, pinned boxes,
 * a line that wraps) and on visualViewport resizes. Only a scroll the player makes by hand lets go: then `unread`
 * turns true once a newer line arrives (show a "새 메시지 ↓" pill that calls `jump`). Scrolling back down sticks again.
 * A change of `reset` (chat mode opened, phase change, a line I sent…) always goes back to the bottom.
 *
 * Put the returned `list` ref on the scrolling box; its first child should wrap the lines, so a change of their height is seen.
 */
export function useChatBottom<T extends HTMLElement = HTMLDivElement>(last: string | undefined, reset: unknown) {
  const list = useRef<T>(null);
  const stuck = useRef(true);
  const lastRef = useRef(last);
  const gestureAt = useRef(0);
  const touching = useRef(false);
  const [away, setAway] = useState<string | null | undefined>(null); // newest key when the player scrolled up; null = stuck

  const pin = useCallback(() => {
    const el = list.current;
    if (el && stuck.current) el.scrollTop = el.scrollHeight;
  }, []);
  // now, and again once the browser has laid the new lines out
  const pinSoon = useCallback(() => {
    pin();
    requestAnimationFrame(() => { pin(); requestAnimationFrame(pin); });
  }, [pin]);
  const jump = useCallback(() => {
    stuck.current = true;
    setAway(null);
    pinSoon();
  }, [pinSoon]);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const mark = () => { gestureAt.current = Date.now(); };
    const down = () => { touching.current = true; mark(); };
    const up = () => { touching.current = false; mark(); };
    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (gap <= NEAR) {
        if (!stuck.current) { stuck.current = true; setAway(null); }
        return;
      }
      if (touching.current || Date.now() - gestureAt.current < GESTURE) {
        if (stuck.current) { stuck.current = false; setAway(lastRef.current); }
      } else if (stuck.current) {
        pin(); // the layout moved the list off the bottom (box shrank, lines dropped off the top): back down
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('touchstart', down, { passive: true });
    el.addEventListener('touchmove', mark, { passive: true });
    el.addEventListener('touchend', up, { passive: true });
    el.addEventListener('touchcancel', up, { passive: true });
    el.addEventListener('wheel', mark, { passive: true });
    el.addEventListener('pointerdown', mark, { passive: true }); // scrollbar drags on desktop
    el.addEventListener('keydown', mark);
    const ro = new ResizeObserver(() => pinSoon());
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', pinSoon);
    pinSoon();
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('touchstart', down);
      el.removeEventListener('touchmove', mark);
      el.removeEventListener('touchend', up);
      el.removeEventListener('touchcancel', up);
      el.removeEventListener('wheel', mark);
      el.removeEventListener('pointerdown', mark);
      el.removeEventListener('keydown', mark);
      ro.disconnect();
      vv?.removeEventListener('resize', pinSoon);
    };
  }, [pin, pinSoon]);

  // a new line (anyone's)
  useEffect(() => {
    lastRef.current = last;
    pinSoon();
  }, [last, pinSoon]);

  // back to the bottom whatever the player was reading
  useEffect(() => {
    stuck.current = true;
    pinSoon();
    const id = requestAnimationFrame(() => setAway(null));
    return () => cancelAnimationFrame(id);
  }, [reset, pinSoon]);

  return { list, unread: away !== null && away !== last, jump };
}
