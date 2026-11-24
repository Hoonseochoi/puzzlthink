import { ImageResponse } from 'next/og';
import { OG_SIZE, fontsFor, ogLocale } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK AI Hell Mode';

const COPY = {
  ko: { kicker: 'AI HELL MODE', title: 'AI 헬모드', sub: '매우 어려움. 이길 수 있는 사람만.', games: ['벽바둑 II', '벽바둑', '십이장기', '러시아장기', '블라인드 오목'], rule: '1승 = 블랙피스 1개' },
  en: { kicker: 'AI HELL MODE', title: 'AI Hell Mode', sub: 'Very Hard. Only if you can win.', games: ['Wallgo II', 'Wallgo', '12 Janggi', 'Russian Janggi', 'Blind Gomoku'], rule: '1 win = 1 black piece' },
};

/** Link preview: a black screen, neon red title over faint scanlines, the five games and the black-piece rule. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(`${c.kicker}${c.title}${c.sub}${c.games.join('')}${c.rule}PUZZLTHINKpuzzlthink.com·=1`);
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#07060a', backgroundImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,32,72,0.38), rgba(7,6,10,0) 70%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(255,43,214,0.22), rgba(7,6,10,0) 70%)', fontFamily: 'Noto Sans KR', color: '#fff', position: 'relative' }}>
      <div style={{ display: 'flex', position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 4px)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: 40 }}>
        <div style={{ display: 'flex', padding: '6px 18px', border: '2px solid rgba(255,51,85,0.7)', borderRadius: 999, fontSize: 22, fontWeight: 900, letterSpacing: 8, color: '#ff8ea0' }}>{c.kicker}</div>
        <div style={{ display: 'flex', marginTop: 18, fontSize: 150, fontWeight: 900, letterSpacing: -6, color: '#ff3355', textShadow: '0 0 18px rgba(255,51,85,0.9), 0 0 60px rgba(255,43,214,0.6)' }}>{c.title}</div>
        <div style={{ display: 'flex', marginTop: 4, fontSize: 38, fontWeight: 900, color: 'rgba(255,255,255,0.9)' }}>{c.sub}</div>
        <div style={{ display: 'flex', marginTop: 30, gap: 12 }}>
          {c.games.map((g) => <div key={g} style={{ display: 'flex', padding: '8px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,51,85,0.45)', fontSize: 24, fontWeight: 900 }}>{g}</div>)}
        </div>
        <div style={{ display: 'flex', marginTop: 26, fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>{c.rule}</div>
      </div>
      <div style={{ display: 'flex', position: 'absolute', top: 30, left: 40, fontSize: 24, fontWeight: 900, letterSpacing: 4, color: 'rgba(255,255,255,0.7)' }}>PUZZLTHINK</div>
      <div style={{ display: 'flex', position: 'absolute', bottom: 28, right: 40, fontSize: 22, fontWeight: 900, color: '#ff3355' }}>puzzlthink.com</div>
    </div>,
    { ...size, fonts },
  );
}
