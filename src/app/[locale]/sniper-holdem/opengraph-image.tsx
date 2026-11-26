import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = "PUZZLTHINK Sniper Hold'em";

const COPY = {
  ko: { kicker: '데블스 플랜 2 감옥매치', title: '스나이퍼 홀덤', sub: '상대의 족보를 숫자까지 맞혀 저격하면, 그 족보는 꼴찌', modes: ['AI 2~5인전', '친구 방', '공개방'], snipe: '9 스트레이트' },
  en: { kicker: "The Devil's Plan 2 prison match", title: "Sniper Hold'em", sub: 'Name the exact hand they hold — and it ranks last', modes: ['vs AI', 'Friends', 'Open rooms'], snipe: '9 straight' },
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '0123456789·SNIPE◎?'));
  return new ImageResponse(
    <GameOgCard kicker={c.kicker} title={c.title} sub={c.sub} modes={c.modes} accent="#ff4f5e" glow="rgba(255,79,94,0.28)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 392, height: 392, borderRadius: 18, background: 'radial-gradient(circle at 50% 28%, #1d4a36, #0d1f17 75%)', border: '3px solid #2f6b4f', position: 'relative' }}>
        <div style={{ display: 'flex' }}>
          {['9', '6', '5', '7'].map((v) => (
            <div key={v} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 70, height: 98, margin: '0 5px', borderRadius: 10, background: '#f6f3ea', color: '#1b1d24', fontSize: 44, fontWeight: 900 }}>{v}</div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 26 }}>
          {['8', '?'].map((v) => (
            <div key={v} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 58, height: 82, margin: '0 5px', borderRadius: 9, background: v === '?' ? '#3a1218' : '#f6f3ea', color: v === '?' ? '#ff4f5e' : '#1b1d24', fontSize: 36, fontWeight: 900, border: v === '?' ? '2px solid rgba(255,79,94,.5)' : 'none' }}>{v}</div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 26, padding: '8px 18px', borderRadius: 10, background: '#ff4f5e', color: '#fff', fontSize: 28, fontWeight: 900 }}>◎ {c.snipe}</div>
      </div>
    } />,
    { ...size, fonts },
  );
}
