"use client";

import { ArrowRight, Bot, Brain, Grid3X3, Sparkles, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { prepareHostedRoom } from '@/hooks/useWallGoRoom';
import { prepareJanggiRoom } from '@/hooks/useJanggiRoom';
import { initialState } from '@/lib/janggi';
import JanggiPiece from './janggi/JanggiPiece';

const MODE_BASE = 'flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition hover:-translate-y-0.5';
const MODE_BUTTON = `${MODE_BASE} border-black/10 bg-white/70 hover:border-black/25 hover:bg-white`;

function MiniFace({ color, shape = 'circle' }: { color: string; shape?: 'circle' | 'square' | 'hex' }) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-[35%]' : '[clip-path:polygon(25%_5%,75%_5%,100%_50%,75%_95%,25%_95%,0_50%)]';
  return <b className={`absolute inset-[16%] flex items-center justify-center gap-[14%] shadow-md ring-2 ring-white ${shapeClass}`} style={{ background: color }}><i className="h-[18%] w-[14%] rounded-full bg-white shadow-[inset_0_-2px_0_rgba(0,0,0,.18)]" /><i className="h-[18%] w-[14%] rounded-full bg-white shadow-[inset_0_-2px_0_rgba(0,0,0,.18)]" /></b>;
}

function WallGoPreview() {
  return <div className="relative grid aspect-square w-[70%] grid-cols-5 overflow-hidden rounded-2xl border-4 border-[#17201e] bg-[#fbfaf5] shadow-2xl sm:w-[62%]">
    {Array.from({ length: 25 }).map((_, index) => <span key={index} className="relative border-b border-r border-black/10">
      {[6, 13, 16].includes(index) && <i className="absolute -right-1 top-0 z-10 h-full w-2 rounded-full bg-[#17201e]" />}
      {[8, 17].includes(index) && <i className="absolute -bottom-1 left-0 z-10 h-2 w-full rounded-full bg-[#17201e]" />}
      {index === 7 && <MiniFace color="#ff6b4a" />}{index === 18 && <MiniFace color="#4b7bff" shape="square" />}{index === 21 && <MiniFace color="#12a594" shape="hex" />}
    </span>)}
  </div>;
}

function JanggiPreview() {
  const board = initialState(0).board;
  return <div className="grid w-[56%] grid-cols-3 gap-1.5 rounded-2xl border-4 border-[#17201e] bg-[#14161c] p-2 shadow-2xl sm:w-[48%]">
    {board.map((piece, i) => <span key={i} className={`relative aspect-square rounded-lg ${i < 3 ? 'bg-[#17c39a]/15' : i > 8 ? 'bg-[#ff5b3a]/15' : 'bg-white/[0.04]'}`}>{piece && <JanggiPiece type={piece.type} owner={piece.owner} flipped={piece.owner === 1} showReading={false} className="absolute inset-[6%] h-[88%] w-[88%]" />}</span>)}
  </div>;
}

function SudokuPreview() {
  const nums = ['8', '', '4', '', '2', '', '1', '', '7', '', '6', '', '9', '', '3', '5'];
  return <div className="grid aspect-square w-[62%] grid-cols-4 overflow-hidden rounded-2xl border-4 border-[#17201e] bg-white shadow-2xl">{nums.map((num, index) => <span key={index} className={`flex items-center justify-center border-b border-r border-black/15 text-sm font-black text-[#293634] sm:text-lg ${index === 5 || index === 10 ? 'bg-[#edf2ff] text-[#4b7bff]' : ''}`}>{num}</span>)}</div>;
}

