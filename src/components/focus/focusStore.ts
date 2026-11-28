"use client";

import { useEffect, useId, useSyncExternalStore } from 'react';
import { dropLayer, forgetLayer, hasLayer, popLayerThen, pushLayer } from '@/lib/backStack';

/**
 * 전체 모드 (focus mode) and the accidental-exit guard, shared by every game.
 *
 * Who tells it what:
 *  - GameGate registers a session while a game is open (useFocusSession). With nothing more, the game counts as
 *    playing from the start and as "at stake" once the player has touched it, until a result screen shows.
 *  - A game that knows better says so with useFocusPlay(playing, stake): playing = a match, run or puzzle is under way
 *    (its start turns 전체 모드 on), stake = what leaving now would cost (the guard's wording), or false.
 *    Room games get this from useRealtimeRoom (a seat in a match that is on = 'room').
 *  - Result screens (ResultActions, EndReveal) call useFocusResult: a game whose result is showing is not at stake.
 *
 * What it does (FocusLayer draws it):
 *  - <html data-focus> while 전체 모드 is on: everything marked data-focus-hide disappears (site header, footer, banners,
 *    ads, rules and tips panels, update/bug buttons), a small 축소 bar sits at the bottom.
 *  - One history entry (src/lib/backStack.ts) while in 전체 모드 or while something is at stake: back first ends
 *    전체 모드, then asks before leaving a game in progress. Links and closing/reloading the tab ask too.
 */

/** challenge = a server-recorded run (leaving counts as failed); run = a local timed run (leaving drops it unrecorded). */
export type StakeKind = 'game' | 'challenge' | 'run' | 'room' | 'puzzle';
/** Order when several games speak at once (an open room's waiting panel and the practice game under it). */
const STAKE_ORDER: StakeKind[] = ['challenge', 'room', 'run', 'game', 'puzzle'];

type Session = { game: string; kind: StakeKind | false; fullscreen: boolean };
type Play = { playing: boolean; stake: StakeKind | false };
export type FocusDialog = { kind: StakeKind; reason: 'back' | 'link'; proceed: () => void };

export type FocusSnapshot = {
  /** A game screen is up (GameGate started, or a room page). */
  active: boolean;
  /** A match, run or puzzle is under way (the 전체 모드 tab shows only then). */
  playing: boolean;
  game: string | null;
  focus: boolean;
  stake: StakeKind | false;
  dialog: FocusDialog | null;
};

const sessions = new Map<string, Session>();
const plays = new Map<string, Play>();
let results = 0;
let focus = false;
let interacted = false;
let bypass = false; // the player chose 나가기: let the page go without asking again
let bypassTimer = 0;
let dialog: FocusDialog | null = null;
let layer: number | null = null;
let lastPlaying = false;
let fullscreenOn = false; // we asked for real fullscreen (Android): leaving it (back) also ends 전체 모드
let snapshot: FocusSnapshot = { active: false, playing: false, game: null, focus: false, stake: false, dialog: null };
const listeners = new Set<() => void>();

const isActive = () => sessions.size > 0 || plays.size > 0;
const session = () => [...sessions.values()].at(-1) ?? null;

function isPlaying() {
  if (plays.size) return [...plays.values()].some((p) => p.playing);
  return sessions.size > 0;
}

function currentStake(): StakeKind | false {
  if (bypass || !isActive()) return false;
  if (plays.size) {
    const kinds = [...plays.values()].map((p) => p.stake).filter((k): k is StakeKind => !!k);
    return STAKE_ORDER.find((k) => kinds.includes(k)) ?? false;
  }
  const s = session();
  return s && interacted && results === 0 ? s.kind : false;
}

function emit() {
  const stake = currentStake();
  const s = session();
  snapshot = { active: isActive(), playing: isActive() && isPlaying(), game: s?.game ?? null, focus, stake, dialog };
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (focus) root.setAttribute('data-focus', ''); else root.removeAttribute('data-focus');
  }
  listeners.forEach((fn) => fn());
}

let reconcileTimer = 0;
/** Settles the history entry and the automatic start after the current tick (a dev double mount must not flicker). */
function schedule() {
  if (typeof window === 'undefined') return;
  emit();
  window.clearTimeout(reconcileTimer);
  reconcileTimer = window.setTimeout(reconcile, 0);
}

function reconcile() {
  const active = isActive();
  if (!active) {
    // The game screen is gone (left, or another page): drop everything without touching the history.
    forgetLayer(layer); layer = null;
    if (focus) setRealFullscreen(false);
    focus = false; interacted = false; dialog = null; bypass = false; lastPlaying = false; results = 0;
    emit();
    return;
  }
  const playing = isPlaying();
  if (playing && !lastPlaying && !focus) { focus = true; scrollTop(); }
  lastPlaying = playing;
  const need = focus || !!currentStake();
  if (!dialog) {
    if (need && !hasLayer(layer)) layer = pushLayer(onLayerPop);
    // Not while leaving: a link is navigating, and popping the entry now would fight it (the entry is left behind).
    else if (!need && hasLayer(layer) && !bypass) { dropLayer(layer); layer = null; }
  }
  emit();
}

