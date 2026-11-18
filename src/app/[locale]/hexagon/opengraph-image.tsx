import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Hexagon';

const COPY = {
  ko: { kicker: '데블스 플랜', title: '헥사곤', sub: '30초 외우고, 합이 타깃인 세 칸을 찾아라', modes: ['혼자 10라운드 · 10분 챌린지', '친구 2~4명 버저 대결'] },
  en: { kicker: "The Devil's Plan", title: 'Hexagon', sub: 'Memorize 19 numbers, find three in a row that hit the target', modes: ['Solo 10 rounds · 10-min challenge', '2–4 player buzzer duel'] },
};

// Rows 3-4-5-4-3 of the first broadcast board; QRS (5) picked out.
const NUMS = [1, 6, 3, 2, 4, 5, 6, 2, 5, 2, 1, 3, 4, 5, 3, 5, 1, 1, 3];
const ROWS = [3, 4, 5, 4, 3];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, 'TARGET0123456789'));
  const s = 38, w = Math.sqrt(3) * s;
  const tiles: { x: number; y: number; v: number; on: boolean }[] = [];
  let i = 0;
  ROWS.forEach((len, row) => {
    for (let col = 0; col < len; col += 1) {
      tiles.push({ x: (5 - len) * w / 2 + col * w + w / 2, y: s + row * 1.5 * s, v: NUMS[i], on: i >= 16 });
      i += 1;
    }
  });
  const hex = (x: number, y: number, r: number) => [0, 1, 2, 3, 4, 5].map((k) => { const a = Math.PI / 180 * (60 * k - 90); return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`; }).join(' ');
  const W = 5 * w, H = 8 * s;
  return new ImageResponse(
    <GameOgCard {...c} accent="#e8b04a" glow="rgba(232,176,74,0.32)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120, borderRadius: 8, background: '#2b2414', overflow: 'hidden' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', background: '#16120a', color: '#e8b04a', fontSize: 15, fontWeight: 900, padding: '4px 0', letterSpacing: 3 }}>TARGET</div>
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 900, color: '#f3e6c4', padding: '2px 0' }}>5</div>
        </div>
        <div style={{ display: 'flex', position: 'relative', width: W, height: H }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
            {tiles.map((tile, k) => <polygon key={k} points={hex(tile.x, tile.y, s - 2)} fill={tile.on ? '#ffcf3f' : '#efe8d6'} stroke="#1a1408" strokeWidth={3} />)}
          </svg>
          {tiles.map((tile, k) => <div key={k} style={{ display: 'flex', position: 'absolute', left: tile.x - 20, top: tile.y - 22, width: 40, height: 44, alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, color: '#17140d' }}>{tile.v}</div>)}
        </div>
      </div>
    } />,
    { ...size, fonts },
  );
}
