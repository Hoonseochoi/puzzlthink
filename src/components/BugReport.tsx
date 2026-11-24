"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { Bug, Check, Loader2, X } from 'lucide-react';
import { usePathname } from '@/i18n/routing';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

/** Game pages that get the floating "오류 제보" button, with the Common message key for the game's name. */
const GAMES: { path: string; id: string; label: string }[] = [
  { path: '/four-three', id: 'four_three', label: 'fourThree' },
  { path: '/flip-omok', id: 'flip_omok', label: 'flipOmok' },
  { path: '/nine-mens-morris', id: 'nine_mens_morris', label: 'nineMensMorris' },
  { path: '/wallgo-2', id: 'wallgo2', label: 'wallgo2' },
  { path: '/wallgo', id: 'wallgo', label: 'wallgo' },
  { path: '/janggi', id: 'janggi', label: 'janggi' },
  { path: '/heavy13', id: 'heavy13', label: 'heavy13' },
  { path: '/russian-roulette', id: 'russian_roulette', label: 'russianRoulette' },
  { path: '/russian-janggi', id: 'russian_janggi', label: 'russianJanggi' },
  { path: '/blind-gomoku', id: 'blind_gomoku', label: 'blindGomoku' },
  { path: '/hexagon', id: 'hexagon', label: 'hexagon' },
  { path: '/piggy-bank', id: 'piggy_bank', label: 'piggyBank' },
  { path: '/black-white-2', id: 'black_white_2', label: 'blackWhite2' },
  { path: '/black-white', id: 'black_white', label: 'blackWhite' },
  { path: '/laser-janggi', id: 'laser_janggi', label: 'laserJanggi' },
  { path: '/nemo-count', id: 'nemo_count', label: 'nemoCount' },
  { path: '/slitherlink', id: 'slitherlink', label: 'slitherlink' },
  { path: '/binairo', id: 'binairo', label: 'binairo' },
  { path: '/one-stroke', id: 'onestroke', label: 'onestroke' },
  { path: '/color-link', id: 'colorlink', label: 'colorlink' },
  { path: '/magic-square', id: 'magicswap', label: 'magicswap' },
  { path: '/2048', id: 'merge2048', label: 'merge2048' },
  { path: '/point-omok', id: 'point_omok', label: 'pointOmok' },
  { path: '/hit-stay', id: 'hit_stay', label: 'hitStay' },
  { path: '/star-battle', id: 'starbattle', label: 'starbattle' },
  { path: '/masyu', id: 'masyu', label: 'masyu' },
  { path: '/nonogram', id: 'nonogram', label: 'nonogram' },
  { path: '/play', id: 'sudoku', label: 'sudoku' },
];
const CATEGORIES = ['bug', 'rule', 'display', 'online', 'other'] as const;
// Web3Forms relays the report to the address the key was created for (contact@puzzlthink.com).
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '';

type Status = 'idle' | 'sending' | 'sent' | 'failed';

/**
 * "오류 제보" button for a game's top bar (solo games and friend rooms). Reports are stored in
 * Supabase and emailed to the site owner. The game is worked out from the current path.
 */
export default function BugReport({ dark = true }: { dark?: boolean }) {
  const pathname = usePathname();
  const game = GAMES.find((g) => pathname === g.path || pathname.startsWith(`${g.path}/`));
  return game ? <BugReportButton game={game} dark={dark} key={game.id} /> : null;
}

function BugReportButton({ game, dark }: { game: (typeof GAMES)[number]; dark: boolean }) {
  const t = useTranslations('BugReport');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState(''); // honeypot: bots fill every field
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const gameName = tc(game.label);

  const close = () => { setOpen(false); if (status === 'sent') { setStatus('idle'); setMessage(''); setCategory('bug'); } };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) { setError(t('tooShort')); return; }
    setError('');
    if (trap) { setStatus('sent'); return; }
    setStatus('sending');
    const page = window.location.href;
    const ua = navigator.userAgent;
    const screen = `${window.innerWidth}x${window.innerHeight}@${window.devicePixelRatio || 1}`;
    const contact = email.trim();

    const stored = getSupabase()?.rpc('submit_bug_report', {
      p_game: game.id, p_category: category, p_message: message.trim(), p_contact_email: contact || null,
      p_page_url: page, p_user_agent: ua, p_screen: screen, p_locale: locale,
    }).then(({ data, error: e2 }) => !e2 && data === true, () => false) ?? Promise.resolve(false);

    const mailed = WEB3FORMS_KEY
      ? fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[PUZZLTHINK 오류 제보] ${gameName} · ${t(`cat_${category}`)}`,
          from_name: 'PUZZLTHINK 오류 제보',
          ...(contact ? { email: contact } : {}),
          게임: `${gameName} (${game.id})`,
          분류: t(`cat_${category}`),
          내용: message.trim(),
          페이지: page,
          브라우저: ua,
          화면: screen,
          언어: locale,
          로그인: user ? `로그인 사용자 (${user.id})` : '비로그인',
        }),
      }).then((r) => r.json()).then((r) => Boolean(r?.success), () => false)
      : Promise.resolve(false);

    const [ok1, ok2] = await Promise.all([stored, mailed]);
    setStatus(ok1 || ok2 ? 'sent' : 'failed');
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={t('button')} title={t('button')}
        className={dark
          ? 'inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/80 transition hover:bg-white/10'
          : 'inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-extrabold text-black/70 transition hover:bg-white'}>
        <Bug size={14} /><span className="hidden sm:inline">{t('button')}</span>
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="bug-report-title" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-[22px] border border-black/10 bg-[#f9f7f1] p-5 text-[#17201e] shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="bug-report-title" className="flex items-center gap-2 text-lg font-black"><Bug size={18} className="text-[#ff6b4a]" />{t('title')}</h2>
                <p className="mt-1 text-xs text-black/55">{t('desc', { game: gameName })}</p>
              </div>
              <button type="button" onClick={close} aria-label={t('close')} className="text-black/40 hover:text-black"><X size={18} /></button>
            </div>

            {status === 'sent' ? (
              <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#12a594] text-white"><Check size={22} /></span>
                <p className="text-sm font-bold">{t('sent')}</p>
                <button type="button" onClick={close} className="mt-2 rounded-full bg-[#17201e] px-5 py-2.5 text-xs font-bold text-white">{t('close')}</button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 space-y-4">
                <fieldset>
                  <legend className="text-xs font-bold text-black/60">{t('category')}</legend>
                  <div className="mt-2 grid gap-1.5">
                    {CATEGORIES.map((c) => (
                      <label key={c} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${category === c ? 'border-[#17201e] bg-white' : 'border-black/10 text-black/60 hover:bg-white/60'}`}>
                        <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} className="accent-[#17201e]" />
                        {t(`cat_${c}`)}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="block">
                  <span className="text-xs font-bold text-black/60">{t('message')}</span>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} rows={4} required placeholder={t('messagePlaceholder')}
                    className="mt-2 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#17201e]" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-black/60">{t('email')}</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#17201e]" />
                  <span className="mt-1 block text-[11px] text-black/40">{t('emailHint')}</span>
                </label>
                <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" aria-hidden />
                <p className="text-[11px] text-black/40">{t('attached')}</p>
                {(error || status === 'failed') && <p className="rounded-xl bg-[#fff0eb] px-3 py-2 text-xs font-bold text-[#c2410c]">{error || t('failed')}</p>}
                <button type="submit" disabled={status === 'sending'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17201e] py-3 text-sm font-black text-white disabled:opacity-60">
                  {status === 'sending' ? <><Loader2 size={15} className="animate-spin" />{t('sending')}</> : t('send')}
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
