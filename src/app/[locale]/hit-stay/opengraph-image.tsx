import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Hit,Stay';

const COPY = {
  ko: { kicker: '데블스 플랜 3 준결승', title: 'Hit,Stay', sub: '한계 숫자에 가장 가깝게. 한 장 더 받을까, 멈출까, 얼마나 걸까', modes: ['AI 5인전', '친구 방', '공개방'] },
  en: { kicker: "The Devil's Plan 3 semifinal", title: 'Hit,Stay', sub: 'Closest to the limit wins. One more card, stop, or raise?', modes: ['vs 4 AI', 'Friends', 'Open rooms'] },
};

// Three cards that land right on the limit 9: 4 + 6 + (-1).
const CARDS = [{ v: '4', dark: false, r: -10 }, { v: '6', dark: false, r: 0 }, { v: '-1', dark: true, r: 10 }];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '0123456789-·HITSTAY'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#6f7dff" glow="rgba(111,125,255,0.28)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 392, height: 392, borderRadius: 18, background: 'radial-gradient(circle at 50% 30%, #3a44b8, #141846 72%)', border: '3px solid #6f7dff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 116, height: 116, background: '#2c348f', color: '#fff', fontSize: 52, fontWeight: 900, transform: 'rotate(45deg)', borderRadius: 14, border: '3px solid rgba(255,255,255,0.3)' }}>
          <div style={{ display: 'flex', transform: 'rotate(-45deg)' }}>9</div>
        </div>
        <div style={{ display: 'flex', marginTop: 44 }}>
          {CARDS.map((card) => (
            <div key={card.v} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 84, height: 118, margin: '0 -4px', borderRadius: 12, background: card.dark ? '#16171d' : '#f6f3ea', color: card.dark ? '#ffffff' : '#191c36', fontSize: 50, fontWeight: 900, border: card.dark ? '2px solid rgba(255,255,255,0.3)' : '2px solid rgba(0,0,0,0.1)', transform: `rotate(${card.r}deg)` }}>{card.v}</div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 22, fontSize: 22, fontWeight: 900, letterSpacing: 4 }}>
          <span style={{ color: '#ff4d6d' }}>HIT</span><span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 12px' }}>·</span><span style={{ color: '#dfe4ff' }}>STAY</span>
        </div>
      </div>
    } />,
    { ...size, fonts },
  );
}
