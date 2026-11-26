"use client";

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { LogOut, UserX, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { avatarUrl, displayName, useAuth } from './AuthProvider';
import GoogleSignInButton from './GoogleSignInButton';
import { type SignupSource, markSignupSource } from '@/lib/signupSource';

function GoogleMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Google sign-in button, or the signed-in avatar with a small menu. */
/** `source`: where this button sits, recorded when a new member signs up through it. */
export default function AuthButton({ full = false, source = 'other' }: { full?: boolean; source?: SignupSource }) {
  const t = useTranslations('Auth');
  const { user, ready, configured, error, signIn, signOut, clearError, setError } = useAuth();
  const locale = useLocale();
  const [useRedirect, setUseRedirect] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);

  // Google's button is a cross-origin iframe: a click on it shows up as the window losing focus to that iframe.
  useEffect(() => {
    const onBlur = () => { window.setTimeout(() => { if (signInRef.current?.contains(document.activeElement)) markSignupSource(source); }, 0); };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [source]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!configured || !ready) return null;
  const errorBox = error && (
    <div className="fixed inset-x-0 top-20 z-[70] mx-auto flex w-fit max-w-[92vw] items-start gap-2 rounded-2xl border border-[#ff6b4a]/40 bg-white px-4 py-3 text-xs font-bold text-[#c2410c] shadow-xl">
      <span>{t('error')}<span className="mt-0.5 block font-normal text-black/50">{error}</span></span>
      <button onClick={clearError} aria-label={t('close')} className="text-black/40 hover:text-black"><X size={14} /></button>
    </div>
  );

  if (!user && !useRedirect) {
    return (
      <>
        {errorBox}
        <div ref={signInRef} onPointerDown={() => markSignupSource(source)}><GoogleSignInButton width={full ? 280 : undefined} onError={setError} onFallback={() => setUseRedirect(true)} /></div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        {errorBox}
        <button type="button" disabled={busy} onClick={() => { markSignupSource(source); setBusy(true); signIn().finally(() => setBusy(false)); }}
          className={`flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-xs font-extrabold text-[#17201e] shadow-sm transition hover:bg-white/80 disabled:opacity-60 ${full ? 'w-full py-3 text-sm' : ''}`}>
          <GoogleMark />{t('signIn')}
        </button>
      </>
    );
  }

  const name = displayName(user);
  const avatar = avatarUrl(user);
  return (
    <div ref={ref} className={`relative ${full ? 'w-full' : ''}`}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label={t('account')} className={`flex items-center gap-2 rounded-full border border-black/10 bg-white py-1 pl-1 pr-3 text-xs font-extrabold shadow-sm ${full ? 'w-full py-2' : ''}`}>
        {avatar
          // eslint-disable-next-line @next/next/no-img-element -- Google avatar URL from an external host
          ? <img src={avatar} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full object-cover" />
          : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#17201e] text-white">{name.slice(0, 1)}</span>}
        <span className="max-w-[110px] truncate">{name}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-black/10 bg-white p-2 shadow-xl">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-extrabold">{name}</p>
            <p className="truncate text-[11px] text-black/45">{user.email}</p>
          </div>
          <button type="button" onClick={() => { setOpen(false); signOut(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-black/70 hover:bg-black/[0.04]"><LogOut size={14} />{t('signOut')}</button>
          {/* 회원탈퇴: the in-app path Google Play's account deletion policy asks for (also on the website). */}
          <Link href="/account-deletion" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-black/45 hover:bg-black/[0.04]"><UserX size={14} />{locale === 'en' ? 'Delete account' : '회원탈퇴'}</Link>
        </div>
      )}
    </div>
  );
}
