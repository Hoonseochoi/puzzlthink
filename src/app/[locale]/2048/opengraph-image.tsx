import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK 2048';

const COPY = {
  ko: { kicker: '힐링 퍼즐', title: '2048', sub: '같은 네모끼리 밀어 합치면 바둑알로 진화해요', modes: ['자유 플레이 · 10분 챌린지', '친구 2~4명 5·10분 대결'] },
  en: { kicker: 'Healing puzzle', title: '2048', sub: 'Merge matching squares and watch them grow into stones', modes: ['Free play · 10-min challenge', '2–4 friends, 5 or 10-min race'] },
};

// Same colours as the board characters (M2Parts).
const LOOK: Record<number, [string, string, boolean]> = {
  2: ['#ffefc2', '#7a5a12', false], 4: ['#ffd6bf', '#8a4425', false], 8: ['#ff8f73', '#ffffff', false], 16: ['#ff6f91', '#ffffff', false],
  32: ['#f45bb5', '#ffffff', false], 64: ['#a77bff', '#ffffff', false], 128: ['#6c7bff', '#ffffff', true], 256: ['#3f9dff', '#ffffff', true],
  512: ['#20c3b0', '#ffffff', true], 1024: ['#35c46a', '#ffffff', true], 2048: ['#f2c53d', '#3b2604', true],
};
const CELLS = [2, 0, 4, 2, 8, 16, 0, 4, 32, 64, 128, 0, 2048, 512, 256, 8];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '0123456789'));
  const cell = 92;
  return new ImageResponse(
    <GameOgCard {...c} accent="#ff8fa3" glow="rgba(255,143,163,0.32)" art={
      <div style={{ display: 'flex', flexWrap: 'wrap', width: cell * 4 + 36, padding: 14, borderRadius: 22, border: '5px solid #17201e', background: '#fbfaf5' }}>
        {CELLS.map((v, i) => {
          const look = LOOK[v];
          return (
            <div key={i} style={{ display: 'flex', width: cell, height: cell, padding: 6 }}>
              {look ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', borderRadius: look[2] ? 999 : 20, background: look[0], boxShadow: '0 5px 0 rgba(23,32,30,.2)' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 2 }}><div style={{ width: 7, height: 12, borderRadius: 4, background: look[1] }} /><div style={{ width: 7, height: 12, borderRadius: 4, background: look[1] }} /></div>
                  <div style={{ display: 'flex', fontSize: v >= 1000 ? 22 : 28, fontWeight: 900, color: look[1] }}>{v}</div>
                </div>
              ) : <div style={{ display: 'flex', width: '100%', height: '100%', borderRadius: 20, background: 'rgba(23,32,30,.06)' }} />}
            </div>
          );
        })}
      </div>
    } />,
    { ...size, fonts },
  );
}
