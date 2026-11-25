import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Tower of Equations';

const COPY = {
  ko: { kicker: '데블스 플랜 3 감옥 매치', title: '수식의 탑', sub: '블록을 옮기고 뒤집어 타깃 넘버를 쌓아라. 몇 번 만에?', modes: ['연습', '10분 챌린지', '친구 2~4명'] },
  en: { kicker: "The Devil's Plan 3 prison match", title: 'Tower of Equations', sub: 'Move and flip blocks to build the target. In how many moves?', modes: ['Practice', '10-min challenge', '2–4 friends'] },
};

// Four stacks, top first; the left one reads 5×2+3 = 13.
const STACKS = [['5', '×2', '+3'], ['8', '−4'], ['6', '+7'], ['−1', '÷2']];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '0123456789+−×÷=TARGET'));
  return new ImageResponse(
    <GameOgCard {...c} accent="#f08c5a" glow="rgba(240,140,90,0.25)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: 392, height: 392, paddingBottom: 26, borderRadius: 18, background: 'radial-gradient(circle at 50% 30%, #5a3322, #170d09 72%)', border: '3px solid #f08c5a' }}>
        <div style={{ display: 'flex', marginBottom: 18, fontSize: 26, fontWeight: 900, letterSpacing: 3, color: '#ffd9c4' }}>TARGET 13</div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          {STACKS.map((stack, s) => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', margin: '0 5px' }}>
              {stack.map((text, i) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 78, height: 46, marginTop: 6, borderRadius: 10, background: i === 0 ? '#f08c5a' : '#3b3f52', color: i === 0 ? '#200d03' : '#fff', fontSize: 28, fontWeight: 900, border: s === 0 ? '3px solid #7ee2ae' : '3px solid rgba(0,0,0,0.3)' }}>{text}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    } />,
    { ...size, fonts },
  );
}
