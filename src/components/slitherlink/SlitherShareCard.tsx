"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Download, ImageIcon, Link2, Loader2 } from 'lucide-react';
import { type Puzzle, formatClock } from '@/lib/slitherlink';
import type { SlitherTheme } from '@/lib/slitherTheme';
import { type ShareCardText, renderShareCard } from '@/lib/slitherShareImage';

/**
 * After a clear: a picture of the solved board in the current theme (time, size, PUZZLTHINK and the link), shared as
 * an image file through the system share sheet where the browser can, otherwise saved; and a copy-link fallback.
 * `path` is the page the link points to (with the locale), e.g. /ko/slitherlink.
 */
export default function SlitherShareCard({ puzzle, theme, ms, detail, extra, path, shareText }: {
  puzzle: Puzzle; theme: SlitherTheme; ms: number; detail: string; extra?: string; path: string; shareText: string;
}) {
  const t = useTranslations('Slitherlink');
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileName = `puzzlthink-slitherlink-${puzzle.dots}x${puzzle.dots}.png`;
  const clock = formatClock(ms); // the same clock the game shows

  useEffect(() => {
    let alive = true, made: string | null = null;
    const text: ShareCardText = {
      title: t('title'), cleared: t('shareCleared'), kicker: t(`shareKicker_${theme.id}`), detail,
      timeLabel: t('shareTimeLabel'), time: clock, extra, url: `puzzlthink.com${path.split('?')[0].replace(/^\/ko(?=\/|$)/, '')}`,
    };
    const family = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
    renderShareCard(puzzle, theme, text, family)
      .then((blob) => { if (!alive) return; made = URL.createObjectURL(blob); setImage({ blob, url: made }); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [puzzle, theme, clock, detail, extra, path, t]);

  const url = () => `${window.location.origin}${path}`;
  const save = () => {
    if (!image) return;
    const a = document.createElement('a');
    a.href = image.url; a.download = fileName;
    document.body.appendChild(a); a.click(); a.remove();
  };
  const share = async () => {
    if (!image || busy) return;
    const file = new File([image.blob], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      setBusy(true);
      try { await navigator.share({ files: [file], title: t('title'), text: `${shareText} ${url()}` }); } catch { /* cancelled */ } finally { setBusy(false); }
      return;
    }
    save();
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${shareText} ${url()}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ }
  };

  return (
    <div className="mt-4 rounded-[14px] border border-(--accent)/30 bg-(--accent)/[.06] p-3 text-left" data-testid="slither-share">
      <p className="text-center text-xs font-black">{t('shareCardTitle')}</p>
      <div className="mt-2 overflow-hidden rounded-[10px] border border-white/10 bg-black/30" style={{ aspectRatio: '16 / 9' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a blob: URL made in the browser */}
        {image ? <img src={image.url} alt={t('shareCardAlt')} className="block h-full w-full" data-testid="slither-share-img" />
          : <div className="flex h-full items-center justify-center text-xs text-white/45">{failed ? t('shareCardFailed') : <Loader2 size={16} className="animate-spin" />}</div>}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <button type="button" onClick={share} disabled={!image || busy} className="col-span-3 flex items-center justify-center gap-2 rounded-[12px] bg-(--accent) py-3 text-sm font-black text-(--accent-ink) transition hover:brightness-110 disabled:opacity-50"><ImageIcon size={15} />{t('shareImage')}</button>
        <button type="button" onClick={save} disabled={!image} className="col-span-1 flex items-center justify-center gap-1.5 rounded-[12px] border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10 disabled:opacity-50"><Download size={14} />{t('shareSave')}</button>
        <button type="button" onClick={copy} className="col-span-2 flex items-center justify-center gap-1.5 rounded-[12px] border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10">{copied ? <Check size={14} /> : <Link2 size={14} />}{copied ? t('shareCopied') : t('shareCopy')}</button>
      </div>
    </div>
  );
}
