import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Gradation';

const COPY = {
  ko: { kicker: '데블스 플랜 3 감옥 매치', title: '그라데이션', sub: '숫자 큐브 7개, 합 30 이하. 상대에겐 통의 색만 보인다', modes: ['AI 1:1', '친구 1:1', '공개방'] },
  en: { kicker: "The Devil's Plan 3 prison match", title: 'Gradation', sub: 'Seven cubes, sum 30 or less. They only see the shade', modes: ['vs AI', 'Friend 1:1', 'Open rooms'] },
};

// The show's row and the rack's shades, dark at both ends.
const ROW = [0, 1, 3, 4, 5, 8, 9];
const SHADE = ['#26262d', '#9a9ca3', '#cfd1d5', '#f1f2f4', '#cfd1d5', '#9a9ca3', '#26262d'];

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '0123456789SUM≤'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#3fd67a" glow="rgba(63,214,122,0.25)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 392, height: 392, borderRadius: 18, background: 'radial-gradient(circle at 50% 35%, #5b4690, #17121f 72%)', border: '3px solid #3fd67a' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          {ROW.map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: 50, height: 86, margin: '0 2px', borderRadius: 12, border: '2px solid rgba(0,0,0,0.35)', background: `linear-gradient(90deg, rgba(0,0,0,0.45), ${SHADE[i]} 35%, ${SHADE[i]} 65%, rgba(0,0,0,0.45))`, paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 7, background: '#33c158', color: '#fff', fontSize: 26, fontWeight: 900 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 26, fontSize: 24, fontWeight: 900, letterSpacing: 4, color: '#e9dcff' }}>SUM ≤ 30</div>
      </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('gradation', props, render);
}
