import { ImageResponse } from 'next/og';
import { OG_SIZE, WallGoBoardArt, TrendOgCard, fontsFor, ogLocale, trendText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Wallgo';

const COPY = {
  ko: { kicker: '데블스플랜3 그 게임', hot: '요즘 인기', title: '벽바둑', sub: '2칸 움직이고 벽 하나, 넓은 땅이 이긴다', modes: ['무료 · 바로 플레이', 'AI 3인전 · 1:1', '친구와 링크 대전'] },
  en: { kicker: "The Devil's Plan 3", hot: 'Trending', title: 'Wallgo', sub: 'Move 2, build a wall, own the most ground', modes: ['Free · play now', 'vs AI · 3P or 1:1', 'Play a friend by link'] },
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(trendText(c) + '0123');
  return new ImageResponse(
    <TrendOgCard {...c} accent="#e0283a" glow="rgba(224,40,58,0.38)" art={<WallGoBoardArt size={430} />} />,
    { ...size, fonts },
  );
}
