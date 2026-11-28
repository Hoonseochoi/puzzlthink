"use client";

import { useLocale, useTranslations } from 'next-intl';
import { CERT_GAMES } from '@/lib/hardClear';
import { parseIcon } from './ProfileIcons';
import { championEdition } from './StoneAvatar';

/** A 피스 경쟁전 champion stone's name ('다이아몬드', '루비'…): 1W and 2W have their own, later weeks their edition's. */
export function useChampName() {
  const tr = useTranslations('Records');
  return (week: number, place: 1 | 2 | 3) => {
    if (tr.has(`stoneChampName.w${week}_${place}`)) return tr(`stoneChampName.w${week}_${place}`);
    const e = championEdition(week);
    return e === null ? '' : tr(`stoneChampName.e${e}_${place}`);
  };
}

/** A readable name for an icon id: '피스 2W 1위 · 다이아몬드', '2048 달성', '벽바둑 1위', '십이장기 어려움 클리어', '플레이 30시간'… */
export function useIconLabel() {
  const t = useTranslations('Icons');
  const champ = useChampName();
  const locale = useLocale();
  return (icon: string) => {
    const ref = parseIcon(icon);
    if (!ref) return icon;
    if (ref.kind === 'piece') return t('pieceLabel', { week: ref.week, place: ref.place, name: champ(ref.week, ref.place) });
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
