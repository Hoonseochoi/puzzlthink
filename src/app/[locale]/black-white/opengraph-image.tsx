import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Black & White';

const COPY = {
  ko: { kicker: '더 지니어스 2', title: '흑과 백', sub: '0~8 숫자 타일, 보이는 건 색뿐 — 심리전 1:1', modes: ['AI 1:1', '친구 1:1'] },
  en: { kicker: 'The Genius 2', title: 'Black & White', sub: 'Tiles 0–8, only colours are shown — a 1:1 mind game', modes: ['AI 1:1', 'Friend 1:1'] },
};

const tile = (black: boolean, label: string) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 136, borderRadius: 14, fontSize: 64, fontWeight: 900,
    background: black ? 'linear-gradient(#34343b, #050506)' : 'linear-gradient(#fffdf8, #cfc8ba)', color: black ? '#f4efe4' : '#0d0d10',
    border: black ? '3px solid #55555e' : '3px solid #ffffff' }}>{label}</div>
);

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '8?'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#e9c46a" glow="rgba(233,196,106,0.22)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <div style={{ display: 'flex', gap: 22 }}>{tile(true, '8')}{tile(false, '?')}</div>
        <div style={{ display: 'flex', gap: 22 }}>{tile(false, '?')}{tile(true, '0')}</div>
      </div>
    } />,
    { ...size, fonts },
  );
}
