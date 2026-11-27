import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';
import { mineArt, treasureArt, walkerArt } from '@/components/mineOblivion/MineStones';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK 망각의 지뢰 Mine of Oblivion';

const COPY = {
  ko: { kicker: '넷플릭스 데스게임 6회차', title: '망각의 지뢰', sub: '지뢰 15개를 몰래 묻고, 내 지뢰마저 사라진 판에서 보물 찾기', modes: ['AI 보통·어려움', '친구 방', '공개방'] },
  en: { kicker: 'Netflix Death Game · match 6', title: 'Mine of Oblivion', sub: 'Bury 15 secret mines, then find treasure on a board that hides even yours', modes: ['Normal / Hard AI', 'Friends', 'Open rooms'] },
};

const TILES = ['#3a3524', '#353322', '#3d3826', '#33301f', '#383424'];
const CELL = 76;

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '0123456789+−'));
  const items: Record<number, React.ReactNode> = {
    6: mineArt('m1', { size: 60, state: 'dormant', mark: '#ff7a6e' }),
    8: treasureArt('t1', { size: 66 }),
    12: walkerArt('w0', { seat: 0, size: 64, glow: true }),
    13: <div style={{ display: 'flex', padding: '0 12px', borderRadius: 999, border: '3px solid #000', background: '#ffd23f', color: '#111', fontSize: 38, fontWeight: 900, lineHeight: 1.1 }}>3</div>,
    16: mineArt('m2', { size: 62, state: 'armed', mark: '#ffd76b' }),
    18: walkerArt('w1', { seat: 1, size: 64 }),
    24: mineArt('m3', { size: 70, state: 'blast' }),
  };
  return new ImageResponse(
    <GameOgCard {...c} accent="#ffb020" glow="rgba(255,140,40,0.28)" art={
      <div style={{ display: 'flex', padding: 10, borderRadius: 18, backgroundImage: 'repeating-linear-gradient(135deg, #f5c518 0px, #f5c518 16px, #141006 16px, #141006 32px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', width: CELL * 5, height: CELL * 5, borderRadius: 10, overflow: 'hidden' }}>
          {Array.from({ length: 25 }, (_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: CELL, height: CELL, background: TILES[(i * 7) % TILES.length], border: '1px solid rgba(0,0,0,0.35)' }}>{items[i]}</div>
          ))}
        </div>
      </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('mine-of-oblivion', props, render);
}
