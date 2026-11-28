"use client";

/**
 * The home page on phones (and in the installed app): games first.
 * Profile strip (my icon, nickname, 피스 and 블랙피스) → 이어하기 → one swipeable event card → a news line that
 * swaps every few seconds → category chips → today's pick → every game as a picture tile, three across, with the
 * game's #1 under it and "[nickname] N위" on it. Wider screens keep the classic home (HomeClient).
 */
import { type ComponentType, type ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight, Crown, Flame, Play, Puzzle, Skull, Swords, Trophy, Zap } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { GAMES, type CatalogGame, type GameId } from '@/lib/gameCatalog';
import { useAppGames, usePlayApp } from '@/components/playApp/usePlayApp';
import { hiddenGameOfPath } from '@/lib/playApp';
import { CERT_GAMES } from '@/lib/hardClear';
import { listAllOpenRooms, listLiveRooms } from '@/lib/openRooms';
import { getSupabase } from '@/lib/supabase';
import type { GameId as StatsGameId } from '@/lib/stats';
import { useAuth } from './AuthProvider';
import { Piece } from './CompetitionBoard';
import { SageToken } from './SageToken';
import { kstMonthDay, piecePeriodBounds, piecePeriodOf, useWallet } from '@/lib/pieceWallet';
import { BlackPiece } from './hell/BlackPiece';
import { GAME_LABEL } from './HallCelebration';
import { type GamePodium, useHallPodiums } from './HallPodium';
import IconCollectionLink from './IconCollectionLink';
import RankBlock from './merge2048/RankBlock';
import { FitTile } from './OpenMatchCard';
import StoneAvatar, { Stone } from './StoneAvatar';
import { AppTesterStrip } from './AppTesterInvite';
import OriginalsRow from './OriginalsRow';
import { CHANGED_TAG } from './changedTags';

// Games still marked NEW on the home (kept in step with the `new` flags of the classic home cards).
export const NEW: GameId[] = ['propositionGo', 'mineOblivion', 'hiddenWordPlus', 'sniperHoldem', 'hiddenWord', 'cardJanggi', 'colorLinkDuel', 'equationSignal', 'equationTower', 'hitStay', 'timeAuction', 'gradation', 'pointOmok'];
const PUZZLE: GameId[] = ['propositionGo', 'slitherlink', 'hiddenWordPlus', 'hiddenWord', 'equationSignal', 'equationTower', 'magicswap', 'colorlink', 'merge2048', 'onestroke', 'starbattle', 'nonogram', 'binairo', 'masyu', 'sudoku', 'nemoCount', 'gyulhap', 'hexagon'];
/** 오늘의 추천 on the phone home: set by the site owner. */
/** 슬리더링크's card while its Christmas theme is the default: candy-cane stripes instead of the game's tint. */
export const XMAS_CARD = { background: 'repeating-linear-gradient(135deg, #e23b4e 0 9px, #fff7f2 9px 18px)', boxShadow: 'inset 0 0 0 1px rgba(226,59,78,.45)' };
export const TODAY_PICK: GameId = 'hiddenWordPlus'; // 히든 워드 확장판, the newest release (11/27); was 'slitherlink'
export const CATS = ['all', 'new', 'original', 'versus', 'puzzle', 'hell'] as const;
export type Cat = (typeof CATS)[number];
export const inCat = (g: CatalogGame, cat: Cat) =>
  cat === 'all' || (cat === 'new' && NEW.includes(g.id)) || (cat === 'original' && !!g.original) || (cat === 'puzzle' && PUZZLE.includes(g.id)) || (cat === 'versus' && !PUZZLE.includes(g.id)) || (cat === 'hell' && !!g.hell?.live);

const rgb = (hex: string) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
export const tint = (hex: string, a: number) => `rgba(${rgb(hex).join(', ')}, ${a})`;
/** Mix a colour toward another (0 = itself, 1 = the other). */
export const shade = (hex: string, t: number, to: string) => { const a = rgb(hex), b = rgb(to); return `rgb(${a.map((v, i) => Math.round(v * (1 - t) + b[i] * t)).join(', ')})`; };

const RECENT_KEY = 'puzzlthink:home-recent';
const readRecent = (): string[] => { try { const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []; } catch { return []; } };
export const pushRecent = (href: string) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify([href, ...readRecent().filter((h) => h !== href)].slice(0, 8))); } catch { /* private mode */ } };

export type Me = { ranks: Map<string, number>; recent: string[] };
const NO_ME: Me = { ranks: new Map(), recent: [] };

