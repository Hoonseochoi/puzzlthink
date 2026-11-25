"use client";

/**
 * Design draft: the home page as an app screen (phones / the installed app). Not wired to live data yet —
 * 이어하기, the piece count and the event cards are samples; the game tiles are the real catalog and previews.
 * It covers the site chrome so the draft can be judged on its own.
 */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Crown, Flame, Home, MessageCircle, Play, Puzzle, Skull, Swords, Trophy, User } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { GAMES, type GameId } from '@/lib/gameCatalog';
import { CERT_GAMES } from '@/lib/hardClear';
import { getSupabase } from '@/lib/supabase';
import { GamePreview } from './HomeClient';
import { FitTile } from './OpenMatchCard';
import StoneAvatar, { Stone } from './StoneAvatar';
import RankBlock from './merge2048/RankBlock';
import { type GamePodium, useHallPodiums } from './HallPodium';

const NEW: GameId[] = ['cardJanggi', 'colorLinkDuel', 'hitStay', 'gradation', 'pointOmok'];
const PUZZLE: GameId[] = ['slitherlink', 'magicswap', 'colorlink', 'merge2048', 'onestroke', 'starbattle', 'nonogram', 'binairo', 'masyu', 'sudoku', 'nemoCount', 'gyulhap', 'hexagon'];
const CATS = [
  { id: 'all', label: '전체' }, { id: 'new', label: '신작' }, { id: 'versus', label: '대전' }, { id: 'puzzle', label: '퍼즐' }, { id: 'hell', label: '헬모드' },
] as const;
type Cat = (typeof CATS)[number]['id'];
const inCat = (g: (typeof GAMES)[number], cat: Cat) =>
  cat === 'all' || (cat === 'new' && NEW.includes(g.id)) || (cat === 'puzzle' && PUZZLE.includes(g.id)) || (cat === 'versus' && !PUZZLE.includes(g.id)) || (cat === 'hell' && !!g.hell?.live);

const tint = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/** Mix a colour toward another (0 = itself, 1 = the other). */
const shade = (hex: string, t: number, to: string) => {
  const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
  const ch = (sh: number) => Math.round(((a >> sh) & 255) * (1 - t) + ((b >> sh) & 255) * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
};

const EVENTS = [
  { key: 'hell', icon: <Skull size={15} />, eyebrow: 'AI HELL MODE', title: 'AI 헬모드 출시', sub: '매우 어려움 1승 = 블랙피스 1개', cta: '도전하기', bg: 'linear-gradient(135deg, #2a0812 0%, #07060a 70%)', accent: '#ff3355', href: '/hell' },
  { key: 'piece', icon: <Puzzle size={15} />, eyebrow: 'PIECE RACE · 2W', title: '피스 경쟁전 2W', sub: '12/1(화) 마감 · TOP 3 보석 아이콘', cta: '순위 보기', bg: 'linear-gradient(135deg, #2c2a14 0%, #17201e 70%)', accent: '#ffd36e', href: '/records' },
  { key: 'open', icon: <Swords size={15} />, eyebrow: 'OPEN MATCH', title: '오픈 대전', sub: '지금 열린 방 34개 · 바로 입장', cta: '입장하기', bg: 'linear-gradient(135deg, #1b1f4a 0%, #0e1020 70%)', accent: '#8f9bff', href: '/games' },
] as const;

const MEDAL = ['#f2c53d', '#b8bfca', '#c98a55'];
const PODIUM_STAT = { wins: 'podiumWins', maps: 'podiumMaps', score: 'podiumScore', correct: 'podiumCorrect' } as const;

// Sample "my rank" per game (the draft is not signed in): the real page needs one RPC that returns all my ranks.
const MY_RANK: Partial<Record<GameId, number>> = { merge2048: 1, gradation: 2, wallgo2: 4, colorlink: 7, slitherlink: 12, janggi: 23 };

/** Under a tile: the game's #1 (one stone and the name). */
function TopOne({ podium }: { podium?: GamePodium }) {
  const top = podium?.entries[0];
  if (!top) return <span className="mt-0.5 block text-center text-[10px] font-bold text-black/30">첫 1위 도전</span>;
  return (
    <span className="mt-0.5 flex items-center justify-center gap-1 px-0.5">
      <span className="flex h-[13px] shrink-0 items-center rounded-full bg-[#f2c53d] px-1 text-[8.5px] font-black leading-none text-[#3b2604]">1위</span>
      <span className="shrink-0">{top.block ? <RankBlock block={top.block} name={top.nickname} size={16} /> : <StoneAvatar name={top.nickname} size={15} />}</span>
      <span className="min-w-0 truncate text-[10px] font-black text-black/55">{top.nickname}</span>
    </span>
  );
}

const ME = '퍼즐러'; // sample nickname (the draft is not signed in)

/** On the picture: where I stand in this game — "[nickname] 7위". */
function MyRank({ rank }: { rank?: number }) {
  if (!rank) return null;
  const first = rank === 1;
  return (
    <span className={`absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-12px)] items-center gap-1 rounded-full px-1.5 py-[3px] text-[9px] font-black leading-none shadow-[0_3px_8px_rgba(0,0,0,.3)] ${first ? 'bg-[#f2c53d] text-[#3b2604]' : 'bg-[#17201e] text-white'}`}>
      {first && <Crown size={9} className="shrink-0 fill-[#3b2604]" />}
      <span className={`min-w-0 truncate ${first ? '' : 'text-white/70'}`}>{ME}</span><span className="shrink-0">{rank}위</span>
    </span>
  );
}

type CrownMove = { game: string; name: string; nickname: string; ago: string; href: string };
const agoOf = (iso: string) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 60 ? `${m}분 전` : m < 1440 ? `${Math.round(m / 60)}시간 전` : `${Math.round(m / 1440)}일 전`;
};
/** The most recent #1 changes (game_crowns.since), newest first. */
function useCrownMoves() {
  const [moves, setMoves] = useState<CrownMove[]>([]);
  useEffect(() => {
    let alive = true;
    getSupabase()?.rpc('game_crowns_public').then(({ data }) => {
      if (!alive || !Array.isArray(data)) return;
      const rows = (data as { game: string; nickname: string; since: string }[])
        .filter((r) => r.game in CERT_GAMES)
        .sort((x, y) => y.since.localeCompare(x.since)).slice(0, 8)
        .map((r) => ({ game: r.game, name: CERT_GAMES[r.game as keyof typeof CERT_GAMES].ko, nickname: r.nickname, ago: agoOf(r.since), href: CERT_GAMES[r.game as keyof typeof CERT_GAMES].href }));
      setMoves(rows);
    });
    return () => { alive = false; };
  }, []);
  return moves;
}

