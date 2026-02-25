"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Clue } from '@/types/escape';
import { cn } from '@/lib/utils';

type Props = {
  clues: Clue[];
  foundClueIds: string[];
  /** 돋보기로 한 번이라도 팝업 본 단서 id (magnifierImage 전용) */
  viewedWithMagnifierClueIds?: string[];
  className?: string;
};

export default function PhotoBox({ clues, foundClueIds, viewedWithMagnifierClueIds = [], className }: Props) {
  const t = useTranslations('Escape');
  const [popupImage, setPopupImage] = useState<{ src: string; name: string } | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const photoItems = clues.filter(
    (c) =>
      foundClueIds.includes(c.id) &&
      (c.magnifierImage || c.imageOnClick)
  ).map((c) => ({
    id: c.id,
    name: c.name,
    src: c.imageOnClick ?? c.magnifierImage!,
    /** magnifierImage만 있고 imageOnClick 없음 → 돋보기로 봐야 팝업 가능 */
    needsMagnifierView: !!c.magnifierImage && !c.imageOnClick,
  }));

  const handlePhotoClick = (item: (typeof photoItems)[0]) => {
    if (item.needsMagnifierView && !viewedWithMagnifierClueIds.includes(item.id)) {
      setPopupMessage(t('magnifierNeededMessage'));
      return;
    }
    setPopupImage({ src: item.src, name: item.name });
  };

  return (
    <>
      <section
        className={cn(
          'rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden',
          className
        )}
      >
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-rose-500 text-[18px]">photo_library</span>
            {t('photos')}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {photoItems.length}
          </span>
        </div>
        <div className="p-3 max-h-[200px] overflow-y-auto">
          {photoItems.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">{t('photosEmpty')}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photoItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePhotoClick(item)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-rose-300 dark:hover:border-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-all overflow-hidden"
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <img
                      src={item.src}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight line-clamp-2 text-slate-700 dark:text-slate-200">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {mounted && popupImage && typeof document !== 'undefined' && document.body
        ? createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4"
              onClick={() => setPopupImage(null)}
            >
              <button
                type="button"
                onClick={() => setPopupImage(null)}
                className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
                aria-label={t('close')}
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
              <div className="relative max-w-[63vw] max-h-[63vh]" onClick={(e) => e.stopPropagation()}>
                <img
                  src={popupImage.src}
                  alt={popupImage.name}
                  className="max-w-full max-h-[63vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            </div>,
            document.body
          )
        : null}

      {mounted && popupMessage && typeof document !== 'undefined' && document.body
        ? createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4"
              onClick={() => setPopupMessage(null)}
            >
              <div
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-[320px] shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-slate-700 dark:text-slate-200 text-center">{popupMessage}</p>
                <button
                  type="button"
                  onClick={() => setPopupMessage(null)}
                  className="mt-4 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium"
                >
                  {t('confirm')}
                </button>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
