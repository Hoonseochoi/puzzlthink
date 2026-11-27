import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Laser Janggi';

const COPY = {
  ko: { kicker: '더 지니어스 2', title: '레이저 장기', sub: '거울로 빛을 꺾어 상대 왕을 먼저 맞혀라', modes: ['AI 3단계', '친구 1:1'] },
  en: { kicker: 'The Genius 2', title: 'Laser Janggi', sub: 'Bend the beam with mirrors and hit the king first', modes: ['AI, 3 levels', 'Friend 1:1'] },
};

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, ''));
  return new ImageResponse(
    <GameOgCard {...c} accent="#59e6ff" glow="rgba(89,230,255,0.28)" art={
    <div style={{ display: 'flex', position: 'relative', width: 380, height: 380, borderRadius: 18, border: '3px solid rgba(89,230,255,0.4)', background: '#05080d' }}>
      {Array.from({ length: 3 }).map((_, i) => <div key={`v${i}`} style={{ position: 'absolute', left: 95 * (i + 1), top: 0, width: 2, height: 380, background: 'rgba(89,230,255,0.18)' }} />)}
      {Array.from({ length: 3 }).map((_, i) => <div key={`h${i}`} style={{ position: 'absolute', top: 95 * (i + 1), left: 0, height: 2, width: 380, background: 'rgba(89,230,255,0.18)' }} />)}
      <div style={{ position: 'absolute', left: 40, top: 330, width: 240, height: 6, background: '#59e6ff', boxShadow: '0 0 18px #59e6ff' }} />
      <div style={{ position: 'absolute', left: 277, top: 140, width: 6, height: 196, background: '#59e6ff', boxShadow: '0 0 18px #59e6ff' }} />
      <div style={{ position: 'absolute', left: 18, top: 306, width: 56, height: 56, borderRadius: 999, border: '4px solid #59e6ff', background: '#092b34' }} />
      <div style={{ display: 'flex', position: 'absolute', left: 250, top: 300, width: 60, height: 60, borderLeft: '6px solid #e9fdff', borderBottom: '6px solid #59e6ff', transform: 'rotate(-45deg)' }} />
      <div style={{ display: 'flex', position: 'absolute', left: 245, top: 84, width: 70, height: 70, borderRadius: 999, border: '5px solid #ff4d6d', background: '#360c17', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, color: '#ff4d6d' }}>K</div>
    </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('laser-janggi', props, render);
}