type FeedItem = { kind: keyof typeof FEED_KIND; who: string; text: string; ago: string };
const FEED_KIND = {
  crown: { label: '1위 변동', chip: 'bg-[#f2c53d] text-[#3b2604]', icon: <Crown size={10} className="fill-[#3b2604]" /> },
  hell: { label: '헬모드 격파', chip: 'bg-[#ff3355] text-white', icon: <Skull size={10} /> },
  block: { label: '2048', chip: 'bg-[#ff8fa3] text-[#4a0d1c]', icon: <Flame size={10} className="fill-[#4a0d1c]" /> },
  piece: { label: '피스 경쟁전', chip: 'bg-[#3fd67a] text-[#06231a]', icon: <Puzzle size={10} /> },
  streak: { label: '연승 중', chip: 'bg-[#8f9bff] text-[#0e1020]', icon: <Swords size={10} /> },
} as const;
// Samples of the other kinds of news (only the 1위 변동 lines are live data in this draft).
const FEED_SAMPLES: FeedItem[] = [
  { kind: 'hell', who: '샘플유저1', text: '님이 벽바둑 헬모드를 깼어요', ago: '12분 전' },
  { kind: 'block', who: '샘플유저2', text: '님이 4096 블록을 만들었어요', ago: '25분 전' },
  { kind: 'piece', who: '샘플유저3', text: '님이 피스 2W 3위로 올라섰어요', ago: '41분 전' },
  { kind: 'streak', who: '샘플유저4', text: '님이 오픈 대전 5연승 중', ago: '방금' },
];

