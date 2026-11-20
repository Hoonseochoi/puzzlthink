import { ImageResponse } from 'next/og';
import { OG_SIZE, SlitherBoardArt, WallGoBoardArt, fontsFor, ogLocale } from '@/lib/og';
import { GAMES } from '@/lib/gameCatalog';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK';

const N = GAMES.length;
const COPY = {
  ko: { tag: `데블스플랜·더 지니어스 두뇌 게임 ${N}종`, line1: '방송 속 그 게임,', line2: '지금 바로 한판', sub: '벽바둑 · 슬리더링크 · 무거운 13 · 네모 세기 · 러시안 룰렛', chips: ['무료 · 가입 없이', 'AI 3단계', '친구와 링크 하나로'] },
  en: { tag: `${N} brain games from the shows`, line1: 'Games from the show,', line2: 'play one now', sub: 'Wallgo · Slitherlink · Heavy 13 · Nemo Count', chips: ['Free · no sign-up', '3 AI levels', 'Friends by link'] },
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(`PUZZLTHINK puzzlthink.com0123456789${c.tag}${c.line1}${c.line2}${c.sub}${c.chips.join('')}`);
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0a0b0f', backgroundImage: 'radial-gradient(ellipse 55% 70% at 88% 35%, rgba(224,40,58,0.34), rgba(10,11,15,0) 70%), radial-gradient(ellipse 45% 55% at 70% 100%, rgba(143,124,255,0.32), rgba(10,11,15,0) 70%)', fontFamily: 'Noto Sans KR', color: '#f2f4f8', padding: '52px 0 52px 64px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 660 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', width: 44, height: 44, padding: 8, gap: 4, background: '#f4f6fb', borderRadius: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#ff6b4a' }} /><div style={{ width: 12, height: 12, borderRadius: 3, background: '#17201e' }} /><div style={{ width: 12, height: 12, borderRadius: 3, background: '#17201e' }} /><div style={{ width: 12, height: 12, borderRadius: 3, background: '#f2c14e' }} />
            </div>
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 900, letterSpacing: -1 }}>PUZZLTHINK</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '8px 16px', borderRadius: 999, border: '2px solid rgba(255,77,94,0.75)', fontSize: 22, fontWeight: 900, color: '#ff6b7a' }}>{c.tag}</div>
            <div style={{ display: 'flex', fontSize: 70, fontWeight: 900, lineHeight: 1.12, marginTop: 18, letterSpacing: -2.5 }}>{c.line1}</div>
            <div style={{ display: 'flex', fontSize: 70, fontWeight: 900, lineHeight: 1.12, letterSpacing: -2.5, color: '#ffcc33' }}>{c.line2}</div>
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 900, marginTop: 20, color: 'rgba(242,244,248,0.78)' }}>{c.sub}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {c.chips.map((m, i) => <div key={m} style={{ display: 'flex', padding: '10px 18px', borderRadius: 12, fontSize: 22, fontWeight: 900, background: i === 0 ? '#e0283a' : 'rgba(255,255,255,0.09)', border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.14)' }}>{m}</div>)}
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(242,244,248,0.45)' }}>puzzlthink.com</div>
        </div>
        <div style={{ display: 'flex', position: 'relative', flex: 1 }}>
          <div style={{ display: 'flex', position: 'absolute', left: 40, top: -10, transform: 'rotate(-7deg)' }}><WallGoBoardArt size={300} /></div>
          <div style={{ display: 'flex', position: 'absolute', left: 150, top: 232, transform: 'rotate(6deg)' }}><SlitherBoardArt size={290} /></div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
