import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK 4 Player 3 In a Row';

const COPY = {
  ko: { kicker: '데블스 플랜 1', title: '4인 3목', sub: '4×4 판, 쌓을 수 있는 말. 셋이 힘을 모아 스페셜 게스트의 3목을 막아라', modes: ['AI 4인전', '친구 2~3명'] },
  en: { kicker: "The Devil's Plan 1", title: '4 Player 3 In a Row', sub: 'A 4×4 board of stacking pieces. Three players team up to stop the Special Guest', modes: ['vs AI (4 players)', 'Friends 2–3'] },
};

const COLORS = ['#ff4d5e', '#ffc93c', '#3ddc84', '#3f8cff'];
// Top piece of each cell (−1 empty), with a red line on the diagonal.
const TOPS = [0, -1, 3, 1, 2, 0, -1, 3, -1, 1, 0, -1, 3, -1, 2, 1];

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, ''));
  return new ImageResponse(
    <GameOgCard {...c} accent="#ffb52e" glow="rgba(255,181,46,0.25)" art={
      <div style={{ display: 'flex', flexWrap: 'wrap', width: 380, height: 380, padding: 10, gap: 8, borderRadius: 18, background: '#3b2a0a' }}>
        {TOPS.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 84, height: 84, borderRadius: 8, background: '#6b5320' }}>
            {p >= 0 && <div style={{ display: 'flex', width: 62, height: 62, borderRadius: 999, background: COLORS[p], border: '4px solid rgba(0,0,0,0.3)' }} />}
          </div>
        ))}
      </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('four-three', props, render);
}
