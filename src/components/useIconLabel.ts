"use client";

import { useLocale, useTranslations } from 'next-intl';
import { CERT_GAMES } from '@/lib/hardClear';
import { parseIcon } from './ProfileIcons';

/** A readable name for an icon id: '피스 2W 1위 · 다이아몬드', '2048 달성', '벽바둑 1위', '십이장기 어려움 클리어', '플레이 30시간'… */
export function useIconLabel() {
  const t = useTranslations('Icons');
  const tr = useTranslations('Records');
  const locale = useLocale();
  return (icon: string) => {
    const ref = parseIcon(icon);
    if (!ref) return icon;
    if (ref.kind === 'piece') return t('pieceLabel', { week: ref.week, place: ref.place, name: tr.has(`stoneChampName.w${ref.week}_${ref.place}`) ? tr(`stoneChampName.w${ref.week}_${ref.place}`) : '' });
    if (ref.kind === 'hell') return t('hellLabel', { week: ref.week, place: ref.place, name: t(`hellName${ref.place}`) });
    if (ref.kind === 'open') return t('openLabel', { place: ref.place });
    if (ref.kind === 'm2048') return t('m2048', { n: ref.tier });
    if (ref.kind === 'hard') return t('hardClear', { game: CERT_GAMES[ref.game][locale === 'en' ? 'en' : 'ko'] });
    if (ref.kind === 'friendWin') return t('friendWin');
    if (ref.kind === 'openWin') return t('openWin');
    if (ref.kind === 'hellClear') return t('hellClear');
    if (ref.kind === 'mission') return t(`mission_${ref.mission}`);
    if (ref.kind === 'tester') return t(`tester_${ref.tier}`);
    if (ref.kind === 'play') return t('playHours', { n: ref.hours });
    return t('crown', { game: CERT_GAMES[ref.game][locale === 'en' ? 'en' : 'ko'] });
  };
}
