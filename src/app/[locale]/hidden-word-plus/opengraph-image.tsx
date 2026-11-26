import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Hidden Word: Expansion';

const COPY = {
  ko: { kicker: '히든 워드 · NEW 확장판', title: '히든 워드 확장판', sub: '닮은 단어 186개 속에서 유사도로 맞혀라', modes: ['186단어 · 30묶음', '확장판 랭킹', '1위 아이콘'] },
  en: { kicker: 'Hidden Word · NEW', title: 'Hidden Word: Expansion', sub: 'Find the word among 186 look-alikes', modes: ['186 words · 30 groups', 'Own ranking', '#1 icon'] },
};

// Three hints and how close each is to the sealed word; the hot one passed the 95% cut.
const HINTS = { ko: ['감정', '연인', '초록'], en: ['감정', '연인', '초록'] };
const SCORES = [96.5, 91, 85];
const HEAT = ['#ff5d73', '#ffc857', '#b79cff'];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = ogLocale((await params).locale);
  const c = COPY[locale];
  const fonts = await fontsFor(ogText(c, `0123456789.%?${HINTS[locale].join('')}`));
  return new ImageResponse(
    <GameOgCard {...c} accent="#b79cff" glow="rgba(183,156,255,0.3)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 392, height: 392, borderRadius: 18, background: 'radial-gradient(circle at 50% 25%, #4a3590, #0c0a14 72%)', border: '3px solid #ffd66b', padding: '0 34px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 220, height: 66, borderRadius: 14, border: '3px solid #ffd66b', background: 'rgba(20,15,40,0.8)', color: '#ffd66b', fontSize: 40, fontWeight: 900, letterSpacing: 12 }}>???</div>
        {HINTS[locale].map((word, i) => (
          <div key={word} style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: i ? 12 : 26, padding: '10px 14px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', fontSize: 28, fontWeight: 900, color: '#f1eaff' }}>{word}</div>
              <div style={{ display: 'flex', fontSize: 24, fontWeight: 900, color: HEAT[i] }}>{SCORES[i]}%</div>
            </div>
            <div style={{ display: 'flex', width: '100%', height: 8, marginTop: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex', width: `${SCORES[i]}%`, height: 8, borderRadius: 4, background: HEAT[i] }} />
            </div>
          </div>
        ))}
      </div>
    } />,
    { ...size, fonts },
  );
}
