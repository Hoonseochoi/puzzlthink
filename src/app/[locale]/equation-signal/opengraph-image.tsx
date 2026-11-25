import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Equation Signal';

const COPY = {
  ko: { kicker: '데블스 플랜 3 결승 3회전', title: '수식 신호등', sub: '숨은 9칸 수식, 초록·노랑·빨강 신호로 맞혀라', modes: ['연습', '10분 챌린지', '친구 2~4명'] },
  en: { kicker: "The Devil's Plan 3 final", title: 'Equation Signal', sub: 'A hidden 9-cell equation. Read the green, yellow and red', modes: ['Practice', '10-min challenge', '2–4 friends'] },
};

// Three guesses closing in on 6×7−12=30 (g/y/r as the game marks them).
const ROWS: [string, string][] = [['1+2×3^4=5', 'yryyyrryr'], ['30−6×2=18', 'yyyyyggyr'], ['6×7−12=30', 'ggggggggg']];
const LAMP: Record<string, string> = { g: '#2fbf71', y: '#f2c230', r: '#e5484d' };

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, '0123456789+−×÷^='));
  return new ImageResponse(
    <GameOgCard {...c} accent="#b6e33a" glow="rgba(182,227,58,0.25)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 392, height: 392, borderRadius: 18, background: 'radial-gradient(circle at 50% 30%, #33401a, #0f130a 72%)', border: '3px solid #b6e33a' }}>
        {ROWS.map(([text, marks]) => (
          <div key={text} style={{ display: 'flex', marginBottom: 10 }}>
            {[...text].map((ch, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 44, margin: '0 2px', borderRadius: 8, background: LAMP[marks[i]], color: '#fff', fontSize: 26, fontWeight: 900 }}>{ch}</div>
            ))}
          </div>
        ))}
      </div>
    } />,
    { ...size, fonts },
  );
}
