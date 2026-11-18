"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Trophy, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { HARD_CLEAR_EVENT, type HardClearDetail, certImagePath, clearLabel } from '@/lib/hardClear';
import AuthButton from './AuthButton';
import CertShare from './CertShare';
import { Fireworks } from './HallCelebration';

/** "N번째로 어려움 클리어!" popup with the certificate, share and save buttons. Signed out: a sign-in prompt for the number. */
export default function HardClearCelebration() {
  const t = useTranslations('Cert');
  const locale = useLocale();
  const [shown, setShown] = useState<HardClearDetail | null>(null);
  const [imgReady, setImgReady] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const onClear = (e: Event) => {
      const detail = (e as CustomEvent<HardClearDetail>).detail;
      timers.push(window.setTimeout(() => { setImgReady(false); setShown(detail); }, detail.delayMs));
    };
    window.addEventListener(HARD_CLEAR_EVENT, onClear);
    return () => { window.removeEventListener(HARD_CLEAR_EVENT, onClear); timers.forEach((id) => window.clearTimeout(id)); };
  }, []);

  if (!shown) return null;
  const close = () => setShown(null);
  const label = clearLabel(shown.game, locale);
  const numbered = shown.id && shown.no;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="hard-clear-title">
      <Fireworks />
      <div className="hall-pop relative my-auto w-full max-w-md overflow-hidden rounded-[26px] border border-[#d9b25f]/45 bg-gradient-to-b from-[#241c0c] to-[#100d07] p-6 text-center text-white shadow-[0_0_120px_rgba(217,178,95,.35)] sm:p-7">
        <button type="button" onClick={close} aria-label={t('close')} className="absolute right-4 top-4 text-white/40 hover:text-white"><X size={18} /></button>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d9b25f]/15 ring-1 ring-[#d9b25f]/45"><Trophy size={30} className="text-[#ffe3a1]" /></div>
        <p className="mt-4 text-[10px] font-black tracking-[0.3em] text-[#d9b25f]">{t('eyebrow')}</p>
        <h2 id="hard-clear-title" className="mt-1 text-[28px] font-black leading-tight tracking-tight">
          {numbered ? t('popupTitle', { n: shown.no! }) : t('popupTitleSignedOut')}
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/70">{numbered ? t('popupDesc', { label, n: shown.no! }) : t('popupDescSignedOut', { label })}</p>

        {numbered ? (
          <>
            <div className="relative mt-5 aspect-[1200/630] w-full overflow-hidden rounded-[12px] bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element -- generated PNG */}
              <img src={certImagePath(shown.id!, locale)} alt={t('imageAlt', { label, n: shown.no! })} onLoad={() => setImgReady(true)} className={`h-full w-full transition-opacity duration-500 ${imgReady ? 'opacity-100' : 'opacity-0'}`} />
              {!imgReady && <span className="absolute inset-0 flex items-center justify-center text-xs text-white/40">{t('imageLoading')}</span>}
            </div>
            <p className="mt-3 text-[11px] text-[#ffe3a1]/80">{t('popupNudge')}</p>
            <div className="mt-3"><CertShare id={shown.id!} text={t('shareText', { n: shown.no!, label })} /></div>
            <Link href={`/cert/${shown.id}`} onClick={close} className="mt-3 inline-block text-xs font-bold text-white/55 underline-offset-4 hover:text-white hover:underline">{t('openPage')}</Link>
          </>
        ) : (
          <div className="mt-5 rounded-[16px] border border-[#d9b25f]/30 bg-[#d9b25f]/[0.07] p-4">
            <p className="text-3xl font-black text-[#ffe3a1]">#???</p>
            <p className="mt-2 text-xs leading-5 text-white/65">{t('signInPrompt')}</p>
            <div className="mt-3 flex justify-center"><AuthButton full source="hard_clear" /></div>
          </div>
        )}
        <button type="button" onClick={close} className="mt-4 w-full rounded-[12px] border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10">{t('close')}</button>
      </div>
    </div>
  );
}
