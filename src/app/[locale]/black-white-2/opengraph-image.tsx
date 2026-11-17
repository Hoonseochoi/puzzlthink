import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Black & White II';

const COPY = {
  ko: { kicker: '더 지니어스 3', title: '흑과 백 II', sub: '99포인트, 보이는 건 흑·백과 표시등뿐', modes: ['AI 1:1', '친구 1:1'] },
  en: { kicker: 'The Genius 3', title: 'Black & White II', sub: '99 points — only colour and gauge are public', modes: ['AI 1:1', 'Friend 1:1'] },
};

const card = (black: boolean, label: string) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 108, height: 150, borderRadius: 16, fontSize: 54, fontWeight: 900, background: black ? 'linear-gradient(#34343b,#050506)' : 'linear-gradient(#fffdf8,#c9c2b5)', color: black ? '#f4efe4' : '#0d0d10', border: black ? '3px solid #55555e' : '3px solid #fff' }}>{label}</div>;

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const copy = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(copy, '99?'));
  return new ImageResponse(<GameOgCard {...copy} accent="#ef3340" glow="rgba(239,51,64,.24)" art={<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}><div style={{ display: 'flex', gap: 24 }}>{card(true, '9')}{card(false, '?')}</div><div style={{ display: 'flex', gap: 12 }}>{[0, 1, 2, 3, 4].map((index) => <i key={index} style={{ width: 20, height: 20, transform: 'rotate(45deg)', borderRadius: 3, background: index < 4 ? '#ef3340' : '#25252b', boxShadow: index < 4 ? '0 0 14px #ef3340' : 'none' }} />)}</div></div>} />, { ...size, fonts });
}
