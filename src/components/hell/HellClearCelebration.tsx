"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Skull, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { certImagePath } from '@/lib/hardClear';
import { HELL_CLEAR_EVENT, type HellClearDetail, hellLabel } from '@/lib/hell';
import AuthButton from '../AuthButton';
import CertShare from '../CertShare';
import { BlackPiece } from './BlackPiece';

/** "N번째 매우 어려움 클리어!" popup: dark neon certificate, share and save. Signed out: sign in to get the number. */
export default function HellClearCelebration() {
  const t = useTranslations('Hell');
  const locale = useLocale();
  const [shown, setShown] = useState<HellClearDetail | null>(null);
  const [imgReady, setImgReady] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const onClear = (e: Event) => {
      const detail = (e as CustomEvent<HellClearDetail>).detail;
      timers.push(window.setTimeout(() => { setImgReady(false); setShown(detail); }, detail.delayMs));
    };
    window.addEventListener(HELL_CLEAR_EVENT, onClear);
    return () => { window.removeEventListener(HELL_CLEAR_EVENT, onClear); timers.forEach((id) => window.clearTimeout(id)); };
  }, []);

  if (!shown) return null;
  const close = () => setShown(null);
  const label = hellLabel(shown.game, locale);
  const numbered = shown.id && shown.no;

  return (
    <div className="fixed inset-0 z-[111] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="hell-clear-title">
      <div className="hall-pop hell-surface hell-scan relative my-auto w-full max-w-md overflow-hidden rounded-[26px] border border-[#ff3355]/55 p-6 text-center text-white shadow-[0_0_120px_rgba(255,36,72,.45)] sm:p-7">
        <button type="button" onClick={close} aria-label={t('close')} className="absolute right-4 top-4 text-white/40 hover:text-white"><X size={18} /></button>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ff3355]/15 ring-1 ring-[#ff3355]/60 shadow-[0_0_30px_rgba(255,51,85,.5)]"><Skull size={30} className="text-[#ff5a74]" /></div>
        <p className="mt-4 text-[10px] font-black tracking-[0.3em] text-[#ff3355]">{t('certEyebrow')}</p>
        <h2 id="hell-clear-title" className="mt-1 text-[28px] font-black leading-tight tracking-tight">
          <span className="hell-neon !text-white">{numbered ? t('popupTitle', { n: shown.no! }) : t('popupTitleSignedOut')}</span>
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/70">{numbered ? t('popupDesc', { label, n: shown.no! }) : t('popupDescSignedOut', { label })}</p>

        {numbered ? (
          <>
            <div className="relative mt-5 aspect-[1200/630] w-full overflow-hidden rounded-[12px] bg-white/5 ring-1 ring-[#ff3355]/30">
              {/* eslint-disable-next-line @next/next/no-img-element -- generated PNG */}
              <img src={certImagePath(shown.id!, locale)} alt={t('imageAlt', { label, n: shown.no! })} onLoad={() => setImgReady(true)} className={`h-full w-full transition-opacity duration-500 ${imgReady ? 'opacity-100' : 'opacity-0'}`} />
              {!imgReady && <span className="absolute inset-0 flex items-center justify-center text-xs text-white/40">{t('imageLoading')}</span>}
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-[#ff8ea0]"><BlackPiece size={11} />{t('popupNudge')}</p>
            <div className="mt-3"><CertShare id={shown.id!} text={t('shareText', { n: shown.no!, label })} /></div>
            <Link href={`/cert/${shown.id}`} onClick={close} className="mt-3 inline-block text-xs font-bold text-white/55 underline-offset-4 hover:text-white hover:underline">{t('openPage')}</Link>
          </>
        ) : (
          <div className="mt-5 rounded-[16px] border border-[#ff3355]/35 bg-[#ff3355]/[0.07] p-4">
            <p className="hell-neon text-3xl font-black">#???</p>
            <p className="mt-2 text-xs leading-5 text-white/65">{t('signInPrompt')}</p>
            <div className="mt-3 flex justify-center"><AuthButton full source="hell_clear" /></div>
          </div>
        )}
        <button type="button" onClick={close} className="mt-4 w-full rounded-[12px] border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10">{t('close')}</button>
      </div>
    </div>
  );
}
