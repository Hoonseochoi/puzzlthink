import { ImageResponse } from 'next/og';
import { OG_SIZE, fontsFor, ogLocale } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Heavy 13';

const COPY = {
  ko: { title: '무거운 13', kicker: '데블스플랜 감옥매치', sub: '받침대 합이 13을 넘기면 벌점! 7인 눈치 싸움', modes: ['AI 대전', '친구 초대 · 빈자리 AI'] },
  en: { title: 'Heavy 13', kicker: "The Devil's Plan prison match", sub: 'Push a stand to 13 and take the penalty. A 7-player mind game', modes: ['vs AI', 'Invite friends · AI fills seats'] },
};
const STANDS: [string, number[]][] = [['#f0524f', [6, 5]], ['#34c47c', [4, 3, 2]], ['#4f7cf0', [5, 6]]];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(`PUZZLTHINK${c.title}${c.kicker}${c.sub}${c.modes.join('')}0123456789/`);
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', background: '#0e1013', backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(214,180,120,0.22), rgba(14,16,19,0) 70%), radial-gradient(ellipse 60% 50% at 50% 110%, rgba(240,82,79,0.3), rgba(14,16,19,0) 70%)', fontFamily: 'Noto Sans KR', color: '#eef0f3', padding: '56px 64px', gap: 48 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 900, color: '#e6c48a', letterSpacing: 3 }}>{c.kicker}</div>
          <div style={{ display: 'flex', fontSize: 118, fontWeight: 900, letterSpacing: -4, marginTop: 6 }}>{c.title}</div>
          <div style={{ display: 'flex', fontSize: 27, fontWeight: 400, marginTop: 6, color: 'rgba(238,240,243,0.72)' }}>{c.sub}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 34 }}>
            {c.modes.map((m, i) => <div key={m} style={{ display: 'flex', padding: '10px 18px', borderRadius: 12, fontSize: 22, fontWeight: 900, background: i === 1 ? '#e6c48a' : 'rgba(255,255,255,0.08)', color: i === 1 ? '#2a2118' : '#eef0f3' }}>{m}</div>)}
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(238,240,243,0.45)', marginTop: 36 }}>PUZZLTHINK · puzzlthink.com</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          {STANDS.map(([color, cubes]) => {
            const total = cubes.reduce((a, b) => a + b, 0);
            return (
              <div key={color} style={{ display: 'flex', flexDirection: 'column', width: 130, padding: 14, borderRadius: 18, border: `2px solid ${color}`, background: 'rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', fontSize: 44, fontWeight: 900, color: total >= 10 ? '#ff8a7a' : '#ffffff' }}>{total}<span style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>/13</span></div>
                <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignContent: 'flex-start', gap: 6, marginTop: 10, height: 190, width: 102 }}>
                  {cubes.map((v, i) => <div key={i} style={{ display: 'flex', width: 48, height: 48, borderRadius: 11, justifyContent: 'center', alignItems: 'center', fontSize: 24, fontWeight: 900, color: '#2a2118', background: 'linear-gradient(160deg, #f1e6cf, #ad9671)' }}>{v}</div>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