/** Back popped our entry: end 전체 모드 first; past that, ask before leaving a game in progress. */
function onLayerPop() {
  layer = null;
  if (focus) {
    focus = false;
    setRealFullscreen(false);
    schedule(); // re-arms the guard when something is still at stake
    return;
  }
  const stake = currentStake();
  if (stake) {
    dialog = { kind: stake, reason: 'back', proceed: () => leaveNow(() => window.history.back()) };
    emit();
  } else schedule();
}

function leaveNow(go: () => void) {
  bypass = true; dialog = null;
  window.clearTimeout(bypassTimer);
  // If leaving did not take the game away after all (nothing behind us in the history), ask again next time.
  bypassTimer = window.setTimeout(() => { bypass = false; schedule(); }, 2500);
  emit();
  go();
}

function scrollTop() { try { window.scrollTo({ top: 0 }); } catch { /* old browsers */ } }

// ---- Real fullscreen (Android Chrome and the TWA app; iOS has no Fullscreen API for pages) ----

function canFullscreen() {
  if (typeof document === 'undefined' || !document.fullscreenEnabled) return false;
  return /Android/i.test(navigator.userAgent) && window.matchMedia('(pointer: coarse)').matches;
}

function setRealFullscreen(on: boolean) {
  if (typeof document === 'undefined') return;
  if (on) {
    if (!canFullscreen() || document.fullscreenElement) return;
    fullscreenOn = true;
    document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => { fullscreenOn = false; });
  } else if (fullscreenOn) {
    fullscreenOn = false;
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => { /* already out */ });
  }
}

/** Android's back while in real fullscreen only leaves fullscreen (no popstate): treat it as leaving 전체 모드. */
export function onFullscreenChange() {
  if (document.fullscreenElement || !fullscreenOn) return;
  fullscreenOn = false;
  if (focus) exitFocus();
}

// ---- Actions ----

/** The 전체 모드 button (a tap, so Android may also go real fullscreen). */
export function enterFocus() {
  if (!isActive() || focus) return;
  focus = true;
  if (session()?.fullscreen !== false) setRealFullscreen(true);
  scrollTop();
  schedule();
}

/** The 축소 bar. The history entry stays while something is at stake (it is the guard). */
export function exitFocus() {
  if (!focus) return;
  focus = false;
  setRealFullscreen(false);
  schedule();
}

/** Called from a game's start button (a tap): on Android, go real fullscreen with the automatic 전체 모드. */
export function requestGameFullscreen(allowed = true) {
  if (allowed) setRealFullscreen(true);
}

export function closeDialog() {
  if (!dialog) return;
  dialog = null;
  schedule(); // 계속하기: the guard entry comes back
}

export function proceedDialog() { dialog?.proceed(); }

/** A link out of a game in progress: ask first (FocusLayer calls this from its click guard). */
export function askBeforeLink(go: () => void): boolean {
  const stake = currentStake();
  if (!stake) return false;
  dialog = { kind: stake, reason: 'link', proceed: () => leaveNow(go) };
  emit();
  return true;
}

/** The first touch in a game GameGate opened: from now on, leaving it loses something. */
export function markInteracted() {
  if (interacted || plays.size || !sessions.size || results > 0) return;
  interacted = true;
  schedule();
}

export const stakeNow = () => currentStake();

/**
 * GameGate's exit (the header's back arrow): pops our entry first, then runs the page's own exit.
 * The player already answered the guard (or nothing was at stake), so nothing asks again.
 */
export function leaveGame(then: () => void) {
  bypass = true; dialog = null; focus = false;
  setRealFullscreen(false);
  emit();
  const id = layer; layer = null;
  if (!popLayerThen(id, then)) then();
}

// ---- Hooks ----

function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
const serverSnapshot: FocusSnapshot = snapshot;
export function useFocusState(): FocusSnapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
}

/** GameGate (and any page that shows one game full screen) while its game is open. */
export function useFocusSession(game: string, active: boolean, kind: StakeKind | false, fullscreen = true) {
  const id = useId();
  useEffect(() => {
    if (!active) return;
    sessions.set(id, { game, kind, fullscreen });
    schedule();
    return () => { sessions.delete(id); schedule(); };
  }, [id, game, active, kind, fullscreen]);
}

/**
 * A game's own word on where it stands. `playing`: a match, run or puzzle is under way (its start turns 전체 모드 on).
 * `stake`: what leaving now would cost, or false (lobby, finished, practice with nothing to lose).
 * Pass `enabled = false` to say nothing (e.g. a component that is only sometimes the game).
 */
export function useFocusPlay(playing: boolean, stake: StakeKind | false, enabled = true) {
  const id = useId();
  useEffect(() => {
    if (!enabled) return;
    plays.set(id, { playing, stake });
    schedule();
  }, [id, playing, stake, enabled]);
  useEffect(() => {
    if (!enabled) return;
    return () => { plays.delete(id); schedule(); };
  }, [id, enabled]);
}

/** Result screens: while one shows, the game is over and nothing is at stake. */
export function useFocusResult(showing = true) {
  useEffect(() => {
    if (!showing) return;
    results += 1;
    schedule();
    return () => {
      results = Math.max(0, results - 1);
      if (results === 0) interacted = false; // the next touch starts a new game
      schedule();
    };
  }, [showing]);
}
