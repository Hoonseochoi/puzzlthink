"use client";

import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';

// KakaoTalk share. The JavaScript key is the public one (it ships in every page that uses the SDK); the domains it
// may run on are set on the key in Kakao Developers. The SDK loads only when someone taps the button.
const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '9febe935e7b9067b4aa2a11e993fa412';
const KAKAO_SDK = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.2/kakao.min.js';
const KAKAO_SRI = 'sha384-zt/G7/KfaRQ9dT/QIkS0ujMtzouJqzuSJcXVQu50x0rl/+mD1dc70AeOejVbMD9E';

type KakaoShare = { sendDefault: (o: Record<string, unknown>) => void };
type KakaoSdk = { isInitialized: () => boolean; init: (key: string) => void; Share: KakaoShare };
declare global { interface Window { Kakao?: KakaoSdk } }

let loading: Promise<KakaoSdk | null> | null = null;
function loadKakao(): Promise<KakaoSdk | null> {
  if (window.Kakao) return Promise.resolve(window.Kakao);
  loading ??= new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = KAKAO_SDK; s.integrity = KAKAO_SRI; s.crossOrigin = 'anonymous'; s.async = true;
    s.onload = () => resolve(window.Kakao ?? null);
    s.onerror = () => { loading = null; resolve(null); };
    document.head.appendChild(s);
  });
  return loading;
}

/** Sends a feed card to KakaoTalk; false when the SDK could not be used (the caller then falls back). */
export async function kakaoShare({ title, description, url, imageUrl, button }: { title: string; description: string; url: string; imageUrl: string; button: string }) {
  try {
    const k = await loadKakao();
    if (!k) return false;
    if (!k.isInitialized()) k.init(KAKAO_JS_KEY);
    k.Share.sendDefault({
      objectType: 'feed',
      content: { title, description, imageUrl, link: { mobileWebUrl: url, webUrl: url } },
      buttons: [{ title: button, link: { mobileWebUrl: url, webUrl: url } }],
    });
    return true;
  } catch { return false; }
}

/** The invite / result share row: KakaoTalk (yellow), the system share sheet, copy link. */
export default function LiarShare({ url, title, text, button, en, compact = false }: { url: string; title: string; text: string; button: string; en: boolean; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const image = () => `${window.location.origin}/${en ? 'en' : 'ko'}/hidden-word-liar/opengraph-image`;
  const copy = async () => { try { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const sheet = async () => { if (navigator.share) { try { await navigator.share({ title, text, url }); return; } catch { return; } } void copy(); };
  const kakao = async () => { if (!(await kakaoShare({ title, description: text, url, imageUrl: image(), button }))) void sheet(); };
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
