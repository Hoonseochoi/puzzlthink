import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }];
export const alt = 'PUZZLTHINK Russian Roulette';

const COPY = {
  ko: { kicker: '데블스 플랜 3', title: '러시안 룰렛', sub: '6개 약실 속 2발, 조사하고 돌리고 살아남기', modes: ['AI 5명과', '친구 초대'] },
  en: { kicker: "The Devil's Plan 3", title: 'Russian Roulette', sub: 'Two bullets in six chambers: inspect, spin, survive', modes: ['With 5 AIs', 'Invite friends'] },
};

async function render({ params }: { params: Promise<{ locale: string }> }) {
  const c = COPY[ogLocale((await params).locale)];
  const fonts = await fontsFor(ogText(c, ''));
  return new ImageResponse(
    <GameOgCard {...c} accent="#65e5ff" glow="rgba(101,229,255,0.25)" art={
    <div style={{ display: 'flex', position: 'relative', width: 380, height: 380, borderRadius: 999, border: '6px solid #34404d', background: '#111722', alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: 6 }).map((_, i) => { const a = ((i * 60 - 90) * Math.PI) / 180; const gold = i === 1 || i === 4; return <div key={i} style={{ display: 'flex', position: 'absolute', left: 190 + Math.cos(a) * 115 - 45, top: 190 + Math.sin(a) * 115 - 45, width: 90, height: 90, borderRadius: 999, border: `6px solid ${gold ? '#ffcf58' : '#323c48'}`, background: gold ? '#c98b2e' : '#080c12' }} />; })}
      <div style={{ display: 'flex', width: 70, height: 70, borderRadius: 999, background: '#080c12', border: '4px solid #34404d' }} />
      <div style={{ display: 'flex', position: 'absolute', left: 186, top: -10, width: 8, height: 70, borderRadius: 4, background: '#65e5ff', boxShadow: '0 0 16px #65e5ff' }} />
    </div>
    } />,
    { ...size, fonts },
  );
}

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('russian-roulette', props, render);
}
