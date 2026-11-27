"use client";

import { useEffect, useState } from 'react';
import HomeApp from './HomeApp';
import HomeWeb from './HomeWeb';
import { MorrisBoard } from './morris/MorrisParts';
import LaserPiece from './laserJanggi/LaserPiece';
import { initialState } from '@/lib/janggi';
import JanggiPiece from './janggi/JanggiPiece';
import RJPiece, { CUP_RATIO } from './russianJanggi/RJPiece';
import OpenMatchCard from './OpenMatchCard';
import { Heavy13Art, IndianPokerArt, PiggyBankArt } from './GameArt';
import type { GameId } from '@/lib/gameCatalog';
import TwoSidedPokerPreview from './twoSidedPoker/TwoSidedPokerPreview';
import { BinairoPreview, ColorLinkPreview, MagicSwapPreview, MasyuPreview, NonogramPreview, OneStrokePreview, StarBattlePreview } from './logic/LogicPreview';
import { CUTE_DIGITS, DIGIT_PEN, DIGIT_STRIPE, DIGIT_STRIPE_DASH, starPath } from '@/lib/slitherDigits';
import { MonorailBoard } from './monorail/MonorailParts';
import { FtBoard } from './fourThree/FourThreeParts';
import type { Board } from '@/lib/fourThree';
import { newMonorail } from '@/lib/monorail';
import Merge2048Preview from './merge2048/Merge2048Preview';
import { HitStayTile } from './hitStay/HitStayPreview';
import { SniperHoldemTile } from './sniperHoldem/SniperHoldemPreview';
import { HiddenWordTile } from './hiddenWord/HiddenWordPreview';
import { TimeAuctionTile } from './timeAuction/TimeAuctionPreview';
import { HiddenWordPlusTile } from './hiddenWord/HiddenWordPlusArt';
import { CjTile } from './cardJanggi/CjPreview';
import { GradationTile } from './gradation/GradationPreview';
import { SignalTile } from './equationSignal/SignalParts';
import { TowerTile } from './equationTower/TowerParts';
import { CldTile } from './colorLinkDuel/CldPreview';

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

function MonorailPreview() {
  // A loop one tile away from closing: the last curve hovers in place, so the thumbnail shows the goal.
  const T = (r: number, c: number, shape: 'h' | 'v' | 'ne' | 'se' | 'sw' | 'nw', skin: number) => ({ r, c, shape, skin });
  const state = { ...newMonorail(), tiles: [
    T(7, 5, 'se', 1), T(8, 5, 'v', 2), T(9, 5, 'v', 4), T(10, 5, 'ne', 3), T(10, 6, 'h', 5),
    T(10, 7, 'h', 0), T(10, 8, 'nw', 2), T(9, 8, 'v', 1), T(8, 8, 'v', 3),
  ] };
  return <div className="w-full sm:w-[66%]"><MonorailBoard state={state} pending={[{ r: 7, c: 8, shape: 'sw', skin: 2 }]} pad={0} minView={4} className="!rounded-xl !border-[3px] !border-[#17201e] !p-[3%] sm:!rounded-2xl sm:!border-4" /></div>;
}

/** 벽바둑 II as on the broadcast: coral 7×7 board in a grey frame, a square and a round piece per player. */
function WallGo2Preview() {
  const pieces = new Map<number, [string, 'circle' | 'square']>([[8, ['#e2474f', 'square']], [12, ['#e2474f', 'circle']], [30, ['#2b9fd8', 'square']], [36, ['#2b9fd8', 'circle']], [16, ['#e0ab2c', 'circle']], [40, ['#e0ab2c', 'square']]]);
  return <div className="relative aspect-square w-full rounded-xl bg-[#6e7179] p-[7%] shadow-xl sm:w-[62%] sm:rounded-2xl sm:shadow-2xl">
    <div className="grid h-full w-full grid-cols-7 overflow-hidden rounded-[4px] bg-[#e79b8a] ring-2 ring-[#f3c6ba]">
      {Array.from({ length: 49 }).map((_, index) => <span key={index} className="relative border-b border-r border-[#c97b6b]">
        {[9, 23, 31].includes(index) && <i className="absolute -right-[3px] top-0 z-10 h-full w-[5px] rounded-full bg-[#2f3136]" />}
        {[15, 24, 38].includes(index) && <i className="absolute -bottom-[3px] left-0 z-10 h-[5px] w-full rounded-full bg-[#2f3136]" />}
        {pieces.has(index) && <b className={`absolute inset-[14%] shadow-md ring-1 ring-white/70 ${pieces.get(index)![1] === 'circle' ? 'rounded-full' : 'rounded-[22%]'}`} style={{ background: pieces.get(index)![0] }} />}
      </span>)}
    </div>
  </div>;
}

