import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK One Stroke';

const COPY = {
  ko: { kicker: 'TV 두뇌 퍼즐', title: '규칙 한붓그리기', sub: '숫자만큼 선이 지나가는 고리 하나를 그려라', modes: ['9×9 · 10×10 · 11×11 연습', '힌트 · 포기하면 정답 · 복기'] },
  en: { kicker: 'TV brain puzzle', title: 'One Stroke', sub: 'Draw one loop that matches every number', modes: ['9×9 · 10×10 · 11×11 practice', 'Hints · reveal · replay'] },
};

// The loop and numbers from the home card, drawn larger.
const PATH = 'M0.5 0.5H2.5V1.5H3.5V0.5H4.5V2.5H3.5V3.5H4.5V4.5H1.5V3.5H0.5Z';
const CLUES: [number, number, number][] = [[0, 2, 3], [0, 3, 3], [1, 0, 1], [1, 1, 0], [2, 3, 3], [3, 0, 2], [3, 2, 1], [2, 1, 0]];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '0123'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#8f7cff" glow="rgba(143,124,255,0.35)" art={
      <div style={{ display: 'flex', position: 'relative', width: 380, height: 380, borderRadius: 18, background: '#eceeff', border: '6px solid #2c1f78' }}>
        <svg width="368" height="368" viewBox="0 0 5 5" style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d={PATH} fill="none" stroke="#2c1f78" strokeWidth="0.09" strokeLinejoin="round" />
          {Array.from({ length: 25 }, (_, i) => <circle key={i} cx={(i % 5) + 0.5} cy={Math.floor(i / 5) + 0.5} r="0.08" fill="#5b45c9" />)}
        </svg>
        {CLUES.map(([r, col, v]) => <div key={`${r}-${col}`} style={{ display: 'flex', position: 'absolute', left: (col + 0.5) * 73.6, top: (r + 0.5) * 73.6, width: 73.6, height: 73.6, alignItems: 'center', justifyContent: 'center', fontSize: 42, fontWeight: 900, color: '#5b45c9' }}>{v}</div>)}
      </div>
    } />,
    { ...size, fonts },
  );
}
