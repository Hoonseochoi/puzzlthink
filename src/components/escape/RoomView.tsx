"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Room, Clue } from '@/types/escape';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Props = {
  room: Room;
  cluesInRoom: Clue[];
  foundClueIds: string[];
  onClueFound: (clueId: string) => void;
  onBack: () => void;
  /** 도구 탭에서 선택된 도구 id. 'magnifier'이면 돋보기 모드 활성화 */
  selectedToolId?: string | null;
  /** 돋보기로 이미지 팝업 봤을 때 호출 (사진탭에서 이미지 표시 허용용) */
  onMagnifierView?: (clueId: string) => void;
  /** When room.isGathering, render this below the room (living room suspects) */
  gatheringContent?: React.ReactNode;
  className?: string;
};

export default function RoomView({
  room,
  cluesInRoom,
  foundClueIds,
  onClueFound,
  onBack,
  selectedToolId,
  onMagnifierView,
  gatheringContent,
  className,
}: Props) {
  const t = useTranslations('Escape');
  const [magnifierPopupImage, setMagnifierPopupImage] = useState<string | null>(null);
  const [passwordKeypadClue, setPasswordKeypadClue] = useState<Clue | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasMagnifier = foundClueIds.includes('magnifier');
  const magnifierMode = hasMagnifier && selectedToolId === 'magnifier';

  useEffect(() => setMounted(true), []);

  const handleHotspotClick = (clue: Clue) => {
    if (magnifierMode && clue.magnifierImage) {
      if (!foundClueIds.includes(clue.id)) onClueFound(clue.id);
      onMagnifierView?.(clue.id);
      setMagnifierPopupImage(clue.magnifierImage);
      return;
    }
    if (clue.imageOnClick) {
      if (!foundClueIds.includes(clue.id)) onClueFound(clue.id);
      setMagnifierPopupImage(clue.imageOnClick);
      return;
    }
    if (clue.passwordLock && !foundClueIds.includes(clue.id)) {
      setPasswordKeypadClue(clue);
      setPasswordInput('');
      setPasswordError(false);
      return;
    }
    if (!foundClueIds.includes(clue.id)) {
      onClueFound(clue.id);
    }
  };

  const handlePasswordKey = (digit: string) => {
    if (passwordInput.length >= 4) return;
    const next = passwordInput + digit;
    setPasswordInput(next);
    setPasswordError(false);
    if (next.length === 4 && passwordKeypadClue?.passwordLock && next === passwordKeypadClue.passwordLock.correctPassword) {
      onClueFound(passwordKeypadClue.id);
      setPasswordKeypadClue(null);
      setPasswordInput('');
    } else if (next.length === 4) {
      setPasswordError(true);
      setTimeout(() => {
        setPasswordInput('');
        setPasswordError(false);
      }, 800);
    }
  };

  const handlePasswordBackspace = () => {
    setPasswordInput((prev) => prev.slice(0, -1));
    setPasswordError(false);
  };

  const handlePasswordConfirm = () => {
    if (!passwordKeypadClue?.passwordLock) return;
    if (passwordInput.length !== 4) return;
    if (passwordInput === passwordKeypadClue.passwordLock.correctPassword) {
      onClueFound(passwordKeypadClue.id);
      setPasswordKeypadClue(null);
      setPasswordInput('');
    } else {
      setPasswordError(true);
      setTimeout(() => {
        setPasswordInput('');
        setPasswordError(false);
      }, 800);
    }
  };

  return (
    <>
    <div className={cn('rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 min-h-[50vh] md:min-h-[55vh] flex flex-col', className)}>
      {/* Room header with back button */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-700 bg-slate-800/80 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-600 hover:bg-slate-700 text-slate-300 transition-colors"
          aria-label={t('backToList')}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h2 className="text-sm font-bold text-slate-200 flex-1">{room.name}</h2>
      </div>

      {/* Room interior with magnifying-glass hotspots */}
      <div
        className="relative flex-1 min-h-[45vh] md:min-h-[50vh] bg-slate-900 bg-cover bg-center"
        style={
          room.image
            ? { backgroundImage: `url(${room.image})` }
            : { background: room.background ?? 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)' }
        }
      >
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 z-10">
          {cluesInRoom.filter((c) => c.hotspotPosition).map((clue) => {
            const found = foundClueIds.includes(clue.id);
            const isMagnifierClue = !!clue.magnifierImage;
            const isLockedSafe = clue.id === 'locked_safe';
            const pos = clue.hotspotPosition!;
            const isReInspectable = isMagnifierClue && found;
            return (
              <button
                key={clue.id}
                type="button"
                onClick={() => handleHotspotClick(clue)}
                aria-label={clue.name}
                className={cn(
                  'absolute rounded-lg flex items-center justify-center transition-all cursor-magnifier',
                  isReInspectable
                    ? 'border-2 border-violet-400/60 bg-violet-500/20 text-violet-200 hover:bg-violet-500/30'
                    : isLockedSafe && found
                      ? 'border-2 border-sky-400/60 bg-sky-500/20 text-sky-200'
                      : found
                        ? 'border-2 border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                        : 'border border-white/40 bg-white/10 hover:bg-white/20 text-white/90'
                )}
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  width: `${pos.width}%`,
                  height: `${pos.height}%`,
                }}
              >
                {isReInspectable ? (
                  <span className="material-symbols-outlined text-[22px] md:text-[28px]">
                    {magnifierMode ? 'zoom_in' : 'image'}
                  </span>
                ) : isLockedSafe && found ? (
                  <span className="material-symbols-outlined text-[22px] md:text-[28px]">
                    lock_open
                  </span>
                ) : found ? (
                  <span className="material-symbols-outlined text-[22px] md:text-[28px]">
                    check_circle
                  </span>
                ) : magnifierMode && clue.magnifierImage ? (
                  <span className="material-symbols-outlined text-[20px] md:text-[24px]">zoom_in</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px] md:text-[24px]">search</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Living room: suspects gathering */}
      {gatheringContent && (
        <div className="shrink-0 border-t border-slate-700 bg-slate-800/60">
          {gatheringContent}
        </div>
      )}
    </div>

    {/* 비밀번호 도어락 팝업 */}
    {mounted && passwordKeypadClue && typeof document !== 'undefined' && document.body
      ? createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPasswordKeypadClue(null)}
          >
            <div
              className="bg-slate-800 rounded-2xl border border-slate-600 p-6 w-full max-w-[280px] shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-200 mb-2">{passwordKeypadClue.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{t('enterPassword')}</p>
              <div
                className={cn(
                  'flex justify-center gap-2 mb-4 px-4 py-3 rounded-xl bg-slate-900 border-2 font-mono text-2xl tracking-[0.5em]',
                  passwordError ? 'border-red-500/80 text-red-400' : 'border-slate-600 text-slate-200'
                )}
              >
                {[0, 1, 2, 3].map((i) => (
                  <span key={i}>{passwordInput[i] ?? '○'}</span>
                ))}
              </div>
              {passwordError && (
                <p className="text-red-400 text-sm text-center mb-2">{t('passwordWrong')}</p>
              )}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key) =>
                  key === '' ? (
                    <div key="empty" />
                  ) : key === '⌫' ? (
                    <button
                      key="back"
                      type="button"
                      onClick={handlePasswordBackspace}
                      className="h-12 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-lg font-medium transition-colors"
                    >
                      ⌫
                    </button>
                  ) : (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePasswordKey(key)}
                      className="h-12 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xl font-medium transition-colors"
                    >
                      {key}
                    </button>
                  )
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordKeypadClue(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handlePasswordConfirm}
                  disabled={passwordInput.length !== 4}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl font-medium transition-colors',
                    passwordInput.length === 4
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  )}
                >
                  {t('confirm')}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null}

    {/* 돋보기 확대 이미지 팝업 (body에 portal로 렌더링하여 overflow 회피) */}
    {mounted && magnifierPopupImage && typeof document !== 'undefined' && document.body
      ? createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setMagnifierPopupImage(null)}
          >
            <button
              type="button"
              onClick={() => setMagnifierPopupImage(null)}
              className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
              aria-label={t('close')}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <img
                src={magnifierPopupImage}
                alt=""
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>,
          document.body
        )
      : null}
    </>
  );
}