/** One line of news at a time, swapping every few seconds and looping: 1위 변동, 헬모드 격파, 큰 블록, 순위 상승, 연승. */
function LiveFeed({ moves }: { moves: CrownMove[] }) {
  const crowns: FeedItem[] = moves.slice(0, 5).map((m) => ({ kind: 'crown', who: m.nickname, text: `님이 ${m.name} 1위`, ago: m.ago }));
  // interleave: a crown line, then a sample line, and so on
  const items: FeedItem[] = [];
  for (let i = 0; i < Math.max(crowns.length, FEED_SAMPLES.length); i++) { if (crowns[i]) items.push(crowns[i]); if (FEED_SAMPLES[i]) items.push(FEED_SAMPLES[i]); }
  const [at, setAt] = useState(0);
  const n = items.length;
  useEffect(() => {
    if (n < 2) return;
    const id = window.setInterval(() => setAt((v) => v + 1), 2800);
    return () => window.clearInterval(id);
  }, [n]);
  const item = items[at % n];
  const k = FEED_KIND[item.kind];
  return (
    <div className="mx-4 mt-2.5 flex h-[34px] items-center gap-2 overflow-hidden rounded-full bg-[#17201e] pl-1.5 pr-3 text-white">
      <span key={`c${at}`} className={`home-feed flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${k.chip}`}>{k.icon}{k.label}</span>
      <span key={`t${at}`} className="home-feed flex min-w-0 flex-1 items-center gap-1.5 text-[11.5px] font-bold">
        <StoneAvatar name={item.who} size={16} />
        <span className="min-w-0 truncate"><b className="font-black">{item.who}</b><span className="text-white/60"> {item.text}</span></span>
      </span>
      <span key={`a${at}`} className="home-feed shrink-0 text-[10px] font-bold text-white/35">{item.ago}</span>
      <i className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#3fd67a]" title="LIVE" />
      <style>{`@keyframes home-feed { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } } .home-feed { animation: home-feed .38s cubic-bezier(.2,.8,.2,1); } @media (prefers-reduced-motion: reduce) { .home-feed { animation: none; } }`}</style>
    </div>
  );
}

