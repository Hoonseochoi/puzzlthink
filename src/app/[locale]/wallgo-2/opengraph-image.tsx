import { ImageResponse } from 'next/og';
import { OG_SIZE, WallGoBoardArt, TrendOgCard, fontsFor, ogLocale, trendText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Wallgo II';

const COPY = {
  ko: { kicker: '감옥매치 10화 그 게임', hot: '요즘 인기', title: '벽바둑 II', sub: '사각 말은 곧게, 원형 말은 꺾어서', modes: ['무료 · 바로 플레이', 'AI 3인전 · 1:1', '친구와 링크 대전'] },
  en: { kicker: "The Devil's Plan 3 · Ep. 10", hot: 'Trending', title: 'Wallgo II', sub: 'Squares go straight, circles turn', modes: ['Free · play now', 'vs AI · 3P or 1:1', 'Play a friend by link'] },
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(trendText(c) + '0123');
  return new ImageResponse(
    <TrendOgCard {...c} accent="#e0283a" glow="rgba(224,40,58,0.38)" art={<WallGoBoardArt size={430} variant={2} />} />,
    { ...size, fonts },
  );
}
