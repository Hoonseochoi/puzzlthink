import { ImageResponse } from 'next/og';
import { duelTime, fetchDuel } from '@/lib/nemoDuel';
import { OG_SIZE, fontsFor } from '@/lib/og';

const LEVEL = { ko: { easy: '쉬움', normal: '보통', hard: '어려움' }, en: { easy: 'Easy', normal: 'Normal', hard: 'Hard' } } as const;

// Link preview / saved image for a 네모 세기 도전장.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const en = new URL(request.url).searchParams.get('l') === 'en';
  const duel = await fetchDuel(id);
  if (!duel) return new Response('Not found', { status: 404 });
  const run = duel.creator_run ?? { correct: 0, ms: 0 };
  const level = (en ? LEVEL.en : LEVEL.ko)[duel.difficulty];
  const kicker = en ? 'NEMO COUNT CHALLENGE' : '네모 세기 도전장';
  const who = en ? `${duel.creator} challenges you` : `${duel.creator}님의 도전장`;
  const score = `${run.correct}/${duel.count}`;
  const time = duelTime(run.ms);
  const sub = en ? `${level} · ${duel.count} boards · same boards for everyone` : `${level} · ${duel.count}문제 · 똑같은 문제로 승부`;
  const cta = en ? 'Can you beat it?' : '이길 수 있어?';
  const takers = en ? `${duel.total} players so far` : `지금까지 ${duel.total}명 도전`;
  const fonts = await fontsFor(`${kicker}${who}${score}${time}${sub}${cta}${takers}PUZZLTHINKpuzzlthink.com0123456789/:.s`);
  const accent = '#c8d1e6';
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0b0c12', backgroundImage: 'radial-gradient(ellipse 70% 70% at 50% 45%, rgba(120,140,210,0.32), rgba(11,12,18,0) 70%)', fontFamily: 'Noto Sans KR', color: '#eef1f7', padding: 28 }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `3px solid ${accent}`, borderRadius: 26, position: 'relative' }}>
        <div style={{ display: 'flex', position: 'absolute', top: 26, left: 34, fontSize: 24, fontWeight: 900, letterSpacing: 4, color: 'rgba(238,241,247,0.7)' }}>PUZZLTHINK</div>
        <div style={{ display: 'flex', position: 'absolute', top: 30, right: 34, fontSize: 20, color: 'rgba(238,241,247,0.45)' }}>{takers}</div>
        <div style={{ display: 'flex', padding: '8px 22px', borderRadius: 999, background: accent, color: '#151b2c', fontSize: 26, fontWeight: 900 }}>{kicker}</div>
        <div style={{ display: 'flex', marginTop: 18, fontSize: 46, fontWeight: 900 }}>{who}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 30, marginTop: 8 }}>
          <div style={{ display: 'flex', fontSize: 150, fontWeight: 900, lineHeight: 1, letterSpacing: -4, color: '#ffffff' }}>{score}</div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 900, color: accent, marginBottom: 16 }}>{time}</div>
        </div>
        <div style={{ display: 'flex', marginTop: 14, fontSize: 28, color: 'rgba(238,241,247,0.7)' }}>{sub}</div>
        <div style={{ display: 'flex', marginTop: 18, fontSize: 40, fontWeight: 900, color: '#ffd84a' }}>{cta}</div>
        <div style={{ display: 'flex', position: 'absolute', bottom: 26, right: 34, fontSize: 22, fontWeight: 900, color: accent }}>puzzlthink.com</div>
      </div>
    </div>,
    { ...OG_SIZE, fonts, headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=3600' } },
  );
}
