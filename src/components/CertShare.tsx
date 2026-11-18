"use client";

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Download, Link2, Share2 } from 'lucide-react';
import { certImagePath, certPath } from '@/lib/hardClear';

/** Share / save-image / copy-link buttons for one certificate. */
export default function CertShare({ id, text, dark = true }: { id: string; text: string; dark?: boolean }) {
  const t = useTranslations('Cert');
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const url = () => `${window.location.origin}${certPath(locale, id)}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url()); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ }
  };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'PUZZLTHINK', text, url: url() }); return; } catch { return; } }
    copy();
  };
  const save = async () => {
    setSaving(true);
    try {
      const blob = await fetch(certImagePath(id, locale)).then((r) => r.blob());
      const file = new File([blob], `puzzlthink-clear-${id}.png`, { type: 'image/png' });
      // Phones: the share sheet has "save image"; elsewhere a normal download.
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
      <button type="button" onClick={share} className="flex items-center justify-center gap-2 rounded-[12px] bg-[#d9b25f] py-3 text-sm font-black text-[#1d1608] hover:bg-[#e8c477]"><Share2 size={15} />{t('share')}</button>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={save} disabled={saving} className={`flex items-center justify-center gap-1.5 rounded-[12px] border py-2.5 text-xs font-bold disabled:opacity-50 ${secondary}`}><Download size={14} />{saving ? t('saving') : t('saveImage')}</button>
        <button type="button" onClick={copy} className={`flex items-center justify-center gap-1.5 rounded-[12px] border py-2.5 text-xs font-bold ${secondary}`}>{copied ? <Check size={14} /> : <Link2 size={14} />}{copied ? t('copied') : t('copyLink')}</button>
      </div>
    </div>
  );
}
