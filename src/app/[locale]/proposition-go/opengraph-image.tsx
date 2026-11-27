import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK ORIGINAL Proposition Go';

const COPY = {
  ko: { kicker: 'PUZZLTHINK ORIGINAL', title: '명제 바둑', sub: '모든 명제가 참이 되는 배치는 단 하나', modes: ['오늘의 3문제', '거짓말 찾기', '연습·튜토리얼'], cards: ['빨강은 모서리에 있다', '파랑은 초록보다 위', '거짓말!'] },
  en: { kicker: 'PUZZLTHINK ORIGINAL', title: 'Proposition Go', sub: 'One placement makes every proposition true', modes: ["Today's three", 'Find the lie', 'Practice'], cards: ['Red is in a corner', 'Blue is above Green', 'LIE!'] },
};

const STONE = [['#ffb3ba', '#ff4d5e', '#a3122a'], ['#b8d6ff', '#3f8cff', '#123c9c'], ['#bff5cd', '#34c463', '#0f6a32'], ['#fff2bf', '#ffc23d', '#b07a07']];
const stone = (k: number, x: number, y: number, s = 62) => (
  <div key={`${k}-${x}-${y}`} style={{ display: 'flex', position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: s, background: `radial-gradient(circle at 34% 28%, ${STONE[k][0]} 0%, ${STONE[k][1]} 52%, ${STONE[k][2]} 100%)`, boxShadow: '0 6px 10px rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', gap: s * 0.18 }}>
    <div style={{ display: 'flex', width: s * 0.1, height: s * 0.2, borderRadius: s, background: '#1a0f20' }} />
    <div style={{ display: 'flex', width: s * 0.1, height: s * 0.2, borderRadius: s, background: '#1a0f20' }} />
  </div>
);

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, c.cards.join('') + '✓✗'));
  const P = 330, G = (P - 60) / 3;
  return new ImageResponse(
    <GameOgCard kicker={c.kicker} title={c.title} sub={c.sub} modes={c.modes} accent="#b49cff" glow="rgba(155,123,255,0.42)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', position: 'relative', width: P, height: P, borderRadius: 26, background: 'radial-gradient(circle at 30% 0%, #1d1638 0%, #0d0a1c 55%, #06050b 100%)', border: '2px solid rgba(155,123,255,0.55)', boxShadow: '0 0 40px rgba(139,92,255,0.45)' }}>
          {[0, 1, 2, 3].map((i) => <div key={`h${i}`} style={{ display: 'flex', position: 'absolute', left: 30, top: 30 + i * G - 1.5, width: P - 60, height: 3, background: '#d9ccff', boxShadow: '0 0 10px 2px rgba(139,92,255,0.8)' }} />)}
          {[0, 1, 2, 3].map((i) => <div key={`v${i}`} style={{ display: 'flex', position: 'absolute', top: 30, left: 30 + i * G - 1.5, height: P - 60, width: 3, background: '#d9ccff', boxShadow: '0 0 10px 2px rgba(139,92,255,0.8)' }} />)}
          {stone(0, 30, 30)}{stone(1, 30 + 2 * G, 30 + G)}{stone(2, 30 + G, 30 + 3 * G)}{stone(3, 30 + 3 * G, 30 + 2 * G)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: P }}>
          {c.cards.slice(0, 2).map((txt, i) => (
            <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, border: `2px solid ${i === 0 ? 'rgba(63,214,122,0.7)' : 'rgba(255,77,94,0.75)'}`, background: i === 0 ? 'rgba(63,214,122,0.16)' : 'rgba(255,77,94,0.16)', fontSize: 22, fontWeight: 900 }}>
              <div style={{ display: 'flex', width: 26, height: 26, borderRadius: 26, alignItems: 'center', justifyContent: 'center', background: i === 0 ? '#3fd67a' : '#ff4d5e', color: i === 0 ? '#06231a' : '#fff', fontSize: 18 }}>{i === 0 ? '✓' : '✗'}</div>
              <div style={{ display: 'flex', flex: 1 }}>{txt}</div>
              {i === 1 && <div style={{ display: 'flex', padding: '0 8px', border: '3px solid #ff4d5e', borderRadius: 6, color: '#ff6b7a', fontSize: 20, transform: 'rotate(-9deg)' }}>{c.cards[2]}</div>}
            </div>
          ))}
        </div>
      </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('proposition-go', props, render);
}