/** The signed-in player's game ranks and the games played last. */
export function useMe(userId: string | null): Me {
  const [me, setMe] = useState<Me>(NO_ME);
  useEffect(() => {
    const supabase = getSupabase();
    let alive = true;
    if (!supabase || !userId) { Promise.resolve().then(() => { if (alive) setMe({ ...NO_ME, recent: readRecent() }); }); return () => { alive = false; }; }
    Promise.all([
      supabase.rpc('my_game_ranks'),
      supabase.from('game_results').select('game, played_at').order('played_at', { ascending: false }).limit(60),
    ]).then(([ranks, results]) => {
      if (!alive) return;
      const rankMap = new Map<string, number>();
      for (const r of (ranks.data as { game: string; rank: number }[] | null) ?? []) {
        const href = CERT_GAMES[r.game as StatsGameId]?.href;
        if (href && r.rank > 0) rankMap.set(href, r.rank);
      }
      const played = ((results.data as { game: string }[] | null) ?? []).map((r) => CERT_GAMES[r.game as StatsGameId]?.href).filter((h): h is NonNullable<typeof h> => !!h);
      setMe({ ranks: rankMap, recent: [...new Set([...played, ...readRecent()])] });
    }).catch(() => {});
    return () => { alive = false; };
  }, [userId]);
  return me;
}

export type RaceRow = { rank: number; nickname: string; pieces: number; is_me: boolean };
export type Races = { piece: RaceRow[]; black: RaceRow[]; open: RaceRow[] };
/** This week's 피스 and 블랙피스 boards and the 오픈 대전 total-wins board: the top three, plus my own row when signed in. */
export function useRaces(userId: string | null): Races {
  const [races, setRaces] = useState<Races>({ piece: [], black: [], open: [] });
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let alive = true;
    const rows = (d: unknown) => (Array.isArray(d) ? (d as RaceRow[]).map((r) => ({ rank: r.rank, nickname: r.nickname, pieces: Number(r.pieces), is_me: !!r.is_me })) : []);
    Promise.all([supabase.rpc('competition_ranking', { p_limit: 3 }), supabase.rpc('black_piece_ranking', { p_limit: 3 }), supabase.rpc('open_total_ranking', { p_limit: 3 })])
      .then(([piece, black, open]) => {
        if (!alive) return;
        const wins = Array.isArray(open.data) ? (open.data as { rank: number; nickname: string; wins: number; is_me: boolean }[]).map((r) => ({ rank: r.rank, nickname: r.nickname, pieces: r.wins, is_me: !!r.is_me })) : [];
        setRaces({ piece: rows(piece.data), black: rows(black.data), open: wins });
      }).catch(() => {});
    return () => { alive = false; };
  }, [userId]);
  return races;
}

/** A race's top three on its banner: 2nd · 1st · 3rd, each wearing the icon that place wins. */
export function RacePodium({ rows, icon, accent, count = (n) => `×${n}` }: { rows: RaceRow[]; icon: (place: 1 | 2 | 3) => string; accent: string; count?: (n: number) => string }) {
  const top = new Map(rows.filter((r) => r.rank <= 3).map((r) => [r.rank, r]));
  return (
    <span className="relative flex shrink-0 items-end gap-1">
      {([2, 1, 3] as const).map((place) => {
        const r = top.get(place);
        return (
          <span key={place} className={`flex w-[52px] flex-col items-center ${place === 1 ? '' : 'pb-0.5'} ${r ? '' : 'opacity-40'}`}>
            <Stone name={r?.nickname ?? String(place)} size={place === 1 ? 44 : 34} icon={icon(place)} />
            <span className="mt-1 w-full truncate text-center text-[9.5px] font-black leading-tight text-white/90">{r?.nickname ?? '—'}</span>
            <span className="flex items-center gap-0.5 text-[9px] font-black leading-tight" style={{ color: accent }}><span className="flex h-[11px] w-[11px] items-center justify-center rounded-full text-[7.5px] text-black/70" style={{ background: MEDAL[place - 1] }}>{place}</span>{r ? count(r.pieces) : ''}</span>
          </span>
        );
      })}
    </span>
  );
}

export type FeedKind = 'crown' | 'hall' | 'hell' | 'hard' | 'open' | 'slither';
export type FeedItem = { key: string; kind: FeedKind; name: string; text: string; at: number; href: string };
export const FEED_STYLE: Record<FeedKind, { chip: string; icon: ReactNode }> = {
  crown: { chip: 'bg-[#f2c53d] text-[#3b2604]', icon: <Crown size={10} className="fill-[#3b2604]" /> },
  hall: { chip: 'bg-[#ffd36e] text-[#3b2604]', icon: <Trophy size={10} /> },
  hell: { chip: 'bg-[#ff3355] text-white', icon: <Skull size={10} /> },
  hard: { chip: 'bg-[#3fd67a] text-[#06231a]', icon: <Flame size={10} className="fill-[#06231a]" /> },
  open: { chip: 'bg-[#8f9bff] text-[#0e1020]', icon: <Swords size={10} /> },
  slither: { chip: 'bg-[#b48cff] text-[#1c0b3a]', icon: <Zap size={10} className="fill-[#1c0b3a]" /> },
};
const FEED_PER_KIND = 3;

