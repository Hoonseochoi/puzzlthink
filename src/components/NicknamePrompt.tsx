"use client";

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { UserRound } from 'lucide-react';
import { useAuth } from './AuthProvider';

const ADJ = {
  ko: ['불쌍한', '배고픈', '졸린', '용감한', '수줍은', '심심한', '똑똑한', '느긋한', '수상한', '행복한', '엉뚱한', '날쌘'],
  en: ['Sleepy', 'Hungry', 'Brave', 'Shy', 'Bored', 'Clever', 'Lazy', 'Sneaky', 'Happy', 'Silly', 'Swift', 'Grumpy'],
};
const ANIMAL = {
  ko: ['고양이', '강아지', '판다', '수달', '너구리', '펭귄', '햄스터', '여우', '부엉이', '거북이', '코알라', '다람쥐'],
  en: ['Cat', 'Puppy', 'Panda', 'Otter', 'Raccoon', 'Penguin', 'Hamster', 'Fox', 'Owl', 'Turtle', 'Koala', 'Squirrel'],
};
/** A random "adjective animal + number" name, used when the player leaves the field empty. */
function randomName(locale: string) {
  const lang = locale === 'en' ? 'en' : 'ko';
  const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];
  const name = `${pick(ADJ[lang])}${lang === 'ko' ? ' ' : ''}${pick(ANIMAL[lang])}${Math.floor(10 + Math.random() * 90)}`;
  return name.slice(0, 16);
}

/**
 * Asked once after the first Google sign-in: the nickname shown in waiting rooms, games and rankings.
 * It can be changed any time in the records page. Left empty, the grey suggestion ("불쌍한 고양이47") is used.
 */
export default function NicknamePrompt() {
  const t = useTranslations('Nickname');
  const locale = useLocale();
  const { user, nicknameSet, saveNickname } = useAuth();
  const [draft, setDraft] = useState('');
  const [suggestion] = useState(() => randomName(locale));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user || nicknameSet !== false) return null;
  const value = draft.trim() || suggestion; // empty → the grey suggestion
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (value.trim().length < 2) { setError(t('tooShort')); return; }
    setBusy(true);
    const failed = await saveNickname(value);
    setBusy(false);
    if (failed) setError(t('failed'));
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="nickname-title">
      <form onSubmit={submit} className="hall-pop w-full max-w-sm rounded-[24px] bg-[#f9f7f1] p-6 text-center text-[#17201e] shadow-2xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#17201e] text-[#ffd36e]"><UserRound size={26} /></span>
        <h2 id="nickname-title" className="mt-4 text-xl font-black">{t('title')}</h2>
        <p className="mt-1.5 break-keep text-xs leading-5 text-black/55">{t('desc')}</p>
        <input autoFocus value={draft} maxLength={16} onChange={(event) => { setDraft(event.target.value); setError(''); }}
          placeholder={suggestion} className="mt-4 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-center text-base font-black outline-none placeholder:font-bold placeholder:text-black/30 focus:border-[#17201e]" />
        <p className="mt-1.5 text-[10px] text-black/40">{t('emptyHint')}</p>
        {error && <p className="mt-2 text-xs font-bold text-[#c2410c]">{error}</p>}
        <button type="submit" disabled={busy} className="mt-4 w-full rounded-2xl bg-[#17201e] py-3 text-sm font-black text-white disabled:opacity-50">{t('save')}</button>
        <p className="mt-3 text-[10px] text-black/40">{t('changeLater')}</p>
      </form>
    </div>
  );
}
