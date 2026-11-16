import { ImageResponse } from 'next/og';
import { JanggiTile, OG_SIZE, fontsFor, ogLocale } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK 12 Janggi';

const COPY = {
  ko: { title: '십이장기', kicker: '더 지니어스 그 게임', sub: '12칸 위의 수싸움 — 왕을 잡거나 적진에 입성하라', modes: ['AI 대전', '1:1 친구와'] },
  en: { title: '12 Janggi', kicker: 'The Genius game', sub: 'A duel on 12 squares — capture the king or march in', modes: ['vs AI', '1:1 with a friend'] },
};
const RED = '#ff5b3a', JADE = '#17c39a';
const BOARD: [string, string, boolean][][] = [
  [['將', JADE, true], ['王', JADE, true], ['相', JADE, true]],
  [['', '', false], ['子', JADE, true], ['', '', false]],
  [['', '', false], ['子', RED, false], ['', '', false]],
  [['相', RED, false], ['王', RED, false], ['將', RED, false]],
];

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(`PUZZLTHINK${c.title}${c.kicker}${c.sub}${c.modes.join('')}`, '將王相子十二棋');
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', background: '#0a0c10', backgroundImage: 'radial-gradient(ellipse 60% 50% at 80% 0%, rgba(23,195,154,0.28), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(255,91,58,0.3), transparent 70%)', fontFamily: 'Noto Sans KR', color: '#eceff4', padding: '48px 64px', gap: 56 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 900, color: '#e8c170', letterSpacing: 3 }}>{c.kicker}</div>
          <div style={{ display: 'flex', fontFamily: 'Noto Serif KR', fontSize: 40, color: 'rgba(232,193,112,0.6)', letterSpacing: 12, marginTop: 10 }}>十二將棋</div>
          <div style={{ display: 'flex', fontSize: 110, fontWeight: 900, letterSpacing: -4, backgroundImage: 'linear-gradient(#fff4d6, #e8c170)', backgroundClip: 'text', color: 'transparent' }}>{c.title}</div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 400, marginTop: 8, color: 'rgba(236,239,244,0.72)' }}>{c.sub}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 34 }}>
            {c.modes.map((m, i) => <div key={m} style={{ display: 'flex', padding: '10px 18px', borderRadius: 12, fontSize: 22, fontWeight: 900, background: i === 1 ? '#e8c170' : 'rgba(255,255,255,0.08)', color: i === 1 ? '#1a1408' : '#eceff4' }}>{m}</div>)}
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(236,239,244,0.45)', marginTop: 36 }}>PUZZLTHINK · puzzlthink.com</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: '#0f1116', border: '2px solid rgba(232,193,112,0.5)', borderRadius: 26 }}>
          {BOARD.map((row, r) => (
            <div key={r} style={{ display: 'flex', gap: 10 }}>
              {row.map(([glyph, color, flipped], col) => (
                <div key={col} style={{ display: 'flex', width: 118, height: 118, borderRadius: 16, justifyContent: 'center', alignItems: 'center', background: r === 0 ? 'rgba(23,195,154,0.14)' : r === 3 ? 'rgba(255,91,58,0.16)' : 'rgba(255,255,255,0.03)' }}>
                  {glyph ? <JanggiTile glyph={glyph} color={color} size={100} flipped={flipped} /> : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
