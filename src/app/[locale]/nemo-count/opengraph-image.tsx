import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Nemo Count';

const COPY = {
  ko: { kicker: '데블스 플랜 3', title: '네모 세기', sub: '숫자 합이 타깃이 되는 네모는 몇 개?', modes: ['30분 챌린지', '친구 2~6명 버저 대결'] },
  en: { kicker: "The Devil's Plan 3", title: 'Nemo Count', sub: 'How many rectangles make the target?', modes: ['30-min challenge', '2–6 player buzzer duel'] },
};

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, 'TARGET20186352749'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#c8d1e6" glow="rgba(125,134,168,0.35)" art={
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 130, borderRadius: 8, background: '#2c2e4b', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center', background: '#15162a', color: '#d6d9e8', fontSize: 16, fontWeight: 900, padding: '4px 0', letterSpacing: 3 }}>TARGET</div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 900, color: '#c9ccd8', padding: '4px 0' }}>20</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', width: 330, position: 'relative' }}>
        {[1, 8, 6, 3, 5, 2, 7, 4, 9].map((v, i) => <div key={i} style={{ display: 'flex', width: 110, height: 110, alignItems: 'center', justifyContent: 'center', border: '3px solid #1a1d3a', background: '#d9dbe2', fontSize: 54, fontWeight: 900, color: '#15161d' }}>{v}</div>)}
        <div style={{ display: 'flex', position: 'absolute', left: 110, top: 110, width: 220, height: 220, border: '7px solid #ffcf3f', borderRadius: 6, background: 'rgba(255,207,63,0.25)' }} />
      </div>
    </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('nemo-count', props, render);
}
