"use client";

import { ArrowRight, Bot, Brain, Grid3X3, Sparkles, UsersRound } from 'lucide-react';
import { Link } from '@/i18n/routing';

const games = [
  { title: '벽바둑', english: 'WALLGO', description: '말을 옮기고 벽을 세워, 누구보다 넓은 나만의 영역을 만드세요.', href: '/wallgo', status: 'NEW', meta: '1인 · AI 대전', color: '#ff6b4a', illustration: 'wallgo' },
  { title: '스도쿠', english: 'SUDOKU', description: '매일 가볍게 시작하고, 끝까지 깊게 생각하는 클래식 숫자 퍼즐.', href: '/play', status: 'CLASSIC', meta: '1인 · 3단계', color: '#4b7bff', illustration: 'sudoku' },
];

function WallGoPreview() {
  return <div className="relative grid aspect-square w-[70%] grid-cols-5 overflow-hidden rounded-2xl border-4 border-[#17201e] bg-[#fbfaf5] shadow-2xl sm:w-[62%]">
    {Array.from({ length: 25 }).map((_, index) => <span key={index} className="relative border-b border-r border-black/10">
      {[6, 13, 16].includes(index) && <i className="absolute -right-1 top-0 z-10 h-full w-2 rounded-full bg-[#17201e]" />}
      {[8, 17].includes(index) && <i className="absolute -bottom-1 left-0 z-10 h-2 w-full rounded-full bg-[#17201e]" />}
      {index === 7 && <b className="absolute inset-[20%] rounded-full bg-[#ff6b4a] shadow-md ring-2 ring-white" />}
      {index === 18 && <b className="absolute inset-[20%] rounded-full bg-[#4b7bff] shadow-md ring-2 ring-white" />}
      {index === 21 && <b className="absolute inset-[20%] rounded-full bg-[#12a594] shadow-md ring-2 ring-white" />}
    </span>)}
  </div>;
}

function SudokuPreview() {
  const nums = ['8', '', '4', '', '2', '', '1', '', '7', '', '6', '', '9', '', '3', '5'];
  return <div className="grid aspect-square w-[62%] grid-cols-4 overflow-hidden rounded-2xl border-4 border-[#17201e] bg-white shadow-2xl">
    {nums.map((num, index) => <span key={index} className={`flex items-center justify-center border-b border-r border-black/15 text-sm font-black text-[#293634] sm:text-lg ${index === 5 || index === 10 ? 'bg-[#edf2ff] text-[#4b7bff]' : ''}`}>{num}</span>)}
  </div>;
}

export default function HomeClient() {
  return <main className="min-h-screen bg-[#f3f0e8] text-[#17201e]">
    <section className="relative overflow-hidden px-5 pb-16 pt-20 sm:pb-24 sm:pt-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[440px] w-[700px] -translate-x-1/2 rounded-full bg-[#f7df9e]/40 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-black tracking-[0.18em] text-black/50 backdrop-blur"><Sparkles size={12} className="text-[#ff6b4a]" /> THINK · PLAY · REPEAT</div>
          <h1 className="text-balance text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-7xl">생각이 머무는<br />작은 게임들</h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-black/50 sm:text-base">복잡한 가입도, 긴 설명도 없이 바로 시작하세요.<br className="hidden sm:block" /> 오늘은 벽을 세울까요, 숫자를 채울까요?</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {games.map((game) => <Link key={game.title} href={game.href} className="group relative overflow-hidden rounded-[32px] border border-black/10 bg-[#f9f7f1] p-5 shadow-[0_18px_50px_rgba(30,38,36,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(30,38,36,0.14)] sm:p-7">
            <div className="flex items-center justify-between"><span className="rounded-full px-3 py-1 text-[10px] font-black tracking-[0.15em] text-white" style={{ background: game.color }}>{game.status}</span><span className="text-[10px] font-black tracking-[0.16em] text-black/30">{game.english}</span></div>
            <div className="flex h-[280px] items-center justify-center sm:h-[330px]"><div className="absolute h-48 w-48 rounded-full opacity-10 blur-3xl" style={{ background: game.color }} />{game.illustration === 'wallgo' ? <WallGoPreview /> : <SudokuPreview />}</div>
            <div className="flex items-end justify-between gap-5"><div><h2 className="text-3xl font-black tracking-[-0.04em]">{game.title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-black/50">{game.description}</p><div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-black/40">{game.illustration === 'wallgo' ? <Bot size={14} /> : <Brain size={14} />}{game.meta}</div></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#17201e] text-white transition group-hover:rotate-[-8deg] group-hover:scale-110"><ArrowRight size={20} /></span></div>
          </Link>)}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><Grid3X3 size={18} /><div><p className="text-xs font-extrabold">선명한 규칙</p><p className="text-[11px] text-black/40">배우기 쉽고 깊이 있는 게임</p></div></div>
          <div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><Bot size={18} /><div><p className="text-xs font-extrabold">혼자서도 바로</p><p className="text-[11px] text-black/40">기다림 없는 AI 대전</p></div></div>
          <div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><UsersRound size={18} /><div><p className="text-xs font-extrabold">계속 확장 중</p><p className="text-[11px] text-black/40">새로운 보드게임을 차례로</p></div></div>
        </div>
      </div>
    </section>
  </main>;
}
