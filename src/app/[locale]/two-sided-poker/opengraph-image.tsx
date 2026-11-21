import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE; export const contentType = 'image/png'; export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }]; export const alt = 'PUZZLTHINK Two-Sided Poker';
const COPY = {
  ko: { kicker: '1:1 심리전', title: '양면포커', sub: '공개된 앞면, 나만 아는 뒷면 — 어느 면으로 싸울까', modes: ['AI 1:1', '추론 + 블러핑'] },
  en: { kicker: '1:1 MIND GAME', title: 'Two-Sided Poker', sub: 'A public front, a secret back — which face will you fight with?', modes: ['AI 1:1', 'Deduce + bluff'] },
};
const face = (back: boolean, label: string, tilt: number) => (
  <div style={{ display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center', width: 150, height: 210, borderRadius: 18, transform: `rotate(${tilt}deg)`, background: back ? 'linear-gradient(150deg,#3a2f6e,#17122e)' : 'linear-gradient(150deg,#fffdf6,#d9d0bf)', border: back ? '4px solid #9b87ff' : '4px solid #ffffff', boxShadow: back ? '0 16px 40px rgba(155,135,255,.45)' : '0 16px 40px rgba(0,0,0,.5)', fontSize: 100, fontWeight: 900, color: back ? '#9b87ff' : '#15151b' }}>
    <div style={{ display: 'flex', position: 'absolute', left: 14, top: 10, fontSize: 16, letterSpacing: 3, color: back ? 'rgba(155,135,255,.85)' : 'rgba(0,0,0,.35)' }}>{back ? 'BACK' : 'FRONT'}</div>
    {label}
  </div>
);
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '?8FRONTBACK'));
  return new ImageResponse(<GameOgCard {...c} accent="#9b87ff" glow="rgba(155,135,255,.26)" art={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{face(false, '8', -7)}<div style={{ display: 'flex', width: 8, height: 110, borderRadius: 8, background: '#9b87ff' }} />{face(true, '?', 7)}</div>} />, { ...size, fonts });
}
