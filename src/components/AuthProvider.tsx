"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';

type AuthState = {
  user: User | null;
  ready: boolean;
  configured: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthState>({
  user: null, ready: false, configured: false, error: null,
  signIn: async () => {}, signOut: async () => {}, clearError: () => {},
});

const NAME_KEY = 'puzzlthink_nickname';
const AUTO_NAME = /^(손님|Guest) \d{4}$/;

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

  // Use the Google name as the room nickname unless the player picked their own.
  useEffect(() => {
    const name = displayName(user).trim().slice(0, 16);
    if (!name) return;
    try {
      const saved = localStorage.getItem(NAME_KEY);
      if (!saved || AUTO_NAME.test(saved)) localStorage.setItem(NAME_KEY, name);
    } catch { /* storage optional */ }
  }, [user]);

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

  const value = useMemo(() => ({ user, ready, configured, error, signIn, signOut, clearError: () => setError(null) }), [user, ready, configured, error, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
