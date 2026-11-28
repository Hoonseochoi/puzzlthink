"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Download, Link2, Share2 } from 'lucide-react';
import { KakaoPlayButton } from './ui/KakaoShareButton';

/**
 * Share / save-image / copy-link buttons. `path` is a page on this site (its link preview is `imagePath`).
 * Phones get the system share sheet; elsewhere the link is copied. 「카카오톡」 sends a KakaoTalk card (button 플레이하기)
 * with `imagePath` (or the page's og:image) as its picture.
 */
export default function ShareButtons({ path, text, imagePath, fileName = 'puzzlthink.png', label, dark = true }: {
  path: string; text: string; imagePath?: string; fileName?: string; label?: string; dark?: boolean;
}) {
  const t = useTranslations('Cert');
  const tc = useTranslations('Common');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const url = () => `${window.location.origin}${path}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(`${text} ${url()}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ }
  };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'PUZZLTHINK', text, url: url() }); return; } catch { return; } }
    copy();
  };
  const save = async () => {
    if (!imagePath) return;
    setSaving(true);
    try {
      const blob = await fetch(imagePath).then((r) => r.blob());
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] }) && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
        try { await navigator.share({ files: [file], text }); return; } catch { return; }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = file.name;
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch { /* offline */ } finally { setSaving(false); }
  };

  const secondary = dark ? 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10' : 'border-black/10 bg-white text-black/75 hover:bg-black/[0.04]';
  return (
    <div className="grid gap-2">
      <button type="button" onClick={share} className="flex items-center justify-center gap-2 rounded-[12px] bg-[#d9b25f] py-3 text-sm font-black text-[#1d1608] hover:bg-[#e8c477]"><Share2 size={15} />{label ?? tc('shareNow')}</button>
      <KakaoPlayButton url={path} text={text} imageUrl={imagePath} className="w-full rounded-[12px] py-3 text-sm" />
      <div className={`grid gap-2 ${imagePath ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {imagePath && <button type="button" onClick={save} disabled={saving} className={`flex items-center justify-center gap-1.5 rounded-[12px] border py-2.5 text-xs font-bold disabled:opacity-50 ${secondary}`}><Download size={14} />{saving ? t('saving') : t('saveImage')}</button>}
        <button type="button" onClick={copy} className={`flex items-center justify-center gap-1.5 rounded-[12px] border py-2.5 text-xs font-bold ${secondary}`}>{copied ? <Check size={14} /> : <Link2 size={14} />}{copied ? t('copied') : t('copyLink')}</button>
      </div>
    </div>
  );
}
