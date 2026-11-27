import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Piggy Bank';

const COPY = {
  ko: { kicker: '데블스 플랜 3', title: '돼지 저금통', sub: '넣은 동전을 기억하고, 틀린 대답을 의심하라', modes: ['AI 4인전'] },
  en: { kicker: "The Devil's Plan 3", title: 'Piggy Bank', sub: 'Remember every coin, doubt every wrong answer', modes: ['4 players vs AI'] },
};

const pig = (n: string) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 150, height: 112, borderRadius: 999, fontSize: 56, fontWeight: 900, color: '#3a2a06',
    background: 'radial-gradient(circle at 35% 30%, #fff6b0, #ffd84a 45%, #d99a12)', border: '4px solid #e0a91c' }}>{n}</div>
);

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '12345'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#ffd84a" glow="rgba(255,216,74,0.22)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div style={{ display: 'flex', gap: 22 }}>{pig('1')}{pig('5')}</div>
        <div style={{ display: 'flex', gap: 22 }}>{pig('3')}{pig('4')}</div>
      </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('piggy-bank', props, render);
}
