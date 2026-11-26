'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { markSignupSource } from '@/lib/signupSource';
import { Link } from '@/i18n/routing';
import { BTN, BTN_ACCENT, SHELL, STAGE } from '../ui/gameUi';
import { hwCopy, hwRootStyle } from './copy';

/** 히든 워드 확장판 is for members: a signed-out visitor to a 확장판 friend room sees the sign-in panel instead of the room. */
export default function MembersGate({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const t = hwCopy(locale, 'plus');
  const { user, ready, signIn } = useAuth();
  if (ready && user) return <>{children}</>;
  return (
    <div className={SHELL} style={hwRootStyle('plus')} data-hw="plus">
      <main className="relative z-10 mx-auto w-full max-w-[640px] px-3 pb-10 pt-16 sm:px-4">
        <div className={`${STAGE} flex min-h-[320px] flex-col items-center justify-center gap-3 text-center`} role="status">
          {!ready ? <Loader2 className="animate-spin text-(--accent)" size={26} /> : <>
            <LockKeyhole className="text-(--accent)" size={28} />
            <h1 className="text-lg font-black text-white">{t.membersTitle}</h1>
            <p className="max-w-[320px] break-keep text-sm leading-6 text-white/60">{t.membersDesc}</p>
            <button type="button" onClick={() => { markSignupSource('hidden_word_plus'); void signIn(); }} className={BTN_ACCENT}>{t.membersSignIn}</button>
            <Link href="/hidden-word-plus" className={BTN}>{t.back}</Link>
          </>}
        </div>
      </main>
    </div>
  );
}
