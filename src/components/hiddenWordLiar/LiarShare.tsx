"use client";

import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { shareFallback, shareKakao } from '@/lib/kakaoShare';

// KakaoTalk goes through the site's shared helper (src/lib/kakaoShare.ts: one SDK loader, falls back to the share
// sheet, then copy link). The card image is this game's own cached OG card.

/** The invite / result share row: KakaoTalk (yellow), the system share sheet, copy link. */
export default function LiarShare({ url, title, text, button, en, compact = false }: { url: string; title: string; text: string; button: string; en: boolean; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const image = () => `/${en ? 'en' : 'ko'}/hidden-word-liar/opengraph-image`;
  const copy = async () => { try { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const sheet = async () => { if ((await shareFallback({ title, description: text, url })) === 'copied') { setCopied(true); window.setTimeout(() => setCopied(false), 1800); } };
  const kakao = async () => { if ((await shareKakao({ title, description: text, url, imageUrl: image(), buttonTitle: button })) === 'copied') { setCopied(true); window.setTimeout(() => setCopied(false), 1800); } };
  const small = compact ? 'py-2 text-[12px]' : 'py-2.5 text-[13px]';
  return (
    <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-1.5">
      <button type="button" onClick={kakao} className={`flex items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] font-black text-[#191600] active:scale-[.98] ${small}`}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M12 3.5c-5 0-9 3.1-9 7 0 2.5 1.7 4.7 4.2 6l-1 3.7c-.1.3.3.6.6.4l4.4-2.9c.3 0 .5.1.8.1 5 0 9-3.1 9-7s-4-7.3-9-7.3z" fill="#191600" /></svg>
        {en ? 'KakaoTalk' : '카카오톡'}
      </button>
      <button type="button" onClick={sheet} className={`flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 font-bold text-white/85 ${small}`}><Share2 size={14} />{en ? 'Share' : '공유'}</button>
      <button type="button" onClick={copy} className={`flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 font-bold text-white/85 ${small}`}>{copied ? <Check size={14} /> : <Link2 size={14} />}{copied ? (en ? 'Copied' : '복사됨') : (en ? 'Link' : '링크')}</button>
    </div>
  );
}
