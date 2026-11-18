"use client";

import { ArrowRight, Bot, Brain, Crosshair, Grid3X3, Sparkles, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { prepareHostedRoom } from '@/hooks/useWallGoRoom';
import { prepareJanggiRoom } from '@/hooks/useJanggiRoom';
import { prepareHeavy13Room } from '@/hooks/useHeavy13Room';
import { prepareRussianRouletteRoom } from '@/hooks/useRussianRouletteRoom';
import { prepareRussianJanggiRoom } from '@/hooks/useRussianJanggiRoom';
import { prepareBlindGomokuRoom } from '@/hooks/useBlindGomokuRoom';
import { prepareLaserJanggiRoom } from '@/hooks/useLaserJanggiRoom';
import { prepareBlackWhiteRoom } from '@/hooks/useBlackWhiteRoom';
import { prepareBlackWhite2Room } from '@/hooks/useBlackWhite2Room';
import LaserPiece from './laserJanggi/LaserPiece';
import { prepareNemoRoom } from '@/hooks/useNemoRoom';
import { prepareHexagonRoom } from '@/hooks/useHexagonRoom';
import { initialState } from '@/lib/janggi';
import JanggiPiece from './janggi/JanggiPiece';
import RJPiece, { CUP_RATIO } from './russianJanggi/RJPiece';
import VisitCounter from './VisitCounter';
import { Pedestal } from './piggyBank/PiggyParts';
import { preparePiggyRoom } from '@/hooks/usePiggyRoom';
import OpenMatchCard from './OpenMatchCard';

const MODE_BASE = 'flex flex-col items-center gap-0.5 rounded-2xl border px-2 py-2.5 text-center transition hover:-translate-y-0.5 sm:gap-1 sm:py-3';
const MODE_BUTTON = `${MODE_BASE} border-black/10 bg-white/70 hover:border-black/25 hover:bg-white`;

function MiniFace({ color, shape = 'circle' }: { color: string; shape?: 'circle' | 'square' | 'hex' }) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-[35%]' : '[clip-path:polygon(25%_5%,75%_5%,100%_50%,75%_95%,25%_95%,0_50%)]';
  return <b className={`absolute inset-[16%] flex items-center justify-center gap-[14%] shadow-md ring-2 ring-white ${shapeClass}`} style={{ background: color }}><i className="h-[18%] w-[14%] rounded-full bg-white shadow-[inset_0_-2px_0_rgba(0,0,0,.18)]" /><i className="h-[18%] w-[14%] rounded-full bg-white shadow-[inset_0_-2px_0_rgba(0,0,0,.18)]" /></b>;
}

function WallGoPreview() {
  return <div className="relative grid aspect-square w-full grid-cols-5 overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[#fbfaf5] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
    {Array.from({ length: 25 }).map((_, index) => <span key={index} className="relative border-b border-r border-black/10">
      {[6, 13, 16].includes(index) && <i className="absolute -right-1 top-0 z-10 h-full w-2 rounded-full bg-[#17201e]" />}
      {[8, 17].includes(index) && <i className="absolute -bottom-1 left-0 z-10 h-2 w-full rounded-full bg-[#17201e]" />}
      {index === 7 && <MiniFace color="#ff6b4a" />}{index === 18 && <MiniFace color="#4b7bff" shape="square" />}{index === 21 && <MiniFace color="#12a594" shape="hex" />}
    </span>)}
  </div>;
}

function BlindGomokuPreview() {
  const stones = new Map<number, string>([[7, '#ef4957'], [8, '#ef4957'], [12, '#4e87ed'], [13, '#f4cf4b'], [17, '#4e87ed'], [18, '#f4cf4b'], [19, '#49bf83']]);
  return <div className="relative grid aspect-square w-full grid-cols-5 overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[#080c12] p-2 shadow-xl ring-1 ring-[#67e8ff]/30 sm:w-[62%] sm:rounded-2xl sm:border-4 sm:p-3 sm:shadow-2xl">
    <div className="absolute inset-[12%]" style={{ backgroundImage: 'linear-gradient(to right, transparent 49%, rgba(103,232,255,.35) 49%, rgba(103,232,255,.35) 51%, transparent 51%), linear-gradient(to bottom, transparent 49%, rgba(103,232,255,.35) 49%, rgba(103,232,255,.35) 51%, transparent 51%)', backgroundSize: '25% 25%' }} />
    {Array.from({ length: 25 }, (_, index) => <span key={index} className="relative z-10 flex items-center justify-center">{stones.has(index) && <MiniFace color={stones.get(index)!} />}</span>)}
    <span className="absolute right-2 top-2 z-20 rounded-full bg-[#17201e] px-2 py-1 text-[7px] font-black tracking-wider text-[#ffd166] sm:right-3 sm:top-3 sm:text-[9px]">HIDDEN</span>
  </div>;
}

