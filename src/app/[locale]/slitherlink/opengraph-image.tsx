import { ImageResponse } from 'next/og';
import { OG_SIZE, SlitherXmasBoardArt, TrendOgCard, fontsFor, ogLocale, trendText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Slitherlink';

const COPY = {
  ko: { kicker: '유배지 그 퍼즐', hot: '크리스마스 에디션', title: '슬리더링크', sub: '숫자만큼 선을 이어 고리 하나 완성', modes: ['무료 · 매번 새 맵', '기록 랭킹 · 맵 뺏기', '친구 2~4명 대결'] },
  en: { kicker: 'From the show', hot: 'Christmas edition', title: 'Slitherlink', sub: 'Join the dots into one loop the numbers allow', modes: ['Free · a new board every time', 'Ranking · take boards', 'Race 2–4 friends'] },
};

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(trendText(c) + '0123');
  return new ImageResponse(
    <TrendOgCard {...c} accent="#e23c52" glow="rgba(255,194,61,0.30)" art={<SlitherXmasBoardArt size={430} />} />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('slitherlink', props, render);
}
