import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = "PUZZLTHINK Nine Men's Morris";

const COPY = {
  ko: { kicker: '데블스 플랜 1', title: '나인 멘스 모리스', sub: '세 개를 한 줄로, 상대 말을 하나씩 잡아내는 결승전 게임', modes: ['AI 1:1', '친구 1:1'] },
  en: { kicker: "The Devil's Plan 1", title: "Nine Men's Morris", sub: 'Line up three, take a piece — the final match board game', modes: ['AI 1:1', 'Friend 1:1'] },
};

// Grid positions (0–6) of the 24 points, and a few pieces: 0 black, 1 white.
const PTS = [[0, 0], [3, 0], [6, 0], [1, 1], [3, 1], [5, 1], [2, 2], [3, 2], [4, 2], [0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3], [2, 4], [3, 4], [4, 4], [1, 5], [3, 5], [5, 5], [0, 6], [3, 6], [6, 6]];
const PIECES: Record<number, 0 | 1> = { 0: 0, 1: 0, 2: 0, 4: 1, 10: 1, 13: 0, 16: 1, 19: 1, 23: 0 };
const at = (n: number) => 30 + n * 53;

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, ''));
  return new ImageResponse(
    <GameOgCard {...c} accent="#3ec9d6" glow="rgba(62,201,214,0.25)" art={
      <div style={{ display: 'flex', position: 'relative', width: 380, height: 380, borderRadius: 18, background: '#2fa7b5', border: '3px solid rgba(255,255,255,0.25)' }}>
        {[[0, 6], [1, 5], [2, 4]].map(([a, b]) => <div key={a} style={{ display: 'flex', position: 'absolute', left: at(a), top: at(a), width: at(b) - at(a), height: at(b) - at(a), border: '5px solid #dff4f6' }} />)}
        <div style={{ display: 'flex', position: 'absolute', left: at(3) - 2, top: at(0), width: 5, height: at(2) - at(0), background: '#dff4f6' }} />
        <div style={{ display: 'flex', position: 'absolute', left: at(3) - 2, top: at(4), width: 5, height: at(6) - at(4), background: '#dff4f6' }} />
        <div style={{ display: 'flex', position: 'absolute', top: at(3) - 2, left: at(0), height: 5, width: at(2) - at(0), background: '#dff4f6' }} />
        <div style={{ display: 'flex', position: 'absolute', top: at(3) - 2, left: at(4), height: 5, width: at(6) - at(4), background: '#dff4f6' }} />
        {PTS.map(([x, y], i) => {
          const p = PIECES[i];
          return <div key={i} style={{ display: 'flex', position: 'absolute', left: at(x) - 21, top: at(y) - 21, width: 42, height: 42, borderRadius: 999, background: p === 0 ? '#16181d' : p === 1 ? '#f4f2ec' : '#e2f3f5', border: p === undefined ? '0' : '3px solid rgba(0,0,0,0.35)' }} />;
        })}
        <div style={{ display: 'flex', position: 'absolute', left: at(0), top: at(0) - 3, width: at(6) - at(0), height: 6, background: '#ffd84a', borderRadius: 3 }} />
      </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('nine-mens-morris', props, render);
}
