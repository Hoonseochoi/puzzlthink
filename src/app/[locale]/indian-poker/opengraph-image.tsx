import { ImageResponse } from 'next/og';
import { GameOgCard, OG_SIZE, fontsFor, ogLocale, ogText, cachedOg } from '@/lib/og';

export const size = OG_SIZE; export const contentType = 'image/png'; export const dynamic = 'force-static';
export const generateStaticParams = () => [{ locale: 'ko' }, { locale: 'en' }]; export const alt = 'PUZZLTHINK Indian Poker';
const COPY = { ko: { kicker: '더 지니어스 1', title: '인디언 포커', sub: '상대 패만 보고 베팅하는 단 한 장의 심리전', modes: ['AI 1:1', '친구 1:1'] }, en: { kicker: 'The Genius 1', title: 'Indian Poker', sub: 'See their card, never yours — bet, bluff, survive', modes: ['AI 1:1', 'Friend 1:1'] } };
const card = (label: string) => <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:125,height:190,borderRadius:16,background:'linear-gradient(#fffdf7,#ddd3c1)',border:'3px solid #fff',fontSize:82,fontWeight:900,color:'#17181d'}}>{label}</div>;
async function render({ params }: { params: Promise<{ locale: string }> }) { const c = COPY[ogLocale((await params).locale)]; const fonts = await fontsFor(ogText(c, '?8')); return new ImageResponse(<GameOgCard {...c} accent="#e6b94f" glow="rgba(230,185,79,.2)" art={<div style={{display:'flex',alignItems:'center',gap:24,padding:34,borderRadius:999,background:'#174a3d',border:'4px solid #976d29'}}>{card('?')}<div style={{display:'flex',fontSize:28,fontWeight:900,color:'#e6b94f'}}>VS</div>{card('8')}</div>} />, { ...size, fonts }); }

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  return cachedOg('indian-poker', props, render);
}
