"use client";

import { ArrowRight, Bot, Brain, Grid3X3, Sparkles, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

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

function SudokuPreview() {
  const nums = ['8', '', '4', '', '2', '', '1', '', '7', '', '6', '', '9', '', '3', '5'];
  return <div className="grid aspect-square w-[62%] grid-cols-4 overflow-hidden rounded-2xl border-4 border-[#17201e] bg-white shadow-2xl">{nums.map((num, index) => <span key={index} className={`flex items-center justify-center border-b border-r border-black/15 text-sm font-black text-[#293634] sm:text-lg ${index === 5 || index === 10 ? 'bg-[#edf2ff] text-[#4b7bff]' : ''}`}>{num}</span>)}</div>;
}

export default function HomeClient() {
  const t = useTranslations('Home');
  const games = [
    { title: 'WALLGO', display: 'Wallgo', description: t('wallgoDescription'), href: '/wallgo', status: t('new'), meta: t('soloAi'), color: '#ff6b4a', illustration: 'wallgo' },
    { title: 'SUDOKU', display: 'Sudoku', description: t('sudokuDescription'), href: '/play', status: t('classic'), meta: t('soloLevels'), color: '#4b7bff', illustration: 'sudoku' },
  ] as const;

  return <main className="min-h-screen bg-[#f3f0e8] text-[#17201e]"><section className="relative overflow-hidden px-5 pb-16 pt-20 sm:pb-24 sm:pt-28"><div className="pointer-events-none absolute left-1/2 top-0 h-[440px] w-[700px] -translate-x-1/2 rounded-full bg-[#f7df9e]/40 blur-3xl" /><div className="relative mx-auto max-w-6xl">
    <div className="mx-auto max-w-3xl text-center"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-black tracking-[0.18em] text-black/50 backdrop-blur"><Sparkles size={12} className="text-[#ff6b4a]" /> {t('eyebrow')}</div><h1 className="text-balance text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-7xl">{t('title1')}<br />{t('title2')}</h1><p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-black/50 sm:text-base">{t('description1')}<br className="hidden sm:block" /> {t('description2')}</p></div>
    <div className="mt-12 grid gap-5 md:grid-cols-2">{games.map((game) => <Link key={game.title} href={game.href} className="group relative overflow-hidden rounded-[32px] border border-black/10 bg-[#f9f7f1] p-5 shadow-[0_18px_50px_rgba(30,38,36,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(30,38,36,0.14)] sm:p-7"><div className="flex items-center justify-between"><span className="rounded-full px-3 py-1 text-[10px] font-black tracking-[0.15em] text-white" style={{ background: game.color }}>{game.status}</span><span className="text-[10px] font-black tracking-[0.16em] text-black/30">{game.title}</span></div><div className="flex h-[280px] items-center justify-center sm:h-[330px]">{game.illustration === 'wallgo' ? <WallGoPreview /> : <SudokuPreview />}</div><div className="flex items-end justify-between gap-5"><div><h2 className="text-3xl font-black tracking-[-0.04em]">{game.display}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-black/50">{game.description}</p><div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-black/40">{game.illustration === 'wallgo' ? <Bot size={14} /> : <Brain size={14} />}{game.meta}</div></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#17201e] text-white transition group-hover:rotate-[-8deg] group-hover:scale-110"><ArrowRight size={20} /></span></div></Link>)}</div>
    <div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><Grid3X3 size={18} /><div><p className="text-xs font-extrabold">{t('clearRules')}</p><p className="text-[11px] text-black/40">{t('clearRulesDesc')}</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><Bot size={18} /><div><p className="text-xs font-extrabold">{t('instantPlay')}</p><p className="text-[11px] text-black/40">{t('instantPlayDesc')}</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><UsersRound size={18} /><div><p className="text-xs font-extrabold">{t('growing')}</p><p className="text-[11px] text-black/40">{t('growingDesc')}</p></div></div></div>
  </div></section></main>;
}
