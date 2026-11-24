import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Point Omok';

const COPY = {
  ko: { kicker: '데블스 플랜 4', title: '포인트 오목', sub: '세 점을 고르고 10포인트를 몰래 나눠 걸어라. 더 많이 건 쪽의 돌이 놓인다', modes: ['AI 1:1', '친구 1:1', '오픈 1:1'] },
  en: { kicker: "The Devil's Plan 4", title: 'Point Omok', sub: 'Put up three points, split 10 points in secret. The higher bid gets the stone', modes: ['vs AI', 'Friend 1:1', 'Open 1:1'] },
};

// A 7×7 corner: 0 black, 1 white, 2 a point put up for bidding.
const CELLS = [
  -1, -1, -1, -1, -1, -1, -1,
  -1, 0, -1, 1, -1, -1, -1,
  -1, -1, 0, 1, 1, -1, -1,
  -1, 1, 0, 0, -1, 0, -1,
  -1, -1, 1, 0, 1, -1, -1,
  -1, 2, 2, 2, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1,
];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '123'));
  let mark = 0;
  return new ImageResponse(
    <GameOgCard {...c} accent="#ff5d8f" glow="rgba(255,93,143,0.25)" art={
      <div style={{ display: 'flex', flexWrap: 'wrap', width: 392, height: 392, padding: 14, borderRadius: 18, background: '#12131a', border: '3px solid #ff5d8f' }}>
        {CELLS.map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52 }}>
            {v === 0 && <div style={{ display: 'flex', width: 44, height: 44, borderRadius: 999, background: '#111318', border: '2px solid #3a3e48' }} />}
            {v === 1 && <div style={{ display: 'flex', width: 44, height: 44, borderRadius: 999, background: '#eef0f4', border: '2px solid #ffffff' }} />}
            {v === 2 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 999, background: 'rgba(255,93,143,0.3)', border: '4px solid #ff5d8f', color: '#fff', fontSize: 22, fontWeight: 900 }}>{String(++mark)}</div>}
            {v === -1 && <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 999, background: 'rgba(201,207,227,0.3)' }} />}
          </div>
        ))}
      </div>
    } />,
    { ...size, fonts },
  );
}