/** The 돼지 저금통 table at 300×300: four stepped boxes with gold pigs around the clock. */
export function PiggyBankArt() {
  const box = (upper: number | null, lower: number | null, pos: string, active = false) => (
    <div className={`absolute ${pos}`}><Pedestal small upper={upper} lower={lower} active={active} buzz={false} /></div>
  );
  return (
    <div className="relative h-[300px] w-[300px] overflow-hidden rounded-[28px] border-4 border-[#17201e] shadow-2xl" style={{ background: 'radial-gradient(ellipse at 50% 45%, #4a5278 0%, #2b3150 55%, #181b2e 100%)' }}>
      <div className="pointer-events-none absolute inset-0 opacity-[.18]" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 0 1px, transparent 2px), radial-gradient(circle at 70% 60%, #fff 0 1px, transparent 2px)', backgroundSize: '38px 38px, 53px 53px' }} />
      {box(1, 3, 'left-[100px] top-[4px]', true)}
      {box(null, 4, 'left-[4px] top-[108px]')}
      {box(null, 2, 'right-[4px] top-[108px]')}
      {box(null, 5, 'left-[100px] bottom-[6px]')}
      <div className="absolute left-1/2 top-1/2 flex h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-[#ffd84a] bg-[#1a1c2c] font-mono text-xl font-black text-white">10</div>
      <span className="absolute left-[178px] top-[10px] rounded-lg bg-[#efe9ff] px-1.5 py-0.5 text-[11px] font-black text-[#2b2f4a] shadow">흑6</span>
    </div>
  );
}

function PiggyBankPreview() {
  return <div className="relative h-24 w-24 sm:h-[300px] sm:w-[300px]"><div className="absolute left-0 top-0 origin-top-left scale-[.32] sm:scale-100"><PiggyBankArt /></div></div>;
}

