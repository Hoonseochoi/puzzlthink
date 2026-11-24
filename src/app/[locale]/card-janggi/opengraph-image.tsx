import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Card Janggi';

const COPY = {
  ko: { kicker: '데블스 플랜 3 결승전', title: '카드 장기', sub: '행마 카드 5장의 순서를 몰래 정해 상대 큰 말을 잡거나 진영에 먼저 들어가라', modes: ['AI 1:1', '친구 1:1', '오픈 1:1'] },
  en: { kicker: "The Devil's Plan 3 final", title: 'Card Janggi', sub: 'Lay out five movement cards in secret. Take the enemy king or reach its square first', modes: ['vs AI', 'Friend 1:1', 'Open 1:1'] },
};

// 5 columns × 6 rows: 1 red small, 2 red king, -1 blue small, -2 blue king.
const CELLS = [
  0, -1, -2, -1, 0,
  0, 0, 0, 0, 0,
  0, 0, -1, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 0, 0,
  0, 1, 2, 1, 0,
];
const RED = '#ff4f5e', BLUE = '#3d8bff';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '123'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#b07cff" glow="rgba(176,124,255,0.25)" art={
      <div style={{ display: 'flex', flexWrap: 'wrap', width: 340, height: 404, padding: 10, borderRadius: 18, background: '#2b2456', border: '3px solid #b07cff' }}>
        {CELLS.map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: '#3a3172', border: '1px solid rgba(143,130,230,0.4)' }}>
            {v !== 0 && <div style={{ display: 'flex', width: 44, height: 44, borderRadius: Math.abs(v) === 2 ? 999 : 8, background: v > 0 ? RED : BLUE, border: Math.abs(v) === 2 ? '3px solid #fff' : '1px solid rgba(255,255,255,0.4)' }} />}
          </div>
        ))}
      </div>
    } />,
    { ...size, fonts },
  );
}
