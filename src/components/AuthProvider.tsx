"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { flushPendingGame } from '@/lib/stats';
import { takeSignupSource } from '@/lib/signupSource';

type AuthState = {
  user: User | null;
  ready: boolean;
  configured: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setError: (message: string) => void;
  /** The player's nickname from their profile (null until loaded or signed out). */
  nickname: string | null;
  /** Whether they have chosen it (false: ask once after sign-in). Null while loading. */
  nicknameSet: boolean | null;
  /** Members who joined before nicknames existed see their current name filled in; new members start empty. */
  prefillNickname: string | null;
  saveNickname: (name: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthState>({
  user: null, ready: false, configured: false, error: null,
  signIn: async () => {}, signOut: async () => {}, clearError: () => {}, setError: () => {},
  nickname: null, nicknameSet: null, prefillNickname: null, saveNickname: async () => null,
});

const NAME_KEY = 'puzzlthink_nickname';
/** When nickname choice launched: members who joined before keep their current name as the default. */
const NICKNAMES_LAUNCHED = Date.parse('2026-11-17T10:44:09Z');

export const displayName = (user: User | null) =>
  (user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '') as string;
export const avatarUrl = (user: User | null) => (user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '') as string;

/** Google sign-in through Supabase Auth (PKCE). The session survives reloads. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { const t = window.setTimeout(() => setReady(true), 0); return () => window.clearTimeout(t); }
    let alive = true;
    const url = new URL(window.location.href);
    const oauthError = url.searchParams.get('error_description') || url.hash.match(/error_description=([^&]+)/)?.[1];
    // Show the login button only once Google is enabled in Supabase Auth (public settings endpoint).
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    fetch(`${base}/auth/v1/settings`, { headers: { apikey: key } })
      .then((r) => r.json())
      .then((settings) => { if (alive) setConfigured(Boolean(settings?.external?.google)); })
      .catch(() => {});
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      if (data.session) setConfigured(true);
      setUser(data.session?.user ?? null);
      setReady(true);
      if (oauthError) setError(decodeURIComponent(oauthError.replace(/\+/g, ' ')));
      // Drop the one-time OAuth parameters from the address bar.
      if (url.searchParams.has('code') || oauthError) {
        ['code', 'error', 'error_code', 'error_description', 'state'].forEach((k) => url.searchParams.delete(k));
        window.history.replaceState(null, '', `${url.pathname}${url.search}`);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  // Keep the Supabase profile fresh and count online time while a tab is visible.
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.rpc('touch_profile', { p_full_name: displayName(user) || null, p_avatar_url: avatarUrl(user) || null }).then(() => {});
    // A game finished while signed out (sign-in prompt on the result screen) is saved now.
    flushPendingGame().then((saved) => { if (saved) window.dispatchEvent(new Event('puzzlthink:game-saved')); });
    const beat = () => { if (document.visibilityState === 'visible') supabase.rpc('track_activity', { p_seconds: 60 }).then(() => {}); };
    const timer = window.setInterval(beat, 60_000);
    return () => window.clearInterval(timer);
  }, [user]);

  // Signed in: the profile nickname is the name in every room (waiting rooms, games, rankings).
  const [profileName, setProfileName] = useState<{ uid: string; nickname: string | null; set: boolean; existing?: boolean } | null>(null);
  const writeRoomName = (name: string) => { try { localStorage.setItem(NAME_KEY, name.slice(0, 16)); } catch { /* storage optional */ } };
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;
    let alive = true;
    // touch_profile (above) creates the row on first sign-in, so retry once if it is not there yet.
    const load = (tries: number) => supabase.from('profiles').select('nickname, nickname_set, created_at').maybeSingle().then(({ data, error }) => {
      if (!alive) return;
      if (!data && tries > 0) { window.setTimeout(() => load(tries - 1), 1200); return; }
      // A brand-new member: note which sign-in button brought them (the server keeps only the first).
      const source = takeSignupSource();
      if (data?.created_at && Date.now() - new Date(data.created_at as string).getTime() < 30 * 60 * 1000) {
        supabase.rpc('set_signup_source', { p_source: source?.source ?? 'other', p_path: source?.path ?? null }).then(() => {});
      }
      const nickname = (data?.nickname as string | null) ?? displayName(user).slice(0, 16) ?? null;
      // Before the nickname migration there is no nickname_set column: treat as chosen (no prompt).
      const existing = !!data?.created_at && new Date(data.created_at as string).getTime() < NICKNAMES_LAUNCHED;
      setProfileName({ uid: user.id, nickname, set: error ? true : !!data?.nickname_set, existing });
      if (nickname) writeRoomName(nickname);
    });
    load(2);
    return () => { alive = false; };
  }, [user]);
  const saveNickname = useCallback(async (name: string) => {
    const supabase = getSupabase();
    const trimmed = name.trim().slice(0, 16);
    if (!supabase || !user || trimmed.length < 2) return 'invalid';
    const { error: e } = await supabase.rpc('update_profile', { p_nickname: trimmed, p_show_in_hall: null });
    if (e) return e.message;
    setProfileName({ uid: user.id, nickname: trimmed, set: true });
    writeRoomName(trimmed);
    return null;
  }, [user]);
  const mine = profileName && user && profileName.uid === user.id ? profileName : null;

  const signIn = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const back = window.location.href.split('#')[0];
    const { error: e } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: back, queryParams: { prompt: 'select_account' } } });
    if (e) setError(e.message);
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user, ready, configured, error, signIn, signOut, clearError: () => setError(null), setError,
    nickname: mine?.nickname ?? null, nicknameSet: mine ? mine.set : null, prefillNickname: mine?.existing ? mine.nickname : null, saveNickname,
  }), [user, ready, configured, error, signIn, signOut, mine, saveNickname]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