/** The day's news, newest first within each kind and the kinds dealt in turn: 1위 변동, 명예의 전당, 헬모드, 어려움 클리어, 오픈대전 승리, 맵 뺏기. */
export function useFeed(): FeedItem[] {
  const tl = useTranslations('Live');
  const th = useTranslations('HomeApp');
  const tc = useTranslations('Common');
  const [rows, setRows] = useState<{ crowns: { game: string; nickname: string; since: string }[]; events: { id: number; kind: string; game: string | null; name: string; other: string | null; value: number | null; created_at: string }[] }>({ crowns: [], events: [] });
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let alive = true;
    const load = () => Promise.all([
      supabase.rpc('game_crowns_public'),
      supabase.from('live_events').select('id, kind, game, name, other, value, created_at').in('kind', ['hall_rank', 'hell_clear', 'hard_clear', 'open_win', 'slither_take']).order('id', { ascending: false }).limit(60),
    ]).then(([crowns, events]) => {
      if (alive) setRows({ crowns: Array.isArray(crowns.data) ? crowns.data : [], events: Array.isArray(events.data) ? events.data : [] });
    }).catch(() => {});
    load();
    const id = window.setInterval(() => { if (document.visibilityState === 'visible') load(); }, 90_000);
    return () => { alive = false; window.clearInterval(id); };
  }, []);

  return useMemo(() => {
    const gameName = (g: string | null) => (g && GAME_LABEL[g as StatsGameId] ? tc(GAME_LABEL[g as StatsGameId]) : '');
    const hrefOf = (g: string | null) => (g && CERT_GAMES[g as StatsGameId]?.href) || '/';
    const byKind: Record<FeedKind, FeedItem[]> = { crown: [], hall: [], hell: [], hard: [], open: [], slither: [] };
    const dayAgo = Date.parse(rows.events[0]?.created_at ?? '') - 86_400_000 || 0;
    for (const c of [...rows.crowns].sort((a, b) => b.since.localeCompare(a.since))) {
      if (!CERT_GAMES[c.game as StatsGameId]) continue;
      // today's crown changes; if there were none, the latest few still show
      if (Date.parse(c.since) < dayAgo && byKind.crown.length >= FEED_PER_KIND) break;
      if (byKind.crown.length >= 6) break;
      byKind.crown.push({ key: `c-${c.game}`, kind: 'crown', name: c.nickname, text: th('crownMove', { name: c.nickname, game: gameName(c.game) }), at: Date.parse(c.since), href: hrefOf(c.game) });
    }
    const seen = new Set<string>();
    for (const e of rows.events) {
      const kind: FeedKind | null = e.kind === 'hall_rank' ? 'hall' : e.kind === 'hell_clear' ? 'hell' : e.kind === 'hard_clear' ? 'hard' : e.kind === 'open_win' ? 'open' : e.kind === 'slither_take' ? 'slither' : null;
      if (!kind || byKind[kind].length >= FEED_PER_KIND) continue;
      const dedupe = `${kind}-${e.name}-${e.game}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      const game = gameName(e.game);
      const text = kind === 'hall' ? tl('hallRank', { name: e.name, game, rank: e.value ?? 1 })
        : kind === 'hell' ? tl('hellClear', { name: e.name, game, n: e.value ?? 1 })
          : kind === 'hard' ? tl('hardClear', { name: e.name, game, n: e.value ?? 1 })
            : kind === 'open' ? tl('openWin', { name: e.name, game })
              : e.other ? tl('slitherTake', { name: e.name, other: e.other }) : tl('slitherTakeAnon', { name: e.name });
      byKind[kind].push({ key: `e-${e.id}`, kind, name: e.name, text, at: Date.parse(e.created_at), href: kind === 'slither' ? '/slitherlink' : hrefOf(e.game) });
    }
    const out: FeedItem[] = [];
    const order: FeedKind[] = ['crown', 'hell', 'hall', 'open', 'hard', 'slither'];
    for (let i = 0; i < 6; i++) for (const k of order) if (byKind[k][i]) out.push(byKind[k][i]);
    return out;
  }, [rows, tl, th, tc]);
}

export function LiveFeed({ items, className = 'mx-4 mt-2.5' }: { items: FeedItem[]; className?: string }) {
  const th = useTranslations('HomeApp');
  const [at, setAt] = useState(0);
  const [now, setNow] = useState(0);
  const n = items.length;
  useEffect(() => {
    const tick = () => { setAt((v) => v + 1); setNow(Date.now()); };
    const first = window.setTimeout(() => setNow(Date.now()), 0);
    const id = n > 1 ? window.setInterval(tick, 3000) : 0;
    return () => { window.clearTimeout(first); if (id) window.clearInterval(id); };
  }, [n]);
  if (!n) return null;
  const item = items[at % n];
  const k = FEED_STYLE[item.kind];
  const mins = now ? Math.max(0, Math.round((now - item.at) / 60000)) : -1;
  const ago = mins < 0 ? '' : mins < 1 ? th('agoNow') : mins < 60 ? th('agoMin', { n: mins }) : mins < 1440 ? th('agoHour', { n: Math.round(mins / 60) }) : th('agoDay', { n: Math.round(mins / 1440) });
  return (
    <Link href={item.href as CatalogGame['href']} className={`${className} flex h-[46px] items-center gap-2 overflow-hidden rounded-[18px] bg-[#17201e] pl-2 pr-3 text-white active:scale-[.985]`} aria-live="off">
      <span key={`c${at}`} className={`home-feed flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${k.chip}`}>{k.icon}{th(`feed_${item.kind}`)}</span>
      <span key={`t${at}`} className="home-feed flex min-w-0 flex-1 items-center gap-1.5 text-[11.5px] font-bold">
        <StoneAvatar name={item.name} size={16} />
        <span className="line-clamp-2 min-w-0 break-keep text-[11px] leading-[14px] text-white/85">{item.text}</span>
      </span>
      <span key={`a${at}`} className="home-feed shrink-0 text-[10px] font-bold text-white/35">{ago}</span>
      <i className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#3fd67a]" />
    </Link>
  );
}

export const MEDAL = ['#f2c53d', '#b8bfca', '#c98a55'];
export const PODIUM_STAT = { wins: 'podiumWins', maps: 'podiumMaps', score: 'podiumScore', correct: 'podiumCorrect', time: 'podiumScore' } as const; // time entries carry their own label

/** Under a tile: the game's #1 (one stone and the name). */
export function TopOne({ podium }: { podium?: GamePodium }) {
  const th = useTranslations('HomeApp');
  const top = podium?.entries[0];
  if (!top) return <span className="mt-0.5 block text-center text-[10px] font-bold text-black/30">{th('noTop')}</span>;
  return (
    <span className="mt-0.5 flex items-center justify-center gap-1 px-0.5">
      <span className="flex h-[13px] shrink-0 items-center rounded-full bg-[#f2c53d] px-1 text-[8.5px] font-black leading-none text-[#3b2604]">{th('first')}</span>
      <span className="shrink-0">{top.block ? <RankBlock block={top.block} name={top.nickname} size={16} /> : <StoneAvatar name={top.nickname} size={15} />}</span>
      <span className="min-w-0 truncate text-[10px] font-black text-black/55">{top.nickname}</span>
      {top.label && <span className="shrink-0 font-mono text-[10px] font-black text-black/40">{top.label}</span>}
    </span>
  );
}

/** On the picture: where I stand in this game — "[nickname] 7위". */
export function MyRank({ rank, name }: { rank?: number; name: string }) {
  const th = useTranslations('HomeApp');
  if (!rank) return null;
  const first = rank === 1;
  return (
    <span className={`absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-12px)] items-center gap-1 rounded-full px-1.5 py-[3px] text-[9px] font-black leading-none shadow-[0_3px_8px_rgba(0,0,0,.3)] ${first ? 'bg-[#f2c53d] text-[#3b2604]' : 'bg-[#17201e] text-white'}`}>
      {first && <Crown size={9} className="shrink-0 fill-[#3b2604]" />}
      <span className={`min-w-0 truncate ${first ? '' : 'text-white/70'}`}>{name}</span><span className="shrink-0">{th('rankN', { n: rank })}</span>
    </span>
  );
}

/** The home's event banners: AI 헬모드, 피스 경쟁전 (while it runs) and 오픈 대전 with the matches on right now. */
export function useHomeEvents(races: Races) {
  const th = useTranslations('HomeApp');
  const [week] = useState(() => piecePeriodOf()); // 피스 경쟁전 runs every week now
  const [rooms, setRooms] = useState<number | null>(null);
  const [live, setLive] = useState<{ open: number; friend: number } | null>(null); // matches being played right now
  useEffect(() => {
    let alive = true;
    const load = () => {
      listAllOpenRooms().then((list) => { if (alive && list) setRooms(list.length); });
      listLiveRooms().then((list) => { if (alive && list) setLive({ open: list.reduce((n, r) => n + r.open, 0), friend: list.reduce((n, r) => n + r.friend, 0) }); });
    };
    load();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') load(); }, 60_000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  const openSide = <RacePodium rows={races.open} icon={(p) => `o-${p}`} accent="#b9c1ff" count={(n) => th('winsN', { n })} />;

  const events = [
    { key: 'hell', icon: <Skull size={15} />, eyebrow: 'AI HELL MODE', title: th('evHellTitle'), sub: th('evHellSub'), cta: th('evHellCta'), bg: 'linear-gradient(135deg, #2a0812 0%, #07060a 70%)', accent: '#ff3355', href: '/hell' as const, hash: undefined, side: <RacePodium rows={races.black} icon={(p) => `h1-${p}`} accent="#ff8ea0" /> },
    { key: 'piece', icon: <Puzzle size={15} />, eyebrow: `PIECE RACE · ${week}W`, title: th('evPieceTitle', { n: week }), sub: th('evPieceSub', { end: kstMonthDay(piecePeriodBounds(week).ends - 1) }), cta: th('evPieceCta'), bg: 'linear-gradient(135deg, #2c2a14 0%, #17201e 70%)', accent: '#ffd36e', href: '/records' as const, hash: 'competition', side: <RacePodium rows={races.piece} icon={(p) => `w${week}-${p}`} accent="#ffd36e" /> },
    { key: 'open', icon: <Swords size={15} />, eyebrow: 'OPEN MATCH', title: th('evOpenTitle'), sub: live ? th('evOpenLive', { open: live.open, friend: live.friend }) + (rooms ? ` · ${th('evOpenWaiting', { n: rooms })}` : '') : rooms ? th('evOpenRooms', { n: rooms }) : th('evOpenSub'), cta: th('evOpenCta'), bg: 'linear-gradient(135deg, #1b1f4a 0%, #0e1020 70%)', accent: '#8f9bff', href: '/' as const, hash: 'open-match', side: openSide },
  ];
  return events;
}

export default function HomeApp({ Preview, openMatch, Heading = 'h1' }: { Preview: ComponentType<{ id: GameId }>; openMatch: ReactNode; /** 'p' while the desktop layout (with its own h1) is in the same HTML */ Heading?: 'h1' | 'p' }) {
  const t = useTranslations('Home');
  const th = useTranslations('HomeApp');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { user, ready, nickname } = useAuth();
  const me = useMe(user?.id ?? null);
  const races = useRaces(user?.id ?? null);
  const myPiece = races.piece.find((r) => r.is_me), myBlack = races.black.find((r) => r.is_me);
  const wallet = useWallet(!!user);
  const podiums = useHallPodiums();
  const playApp = usePlayApp();
  const feed = useFeed().filter((item) => !(playApp && hiddenGameOfPath(item.href, GAMES))); // Google Play app: no hidden games
  const [cat, setCat] = useState<Cat>('all');
  const [ev, setEv] = useState(0);
  const games = useAppGames(); // without the games hidden in the Google Play app
  const list = games.filter((g) => inCat(g, cat));
  // Today's pick is chosen by hand (TODAY_PICK); a category shows the first game of its list instead.
  const hero = cat === 'all' ? GAMES.find((g) => g.id === TODAY_PICK) ?? list[0] : list[0];
  const rest = list.filter((g) => g !== hero);
  const name = nickname?.trim() || '';
  const recent = me.recent.map((href) => games.find((g) => g.href === href)).filter((g): g is CatalogGame => !!g).slice(0, 6);
  const heroPodium = hero ? podiums?.get(hero.href) : undefined;

  const events = useHomeEvents(races);

  return (
    <div className="bg-[#f3f0e8] pb-10 text-[#17201e]">
      <Heading className="sr-only">{t('title1')} {t('title2')}</Heading>
      <p className="sr-only">{t('description1')} {t('description2')}</p>

      {/* profile strip: my icon and nickname, 피스 and 블랙피스 */}
      {ready && (
        <section className="px-4 pt-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link href={{ pathname: '/records', hash: 'my-icon' }} className="flex min-w-0 flex-1 items-center gap-2 active:scale-[.98]">
                <Stone name={name || 'me'} size={38} />
                <span className="min-w-0"><b className="block truncate text-[15px] font-black tracking-[-0.02em]">{name || th('noName')}</b><span className="flex items-center text-[10.5px] font-bold text-black/40">{th('myRecords')}<ChevronRight size={11} /></span></span>
              </Link>
              <Link href={{ pathname: '/records', hash: 'competition' }} className="flex shrink-0 flex-col items-center rounded-2xl bg-[#17201e] px-3 py-1.5 text-white active:scale-95" title={th('pieces')}>
                <span className="flex items-center gap-1 text-[13px] font-black text-[#ffd36e]"><Piece size={12} />{myPiece?.pieces ?? 0}</span>
                <span className="text-[9px] font-bold text-white/45">{myPiece ? th('piecesRank', { n: myPiece.rank }) : th('pieces')}</span>
              </Link>
              {!!wallet?.tokens && (
                <Link href={{ pathname: '/records', hash: 'competition' }} data-token-chip className="flex shrink-0 flex-col items-center rounded-2xl bg-[#2a1670] px-3 py-1.5 text-white ring-1 ring-[#b48cff]/40 active:scale-95" title={th('tokens')}>
                  <span className="flex items-center gap-1 text-[13px] font-black text-[#e3d8ff]"><SageToken size={14} />{wallet.tokens}</span>
                  <span className="text-[9px] font-bold text-white/45">{th('tokens')}</span>
                </Link>
              )}
              <Link href="/hell" className="flex shrink-0 flex-col items-center rounded-2xl bg-[#07060a] px-3 py-1.5 text-white ring-1 ring-[#ff3355]/40 active:scale-95" title={th('blackPieces')}>
                <span className="flex items-center gap-1 text-[13px] font-black text-[#ff5c77]"><BlackPiece size={12} glow={false} />{myBlack?.pieces ?? 0}</span>
                <span className="text-[9px] font-bold text-white/45">{myBlack ? th('blackRank', { n: myBlack.rank }) : th('blackPieces')}</span>
              </Link>
            </div>
          ) : (
            <Link href="/records" className="flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 ring-1 ring-black/10 active:scale-[.985]">
              <span className="flex items-center gap-1.5"><Piece size={14} /><BlackPiece size={14} glow={false} /></span>
              <span className="min-w-0 flex-1 break-keep text-[12px] font-black">{th('signInPitch')}</span>
              <span className="shrink-0 rounded-full bg-[#17201e] px-3 py-1.5 text-[11px] font-black text-white">{th('signIn')}</span>
            </Link>
          )}
        </section>
      )}

      {/* continue playing */}
      {recent.length > 0 && (
        <section className="px-4 pt-3">
          <ul className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
            {recent.map((g, i) => (
              <li key={g.id} className="shrink-0">
                <Link href={g.href} className="flex w-[58px] flex-col items-center gap-1 active:scale-95">
                  <span className="relative h-[58px] w-[58px] rounded-full p-[2.5px]" style={{ background: `conic-gradient(${g.color}, ${tint(g.color, 0.35)}, ${g.color})` }}>
                    <span className="block h-full w-full overflow-hidden rounded-full bg-[#17201e]"><FitTile title={tc(g.id)} className="h-full w-full"><Preview id={g.id} /></FitTile></span>
                    {i === 0 && <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b4a] text-white ring-2 ring-[#f3f0e8]"><Play size={10} className="fill-white" /></span>}
                  </span>
                  <span className="w-full truncate text-center text-[10.5px] font-bold text-black/60">{i === 0 ? th('continue') : tc(g.id)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* events: one swipeable card, then the news line */}
      <section className="pt-3">
        <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 [scrollbar-width:none]"
          onScroll={(e) => { const el = e.currentTarget; setEv(Math.round(el.scrollLeft / (el.clientWidth - 22))); }}>
          {events.map((e) => (
            <Link key={e.key} href={e.hash ? { pathname: e.href, hash: e.hash } : e.href} className="relative flex h-[150px] w-[calc(100%-22px)] shrink-0 snap-center items-stretch justify-between gap-2 overflow-hidden rounded-[22px] p-4 text-white active:scale-[.985]" style={{ background: e.bg }}>
              <span className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 rounded-full blur-2xl" style={{ background: tint(e.accent, 0.35) }} />
              <span className="relative flex min-w-0 flex-1 flex-col justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.16em]" style={{ color: e.accent }}>{e.icon}<span className="truncate">{e.eyebrow}</span></span>
                <span className="min-w-0"><b className="block break-keep text-[20px] font-black leading-[1.1] tracking-[-0.04em]">{e.title}</b><span className="mt-1 line-clamp-2 block break-keep text-[11px] font-bold leading-[14px] text-white/60">{e.sub}</span></span>
                <span className="w-fit rounded-full px-3.5 py-1.5 text-[12px] font-black text-[#17201e]" style={{ background: e.accent }}>{e.cta}</span>
              </span>
              <span className="relative flex shrink-0 items-center">{e.side}</span>
            </Link>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-1.5">{events.map((e, i) => <i key={e.key} className={`h-1.5 rounded-full transition-all ${i === ev ? 'w-4 bg-[#17201e]' : 'w-1.5 bg-black/20'}`} />)}</div>
        <LiveFeed items={feed} />
      </section>

      {/* category chips (stick while scrolling) */}
      <nav className="sticky top-0 z-10 mt-2 flex gap-1.5 overflow-x-auto bg-[#f3f0e8]/90 px-4 py-2.5 backdrop-blur [scrollbar-width:none]">
        {CATS.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-black transition active:scale-95 ${cat === c ? 'bg-[#17201e] text-white' : 'bg-white text-black/55 ring-1 ring-black/10'}`}>
            {th(`cat_${c}`)}<span className={`ml-1 text-[10.5px] ${cat === c ? 'text-white/50' : 'text-black/30'}`}>{games.filter((g) => inCat(g, c)).length}</span>
          </button>
        ))}
      </nav>

      <section className="px-4">
        {/* today's pick */}
        {hero && (
          <Link href={hero.href} onClick={() => pushRecent(hero.href)} className="relative flex min-h-[232px] items-center gap-3 overflow-hidden rounded-[26px] p-4 active:scale-[.985]"
            style={{ background: `radial-gradient(120% 90% at 0% 0%, ${shade(hero.color, 0.28, '#ffffff')} 0%, transparent 55%), radial-gradient(90% 80% at 100% 100%, ${shade(hero.color, 0.55, '#12062e')} 0%, transparent 60%), linear-gradient(135deg, ${hero.color} 0%, ${shade(hero.color, 0.35, '#12062e')} 100%)` }}>
            <span className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.55)_1px,transparent_1.4px)] [background-size:14px_14px] [mask-image:linear-gradient(115deg,transparent_25%,#000_95%)]" />
            <span className="pointer-events-none absolute -right-14 top-1/2 h-[250px] w-[250px] -translate-y-1/2 rounded-full border-[22px] border-white/10" />
            <span className="pointer-events-none absolute -right-2 top-1/2 h-[150px] w-[150px] -translate-y-1/2 rounded-full bg-white/25 blur-2xl" />
            <span className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/25 blur-2xl" />
            <span className="home-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <svg viewBox="0 0 100 100" className="pointer-events-none absolute left-[47%] top-3 h-5 w-5 text-white/80" aria-hidden="true"><path d="M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42Z" fill="currentColor" /></svg>
            <svg viewBox="0 0 100 100" className="pointer-events-none absolute bottom-4 left-[52%] h-3 w-3 text-white/60" aria-hidden="true"><path d="M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42Z" fill="currentColor" /></svg>
            <span className="relative flex min-w-0 flex-1 flex-col justify-between gap-3 self-stretch text-white">
              <span className="flex flex-wrap items-center gap-1.5"><span className="flex w-fit items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-black tracking-[0.12em]"><Flame size={11} className="fill-white" />{th('todayPick')}</span>{hero.id === 'hiddenWordPlus' && <span className="rounded-full bg-[#7c5cff] px-2.5 py-1 text-[10px] font-black tracking-[0.02em] text-white shadow-[0_0_10px_rgba(124,92,255,.55)]">{t('partyOpenTag')}</span>}</span>
              <span>
                {heroPodium?.entries.length ? (
                  <span className="mb-2 flex flex-col gap-[3px]">
                    {heroPodium.entries.slice(0, 3).map((e, i) => (
                      <span key={e.rank} className="flex items-center gap-1.5 text-[11px] font-black">
                        <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full text-[9px] text-black/70" style={{ background: MEDAL[i] }}>{i + 1}</span>
                        <span className="shrink-0">{e.block ? <RankBlock block={e.block} name={e.nickname} size={16} /> : <StoneAvatar name={e.nickname} size={16} />}</span>
                        <span className="min-w-0 max-w-[92px] truncate">{e.nickname}</span>
                        <span className="shrink-0 font-bold text-white/65">{e.label ?? t(PODIUM_STAT[heroPodium.kind], { n: e.n })}</span>
                      </span>
                    ))}
                  </span>
                ) : null}
                {name && me.ranks.get(hero.href) ? <span className="mb-1.5 flex w-fit max-w-full items-center gap-1 rounded-full bg-[#17201e] px-2 py-1 text-[10.5px] font-black"><span className="min-w-0 max-w-[90px] truncate text-white/70">{name}</span>{th('rankN', { n: me.ranks.get(hero.href)! })}</span> : null}
                <b className="block break-keep text-[26px] font-black leading-[1.05] tracking-[-0.05em] drop-shadow-sm">{tc(hero.id)}</b>
                {t.has(`${hero.id}Description`) && <span className="mt-1 line-clamp-2 block break-keep text-[11.5px] font-bold leading-[15px] text-white/80">{t(`${hero.id}Description`)}</span>}
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12.5px] font-black text-[#17201e]"><Play size={12} className="fill-[#17201e]" />{th('playNow')}</span>
              </span>
            </span>
            <span className="home-float relative h-[136px] w-[136px] shrink-0 rotate-[4deg] overflow-hidden rounded-[22px] bg-[#17201e]/90 shadow-[0_18px_36px_rgba(0,0,0,.35)] ring-2 ring-white/40"><FitTile title={tc(hero.id)} className="h-full w-full"><Preview id={hero.id} /></FitTile></span>
          </Link>
        )}

        {/* every other game: picture tiles, three across */}
        <ul className="mt-2.5 grid grid-cols-3 gap-x-2.5 gap-y-3">
          {rest.map((g) => (
            <li key={g.id}>
              <Link href={g.href} onClick={() => pushRecent(g.href)} className="block active:scale-95">
                <span className="relative block aspect-square overflow-hidden rounded-[20px]" style={g.id === 'slitherlink' ? XMAS_CARD : { background: `linear-gradient(160deg, ${tint(g.color, 0.3)} 0%, ${tint(g.color, 0.12)} 100%)`, boxShadow: `inset 0 0 0 1px ${tint(g.color, 0.28)}` }}>
                  <span className="absolute inset-[9%] overflow-hidden rounded-[14px] bg-[#17201e]/90"><FitTile title={tc(g.id)} className="h-full w-full"><Preview id={g.id} /></FitTile></span>
                  {g.id === 'hiddenWordPlus' ? <span className="absolute left-1.5 top-1.5 rounded-full bg-[linear-gradient(135deg,#ffe9a6,#e0a83a)] px-1.5 py-0.5 text-[8.5px] font-black tracking-[0.04em] text-[#2a1a04]">NEW+</span>
                    : g.id === 'slitherlink' ? <span className="absolute left-1.5 top-1.5 rounded-full bg-[#e23b4e] px-1.5 py-0.5 text-[8.5px] font-black tracking-[0.04em] text-white shadow-[0_0_10px_rgba(226,59,78,.5)]">🎄 X-MAS</span>
                          : CHANGED_TAG[g.id] ? <span className="absolute left-1.5 top-1.5 rounded-full bg-[#3fb8ff] px-1.5 py-0.5 text-[8.5px] font-black tracking-[0.02em] text-[#04263a] shadow-[0_0_10px_rgba(63,184,255,.5)]">{tc(CHANGED_TAG[g.id]!)}</span>
                          : NEW.includes(g.id) && <span className="absolute left-1.5 top-1.5 rounded-full bg-[#ff4d5e] px-1.5 py-0.5 text-[8.5px] font-black tracking-[0.08em] text-white">NEW</span>}
                  {g.id === 'hiddenWordPlus' && <span className="absolute bottom-1.5 left-1.5 max-w-[calc(100%-12px)] truncate rounded-full bg-[#7c5cff] px-1.5 py-0.5 text-[8.5px] font-black tracking-[0.02em] text-white shadow-[0_0_10px_rgba(124,92,255,.55)]">{t('partyOpenTag')}</span>}
                  {g.original && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-[linear-gradient(135deg,#2c1470,#5b37c9)] px-1.5 py-0.5 text-[8px] font-black tracking-[0.1em] text-white ring-1 ring-[#c9b6ff]/60">{tc('originalTag')}</span>}
                  {g.hell?.live && <span className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#07060a] text-[#ff3355] ring-1 ring-[#ff3355]/60"><Skull size={10} /></span>}
                  {name && <MyRank rank={me.ranks.get(g.href)} name={name} />}
                </span>
                <span className="mt-1.5 block truncate text-center text-[12px] font-black tracking-[-0.02em]">{tc(g.id)}</span>
                <TopOne podium={podiums?.get(g.href)} />
              </Link>
            </li>
          ))}
        </ul>

        {/* Below the game list: PUZZLTHINK ORIGINAL (the site's own games), then the tester's card. */}
        {cat === 'all' && <OriginalsRow Preview={Preview} isNew={(id) => NEW.includes(id)} onOpen={pushRecent} className="mt-5" />}
        <AppTesterStrip className="mt-4" />

        <div id="open-match" className="mt-6 scroll-mt-16">{openMatch}</div>
        <IconCollectionLink className="mt-4" />
        <p className="mt-3 text-center text-[10.5px] font-bold text-black/30">{locale === 'en' ? 'Ranks update every few minutes' : th('rankNote')}</p>
      </section>
    </div>
  );
}