export default function HomeAppPreview() {
  const t = useTranslations('Home');
  const podiums = useHallPodiums();
  const moves = useCrownMoves();
  const tc = useTranslations('Common');
  const [cat, setCat] = useState<Cat>('all');
  const [ev, setEv] = useState(0);
  const list = GAMES.filter((g) => inCat(g, cat));
  const hero = list[0];
  const rest = list.slice(1);
  const recent = [GAMES[9], GAMES[0], GAMES[6], GAMES[4], GAMES[10]];

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain bg-[#f3f0e8] text-[#17201e]">
      <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col">
        <p className="bg-[#17201e] px-4 py-1.5 text-center text-[10.5px] font-bold text-white/70">홈 화면 시안 · 내 순위·이어하기·일부 소식은 샘플이에요</p>
        {/* top bar */}
        <header className="flex items-center justify-between px-4 pb-2 pt-3">
          <span className="flex items-center gap-2 text-[17px] font-black tracking-[-0.03em]">
            <span className="grid h-7 w-7 grid-cols-2 gap-[3px] rounded-lg bg-[#17201e] p-[6px]"><i className="rounded-full bg-[#ff6b4a]" /><i className="rounded-full bg-[#ffd36e]" /><i className="rounded-full bg-[#3fd67a]" /><i className="rounded-full bg-white" /></span>
            PUZZLTHINK
          </span>
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-[#17201e] px-2.5 py-1 text-[12px] font-black text-[#ffd36e]"><Puzzle size={13} />12</span>
            <Stone name="나" size={30} icon="m4096" />
          </span>
        </header>

        {/* continue playing */}
        <section className="px-4 pt-1">
          <ul className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
            {recent.map((g, i) => (
              <li key={g.id} className="shrink-0">
                <Link href={g.href} className="flex w-[58px] flex-col items-center gap-1 active:scale-95">
                  <span className="relative h-[58px] w-[58px] rounded-full p-[2.5px]" style={{ background: `conic-gradient(${g.color}, ${tint(g.color, 0.35)}, ${g.color})` }}>
                    <span className="block h-full w-full overflow-hidden rounded-full bg-[#17201e]"><FitTile title={tc(g.id)} className="h-full w-full"><GamePreview id={g.id} /></FitTile></span>
                    {i === 0 && <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b4a] text-white ring-2 ring-[#f3f0e8]"><Play size={10} className="fill-white" /></span>}
                  </span>
                  <span className="w-full truncate text-center text-[10.5px] font-bold text-black/60">{i === 0 ? '이어하기' : tc(g.id)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* events: one swipeable card */}
        <section className="pt-3">
          <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 [scrollbar-width:none]"
            onScroll={(e) => { const el = e.currentTarget; setEv(Math.round(el.scrollLeft / (el.clientWidth - 22))); }}>
            {EVENTS.map((e) => (
              <Link key={e.key} href={e.href} className="relative flex h-[118px] w-[calc(100%-22px)] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[22px] p-4 text-white active:scale-[.985]" style={{ background: e.bg }}>
                <span className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full blur-2xl" style={{ background: tint(e.accent, 0.35) }} />
                <span className="relative flex items-center gap-1.5 text-[10px] font-black tracking-[0.16em]" style={{ color: e.accent }}>{e.icon}{e.eyebrow}</span>
                <span className="relative flex items-end justify-between gap-3">
                  <span><b className="block text-[21px] font-black leading-tight tracking-[-0.04em]">{e.title}</b><span className="mt-0.5 block text-[11.5px] font-bold text-white/60">{e.sub}</span></span>
                  <span className="shrink-0 rounded-full px-3.5 py-2 text-[12px] font-black text-[#17201e]" style={{ background: e.accent }}>{e.cta}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-1.5">{EVENTS.map((e, i) => <i key={e.key} className={`h-1.5 rounded-full transition-all ${i === ev ? 'w-4 bg-[#17201e]' : 'w-1.5 bg-black/20'}`} />)}</div>
          <LiveFeed moves={moves} />
        </section>

        {/* category chips (stick while scrolling) */}
        <nav className="sticky top-0 z-10 mt-2 flex gap-1.5 overflow-x-auto bg-[#f3f0e8]/90 px-4 py-2.5 backdrop-blur [scrollbar-width:none]">
          {CATS.map((c) => (
            <button key={c.id} type="button" onClick={() => setCat(c.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-black transition active:scale-95 ${cat === c.id ? 'bg-[#17201e] text-white' : 'bg-white text-black/55 ring-1 ring-black/10'}`}>
              {c.label}<span className={`ml-1 text-[10.5px] ${cat === c.id ? 'text-white/50' : 'text-black/30'}`}>{GAMES.filter((g) => inCat(g, c.id)).length}</span>
            </button>
          ))}
        </nav>

        <section className="flex-1 px-4 pb-6">
          {/* featured */}
          {hero && (
            <Link href={hero.href} className="relative flex h-[232px] items-center gap-3 overflow-hidden rounded-[26px] p-4 active:scale-[.985]"
              style={{ background: `radial-gradient(120% 90% at 0% 0%, ${shade(hero.color, 0.28, '#ffffff')} 0%, transparent 55%), radial-gradient(90% 80% at 100% 100%, ${shade(hero.color, 0.55, '#12062e')} 0%, transparent 60%), linear-gradient(135deg, ${hero.color} 0%, ${shade(hero.color, 0.35, '#12062e')} 100%)` }}>
              {/* backdrop: a dot grid fading out, two rings behind the picture, a light sweep, a few sparks */}
              <span className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.55)_1px,transparent_1.4px)] [background-size:14px_14px] [mask-image:linear-gradient(115deg,transparent_25%,#000_95%)]" />
              <span className="pointer-events-none absolute -right-14 top-1/2 h-[250px] w-[250px] -translate-y-1/2 rounded-full border-[22px] border-white/10" />
              <span className="pointer-events-none absolute -right-2 top-1/2 h-[150px] w-[150px] -translate-y-1/2 rounded-full bg-white/25 blur-2xl" />
              <span className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/25 blur-2xl" />
              <span className="home-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <svg viewBox="0 0 100 100" className="pointer-events-none absolute left-[47%] top-3 h-5 w-5 text-white/80" aria-hidden="true"><path d="M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42Z" fill="currentColor" /></svg>
              <svg viewBox="0 0 100 100" className="pointer-events-none absolute bottom-4 left-[52%] h-3 w-3 text-white/60" aria-hidden="true"><path d="M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42Z" fill="currentColor" /></svg>
              <style>{`@keyframes home-sweep { 0%, 55% { transform: translateX(0) skewX(-12deg); } 100% { transform: translateX(620%) skewX(-12deg); } } .home-sweep { animation: home-sweep 4.5s ease-in-out infinite; } @keyframes home-float { 0%, 100% { transform: rotate(4deg) translateY(0); } 50% { transform: rotate(4deg) translateY(-5px); } } .home-float { animation: home-float 4s ease-in-out infinite; } @media (prefers-reduced-motion: reduce) { .home-sweep, .home-float { animation: none; } }`}</style>
              <span className="relative flex min-w-0 flex-1 flex-col justify-between self-stretch text-white">
                <span className="flex w-fit items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-black tracking-[0.12em]"><Flame size={11} className="fill-white" />오늘의 추천</span>
                <span>
                  {podiums?.get(hero.href)?.entries.length ? (
                    <span className="mb-2 flex flex-col gap-[3px]">
                      {podiums.get(hero.href)!.entries.slice(0, 3).map((e, i) => (
                        <span key={e.rank} className="flex items-center gap-1.5 text-[11px] font-black">
                          <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full text-[9px] text-black/70" style={{ background: MEDAL[i] }}>{i + 1}</span>
                          {e.block ? <RankBlock block={e.block} name={e.nickname} size={16} /> : <StoneAvatar name={e.nickname} size={16} />}
                          <span className="min-w-0 max-w-[92px] truncate">{e.nickname}</span>
                          <span className="font-bold text-white/65">{t(PODIUM_STAT[podiums.get(hero.href)!.kind], { n: e.n })}</span>
                        </span>
                      ))}
                    </span>
                  ) : null}
                  {MY_RANK[hero.id] && <span className="mb-1.5 flex w-fit items-center gap-1 rounded-full bg-[#17201e] px-2 py-1 text-[10.5px] font-black"><span className="max-w-[90px] truncate text-white/70">{ME}</span>{MY_RANK[hero.id]}위</span>}
                  <b className="block break-keep text-[26px] font-black leading-[1.05] tracking-[-0.05em] drop-shadow-sm">{tc(hero.id)}</b>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12.5px] font-black text-[#17201e]"><Play size={12} className="fill-[#17201e]" />바로 시작</span></span>
              </span>
              <span className="home-float relative h-[136px] w-[136px] shrink-0 rotate-[4deg] overflow-hidden rounded-[22px] bg-[#17201e]/90 shadow-[0_18px_36px_rgba(0,0,0,.35)] ring-2 ring-white/40"><FitTile title={tc(hero.id)} className="h-full w-full"><GamePreview id={hero.id} /></FitTile></span>
            </Link>
          )}

          {/* everything else: picture-first tiles, three across */}
          <ul className="mt-2.5 grid grid-cols-3 gap-2.5">
            {rest.map((g) => (
              <li key={g.id}>
                <Link href={g.href} className="group block active:scale-95">
                  <span className="relative block aspect-square overflow-hidden rounded-[20px]" style={{ background: `linear-gradient(160deg, ${tint(g.color, 0.3)} 0%, ${tint(g.color, 0.12)} 100%)`, boxShadow: `inset 0 0 0 1px ${tint(g.color, 0.28)}` }}>
                    <span className="absolute inset-[9%] overflow-hidden rounded-[14px] bg-[#17201e]/90"><FitTile title={tc(g.id)} className="h-full w-full"><GamePreview id={g.id} /></FitTile></span>
                    {NEW.includes(g.id) && <span className="absolute left-1.5 top-1.5 rounded-full bg-[#ff4d5e] px-1.5 py-0.5 text-[8.5px] font-black tracking-[0.08em] text-white">NEW</span>}
                    <MyRank rank={MY_RANK[g.id]} />
                    {g.hell?.live && <span className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#07060a] text-[#ff3355] ring-1 ring-[#ff3355]/60"><Skull size={10} /></span>}
                  </span>
                  <span className="mt-1.5 block truncate text-center text-[12px] font-black tracking-[-0.02em]">{tc(g.id)}</span>
                  <TopOne podium={podiums?.get(g.href)} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* tab bar */}
        <nav className="sticky bottom-0 z-10 grid grid-cols-5 border-t border-black/10 bg-[#fbfaf5]/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur">
          {[
            { label: '홈', icon: <Home size={20} />, on: true }, { label: '오픈대전', icon: <Swords size={20} />, badge: '34' }, { label: '랭킹', icon: <Trophy size={20} /> },
            { label: '라운지', icon: <MessageCircle size={20} />, badge: '225' }, { label: '내 기록', icon: <User size={20} /> },
          ].map((tab) => (
            <span key={tab.label} className={`relative flex flex-col items-center gap-0.5 text-[10px] font-black ${tab.on ? 'text-[#17201e]' : 'text-black/35'}`}>
              {tab.icon}{tab.label}
              {tab.badge && <span className="absolute left-1/2 top-[-3px] ml-1.5 rounded-full bg-[#ff6b4a] px-1 text-[8.5px] font-black leading-[13px] text-white">{tab.badge}</span>}
              {tab.on && <i className="absolute -top-2 h-[3px] w-6 rounded-full bg-[#17201e]" />}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
