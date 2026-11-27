import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE; export const contentType = 'image/png'; export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }]; export const alt = 'PUZZLTHINK Two-Sided Poker';
const COPY = {
  ko: { kicker: '더 지니어스', title: '양면포커', sub: '앞면에 걸까, 뒷면에 걸까 — 양면베팅 성공은 +10', modes: ['AI 1:1', '칩 40개 서바이벌'] },
  en: { kicker: 'The Genius', title: 'Two-Sided Poker', sub: 'Bet the front, bet the back — or both for +10', modes: ['AI 1:1', '40-chip survival'] },
};
const chips = (color: string, n: number) => <div style={{ display: 'flex', position: 'relative', width: 70, height: 26 + n * 12 }}>{Array.from({ length: n }, (_, i) => <div key={i} style={{ display: 'flex', position: 'absolute', left: 0, bottom: i * 12, width: 70, height: 40, borderRadius: 999, border: '2px solid rgba(0,0,0,.4)', background: color }} />)}</div>;
const face = (back: boolean, label: string, tilt: number) => (
  <div style={{ display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center', width: 150, height: 210, borderRadius: 18, transform: `rotate(${tilt}deg)`, background: back ? 'linear-gradient(150deg,#3a2f6e,#17122e)' : 'linear-gradient(150deg,#fffdf6,#d9d0bf)', border: back ? '4px solid #9b87ff' : '4px solid #ffffff', boxShadow: back ? '0 16px 40px rgba(155,135,255,.45)' : '0 16px 40px rgba(0,0,0,.5)', fontSize: 100, fontWeight: 900, color: back ? '#9b87ff' : '#15151b' }}>
    <div style={{ display: 'flex', position: 'absolute', left: 14, top: 10, fontSize: 16, letterSpacing: 3, color: back ? 'rgba(155,135,255,.85)' : 'rgba(0,0,0,.35)' }}>{back ? 'BACK' : 'FRONT'}</div>
    {label}
  </div>
);
async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '?9FRONTBACKBOTH+10'));
  return new ImageResponse(<GameOgCard {...c} accent="#9b87ff" glow="rgba(155,135,255,.26)" art={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{face(false, '9', -7)}<div style={{ display: 'flex', width: 8, height: 110, borderRadius: 8, background: '#9b87ff' }} />{face(true, '?', 7)}</div><div style={{ display: 'flex', alignItems: 'flex-end', gap: 22 }}>{chips('#f2c14e', 4)}<div style={{ display: 'flex', padding: '8px 16px', borderRadius: 999, background: '#9b87ff', color: '#120d26', fontSize: 24, fontWeight: 900 }}>BOTH +10</div>{chips('#9b87ff', 3)}</div></div>} />, { ...size, fonts });
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('two-sided-poker', props, render);
}