function HexagonPreview() {
  // The first broadcast board (rows 3-4-5-4-3) with the line Q-R-S (1+1+3 = target 5) picked out.
  const nums = [1, 6, 3, 2, 4, 5, 6, 2, 5, 2, 1, 3, 4, 5, 3, 5, 1, 1, 3];
  const s = 10, w = Math.sqrt(3) * s;
  const tiles: { x: number; y: number; v: number; on: boolean }[] = [];
  let i = 0;
  [3, 4, 5, 4, 3].forEach((len, row) => { for (let col = 0; col < len; col += 1) { tiles.push({ x: ((5 - len) * w) / 2 + col * w + w / 2, y: s + row * 1.5 * s, v: nums[i], on: i >= 16 }); i += 1; } });
  const hex = (x: number, y: number) => [0, 1, 2, 3, 4, 5].map((k) => { const a = (Math.PI / 180) * (60 * k - 90); return `${(x + (s - 0.6) * Math.cos(a)).toFixed(2)},${(y + (s - 0.6) * Math.sin(a)).toFixed(2)}`; }).join(' ');
  return <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[#15182a] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
    <svg viewBox={`-2 -2 ${5 * w + 4} ${8 * s + 4}`} className="w-[86%]">
      {tiles.map((tile, k) => <g key={k}><polygon points={hex(tile.x, tile.y)} fill={tile.on ? '#ffcf3f' : '#efe8d6'} stroke="#e8b04a" strokeWidth={tile.on ? 1 : 0.4} /><text x={tile.x} y={tile.y + 3.4} textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#17140d" fontFamily="Georgia, serif">{tile.v}</text></g>)}
    </svg>
    <span className="absolute right-[5%] top-[5%] rounded bg-[#2b2414] px-1 py-0.5 font-serif text-[8px] font-black text-[#f3e6c4] sm:px-2 sm:text-base">5</span>
  </div>;
}

function NemoCountPreview() {
  // A 3×3 corner of the broadcast board with one rectangle that makes the target picked out.
  const cells = [1, 8, 6, 3, 5, 2, 7, 4, 9];
  return <div className="relative w-full rounded-xl border-[3px] border-[#17201e] bg-[#5d6478] p-2 shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:p-4 sm:shadow-2xl">
    <span className="absolute right-1.5 top-1.5 rounded-[3px] bg-[#2c2e4b] px-1 text-center font-serif text-[7px] font-black leading-tight text-[#d6d9e8] sm:right-3 sm:top-3 sm:px-2 sm:py-1 sm:text-[11px]">TARGET<br /><b className="text-[10px] sm:text-xl">20</b></span>
    <div className="relative mt-3 grid w-[78%] grid-cols-3 sm:mt-6">{cells.map((v, i) => <span key={i} className="flex aspect-square items-center justify-center border border-[#1a1d3a] bg-gradient-to-b from-[#e4e5ea] to-[#c9cbd3] font-serif text-[10px] font-black text-[#15161d] sm:text-2xl">{v}</span>)}
      <span className="pointer-events-none absolute left-[33.3%] top-[33.3%] h-[66.7%] w-[66.7%] rounded-[2px] border-2 border-[#ffcf3f] bg-[#ffcf3f]/25 sm:border-[3px]" />
    </div>
  </div>;
}

function LaserJanggiPreview() {
  const pieces = [
    { id:'hp-l',owner:0 as const,type:'laser' as const,row:0,col:0,direction:1 as const },
    { id:'hp-t',owner:0 as const,type:'triangle' as const,row:0,col:0,direction:1 as const },
    { id:'hp-s',owner:1 as const,type:'splitter' as const,row:0,col:0,direction:0 as const },
    { id:'hp-k',owner:1 as const,type:'king' as const,row:0,col:0,direction:0 as const },
  ];
  return <div className="relative grid aspect-square w-full grid-cols-4 grid-rows-4 overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[#05080d] p-2 shadow-xl ring-1 ring-[#59e6ff]/30 sm:w-[62%] sm:rounded-2xl sm:border-4 sm:p-3 sm:shadow-2xl">{Array.from({length:16},(_,i)=><span key={i} className="border-b border-r border-[#59e6ff]/20" />)}<span className="absolute left-[9%] top-[58%] h-[22%] w-[22%]"><LaserPiece piece={pieces[0]} /></span><span className="absolute left-[38%] top-[58%] h-[22%] w-[22%]"><LaserPiece piece={pieces[1]} /></span><span className="absolute right-[10%] top-[12%] h-[22%] w-[22%]"><LaserPiece piece={pieces[3]} /></span><span className="absolute right-[38%] top-[34%] h-[22%] w-[22%]"><LaserPiece piece={pieces[2]} /></span><i className="absolute left-[27%] top-[68.5%] h-[2px] w-[20%] bg-[#59e6ff] shadow-[0_0_8px_#59e6ff]" /><i className="absolute left-[48%] top-[49%] h-[20%] w-[2px] bg-[#ff4d6d] shadow-[0_0_8px_#ff4d6d]" /></div>;
}

function BlackWhitePreview() {
  // My tile face up, the other side's tile face down: only its colour shows.
  const tile = (black: boolean, n: string, tilt: string) => <span className={`flex aspect-[5/7] w-[34%] items-center justify-center rounded-[10%] border-2 text-[22px] font-black shadow-xl sm:text-6xl ${tilt} ${black ? 'border-[#55555e] bg-gradient-to-b from-[#34343b] to-[#050506] text-[#f4efe4]' : 'border-white bg-gradient-to-b from-[#fffdf8] to-[#cfc8ba] text-[#0d0d10]'}`}>{n}</span>;
  return <div className="relative flex aspect-square w-full items-center justify-center gap-[6%] overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[#121217] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(233,196,106,.22),transparent_65%)]" />
    {tile(false, '7', '-rotate-6')}{tile(true, '?', 'rotate-6')}
    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#e9c46a] px-2 py-0.5 text-[7px] font-black tracking-wider text-[#17120a] sm:bottom-4 sm:text-[10px]">WIN?</span>
  </div>;
}

function BlackWhite2Preview() {
  const card = (black: boolean, n: string) => <span className={`flex aspect-[5/7] w-[30%] items-center justify-center rounded-[10%] border-2 text-[20px] font-black shadow-xl sm:text-5xl ${black ? 'border-[#55555e] bg-gradient-to-b from-[#34343b] to-[#050506] text-[#f4efe4]' : 'border-white bg-gradient-to-b from-[#fffdf8] to-[#cfc8ba] text-[#0d0d10]'}`}>{n}</span>;
  return <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[#121217] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,51,64,.22),transparent_65%)]" /><div className="relative flex items-center justify-center gap-[8%]">{card(true, '9')}{card(false, '?')}</div><div className="relative mt-[8%] flex gap-1.5 sm:gap-3">{Array.from({ length: 5 }, (_, index) => <i key={index} className={`h-2.5 w-2.5 rotate-45 rounded-[2px] sm:h-5 sm:w-5 ${index < 4 ? 'bg-[#ef3340] shadow-[0_0_10px_#ef3340]' : 'bg-white/10'}`} />)}</div><span className="absolute bottom-2 rounded-full bg-[#ef3340] px-2 py-0.5 text-[7px] font-black tracking-wider text-white sm:bottom-4 sm:text-[10px]">99 POINTS</span></div>;
}

function JanggiPreview() {
  const board = initialState(0).board;
  return <div className="grid w-[74%] grid-cols-3 gap-0.5 rounded-xl border-[3px] border-[#17201e] bg-[#14161c] p-1 shadow-xl sm:w-[48%] sm:gap-1.5 sm:rounded-2xl sm:border-4 sm:p-2 sm:shadow-2xl">
    {board.map((piece, i) => <span key={i} className={`relative aspect-square rounded-lg ${i < 3 ? 'bg-[#17c39a]/15' : i > 8 ? 'bg-[#ff5b3a]/15' : 'bg-white/[0.04]'}`}>{piece && <JanggiPiece type={piece.type} owner={piece.owner} flipped={piece.owner === 1} showReading={false} className="absolute inset-[6%] h-[88%] w-[88%]" />}</span>)}
  </div>;
}

function Heavy13Preview() {
  const stands: [string, number[]][] = [['#f0524f', [6, 5]], ['#34c47c', [3, 2, 4]], ['#4f7cf0', [5]]];
  return <div className="grid w-full grid-cols-3 gap-1 rounded-xl border-[3px] border-[#17201e] bg-[#14161b] p-1.5 shadow-xl sm:w-[66%] sm:gap-2 sm:rounded-2xl sm:border-4 sm:p-3 sm:shadow-2xl">
    {stands.map(([color, cubes]) => <div key={color} className="flex flex-col rounded-md p-1 sm:rounded-xl sm:p-2" style={{ background: `${color}22`, border: `1px solid ${color}66` }}>
      <span className="font-mono text-[10px] font-black text-white sm:text-xl">{cubes.reduce((a, b) => a + b, 0)}<span className="text-[7px] text-white/40 sm:text-[10px]">/13</span></span>
      <div className="mt-1 grid h-12 grid-cols-2 content-end gap-0.5 sm:h-28 sm:gap-1">{[...cubes.keys()].reduce<number[][]>((rows, i) => (i % 2 ? rows[rows.length - 1].push(i) : rows.push([i]), rows), []).reverse().flat().map((i) => <span key={i} className={`flex aspect-square items-center justify-center rounded-[3px] text-[7px] font-black text-[#2a2118] sm:rounded-md sm:text-xs ${i % 2 === 0 && i === cubes.length - 1 ? 'col-start-1' : ''}`} style={{ background: 'linear-gradient(#f1e6cf,#bfa883)' }}>{cubes[i]}</span>)}</div>
    </div>)}
  </div>;
}

function RussianRoulettePreview() {
  return <div className="relative flex aspect-square w-full items-center justify-center rounded-full border-[3px] border-[#17201e] bg-[#111722] shadow-xl sm:w-[62%] sm:border-4 sm:shadow-2xl"><span className="absolute left-1/2 top-[2%] h-[28%] w-1.5 -translate-x-1/2 rounded-full bg-[#65e5ff] shadow-[0_0_12px_#65e5ff]" /><div className="relative h-[64%] w-[64%] rounded-full border-4 border-[#34404d] bg-[#202a36] shadow-[inset_0_0_24px_#000]">{Array.from({ length: 6 }, (_, i) => { const angle = (i * 60 - 90) * Math.PI / 180; return <i key={i} className={`absolute h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${i === 1 || i === 4 ? 'border-[#ffcf58] bg-[#c98b2e]' : 'border-white/10 bg-[#080c12]'}`} style={{ left: `${50 + Math.cos(angle) * 33}%`, top: `${50 + Math.sin(angle) * 33}%` }} />; })}<b className="absolute left-1/2 top-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#080c12]" /></div></div>;
}

function RussianJanggiPreview() {
  // [owner, sizes bottom → top]: one cell shows a big cup that has swallowed a small one.
  const cells: ([0 | 1, (0 | 1 | 2)[]] | null)[] = [[1, [2]], null, [0, [0]], null, [0, [1, 2]], [1, [1]], [0, [1]], null, [1, [0]]];
  return <div className="grid aspect-square w-full grid-cols-3 gap-1 rounded-xl border-[3px] border-[#17201e] bg-[#2a1d14] p-1 shadow-xl sm:w-[58%] sm:gap-1.5 sm:rounded-2xl sm:border-4 sm:p-2 sm:shadow-2xl">
    {cells.map((cell, i) => <span key={i} className="relative rounded-md bg-[#6b4a2f] shadow-[inset_0_4px_10px_rgba(0,0,0,.5)] sm:rounded-lg">{cell && <RJPiece owner={cell[0]} size={cell[1][cell[1].length - 1]} className="absolute inset-x-0 bottom-[10%] mx-auto" style={{ width: `${[50, 70, 90][cell[1][cell[1].length - 1]]}%`, aspectRatio: `${CUP_RATIO}` }} />}</span>)}
  </div>;
}

function SudokuPreview() {
  const nums = ['8', '', '4', '', '2', '', '1', '', '7', '', '6', '', '9', '', '3', '5'];
  return <div className="grid aspect-square w-full grid-cols-4 overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-white text-[10px] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:text-base sm:shadow-2xl">{nums.map((num, index) => <span key={index} className={`flex items-center justify-center border-b border-r border-black/15 font-black text-[#293634] sm:text-lg ${index === 5 || index === 10 ? 'bg-[#edf2ff] text-[#4b7bff]' : ''}`}>{num}</span>)}</div>;
}

/** Programme tag on each card. Devil's Plan 3 (on air now) gets a dark plate with glowing red letters. */
function ShowTag({ show, color, label }: { show: string; color: string; label: string }) {
  if (show === 'dp3') {
    return <span className="dp3-tag rounded-full border border-[#ff2d55]/60 bg-[#0b0a10] px-3 py-1 text-[10px] font-black tracking-[0.12em] text-[#ff5c7a]">{label}</span>;
  }
  return <span className="rounded-full px-3 py-1 text-[10px] font-black tracking-[0.12em] text-white" style={{ background: color }}>{label}</span>;
}

export default function HomeClient() {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');
  const router = useRouter();
  // Order: the hot Devil's Plan 3 games first, then the rest (헥사곤, made at a supporter's request, right after them). `show` is the programme each game is from.
  const games = [
    { title: 'PIGGY BANK', display: tc('piggyBank'), description: t('piggyBankDescription'), href: '/piggy-bank', show: 'dp3', meta: t('piggyBankMeta'), color: '#e0a91c', illustration: 'piggyBank' },
    { title: 'NEMO COUNT', display: tc('nemoCount'), description: t('nemoCountDescription'), href: '/nemo-count', show: 'dp3', meta: t('nemoCountMeta'), color: '#7d86a8', illustration: 'nemoCount' },
    { title: 'HEAVY 13', display: tc('heavy13'), description: t('heavy13Description'), href: '/heavy13', show: 'dp3', meta: t('heavy13Meta'), color: '#c9a061', illustration: 'heavy13' },
    { title: 'RUSSIAN ROULETTE', display: tc('russianRoulette'), description: t('rouletteDescription'), href: '/russian-roulette', show: 'dp3', meta: t('rouletteMeta'), color: '#238ca8', illustration: 'roulette' },
    { title: 'WALLGO', display: tc('wallgo'), description: t('wallgoDescription'), href: '/wallgo', show: 'dp3', meta: t('soloAi'), color: '#ff6b4a', illustration: 'wallgo' },
    { title: 'HEXAGON', display: tc('hexagon'), description: t('hexagonDescription'), href: '/hexagon', show: 'dp1', meta: t('hexagonMeta'), color: '#e8b04a', illustration: 'hexagon', sponsor: true },
    { title: 'BLACK & WHITE', display: tc('blackWhite'), description: t('blackWhiteDescription'), href: '/black-white', show: 'genius2', meta: t('blackWhiteMeta'), color: '#2b2b31', illustration: 'blackWhite' },
    { title: 'BLACK & WHITE II', display: tc('blackWhite2'), description: t('blackWhite2Description'), href: '/black-white-2', show: 'genius3', meta: t('blackWhite2Meta'), color: '#ef3340', illustration: 'blackWhite2' },
    { title: 'LASER JANGGI', display: tc('laserJanggi'), description: t('laserJanggiDescription'), href: '/laser-janggi', show: 'genius2', meta: t('laserJanggiMeta'), color: '#28b9d7', illustration: 'laserJanggi' },
    { title: 'RUSSIAN JANGGI', display: tc('russianJanggi'), description: t('rjanggiDescription'), href: '/russian-janggi', show: 'society2', meta: t('rjanggiMeta'), color: '#e2283c', illustration: 'rjanggi' },
    { title: 'BLIND GOMOKU', display: tc('blindGomoku'), description: t('blindGomokuDescription'), href: '/blind-gomoku', show: 'dp1', meta: t('blindGomokuMeta'), color: '#d39b2f', illustration: 'blindGomoku' },
    { title: '12 JANGGI', display: tc('janggi'), description: t('janggiDescription'), href: '/janggi', show: 'genius34', meta: t('janggiMeta'), color: '#e8a33c', illustration: 'janggi' },
    { title: 'SUDOKU', display: tc('sudoku'), description: t('sudokuDescription'), href: '/play', show: 'classic', meta: t('soloLevels'), color: '#4b7bff', illustration: 'sudoku' },
  ] as const;

  return <main className="min-h-screen bg-[#f3f0e8] text-[#17201e]"><section className="relative overflow-hidden px-4 pb-12 pt-10 sm:px-5 sm:pb-24 sm:pt-28"><div className="pointer-events-none absolute left-1/2 top-0 h-[440px] w-[700px] -translate-x-1/2 rounded-full bg-[#f7df9e]/40 blur-3xl" /><div className="relative mx-auto max-w-6xl">
    <div className="mx-auto max-w-3xl text-center"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-black tracking-[0.18em] text-black/50 backdrop-blur"><Sparkles size={12} className="text-[#ff6b4a]" /> {t('eyebrow')}</div><h1 className="text-balance break-keep text-[2.4rem] font-black leading-[1.05] tracking-[-0.05em] sm:text-7xl sm:leading-[0.98]">{t('title1')}<br />{t('title2')}</h1><p className="mx-auto mt-4 max-w-xl break-keep text-sm leading-6 text-black/55 sm:mt-6 sm:text-base sm:leading-7">{t('description1')}<br className="hidden sm:block" /> {t('description2')}</p><VisitCounter /></div>
    <div className="mt-8 grid gap-3 sm:mt-12 sm:gap-5 md:grid-cols-2"><OpenMatchCard previews={{
      hexagon: <HexagonPreview />, piggyBank: <PiggyBankArt />, nemoCount: <NemoCountPreview />, blackWhite: <BlackWhitePreview />, blackWhite2: <BlackWhite2Preview />, laserJanggi: <LaserJanggiPreview />,
      blindGomoku: <BlindGomokuPreview />, wallgo: <WallGoPreview />, russianRoulette: <RussianRoulettePreview />, heavy13: <Heavy13Preview />,
      janggi: <JanggiPreview />, russianJanggi: <RussianJanggiPreview />,
    }} />{games.map((game) => (
      <div key={game.title} className="group relative flex flex-col overflow-hidden rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4 shadow-[0_18px_50px_rgba(30,38,36,0.08)] sm:rounded-[32px] sm:p-5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(30,38,36,0.14)] sm:p-7">
        <Link href={game.href} className="block flex-1">
          <div className="flex items-center justify-between"><span className="flex flex-wrap items-center gap-1.5"><ShowTag show={game.show} color={game.color} label={game.show === 'classic' ? t('classic') : t(`show_${game.show}`)} />{'sponsor' in game && <span className="rounded-full border border-[#e8b04a]/60 bg-[#fbf2dc] px-3 py-1 text-[10px] font-black tracking-[0.12em] text-[#9a6a12]">♥ {t('sponsorTag')}</span>}</span><span className="text-[10px] font-black tracking-[0.16em] text-black/30">{game.title}</span></div>
          <div className="mt-3 flex items-center gap-4 sm:mt-0 sm:block">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center sm:h-[330px] sm:w-auto">{game.illustration === 'hexagon' ? <HexagonPreview /> : game.illustration === 'piggyBank' ? <PiggyBankPreview /> : game.illustration === 'nemoCount' ? <NemoCountPreview /> : game.illustration === 'laserJanggi' ? <LaserJanggiPreview /> : game.illustration === 'blackWhite' ? <BlackWhitePreview /> : game.illustration === 'blackWhite2' ? <BlackWhite2Preview /> : game.illustration === 'blindGomoku' ? <BlindGomokuPreview /> : game.illustration === 'wallgo' ? <WallGoPreview /> : game.illustration === 'roulette' ? <RussianRoulettePreview /> : game.illustration === 'janggi' ? <JanggiPreview /> : game.illustration === 'heavy13' ? <Heavy13Preview /> : game.illustration === 'rjanggi' ? <RussianJanggiPreview /> : <SudokuPreview />}</div>
            <div className="flex min-w-0 flex-1 items-end justify-between gap-3 sm:gap-5">
              <div className="min-w-0"><h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">{game.display}</h2><p className="mt-1 max-w-sm break-keep text-[13px] leading-5 text-black/50 sm:mt-2 sm:text-sm sm:leading-6">{game.description}</p><div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-black/40 sm:mt-4">{game.illustration === 'sudoku' ? <Brain size={14} /> : <Bot size={14} />}{game.meta}</div></div>
              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#17201e] text-white transition group-hover:rotate-[-8deg] group-hover:scale-110 sm:flex"><ArrowRight size={20} /></span>
            </div>
          </div>
        </Link>
        {game.illustration === 'hexagon' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35 sm:mb-2.5">{t('modeTitle')}</p>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/hexagon?mode=solo#play" className={MODE_BUTTON}><Brain size={15} className="text-[#c8932f]" /><span className="text-sm font-black">{t('modeHexSolo')}</span><span className="text-[10px] font-bold text-black/45">{t('modeHexSoloDesc')}</span></Link>
              <Link href="/hexagon?mode=challenge#play" className={MODE_BUTTON}><Sparkles size={15} className="text-[#c8932f]" /><span className="text-sm font-black">{t('modeHexChallenge')}</span><span className="text-[10px] font-bold text-black/45">{t('modeHexChallengeDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/hexagon/room/${await prepareHexagonRoom()}`)} className={`${MODE_BASE} border-[#e8b04a]/50 bg-[#fbf2dc] hover:border-[#e8b04a]`}><UsersRound size={15} className="text-[#c8932f]" /><span className="text-sm font-black">{t('modeHexFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeHexFriendDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'piggyBank' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35 sm:mb-2.5">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/piggy-bank" className={MODE_BUTTON}><Bot size={15} className="text-[#e0a91c]" /><span className="text-sm font-black">{t('modePiggyAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modePiggyAiDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/piggy-bank/room/${await preparePiggyRoom()}`)} className={`${MODE_BASE} border-[#e0a91c]/45 bg-[#fdf4dc] hover:border-[#e0a91c]`}><UsersRound size={15} className="text-[#e0a91c]" /><span className="text-sm font-black">{t('modePiggyFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modePiggyFriendDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'nemoCount' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35 sm:mb-2.5">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/nemo-count" className={MODE_BUTTON}><Brain size={15} className="text-[#7d86a8]" /><span className="text-sm font-black">{t('modeNemoSolo')}</span><span className="text-[10px] font-bold text-black/45">{t('modeNemoSoloDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/nemo-count/room/${await prepareNemoRoom()}`)} className={`${MODE_BASE} border-[#7d86a8]/45 bg-[#eef0f7] hover:border-[#7d86a8]`}><UsersRound size={15} className="text-[#7d86a8]" /><span className="text-sm font-black">{t('modeNemoFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeNemoFriendDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'blackWhite' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/black-white" className={MODE_BUTTON}><Bot size={15} className="text-[#2b2b31]" /><span className="text-sm font-black">{t('modeBwAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeBwAiDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/black-white/room/${await prepareBlackWhiteRoom()}`)} className={`${MODE_BASE} border-[#2b2b31]/35 bg-[#ecebe8] hover:border-[#2b2b31]`}><UsersRound size={15} className="text-[#2b2b31]" /><span className="text-sm font-black">{t('modeBwFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeBwFriendDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'blackWhite2' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/black-white-2" className={MODE_BUTTON}><Bot size={15} className="text-[#ef3340]" /><span className="text-sm font-black">{t('modeBw2Ai')}</span><span className="text-[10px] font-bold text-black/45">{t('modeBw2AiDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/black-white-2/room/${await prepareBlackWhite2Room()}`)} className={`${MODE_BASE} border-[#ef3340]/35 bg-[#fdecee] hover:border-[#ef3340]`}><UsersRound size={15} className="text-[#ef3340]" /><span className="text-sm font-black">{t('modeBw2Friend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeBw2FriendDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'laserJanggi' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/laser-janggi" className={MODE_BUTTON}><Bot size={15} className="text-[#28b9d7]" /><span className="text-sm font-black">{t('modeLaserAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeLaserAiDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/laser-janggi/room/${await prepareLaserJanggiRoom()}`)} className={`${MODE_BASE} border-[#28b9d7]/45 bg-[#e8f8fb] hover:border-[#28b9d7]`}><UsersRound size={15} className="text-[#28b9d7]" /><span className="text-sm font-black">{t('modeLaserFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeLaserFriendDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'blindGomoku' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35 sm:mb-2.5">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/blind-gomoku" className={MODE_BUTTON}><Bot size={15} className="text-[#d39b2f]" /><span className="text-sm font-black">{t('modeBlindAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeBlindAiDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/blind-gomoku/room/${await prepareBlindGomokuRoom()}`)} className={`${MODE_BASE} border-[#d39b2f]/45 bg-[#fdf4e2] hover:border-[#d39b2f]`}><UsersRound size={15} className="text-[#d39b2f]" /><span className="text-sm font-black">{t('modeBlindFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeBlindFriendDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'heavy13' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35 sm:mb-2.5">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/heavy13" className={MODE_BUTTON}><Bot size={15} className="text-[#c9a061]" /><span className="text-sm font-black">{t('modeHeavyAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeHeavyAiDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/heavy13/room/${await prepareHeavy13Room()}`)} className={`${MODE_BASE} border-[#c9a061]/50 bg-[#fbf3e4] hover:border-[#c9a061]`}><UsersRound size={15} className="text-[#c9a061]" /><span className="text-sm font-black">{t('modeHeavyFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeHeavyFriendDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'roulette' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35 sm:mb-2.5">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/russian-roulette" className={MODE_BUTTON}><Crosshair size={15} className="text-[#238ca8]" /><span className="text-sm font-black">{t('modeRouletteAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeRouletteAiDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/russian-roulette/room/${await prepareRussianRouletteRoom()}`)} className={`${MODE_BASE} border-[#238ca8]/45 bg-[#e9f7fa] hover:border-[#238ca8]`}><UsersRound size={15} className="text-[#238ca8]" /><span className="text-sm font-black">{t('modeRouletteFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeRouletteFriendDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'rjanggi' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35 sm:mb-2.5">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/russian-janggi" className={MODE_BUTTON}><Bot size={15} className="text-[#e2283c]" /><span className="text-sm font-black">{t('modeRjAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeRjAiDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/russian-janggi/room/${await prepareRussianJanggiRoom()}`)} className={`${MODE_BASE} border-[#e2283c]/35 bg-[#fdecee] hover:border-[#e2283c]`}><UsersRound size={15} className="text-[#e2283c]" /><span className="text-sm font-black">{t('modeRjFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeRjFriendDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'janggi' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35 sm:mb-2.5">{t('modeTitle')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/janggi" className={MODE_BUTTON}><Bot size={15} className="text-[#e8a33c]" /><span className="text-sm font-black">{t('modeAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeAiDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/janggi/room/${await prepareJanggiRoom()}`)} className={`${MODE_BASE} border-[#e8a33c]/40 bg-[#fff6e5] hover:border-[#e8a33c]`}><UsersRound size={15} className="text-[#e8a33c]" /><span className="text-sm font-black">{t('modeFriendJanggi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeFriendJanggiDesc')}</span></button>
            </div>
          </div>
        )}
        {game.illustration === 'wallgo' && (
          <div className="mt-4 border-t border-black/[0.07] pt-3 sm:mt-5 sm:pt-4">
            <p className="mb-2 text-[10px] font-black tracking-[0.16em] text-black/35 sm:mb-2.5">{t('modeTitle')}</p>
            <div className="grid grid-cols-3 gap-2">
              <Link href={{ pathname: '/wallgo', query: { mode: 'three' } }} className={MODE_BUTTON}><Bot size={15} className="text-[#ff6b4a]" /><span className="text-sm font-black">{t('modeThreeAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeThreeAiDesc')}</span></Link>
              <Link href={{ pathname: '/wallgo', query: { mode: 'two' } }} className={MODE_BUTTON}><Bot size={15} className="text-[#4b7bff]" /><span className="text-sm font-black">{t('modeTwoAi')}</span><span className="text-[10px] font-bold text-black/45">{t('modeTwoAiDesc')}</span></Link>
              <button type="button" onClick={async () => router.push(`/wallgo/room/${await prepareHostedRoom('two')}`)} className={`${MODE_BASE} border-[#ff6b4a]/40 bg-[#fff0eb] hover:border-[#ff6b4a]`}><UsersRound size={15} className="text-[#ff6b4a]" /><span className="text-sm font-black">{t('modeFriend')}</span><span className="text-[10px] font-bold text-black/45">{t('modeFriendDesc')}</span></button>
            </div>
          </div>
        )}
      </div>
    ))}</div>
    <div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><Grid3X3 size={18} /><div><p className="text-xs font-extrabold">{t('clearRules')}</p><p className="text-[11px] text-black/40">{t('clearRulesDesc')}</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><Bot size={18} /><div><p className="text-xs font-extrabold">{t('instantPlay')}</p><p className="text-[11px] text-black/40">{t('instantPlayDesc')}</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/40 p-4"><UsersRound size={18} /><div><p className="text-xs font-extrabold">{t('growing')}</p><p className="text-[11px] text-black/40">{t('growingDesc')}</p></div></div></div>
  </div></section></main>;
}
