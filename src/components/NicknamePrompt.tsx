"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { UserRound } from 'lucide-react';
import { useAuth } from './AuthProvider';

const LATER_KEY = 'puzzlthink_nickname_later';

/**
 * Asked once after the first Google sign-in: the nickname shown in waiting rooms, games and rankings.
 * It can be changed any time in the records page. "Later" hides it for this browser session.
 */
export default function NicknamePrompt() {
  const t = useTranslations('Nickname');
  const { user, nickname, nicknameSet, saveNickname } = useAuth();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [later, setLater] = useState(() => { try { return typeof window !== 'undefined' && sessionStorage.getItem(LATER_KEY) === '1'; } catch { return false; } });

  if (!user || nicknameSet !== false || later) return null;
  const value = draft ?? nickname ?? '';
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (value.trim().length < 2) { setError(t('tooShort')); return; }
    setBusy(true);
    const failed = await saveNickname(value);
    setBusy(false);
    if (failed) setError(t('failed'));
  };
  const skip = () => { try { sessionStorage.setItem(LATER_KEY, '1'); } catch { /* optional */ } setLater(true); };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="nickname-title">
      <form onSubmit={submit} className="hall-pop w-full max-w-sm rounded-[24px] bg-[#f9f7f1] p-6 text-center text-[#17201e] shadow-2xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#17201e] text-[#ffd36e]"><UserRound size={26} /></span>
        <h2 id="nickname-title" className="mt-4 text-xl font-black">{t('title')}</h2>
        <p className="mt-1.5 break-keep text-xs leading-5 text-black/55">{t('desc')}</p>
        <input autoFocus value={value} maxLength={16} onChange={(event) => { setDraft(event.target.value); setError(''); }}
          placeholder={t('placeholder')} className="mt-4 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-center text-base font-black outline-none focus:border-[#17201e]" />
        {error && <p className="mt-2 text-xs font-bold text-[#c2410c]">{error}</p>}
        <button type="submit" disabled={busy} className="mt-4 w-full rounded-2xl bg-[#17201e] py-3 text-sm font-black text-white disabled:opacity-50">{t('save')}</button>
        <button type="button" onClick={skip} className="mt-2 w-full py-2 text-xs font-bold text-black/45 hover:text-black">{t('later')}</button>
        <p className="mt-1 text-[10px] text-black/40">{t('changeLater')}</p>
      </form>
    </div>
  );
}
