import { ImageResponse } from 'next/og';
import { JanggiTile, OG_SIZE, SudokuMini, WallGoMini, fontsFor, ogLocale } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK';

const COPY = {
  ko: { line1: '데블스 플랜·더 지니어스', line2: '그 게임을 친구들과', sub: '네모 세기 · 무거운 13 · 벽바둑 · 레이저 장기 · 십이장기 — 가입 없이 바로', tag: '무료 브라우저 두뇌 게임' },
  en: { line1: "The Devil's Plan & The Genius", line2: 'games, with your friends', sub: 'Nemo Count · Heavy 13 · Wall Go · Laser Janggi · 12 Janggi — no sign-up', tag: 'Free brain games in your browser' },
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(`PUZZLTHINK${c.line1}${c.line2}${c.sub}${c.tag}`, '王');
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0b0b0e', backgroundImage: 'radial-gradient(ellipse 60% 70% at 85% 30%, rgba(224,40,58,0.35), transparent 70%), radial-gradient(ellipse 50% 60% at 10% 100%, rgba(232,193,112,0.18), transparent 70%)', fontFamily: 'Noto Sans KR', color: '#f4f6fb', padding: 64 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', width: 44, height: 44, padding: 8, gap: 4, background: '#f4f6fb', borderRadius: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#ff6b4a' }} /><div style={{ width: 12, height: 12, borderRadius: 3, background: '#17201e' }} /><div style={{ width: 12, height: 12, borderRadius: 3, background: '#17201e' }} /><div style={{ width: 12, height: 12, borderRadius: 3, background: '#f2c14e' }} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -1 }}>PUZZLTHINK</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 900, color: '#ff4d5e', letterSpacing: 2 }}>{c.tag}</div>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 900, lineHeight: 1.12, marginTop: 14, letterSpacing: -2 }}>{c.line1}</div>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 900, lineHeight: 1.12, letterSpacing: -2, color: '#e8c170' }}>{c.line2}</div>
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 400, marginTop: 24, color: 'rgba(244,246,251,0.7)' }}>{c.sub}</div>
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(244,246,251,0.5)' }}>puzzlthink.com</div>
        </div>
        <div style={{ display: 'flex', position: 'relative', flex: 1 }}>
          <div style={{ display: 'flex', position: 'absolute', left: 40, top: 20, transform: 'rotate(-6deg)' }}><WallGoMini size={270} /></div>
          <div style={{ display: 'flex', position: 'absolute', left: 150, top: 300, transform: 'rotate(5deg)' }}><SudokuMini size={170} /></div>
          <div style={{ display: 'flex', position: 'absolute', left: 300, top: 230, transform: 'rotate(-8deg)' }}><JanggiTile glyph="王" color="#ff5b3a" size={130} /></div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
