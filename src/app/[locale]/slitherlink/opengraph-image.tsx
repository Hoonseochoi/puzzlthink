import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';
import { SHOW_BOARD } from '@/lib/slitherShowBoard';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Slitherlink';

const COPY = {
  ko: { kicker: '유배지 그 게임', title: '슬리더링크', sub: '유배지에서 하던 게임 그대로!', modes: ['랜덤 맵 챌린지 · 랭킹', '맵 뺏기 · 9×9~11×11 연습'] },
  en: { kicker: 'From the show', title: 'Slitherlink', sub: 'The loop puzzle from the show, as it was', modes: ['Random-board challenge · ranking', 'Take boards · 9×9–11×11 practice'] },
};

// The show's board: lilac screen in a dark stone frame, violet dots and serif numbers.
const SCREEN = 396;
const STEP = SCREEN / 11;

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '0123'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#8f7cff" glow="rgba(143,124,255,0.35)" art={
      <div style={{ display: 'flex', padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, #4a4652, #2f2c36 55%, #46424e)' }}>
        <div style={{ display: 'flex', position: 'relative', width: SCREEN, height: SCREEN, background: '#e9ebff' }}>
          {Array.from({ length: 121 }, (_, i) => <div key={`d${i}`} style={{ position: 'absolute', left: ((i % 11) + 0.5) * STEP - 3.5, top: (Math.floor(i / 11) + 0.5) * STEP - 3.5, width: 7, height: 7, borderRadius: 7, background: '#5b45c9' }} />)}
          {SHOW_BOARD.flatMap((row, r) => [...row].map((ch, col) => ch === '.' ? null : (
            <div key={`n${r}-${col}`} style={{ display: 'flex', position: 'absolute', left: (col + 0.5) * STEP, top: (r + 0.5) * STEP, width: STEP, height: STEP, alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#5b45c9' }}>{ch}</div>
          )))}
        </div>
      </div>
    } />,
    { ...size, fonts },
  );
}