export default function HomeClient() {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');
  const router = useRouter();
  const games = [
    { title: 'WALLGO', display: 'Wallgo', description: t('wallgoDescription'), href: '/wallgo', status: t('new'), meta: t('soloAi'), color: '#ff6b4a', illustration: 'wallgo' },
    { title: '12 JANGGI', display: tc('janggi'), description: t('janggiDescription'), href: '/janggi', status: t('new'), meta: t('janggiMeta'), color: '#e8a33c', illustration: 'janggi' },
    { title: 'SUDOKU', display: 'Sudoku', description: t('sudokuDescription'), href: '/play', status: t('classic'), meta: t('soloLevels'), color: '#4b7bff', illustration: 'sudoku' },
  ] as const;

  return <main className="min-h-screen bg-[#f3f0e8] text-[#17201e]"><section className="relative overflow-hidden px-5 pb-16 pt-20 sm:pb-24 sm:pt-28"><div className="pointer-events-none absolute left-1/2 top-0 h-[440px] w-[700px] -translate-x-1/2 rounded-full bg-[#f7df9e]/40 blur-3xl" /><div className="relative mx-auto max-w-6xl">
    <div className="mx-auto max-w-3xl text-center"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-black tracking-[0.18em] text-black/50 backdrop-blur"><Sparkles size={12} className="text-[#ff6b4a]" /> {t('eyebrow')}</div><h1 className="text-balance text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-7xl">{t('title1')}<br />{t('title2')}</h1><p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-black/50 sm:text-base">{t('description1')}<br className="hidden sm:block" /> {t('description2')}</p></div>
    <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{games.map((game) => (
      <div key={game.title} className="group relative flex flex-col overflow-hidden rounded-[32px] border border-black/10 bg-[#f9f7f1] p-5 shadow-[0_18px_50px_rgba(30,38,36,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(30,38,36,0.14)] sm:p-7">
        <Link href={game.href} className="block flex-1">
          <div className="flex items-center justify-between"><span className="rounded-full px-3 py-1 text-[10px] font-black tracking-[0.15em] text-white" style={{ background: game.color }}>{game.status}</span><span className="text-[10px] font-black tracking-[0.16em] text-black/30">{game.title}</span></div>
          <div className="flex h-[280px] items-center justify-center sm:h-[330px]">{game.illustration === 'wallgo' ? <WallGoPreview /> : game.illustration === 'janggi' ? <JanggiPreview /> : <SudokuPreview />}</div>
          <div className="flex items-end justify-between gap-5"><div><h2 className="text-3xl font-black tracking-[-0.04em]">{game.display}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-black/50">{game.description}</p><div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-black/40">{game.illustration === 'sudoku' ? <Brain size={14} /> : <Bot size={14} />}{game.meta}</div></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#17201e] text-white transition group-hover:rotate-[-8deg] group-hover:scale-110"><ArrowRight size={20} /></span></div>
        </Link>
        {game.illustration === 'janggi' && (
          <div className="mt-5 border-t border-black/[0.07] pt-4">
            <p className="mb-2.5 text-[10px] font-black tracking-[0.16em] text-black/35">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/janggi" className={MODE_BUTTON}><Bot size={15} className="text-[#e8a33c]" /><span className="text-sm font-black">{t('modeAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeAiDesc')}</span></Link>
              <button type="button" onClick={() => router.push(`/janggi/room/${prepareJanggiRoom()}`)} className={`${MODE_BASE} border-[#e8a33c]/40 bg-[#fff6e5] hover:border-[#e8a33c]`}><UsersRound size={15} className="text-[#e8a33c]" /><span className="text-sm font-black">{t('modeFriendJanggi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeFriendJanggiDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'wallgo' && (
          <div className="mt-5 border-t border-black/[0.07] pt-4">
            <p className="mb-2.5 text-[10px] font-black tracking-[0.16em] text-black/35">{t('modeTitle')}</p>
            <div className="grid grid-cols-3 gap-2">
              <Link href={{ pathname: '/wallgo', query: { mode: 'three' } }} className={MODE_BUTTON}><Bot size={15} className="text-[#ff6b4a]" /><span className="text-sm font-black">{t('modeThreeAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeThreeAiDesc')}</span></Link>
              <Link href={{ pathname: '/wallgo', query: { mode: 'two' } }} className={MODE_BUTTON}><Bot size={15} className="text-[#4b7bff]" /><span className="text-sm font-black">{t('modeTwoAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeTwoAiDesc')}</span></Link>
              <button type="button" onClick={() => router.push(`/wallgo/room/${prepareHostedRoom('two')}`)} className={`${MODE_BASE} border-[#ff6b4a]/40 bg-[#fff0eb] hover:border-[#ff6b4a]`}><UsersRound size={15} className="text-[#ff6b4a]" /><span className="text-sm font-black">{t('modeFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeFriendDesc')}</span></button>
            </div>
          </div>
        )}
      </div>
    ))}</div>
    <div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><Grid3X3 size={18} /><div><p className="text-xs font-extrabold">{t('clearRules')}</p><p className="text-[11px] text-black/40">{t('clearRulesDesc')}</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><Bot size={18} /><div><p className="text-xs font-extrabold">{t('instantPlay')}</p><p className="text-[11px] text-black/40">{t('instantPlayDesc')}</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><UsersRound size={18} /><div><p className="text-xs font-extrabold">{t('growing')}</p><p className="text-[11px] text-black/40">{t('growingDesc')}</p></div></div></div>
  </div></section></main>;
}
