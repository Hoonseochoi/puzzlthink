import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Blind Gomoku';

const COPY = {
  ko: { kicker: '데블스 플랜 1', title: '블라인드 오목', sub: '같은 색 돌 아래 숨은 흑과 백, 기억으로 5목', modes: ['AI 1:1', '친구 1:1'] },
  en: { kicker: "The Devil's Plan 1", title: 'Blind Gomoku', sub: 'Black and white hidden under colour — win by memory', modes: ['AI 1:1', 'Friend 1:1'] },
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, ''));
  return new ImageResponse(
    <GameOgCard {...c} accent="#ffd166" glow="rgba(255,209,102,0.25)" art={
    <div style={{ display: 'flex', flexWrap: 'wrap', width: 380, height: 380, padding: 20, gap: 14, borderRadius: 18, border: '3px solid rgba(103,232,255,0.3)', background: '#080c12' }}>
      {['#ef4957', '', '#4e87ed', '#f4cf4b', '', '#49bf83', '#ef4957', '#9a69dc', '', '#ed72ad', '#4e87ed', '', '#f58a3c', '', '#49bf83', '#ef4957'].map((c, i) => <div key={i} style={{ display: 'flex', width: 71, height: 71, borderRadius: 999, background: c || 'transparent', border: c ? '3px solid rgba(255,255,255,0.25)' : '2px dashed rgba(103,232,255,0.18)' }} />)}
    </div>
    } />,
    { ...size, fonts },
  );
}
