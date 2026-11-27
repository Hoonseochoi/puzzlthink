import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE; export const contentType = 'image/png'; export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }]; export const alt = 'PUZZLTHINK Gyul Hap';
const COPY = { ko: { kicker: '더 지니어스 1', title: '결! 합!', sub: '모두 같거나 모두 다르게 — 마지막 결을 선점하라', modes: ['5분 · 10분', '친구 2–4인'] }, en: { kicker: 'The Genius 1', title: 'Gyul! Hap!', sub: 'All same or all different — claim the final Gyul', modes: ['5 · 10 min', '2–4 friends'] } };
async function render({ params }: { params: Promise<{ locale: string }> }) { const c = COPY[ogLocale((await params).locale)]; const fonts = await fontsFor(ogText(c)); const cards = [['#f4efe4','#21a5ff','50%'],['#777b83','#ff4d5e','8%'],['#111318','#ffd449','50%'],['#111318','#ff4d5e','8%'],['#f4efe4','#ffd449','50%'],['#777b83','#21a5ff','8%']]; return new ImageResponse(<GameOgCard {...c} accent="#ffcf3f" glow="rgba(255,207,63,.2)" art={<div style={{display:'flex',flexWrap:'wrap',width:330,gap:14}}>{cards.map(([bg,ink,r],i)=><div key={i} style={{display:'flex',alignItems:'center',justifyContent:'center',width:96,height:96,borderRadius:14,background:bg,border:'2px solid rgba(255,255,255,.15)'}}><div style={{width:48,height:48,borderRadius:r,background:ink}} /></div>)}</div>} />, { ...size, fonts }); }

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('gyulhap', props, render);
}
