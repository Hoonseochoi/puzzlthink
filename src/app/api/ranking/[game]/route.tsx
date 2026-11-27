import { ImageResponse } from 'next/og';
import { CERT_GAMES } from '@/lib/hardClear';
import { OG_SIZE, cachedImage, dataKey, fontsFor } from '@/lib/og';
import { fetchGameRanking, gameFromSlug, podium } from '@/lib/rankings';

// Share image for a game's ranking page: the current top three.
export async function GET(request: Request, { params }: { params: Promise<{ game: string }> }) {
  const game = gameFromSlug((await params).game);
  if (!game) return new Response('Not found', { status: 404 });
  const en = new URL(request.url).searchParams.get('l') === 'en';
  const info = CERT_GAMES[game];
  const name = en ? info.en : info.ko;
  const top = podium(await fetchGameRanking(game));
  // Drawn again only when the top three change (the response's own Cache-Control is not honoured in front of a Worker).
  return cachedImage(dataKey('ranking', game, en, top), async () => {
  const kicker = en ? 'RANKING' : '랭킹';
  const title = en ? `${name} Ranking` : `${name} 랭킹`;
  const cta = en ? 'Your name could be next' : '다음 이름은 당신 차례';
  const empty = en ? 'No one yet — be the first' : '아직 아무도 없어요 — 첫 번째 주인공이 되어 보세요';
  const fonts = await fontsFor(`${kicker}${title}${cta}${empty}${top.map((x) => x.name + x.stat).join('')}PUZZLTHINKpuzzlthink.com123W`);
  const colors = ['#ffd36e', '#d8dde8', '#e3a46b'];
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0b0c10', backgroundImage: `radial-gradient(ellipse 70% 70% at 50% 40%, ${info.color}44, rgba(11,12,16,0) 70%)`, fontFamily: 'Noto Sans KR', color: '#f5f1e6', padding: 28 }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', border: '3px solid #d9b25f', borderRadius: 26, padding: '40px 60px', position: 'relative' }}>
        <div style={{ display: 'flex', position: 'absolute', top: 26, left: 34, fontSize: 24, fontWeight: 900, letterSpacing: 4, color: 'rgba(245,241,230,0.7)' }}>PUZZLTHINK</div>
        <div style={{ display: 'flex', marginTop: 24, fontSize: 64, fontWeight: 900, letterSpacing: -1 }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 30, width: 760 }}>
          {top.length ? top.map((x, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 28px', borderRadius: 18, background: 'rgba(255,255,255,0.07)', border: `2px solid ${colors[i]}66` }}>
              <div style={{ display: 'flex', width: 54, height: 54, borderRadius: 999, background: colors[i], color: '#1d1608', fontSize: 30, fontWeight: 900, alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
              <div style={{ display: 'flex', flex: 1, fontSize: 38, fontWeight: 900 }}>{x.name}</div>
              <div style={{ display: 'flex', fontSize: 32, fontWeight: 900, color: colors[i] }}>{x.stat}</div>
            </div>
          )) : <div style={{ display: 'flex', justifyContent: 'center', fontSize: 32, color: 'rgba(245,241,230,0.6)' }}>{empty}</div>}
        </div>
        <div style={{ display: 'flex', position: 'absolute', bottom: 26, left: 34, fontSize: 26, fontWeight: 900, color: '#ffd36e' }}>{cta}</div>
        <div style={{ display: 'flex', position: 'absolute', bottom: 26, right: 34, fontSize: 22, fontWeight: 900, color: info.color }}>puzzlthink.com</div>
      </div>
    </div>,
    { ...OG_SIZE, fonts, headers: { 'Cache-Control': 'public, max-age=120, s-maxage=300, stale-while-revalidate=3600' } },
  );
  });
}
