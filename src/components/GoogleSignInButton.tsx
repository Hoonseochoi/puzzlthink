"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { getSupabase } from '@/lib/supabase';

// Public OAuth client ID (also visible in Google's sign-in URL). Env var overrides it.
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '910472181276-d02627nr5sodsaaabdv7l84eshn9p7j6.apps.googleusercontent.com';

type GoogleId = {
  initialize: (config: Record<string, unknown>) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
};
declare global { interface Window { google?: { accounts: { id: GoogleId } } } }

let scriptPromise: Promise<void> | null = null;
function loadGis(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(new Error('gis')); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Google's own sign-in button (Google Identity Services). The ID token goes straight to Supabase,
 * so Google's screen shows puzzlthink.com rather than the Supabase project domain.
 * Calls `onFallback` if the Google script cannot load (then the redirect flow is used).
 */
export default function GoogleSignInButton({ width, onError, onFallback }: { width?: number; onError: (message: string) => void; onFallback: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await loadGis();
        if (!alive || !ref.current || !window.google) return;
        const raw = crypto.randomUUID().replace(/-/g, '');
        const hashed = await sha256Hex(raw);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          nonce: hashed,
          ux_mode: 'popup',
          use_fedcm_for_button: true,
          callback: async ({ credential }: { credential: string }) => {
            const { error } = await getSupabase()!.auth.signInWithIdToken({ provider: 'google', token: credential, nonce: raw });
            if (error) onError(error.message);
          },
        });
        window.google.accounts.id.renderButton(ref.current, {
          type: 'standard', theme: 'outline', size: 'medium', shape: 'pill', text: 'signin_with', logo_alignment: 'left', locale, ...(width ? { width } : {}),
        });
      } catch {
        if (alive) { setFailed(true); onFallback(); }
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, width]);

  if (failed) return null;
  return <div ref={ref} className="flex min-h-[32px] min-w-[120px] items-center justify-center" />;
}
