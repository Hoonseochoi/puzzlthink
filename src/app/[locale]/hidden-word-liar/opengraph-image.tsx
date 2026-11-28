import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';
import { LiarStone } from '@/components/hiddenWordLiar/LiarArt';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK 히든 워드: 라이어';

// One card for the game page and every room invite under it (room links reuse it, so no image is drawn per room).
const COPY = {
  ko: { kicker: '히든 워드 · PUZZLTHINK ORIGINAL', title: '라이어 게임', sub: '라이어만 제시어가 없다. 숫자를 보고 속여라.', modes: ['4~10인 파티', '친구 초대', '공개방'] },
  en: { kicker: 'HIDDEN WORD · ORIGINAL', title: 'Liar Game', sub: 'The liar has no word. Read the numbers and bluff.', modes: ['4–10 players', 'Invite friends', 'Matchmaking'] },
};
const CLUES = [{ w: '공', s: '72', c: '#ff9a3d' }, { w: '체육관', s: '41', c: '#7fd0ff' }, { w: '선수', s: '🔥85+', c: '#ff5a3d' }];

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, `${CLUES.map((x) => x.w + x.s).join('')}?`));
  return new ImageResponse(
    <GameOgCard {...c} accent="#a98bff" glow="rgba(169,139,255,0.32)" art={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 392, height: 392, borderRadius: 28, background: 'radial-gradient(circle at 50% 30%, #3b2a75, #15111f 72%)', border: '3px solid #a98bff' }}>
        {LiarStone({ id: "og", name: "", size: 210 })}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {CLUES.map((x) => (
            <div key={x.w} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: '#ffffff', color: '#241457', fontSize: 22, fontWeight: 900 }}>
              {x.w}<span style={{ display: 'flex', padding: '0 8px', borderRadius: 999, background: x.c, color: '#ffffff', fontSize: 18 }}>{x.s}</span>
            </div>
          ))}
        </div>
      </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('hidden-word-liar', props, render);
}
