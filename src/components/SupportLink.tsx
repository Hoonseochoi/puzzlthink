"use client";

import { useTranslations } from 'next-intl';
import { getSupabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';

/** Voluntary support goes through CTEE: supporters see only "PUZZLTHINK", never the developer's name or account. */
export const SUPPORT_URL = 'https://ctee.kr/place/puzzlthink/donation';

/** Counts footer clicks by page so we can measure whether the quiet link is useful. */
function trackSupportClick() {
  try {
    const page = window.location.pathname.replace(/^\/(ko|en)(?=\/|$)/, '').split('/')[1] ?? '';
    getSupabase()?.rpc('count_support_click', { p_place: 'footer', p_page: page || 'home' }).then(() => {});
  } catch { /* optional */ }
}

/** A single, unobtrusive voluntary-support link in the global footer. */
export default function SupportLink() {
  const t = useTranslations('Common');
  return (
    <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={trackSupportClick} className="inline-flex items-center gap-1 text-black/35 transition hover:text-black/60">
      <Heart size={10} />{t('supportShort')}
    </a>
  );
}
