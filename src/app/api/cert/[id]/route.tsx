import { ImageResponse } from 'next/og';
import { CERT_GAMES, clearLabel, fetchCert, formatClearDate } from '@/lib/hardClear';
import { OG_SIZE, fontsFor } from '@/lib/og';

// The certificate picture: link preview for the share page and the "이미지 저장" download.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = new URL(request.url).searchParams.get('l') === 'en' ? 'en' : 'ko';
  const cert = await fetchCert(id);
  if (!cert) return new Response('Not found', { status: 404 });

  const en = locale === 'en';
  const accent = CERT_GAMES[cert.game]?.color ?? '#ffd36e';
  const label = clearLabel(cert.game, locale);
  const kicker = en ? 'HARD CLEAR CERTIFICATE' : '어려움 클리어 인증서';
  const line = en ? `${cert.nickname} beat it as the No. ${cert.clear_no} player` : `${cert.nickname} 님이 ${cert.clear_no}번째로 클리어했어요`;
  const foot = `${formatClearDate(cert.cleared_at)} · ${en ? `${cert.total} cleared so far` : `지금까지 ${cert.total}명 클리어`}`;
  const fonts = await fontsFor(`${kicker}${label}${line}${foot}#0123456789PUZZLTHINKpuzzlthink.comNo.${en ? 'Unofficial fan game' : '비공식 팬 게임'}`);

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0b0c10', backgroundImage: `radial-gradient(ellipse 70% 70% at 50% 45%, ${accent}40, rgba(11,12,16,0) 70%)`, fontFamily: 'Noto Sans KR', color: '#f5f1e6', padding: 28 }}>
      <div style={{ display: 'flex', flex: 1, border: '3px solid #d9b25f', borderRadius: 26, padding: 10 }}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(217,178,95,0.45)', borderRadius: 18, position: 'relative' }}>
          <div style={{ display: 'flex', position: 'absolute', top: 26, left: 34, fontSize: 24, fontWeight: 900, letterSpacing: 4, color: 'rgba(245,241,230,0.7)' }}>PUZZLTHINK</div>
          <div style={{ display: 'flex', position: 'absolute', top: 30, right: 34, fontSize: 18, fontWeight: 400, color: 'rgba(245,241,230,0.4)' }}>{en ? 'Unofficial fan game' : '비공식 팬 게임'}</div>
          <div style={{ display: 'flex', padding: '8px 22px', borderRadius: 999, background: '#d9b25f', color: '#1d1608', fontSize: 24, fontWeight: 900, letterSpacing: en ? 3 : 1 }}>{kicker}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 8 }}>
            <div style={{ display: 'flex', fontSize: 70, fontWeight: 900, color: '#d9b25f', marginBottom: 34, marginRight: 6 }}>#</div>
            <div style={{ display: 'flex', fontSize: 190, fontWeight: 900, lineHeight: 1, letterSpacing: -6, color: '#ffe3a1' }}>{cert.clear_no}</div>
          </div>
          <div style={{ display: 'flex', marginTop: 10, fontSize: 52, fontWeight: 900, letterSpacing: -1 }}>{label}</div>
          <div style={{ display: 'flex', marginTop: 14, fontSize: 30, fontWeight: 400, color: 'rgba(245,241,230,0.8)' }}>{line}</div>
          <div style={{ display: 'flex', position: 'absolute', bottom: 26, left: 34, fontSize: 20, color: 'rgba(245,241,230,0.5)' }}>{foot}</div>
          <div style={{ display: 'flex', position: 'absolute', bottom: 26, right: 34, fontSize: 20, fontWeight: 900, color: accent }}>puzzlthink.com</div>
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts, headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400' } },
  );
}
