import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Hidden Word';

const COPY = {
  ko: { kicker: '데블스 플랜 3 · 5화 메인매치', title: '히든 워드', sub: '힌트의 유사도만 보고 상대의 단어를 맞혀라', modes: ['AI 승점전', '승점 랭킹', '1위 아이콘'] },
  en: { kicker: "The Devil's Plan 3 · Ep. 5 main match", title: 'Hidden Word', sub: "Find the word from each hint's similarity", modes: ['vs AI', 'Points ranking', '#1 icon'] },
};

// Three hints and how close each is to the sealed word; the hot one passed the 95% cut.
const HINTS = { ko: ['과일', '여름', '바다'], en: ['과일', '여름', '바다'] };
const SCORES = [96.5, 88, 61];
const HEAT = ['#ff5d73', '#a8ef70', '#3fd0c9'];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = ogLocale((await params).locale);
  const c = COPY[locale];
  const fonts = await fontsFor(ogText(c, `0123456789.%?${HINTS[locale].join('')}`));
  return new ImageResponse(
    <GameOgCard {...c} accent="#a8ef70" glow="rgba(168,239,112,0.25)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 392, height: 392, borderRadius: 18, background: 'radial-gradient(circle at 50% 25%, #2f5a2c, #0f1a12 72%)', border: '3px solid #a8ef70', padding: '0 34px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 220, height: 66, borderRadius: 14, border: '3px solid #ffc857', background: 'rgba(0,0,0,0.35)', color: '#ffc857', fontSize: 40, fontWeight: 900, letterSpacing: 12 }}>???</div>
        {HINTS[locale].map((word, i) => (
          <div key={word} style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: i ? 12 : 26, padding: '10px 14px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', fontSize: 28, fontWeight: 900, color: '#f2f5ee' }}>{word}</div>
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
