import { ImageResponse } from 'next/og';
import { OG_SIZE, WallGoMini, fontsFor, ogLocale } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Wallgo';

const COPY = {
  ko: { title: '벽바둑', kicker: '데블스 플랜 3', sub: '말을 옮기고 벽을 세워 가장 넓은 영역을 차지하라', modes: ['1:1:1 AI', '1:1 AI', '1:1 친구와'] },
  en: { title: 'Wallgo', kicker: "The Devil's Plan 3", sub: 'Move, build walls, and claim the largest territory', modes: ['1:1:1 vs AI', '1:1 vs AI', '1:1 with a friend'] },
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(`PUZZLTHINK${c.title}${c.kicker}${c.sub}${c.modes.join('')}`);
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', background: '#0b0b0e', backgroundImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(120,110,150,0.3), transparent 70%), radial-gradient(ellipse 60% 50% at 50% 110%, rgba(140,18,30,0.45), transparent 70%)', fontFamily: 'Noto Sans KR', color: '#f4f6fb', padding: '56px 64px', gap: 56 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 900, color: '#ff4d5e', letterSpacing: 3 }}>{c.kicker}</div>
          <div style={{ display: 'flex', fontSize: 120, fontWeight: 900, letterSpacing: -4, marginTop: 6, backgroundImage: 'linear-gradient(#f4f6fb, #8d95a8)', backgroundClip: 'text', color: 'transparent' }}>{c.title}</div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 400, marginTop: 10, color: 'rgba(244,246,251,0.72)' }}>{c.sub}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
            {c.modes.map((m, i) => <div key={m} style={{ display: 'flex', padding: '10px 18px', borderRadius: 10, fontSize: 22, fontWeight: 900, background: i === 2 ? '#e0283a' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>{m}</div>)}
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(244,246,251,0.45)', marginTop: 40 }}>PUZZLTHINK · puzzlthink.com</div>
        </div>
        <WallGoMini size={420} />
      </div>
    ),
    { ...size, fonts },
  );
}
