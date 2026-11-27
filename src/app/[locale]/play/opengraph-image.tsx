import { ImageResponse } from 'next/og';
import { OG_SIZE, SudokuMini, fontsFor, ogLocale, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Sudoku';

const COPY = {
  ko: { title: '스도쿠', kicker: '무료 온라인 스도쿠', sub: '쉬움 · 보통 · 어려움 — 푸는 요령 가이드까지' },
  en: { title: 'Sudoku', kicker: 'Free online Sudoku', sub: 'Easy · Medium · Hard — with a solving guide' },
};

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(`PUZZLTHINK${c.title}${c.kicker}${c.sub}0123456789`);
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', background: '#f3f0e8', backgroundImage: 'radial-gradient(ellipse 60% 60% at 20% 0%, rgba(247,223,158,0.75), rgba(243,240,232,0) 70%)', fontFamily: 'Noto Sans KR', color: '#17201e', padding: '56px 72px', gap: 64 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 900, color: '#4b7bff', letterSpacing: 3 }}>{c.kicker}</div>
          <div style={{ display: 'flex', fontSize: 130, fontWeight: 900, letterSpacing: -5, marginTop: 6 }}>{c.title}</div>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 400, marginTop: 8, color: 'rgba(23,32,30,0.65)' }}>{c.sub}</div>
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(23,32,30,0.45)', marginTop: 48 }}>PUZZLTHINK · puzzlthink.com</div>
        </div>
        <SudokuMini size={420} />
      </div>
    ),
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('play', props, render);
}
