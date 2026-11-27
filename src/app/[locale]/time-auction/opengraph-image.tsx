import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK 시간 경매 Time Auction';

const COPY = {
  ko: { kicker: '데블스 플랜: 데스룸 감옥매치', title: '시간 경매', sub: '바둑알 경매. 버튼을 가장 오래 누른 사람이 낙찰, 쓴 시간은 돌아오지 않아요', modes: ['AI 6인전', '친구 방', '공개방'] },
  en: { kicker: "The Devil's Plan: Death Room", title: 'Time Auction', sub: 'A go-stone auction: hold the button longest to win. Time spent never comes back', modes: ['vs 5 AI', 'Friends', 'Open rooms'] },
};

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '0123456789:.HOLD×'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#ff3b30" glow="rgba(255,59,48,0.3)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 392, height: 392, borderRadius: 18, background: 'radial-gradient(circle at 50% 28%, #5a1410, #0b0b0e 72%)', border: '3px solid #ff3b30' }}>
        <div style={{ display: 'flex', padding: '8px 22px', borderRadius: 12, background: '#000', color: '#ff3b30', fontSize: 76, fontWeight: 900, letterSpacing: -2 }}>1:49.8</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 30, width: 140, height: 140, borderRadius: 70, border: '8px solid #ff3b30', background: 'radial-gradient(circle at 50% 35%, #ff6a5f, #7a0d07 75%)', color: '#fff', fontSize: 26, fontWeight: 900, letterSpacing: 6 }}>HOLD</div>
        <div style={{ display: 'flex', marginTop: 22, fontSize: 22, fontWeight: 900, color: 'rgba(255,255,255,0.55)', letterSpacing: 4 }}>10:00 × 19</div>
      </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('time-auction', props, render);
}
