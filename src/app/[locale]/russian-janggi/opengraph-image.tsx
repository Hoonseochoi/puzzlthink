import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Russian Janggi';

const COPY = {
  ko: { kicker: '소사이어티 게임 2', title: '러시아장기', sub: '큰 말이 작은 말을 덮는 3×3 두뇌 싸움', modes: ['AI 3단계', '친구 1:1'] },
  en: { kicker: 'The Society Game 2', title: 'Russian Janggi', sub: 'Big cups cover small ones on a 3×3 board', modes: ['AI, 3 levels', 'Friend 1:1'] },
};

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '+○'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#f2b84b" glow="rgba(242,184,75,0.25)" art={
    <div style={{ display: 'flex', flexWrap: 'wrap', width: 380, height: 380, padding: 14, gap: 10, borderRadius: 18, background: '#2a1d14' }}>
      {[[1, 2], null, [0, 0], null, [0, 2], [1, 1], [0, 1], null, [1, 0]].map((cell, i) => (
        <div key={i} style={{ display: 'flex', width: 108, height: 108, borderRadius: 12, background: '#6b4a2f', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8 }}>
          {cell && <div style={{ display: 'flex', width: [52, 72, 92][cell[1]], height: [48, 66, 84][cell[1]], borderRadius: '50% 50% 10% 10%', background: cell[0] === 0 ? 'linear-gradient(90deg, #8a1a12, #ff9a8a 30%, #ec3b2c 60%, #8a1a12)' : 'linear-gradient(90deg, #0d2f78, #9cc4ff 30%, #2f6fe8 60%, #0d2f78)', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)', fontSize: [20, 28, 36][cell[1]], fontWeight: 900 }}>{cell[0] === 0 ? '+' : '○'}</div>}
        </div>
      ))}
    </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('russian-janggi', props, render);
}