/** 나인 멘스 모리스: the teal broadcast board with a mill along the top. */
const MORRIS_SHOWCASE: (0 | 1 | null)[] = [0, 0, 0, 1, 1, null, null, 1, null, null, 0, null, null, 1, null, 0, null, null, null, null, 0, 1, null, null];
/** 4인 3목: the 4×4 board with stacked pieces and a red line from above. */
const FT_SHOWCASE: Board = [[0], [], [3], [2, 1], [1], [3, 0], [], [3], [], [2], [1, 0], [], [3], [], [2], [0, 1]];
function FourThreePreview() {
  return <div className="w-full sm:w-[58%]"><FtBoard board={FT_SHOWCASE} guest={3} lines={[[0, 5, 10]]} compact className="!max-w-none !border-[#17201e]" /></div>;
}

function MorrisPreview() {
  return <div className="w-full sm:w-[62%]"><MorrisBoard board={MORRIS_SHOWCASE} labels={false} className="!max-w-none !rounded-xl border-[3px] border-[#17201e] sm:!rounded-2xl sm:border-4" /></div>;
}

/** 뒤집기 오목: the neon board with red and blue characters, one of them flipping over. */
function FlipFace({ hex, back = false }: { hex: string; back?: boolean }) {
  return <i className={`absolute inset-0 rounded-full [backface-visibility:hidden] ${back ? '[transform:rotateY(180deg)]' : ''}`} style={{ background: `radial-gradient(circle at 34% 28%, color-mix(in srgb, ${hex} 55%, white), ${hex} 48%, color-mix(in srgb, ${hex} 60%, black))`, boxShadow: `0 0 8px ${hex}99` }}>
    <b className="absolute left-[29%] top-[33%] h-[17%] w-[12%] rounded-full bg-white" /><b className="absolute right-[29%] top-[33%] h-[17%] w-[12%] rounded-full bg-white" />
  </i>;
}
function FlipOmokPreview() {
  const R = '#ff4d6d', B = '#3fb8ff';
  const stones = new Map<number, string>([[6, R], [7, B], [12, R], [13, R], [16, B], [18, B], [11, B]]);
  return <div className="relative grid aspect-square w-full grid-cols-5 overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[#080c12] p-2 shadow-xl ring-1 ring-[#67e8ff]/30 sm:w-[62%] sm:rounded-2xl sm:border-4 sm:p-3 sm:shadow-2xl">
    <div className="absolute inset-[12%]" style={{ backgroundImage: 'linear-gradient(to right, transparent 49%, rgba(103,232,255,.35) 49%, rgba(103,232,255,.35) 51%, transparent 51%), linear-gradient(to bottom, transparent 49%, rgba(103,232,255,.35) 49%, rgba(103,232,255,.35) 51%, transparent 51%)', backgroundSize: '25% 25%' }} />
    {Array.from({ length: 25 }, (_, index) => <span key={index} className="relative z-10 flex items-center justify-center [perspective:200px]">
      {index === 8 ? <span className="flip-omok-loop relative h-[80%] w-[80%] [transform-style:preserve-3d]"><FlipFace hex={B} /><FlipFace hex={R} back /></span>
        : stones.has(index) && <span className="relative h-[80%] w-[80%]"><FlipFace hex={stones.get(index)!} /></span>}
    </span>)}
    <span className="absolute right-2 top-2 z-20 rounded-full bg-[#17201e] px-2 py-1 text-[7px] font-black tracking-wider text-[#67e8ff] sm:right-3 sm:top-3 sm:text-[9px]">FLIP!</span>
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

/** 포인트 오목: a board corner with black and white stones and three points put up for bidding. */
function PointOmokPreview() {
  const stones = new Map<number, 0 | 1>([[1, 0], [6, 1], [7, 0], [8, 1], [11, 0], [12, 0], [13, 1], [16, 1], [18, 0]]);
  const points = [21, 22, 23];
  return <div className="relative grid aspect-square w-full grid-cols-5 overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[#12131a] p-2 shadow-xl ring-1 ring-[#ff5d8f]/30 sm:w-[62%] sm:rounded-2xl sm:border-4 sm:p-3 sm:shadow-2xl">
    <div className="absolute inset-[12%]" style={{ backgroundImage: 'linear-gradient(to right, transparent 49%, rgba(201,207,227,.3) 49%, rgba(201,207,227,.3) 51%, transparent 51%), linear-gradient(to bottom, transparent 49%, rgba(201,207,227,.3) 49%, rgba(201,207,227,.3) 51%, transparent 51%)', backgroundSize: '25% 25%' }} />
    {Array.from({ length: 25 }, (_, index) => <span key={index} className="relative z-10 flex items-center justify-center">
      {stones.has(index) && <b className={`absolute inset-[14%] rounded-full shadow-md ${stones.get(index) === 0 ? 'bg-[radial-gradient(circle_at_34%_30%,#5a5f6b,#15171c_45%,#050507)]' : 'bg-[radial-gradient(circle_at_34%_30%,#fff,#e9ecf2_45%,#aab1be)]'}`} />}
      {points.includes(index) && <b className="absolute inset-[16%] flex items-center justify-center rounded-full bg-[#ff5d8f]/30 font-mono text-xs font-black text-white ring-2 ring-[#ff5d8f]">{points.indexOf(index) + 1}</b>}
    </span>)}
    <span className="absolute right-2 top-2 z-20 rounded-full bg-[#17201e] px-2 py-1 text-[7px] font-black tracking-wider text-[#ff5d8f] sm:right-3 sm:top-3 sm:text-[9px]">10P</span>
  </div>;
}

/** The 돼지 저금통 table at 300×300: four stepped boxes with gold pigs around the clock. */
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

// 슬리더링크's card for the Christmas season: the Christmas theme's board (cream paper in a pine frame, candy-cane
// numbers, a fairy-light loop with a star on top). The loop is a real one and the numbers are counted from it.
const XMAS_LOOP: [number, number][] = [[1, 0], [4, 0], [4, 1], [5, 1], [5, 4], [3, 4], [3, 5], [1, 5], [1, 3], [0, 3], [0, 1], [1, 1]];
const XMAS_SHOWN = new Set(['0,0', '2,0', '4,0', '1,1', '3,1', '0,2', '2,2', '4,2', '1,3', '3,3', '0,4', '2,4', '4,4']);
const XMAS_BULBS = ['#ff4d5e', '#ffc23d', '#46b4ff', '#ff86c8', '#7be07f'];
const XMAS_EDGES = XMAS_LOOP.flatMap(([x, y], i) => {
  const [nx, ny] = XMAS_LOOP[(i + 1) % XMAS_LOOP.length], steps = Math.abs(nx - x) + Math.abs(ny - y), dx = Math.sign(nx - x), dy = Math.sign(ny - y);
  return Array.from({ length: steps }, (_, k) => ({ x1: x + dx * k, y1: y + dy * k, x2: x + dx * (k + 1), y2: y + dy * (k + 1) }));
});
const xmasClue = (c: number, r: number) => XMAS_EDGES.filter((e) => (e.y1 === e.y2 ? (e.y1 === r || e.y1 === r + 1) && Math.min(e.x1, e.x2) === c : (e.x1 === c || e.x1 === c + 1) && Math.min(e.y1, e.y2) === r)).length;
const XMAS_SNOW = [[8, 10, 1.6], [26, 4, 1.1], [52, 9, 1.4], [78, 5, 1.2], [93, 14, 1.6], [4, 46, 1.2], [96, 52, 1.3], [7, 86, 1.5], [90, 90, 1.2], [60, 96, 1.1], [34, 93, 1.4]];

function SlitherPreview() {
  const n = 5, pad = 0.55, size = n + pad * 2;
  return <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#1f6b47] via-[#124a31] to-[#0c3524] p-1.5 shadow-xl ring-1 ring-[#ffd66b]/40 sm:w-[66%] sm:rounded-2xl sm:p-3 sm:shadow-2xl">
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">{XMAS_SNOW.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.75} />)}</svg>
    <svg viewBox={`${-pad} ${-pad} ${size} ${size}`} className="relative block w-full rounded-[4px] bg-gradient-to-b from-[#fffaf0] to-[#f3f7f2] shadow-[inset_0_0_10px_rgba(31,107,71,.22)]">
      <path d={`M${XMAS_LOOP.map(([x, y]) => `${x} ${y}`).join('L')}Z`} fill="none" stroke="#1f6b47" strokeWidth={0.13} strokeLinejoin="round" />
      {XMAS_EDGES.map((e, i) => <circle key={i} cx={(e.x1 + e.x2) / 2} cy={(e.y1 + e.y2) / 2} r={0.13} fill={XMAS_BULBS[i % XMAS_BULBS.length]} stroke="#fff" strokeWidth={0.03} />)}
      {Array.from({ length: (n + 1) * (n + 1) }, (_, i) => <circle key={i} cx={i % (n + 1)} cy={Math.floor(i / (n + 1))} r={0.075} fill="#1f5b3f" />)}
      {Array.from({ length: n * n }, (_, i) => { const c = i % n, r = Math.floor(i / n); return XMAS_SHOWN.has(`${c},${r}`) ? (
        <g key={i} transform={`translate(${c + 0.5} ${r + 0.5}) scale(1.75)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={CUTE_DIGITS[xmasClue(c, r)]} stroke="#e23b4e" strokeWidth={DIGIT_PEN} />
          <path d={CUTE_DIGITS[xmasClue(c, r)]} stroke="#fff" strokeWidth={DIGIT_STRIPE} strokeDasharray={DIGIT_STRIPE_DASH} />
        </g>) : null; })}
      <path d={starPath(0.3)} transform="translate(2.5 0)" fill="#ffc23d" stroke="#fff" strokeWidth={0.04} strokeLinejoin="round" />
    </svg>
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

function GyulhapPreview() {
  const cards = [
    ['#f4efe4', '#21a5ff', 'rounded-full'], ['#777b83', '#ff4d5e', '[clip-path:polygon(50%_0,100%_100%,0_100%)]'], ['#111318', '#ffd449', 'rounded-[8%]'],
    ['#777b83', '#ffd449', 'rounded-[8%]'], ['#111318', '#21a5ff', 'rounded-full'], ['#f4efe4', '#ff4d5e', '[clip-path:polygon(50%_0,100%_100%,0_100%)]'],
    ['#111318', '#ff4d5e', '[clip-path:polygon(50%_0,100%_100%,0_100%)]'], ['#f4efe4', '#ffd449', 'rounded-[8%]'], ['#777b83', '#21a5ff', 'rounded-full'],
  ];
  return <div className="grid aspect-square w-full grid-cols-3 gap-1 rounded-xl border-[3px] border-[#17201e] bg-[#15161b] p-1 shadow-xl sm:w-[62%] sm:gap-2 sm:border-4 sm:p-2">{cards.map(([bg, ink, shape], i) => <span key={i} className="relative flex items-center justify-center rounded-md" style={{ background: bg }}><i className={`h-[48%] w-[48%] ${shape}`} style={{ background: ink }} /></span>)}</div>;
}

/** A game's home-card picture, by catalog id (also used by the game list page). */
export function GamePreview({ id }: { id: GameId }) {
  switch (id) {
    case 'equationSignal': return <SignalTile />;
    case 'equationTower': return <TowerTile />;
    case 'hiddenWord': return <HiddenWordTile />;
    case 'hiddenWordPlus': return <HiddenWordPlusTile />;
    case 'gradation': return <GradationTile />;
    case 'cardJanggi': return <CjTile />;
    case 'colorLinkDuel': return <CldTile />;
    case 'sniperHoldem': return <SniperHoldemTile />;
    case 'hitStay': return <HitStayTile />;
    case 'timeAuction': return <TimeAuctionTile />;
    case 'pointOmok': return <PointOmokPreview />;
    case 'magicswap': return <MagicSwapPreview />;
    case 'fourThree': return <FourThreePreview />;
    case 'binairo': return <BinairoPreview />;
    case 'onestroke': return <OneStrokePreview />;
    case 'colorlink': return <ColorLinkPreview />;
    case 'starbattle': return <StarBattlePreview />;
    case 'masyu': return <MasyuPreview />;
    case 'nonogram': return <NonogramPreview />;
    case 'twoSidedPoker': return <TwoSidedPokerPreview />;
    case 'monorail': return <MonorailPreview />;
    case 'flipOmok': return <FlipOmokPreview />;
    case 'nineMensMorris': return <MorrisPreview />;
    case 'wallgo2': return <WallGo2Preview />;
    case 'slitherlink': return <SlitherPreview />;
    case 'gyulhap': return <GyulhapPreview />;
    case 'indianPoker': return <IndianPokerArt />;
    case 'hexagon': return <HexagonPreview />;
    case 'merge2048': return <Merge2048Preview />;
    case 'piggyBank': return <PiggyBankArt />;
    case 'nemoCount': return <NemoCountPreview />;
    case 'blackWhite': return <BlackWhitePreview />;
    case 'blackWhite2': return <BlackWhite2Preview />;
    case 'laserJanggi': return <LaserJanggiPreview />;
    case 'blindGomoku': return <BlindGomokuPreview />;
    case 'wallgo': return <WallGoPreview />;
    case 'russianRoulette': return <RussianRoulettePreview />;
    case 'heavy13': return <Heavy13Art />;
    case 'janggi': return <JanggiPreview />;
    case 'russianJanggi': return <RussianJanggiPreview />;
    case 'sudoku': return <SudokuPreview />;
  }
}

export default function HomeClient() {
  const [phone, setPhone] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const openCard = <OpenMatchCard previews={{
      equationSignal: <SignalTile />, equationTower: <TowerTile />, gradation: <GradationTile />, cardJanggi: <CjTile />, colorLinkDuel: <CldTile />, hitStay: <HitStayTile />, sniperHoldem: <SniperHoldemTile />, pointOmok: <PointOmokPreview />, merge2048: <Merge2048Preview />, magicswap: <MagicSwapPreview />, fourThree: <FourThreePreview />, binairo: <BinairoPreview />, onestroke: <OneStrokePreview />, colorlink: <ColorLinkPreview />, starbattle: <StarBattlePreview />, masyu: <MasyuPreview />, nonogram: <NonogramPreview />, twoSidedPoker: <TwoSidedPokerPreview />, monorail: <MonorailPreview />, slitherlink: <SlitherPreview />, gyulhap: <GyulhapPreview />, indianPoker: <IndianPokerArt />, hexagon: <HexagonPreview />, piggyBank: <PiggyBankArt />, nemoCount: <NemoCountPreview />, blackWhite: <BlackWhitePreview />, blackWhite2: <BlackWhite2Preview />, laserJanggi: <LaserJanggiPreview />,
      blindGomoku: <BlindGomokuPreview />, nineMensMorris: <MorrisPreview />, flipOmok: <FlipOmokPreview />, wallgo: <WallGoPreview />, wallgo2: <WallGo2Preview />, russianRoulette: <RussianRoulettePreview />, heavy13: <Heavy13Art />,
      janggi: <JanggiPreview />, russianJanggi: <RussianJanggiPreview />,
      timeAuction: <TimeAuctionTile />,
    }} />;
  // Phones get the app home, wider screens (foldables, tablets, desktop) the web home. Both are in the server HTML (CSS picks one);
  // once the browser knows its width the other is dropped.
  if (phone === true) return <HomeApp Preview={GamePreview} openMatch={openCard} />;
  return <>
    {phone === null && <div className="sm:hidden"><HomeApp Preview={GamePreview} openMatch={openCard} Heading="p" /></div>}
    <HomeWeb Preview={GamePreview} openMatch={openCard} className={phone === null ? 'hidden sm:block' : ''} />
  </>;
}
