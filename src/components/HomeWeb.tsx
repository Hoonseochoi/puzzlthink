"use client";

/**
 * The home page from 640px up: an unfolded foldable or a tablet (640–1023px) and the desktop web (1024px+).
 * One tree, laid out by width.
 * - Top: today's pick beside the three event banners (each with its live top three).
 * - Below: every game as a picture card, filtered by the category chips, then the 오픈 대전 panel.
 * - Desktop adds a right rail: my profile (피스 · 블랙피스), 최근 플레이, the live news list and an ad unit.
 *   On a foldable the rail's content sits in the page instead: a profile strip on top, a news line under the banners.
 * Ad units (`home` under the game grid, `rail` in the rail) draw nothing until their slot ids are set.
 * Phones keep the app home (HomeApp), which this shares its data hooks with.
 */
import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronRight, Flame, Play, Skull, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { GAMES, type CatalogGame, type GameId } from '@/lib/gameCatalog';
import { useChallengeRates } from '@/lib/challengeRates';
import AdSlot from './AdSlot';
import { useAuth } from './AuthProvider';
import { Piece } from './CompetitionBoard';
import { BlackPiece } from './hell/BlackPiece';
import { useHallPodiums } from './HallPodium';
import {
  CATS, type Cat, FEED_STYLE, type FeedItem, LiveFeed, MEDAL, MyRank, NEW, PODIUM_STAT, TODAY_PICK, TopOne,
  inCat, pushRecent, shade, tint, useFeed, useHomeEvents, useMe, useRaces,
} from './HomeApp';
import IconCollectionLink from './IconCollectionLink';
import RankBlock from './merge2048/RankBlock';
import { FitTile } from './OpenMatchCard';
import StoneAvatar, { Stone } from './StoneAvatar';

// Home description keys that do not follow `${id}Description`.
const DESC_KEY: Partial<Record<GameId, string>> = { russianJanggi: 'rjanggiDescription', russianRoulette: 'rouletteDescription' };
const RATE_TONE = { easy: 'bg-[#18b26b] text-white', medium: 'bg-[#ffb52e] text-[#3a2400]', hard: 'bg-[#e0283a] text-white' } as const;
const CARD = 'rounded-[24px] border border-black/[0.07] bg-white/70 shadow-[0_10px_30px_rgba(30,38,36,.05)]';

/** The news list in the desktop rail: the latest of each kind, with how long ago. */
function FeedList({ items }: { items: FeedItem[] }) {
  const th = useTranslations('HomeApp');
  const [now, setNow] = useState(0);
  useEffect(() => {
    const first = window.setTimeout(() => setNow(Date.now()), 0);
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => { window.clearTimeout(first); window.clearInterval(id); };
  }, []);
  if (!items.length) return null;
  const ago = (at: number) => {
    if (!now) return '';
    const mins = Math.max(0, Math.round((now - at) / 60000));
    return mins < 1 ? th('agoNow') : mins < 60 ? th('agoMin', { n: mins }) : mins < 1440 ? th('agoHour', { n: Math.round(mins / 60) }) : th('agoDay', { n: Math.round(mins / 1440) });
  };
  return (
    <section className="overflow-hidden rounded-[24px] bg-[#17201e] p-4 text-white">
      <h2 className="flex items-center gap-2 text-[13px] font-black"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3fd67a]" />{th('feedTitle')}</h2>
      <ul className="mt-2 flex flex-col">
        {items.slice(0, 7).map((item) => (
          <li key={item.key} className="border-t border-white/[0.07] first:border-t-0">
            <Link href={item.href as CatalogGame['href']} className="-mx-2 flex items-start gap-2 rounded-xl px-2 py-2 transition hover:bg-white/[0.06]">
              <span className="mt-0.5 shrink-0"><StoneAvatar name={item.name} size={22} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className={`flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-black ${FEED_STYLE[item.kind].chip}`}>{FEED_STYLE[item.kind].icon}{th(`feed_${item.kind}`)}</span>
                  <span className="text-[10px] font-bold text-white/35">{ago(item.at)}</span>
                </span>
                <span className="mt-1 line-clamp-2 block break-keep text-[11.5px] font-bold leading-[15px] text-white/80">{item.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HomeWeb({ Preview, openMatch, className = '' }: { Preview: ComponentType<{ id: GameId }>; openMatch: ReactNode; className?: string }) {
  const t = useTranslations('Home');
  const th = useTranslations('HomeApp');
  const tc = useTranslations('Common');
  const { user, ready, nickname } = useAuth();
  const me = useMe(user?.id ?? null);
  const races = useRaces(user?.id ?? null);
  const events = useHomeEvents(races);
  const podiums = useHallPodiums();
  const rates = useChallengeRates();
  const feed = useFeed();
  const [cat, setCat] = useState<Cat>('all');

  const name = nickname?.trim() || '';
  const myPiece = races.piece.find((r) => r.is_me), myBlack = races.black.find((r) => r.is_me);
  const list = GAMES.filter((g) => inCat(g, cat));
  const pick = GAMES.find((g) => g.id === TODAY_PICK) ?? GAMES[0];
  const pickPodium = podiums?.get(pick.href);
  const recent = me.recent.map((href) => GAMES.find((g) => g.href === href)).filter((g): g is CatalogGame => !!g).slice(0, 5);
  const desc = (g: CatalogGame) => { const key = DESC_KEY[g.id] ?? `${g.id}Description`; return t.has(key) ? t(key) : ''; };

  const pieceBox = (
    <Link href={{ pathname: '/records', hash: 'competition' }} className="flex flex-1 flex-col items-center rounded-2xl bg-[#17201e] px-3 py-2 text-white transition hover:-translate-y-0.5" title={th('pieces')}>
      <span className="flex items-center gap-1 text-[15px] font-black text-[#ffd36e]"><Piece size={13} />{myPiece?.pieces ?? 0}</span>
      <span className="text-[10px] font-bold text-white/45">{myPiece ? th('piecesRank', { n: myPiece.rank }) : th('pieces')}</span>
    </Link>
  );
  const blackBox = (
    <Link href="/hell" className="flex flex-1 flex-col items-center rounded-2xl bg-[#07060a] px-3 py-2 text-white ring-1 ring-[#ff3355]/40 transition hover:-translate-y-0.5" title={th('blackPieces')}>
      <span className="flex items-center gap-1 text-[15px] font-black text-[#ff5c77]"><BlackPiece size={13} glow={false} />{myBlack?.pieces ?? 0}</span>
      <span className="text-[10px] font-bold text-white/45">{myBlack ? th('blackRank', { n: myBlack.rank }) : th('blackPieces')}</span>
    </Link>
  );
  const signIn = (
    <Link href="/records" className="flex items-center gap-2.5 transition hover:opacity-80">
      <span className="flex shrink-0 items-center gap-1.5"><Piece size={16} /><BlackPiece size={16} glow={false} /></span>
      <span className="min-w-0 flex-1 break-keep text-[12.5px] font-black leading-[17px]">{th('signInPitch')}</span>
      <span className="shrink-0 rounded-full bg-[#17201e] px-3.5 py-2 text-[11.5px] font-black text-white">{th('signIn')}</span>
    </Link>
  );
  const recentRow = (g: CatalogGame, i: number, size: number) => (
    <Link key={g.id} href={g.href} className="group flex shrink-0 flex-col items-center gap-1" style={{ width: size }}>
      <span className="relative rounded-full p-[2.5px] transition group-hover:-translate-y-0.5" style={{ width: size, height: size, background: `conic-gradient(${g.color}, ${tint(g.color, 0.35)}, ${g.color})` }}>
        <span className="block h-full w-full overflow-hidden rounded-full bg-[#17201e]"><FitTile title={tc(g.id)} className="h-full w-full"><Preview id={g.id} /></FitTile></span>
        {i === 0 && <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b4a] text-white ring-2 ring-[#f3f0e8]"><Play size={10} className="fill-white" /></span>}
      </span>
      <span className="w-full truncate text-center text-[10.5px] font-bold text-black/60">{i === 0 ? th('continue') : tc(g.id)}</span>
    </Link>
  );

  return (
    <main className={`min-h-screen bg-[#f3f0e8] text-[#17201e] ${className}`}>
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-5 lg:px-8 lg:pt-8">
        {/* headline (desktop) · profile strip (foldable) */}
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0 max-lg:sr-only">
            <p className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.18em] text-black/40"><Sparkles size={12} className="text-[#ff6b4a]" />{t('eyebrow')}</p>
            <h1 className="mt-1.5 break-keep text-[30px] font-black leading-[1.1] tracking-[-0.05em] xl:text-[34px]">{t('title1')} {t('title2')}</h1>
            <p className="mt-1.5 break-keep text-[13px] leading-5 text-black/50">{t('description1')} {t('description2')}</p>
          </div>
          <Link href="/game-list" className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[12px] font-black ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:ring-black/25 lg:flex">{th('allGames', { n: GAMES.length })}<ArrowRight size={14} /></Link>
        </div>
        {ready && (
          <section className="lg:hidden">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link href={{ pathname: '/records', hash: 'my-icon' }} className="flex min-w-0 flex-1 items-center gap-2.5 active:scale-[.98]">
                  <Stone name={name || 'me'} size={42} />
                  <span className="min-w-0"><b className="block truncate text-[16px] font-black tracking-[-0.02em]">{name || th('noName')}</b><span className="flex items-center text-[11px] font-bold text-black/40">{th('myRecords')}<ChevronRight size={11} /></span></span>
                </Link>
                {recent.length > 0 && <div className="flex gap-2.5 max-md:hidden">{recent.slice(0, 4).map((g, i) => recentRow(g, i, 46))}</div>}
                <div className="flex w-[190px] shrink-0 gap-2">{pieceBox}{blackBox}</div>
              </div>
            ) : <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/10">{signIn}</div>}
          </section>
        )}

        {/* today's pick + the event banners */}
        <section className="mt-3 grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-3 lg:mt-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-4">
          <Link href={pick.href} onClick={() => pushRecent(pick.href)} className="group relative flex min-h-[318px] items-center gap-4 overflow-hidden rounded-[28px] p-5 transition hover:shadow-[0_24px_60px_rgba(30,38,36,.22)] lg:min-h-[384px] lg:gap-8 lg:rounded-[32px] lg:p-9"
            style={{ background: `radial-gradient(120% 90% at 0% 0%, ${shade(pick.color, 0.28, '#ffffff')} 0%, transparent 55%), radial-gradient(90% 80% at 100% 100%, ${shade(pick.color, 0.55, '#12062e')} 0%, transparent 60%), linear-gradient(135deg, ${pick.color} 0%, ${shade(pick.color, 0.35, '#12062e')} 100%)` }}>
            <span className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.55)_1px,transparent_1.4px)] [background-size:16px_16px] [mask-image:linear-gradient(115deg,transparent_25%,#000_95%)]" />
            <span className="pointer-events-none absolute -right-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border-[34px] border-white/10" />
            <span className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
            <span className="home-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <span className="relative flex min-w-0 flex-1 flex-col justify-between gap-4 self-stretch text-white">
              <span className="flex w-fit items-center gap-1 rounded-full bg-black/25 px-3 py-1.5 text-[10.5px] font-black tracking-[0.12em]"><Flame size={12} className="fill-white" />{th('todayPick')}</span>
              <span>
                {pickPodium?.entries.length ? (
                  <span className="mb-3 flex flex-col gap-1">
                    {pickPodium.entries.slice(0, 3).map((e, i) => (
                      <span key={e.rank} className="flex items-center gap-1.5 text-[11.5px] font-black lg:text-[13px]">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9.5px] text-black/70" style={{ background: MEDAL[i] }}>{i + 1}</span>
                        <span className="shrink-0">{e.block ? <RankBlock block={e.block} name={e.nickname} size={18} /> : <StoneAvatar name={e.nickname} size={18} />}</span>
                        <span className="min-w-0 max-w-[130px] truncate">{e.nickname}</span>
                        <span className="shrink-0 font-bold text-white/65">{t(PODIUM_STAT[pickPodium.kind], { n: e.n })}</span>
                      </span>
                    ))}
                  </span>
                ) : null}
                {name && me.ranks.get(pick.href) ? <span className="mb-2 flex w-fit max-w-full items-center gap-1 rounded-full bg-[#17201e] px-2.5 py-1 text-[11px] font-black"><span className="min-w-0 max-w-[110px] truncate text-white/70">{name}</span>{th('rankN', { n: me.ranks.get(pick.href)! })}</span> : null}
                <b className="block break-keep text-[30px] font-black leading-[1.02] tracking-[-0.05em] drop-shadow-sm lg:text-[46px]">{tc(pick.id)}</b>
                <span className="mt-1.5 line-clamp-2 block max-w-md break-keep text-[12px] font-bold leading-4 text-white/80 lg:text-[14px] lg:leading-5">{desc(pick)}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-black text-[#17201e] transition group-hover:gap-2.5 lg:px-5 lg:py-2.5 lg:text-[14px]"><Play size={13} className="fill-[#17201e]" />{th('playNow')}</span>
              </span>
            </span>
            <span className="home-float relative h-[150px] w-[150px] shrink-0 rotate-[4deg] overflow-hidden rounded-[24px] bg-[#17201e]/90 shadow-[0_18px_36px_rgba(0,0,0,.35)] ring-2 ring-white/40 lg:h-[250px] lg:w-[250px] lg:rounded-[32px]"><FitTile title={tc(pick.id)} className="h-full w-full"><Preview id={pick.id} /></FitTile></span>
          </Link>

          <div className="flex min-w-0 flex-col gap-3 lg:gap-4">
            {events.map((e) => (
              <Link key={e.key} href={e.hash ? { pathname: e.href, hash: e.hash } : e.href} className="group relative flex min-h-[98px] flex-1 items-center justify-between gap-2 overflow-hidden rounded-[22px] px-4 py-3 text-white transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,.22)] lg:rounded-[26px] lg:px-6" style={{ background: e.bg }}>
                <span className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 rounded-full blur-2xl" style={{ background: tint(e.accent, 0.35) }} />
                <span className="relative min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[9.5px] font-black tracking-[0.16em] lg:text-[10.5px]" style={{ color: e.accent }}>{e.icon}<span className="truncate">{e.eyebrow}</span></span>
                  <b className="mt-1 flex items-center gap-1.5 break-keep text-[17px] font-black leading-[1.1] tracking-[-0.04em] lg:text-[22px]">{e.title}<ArrowRight size={15} className="shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" style={{ color: e.accent }} /></b>
                  <span className="mt-1 line-clamp-2 block break-keep text-[10.5px] font-bold leading-[14px] text-white/60 lg:text-[12px] lg:leading-4">{e.sub}</span>
                </span>
                <span className="relative flex shrink-0 items-center [zoom:.78] lg:[zoom:1]">{e.side}</span>
              </Link>
            ))}
          </div>
        </section>
        <LiveFeed items={feed} className="mt-3 lg:hidden" />

        <div className="mt-6 grid gap-6 lg:mt-9 lg:grid-cols-[minmax(0,1fr)_316px] lg:gap-7">
          <div className="min-w-0">
            {/* categories */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[20px] font-black tracking-[-0.04em] lg:text-[24px]">{th('gamesTitle')}</h2>
              <nav className="flex gap-1.5">
                {CATS.map((c) => (
                  <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-black transition active:scale-95 ${cat === c ? 'bg-[#17201e] text-white' : 'bg-white text-black/55 ring-1 ring-black/10 hover:text-black hover:ring-black/25'}`}>
                    {th(`cat_${c}`)}<span className={`ml-1 text-[10.5px] ${cat === c ? 'text-white/50' : 'text-black/30'}`}>{GAMES.filter((g) => inCat(g, c)).length}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* every game */}
            <ul className="mt-4 grid grid-cols-4 gap-2.5 md:grid-cols-5 md:gap-3 lg:grid-cols-4 xl:grid-cols-5">
              {list.map((g) => {
                const rate = rates?.get(g.href);
                return (
                  <li key={g.id}>
                    <Link href={g.href} onClick={() => pushRecent(g.href)} className={`group block h-full p-2 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_44px_rgba(30,38,36,.13)] active:scale-[.98] md:p-2.5 ${CARD}`}>
                      <span className="relative block aspect-square overflow-hidden rounded-[18px]" style={{ background: `linear-gradient(160deg, ${tint(g.color, 0.32)} 0%, ${tint(g.color, 0.12)} 100%)`, boxShadow: `inset 0 0 0 1px ${tint(g.color, 0.28)}` }}>
                        <span className="absolute inset-[9%] overflow-hidden rounded-[13px] bg-[#17201e]/90 transition duration-300 group-hover:scale-[1.05]"><FitTile title={tc(g.id)} className="h-full w-full"><Preview id={g.id} /></FitTile></span>
                        {NEW.includes(g.id) && <span className="absolute left-1.5 top-1.5 rounded-full bg-[#ff4d5e] px-1.5 py-0.5 text-[9px] font-black tracking-[0.08em] text-white">NEW</span>}
                        {g.hell?.live && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#07060a] text-[#ff3355] ring-1 ring-[#ff3355]/60" title={t('hellTag')}><Skull size={11} /></span>}
                        {rate && <span title={t('clearRateTitle', { c: rate.clears, n: rate.attempts })} className={`absolute bottom-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-black max-md:hidden ${RATE_TONE[rate.level]}`}>{rate.pct}%</span>}
                        {name && <MyRank rank={me.ranks.get(g.href)} name={name} />}
                      </span>
                      <span className="mt-2 block truncate px-0.5 text-[13px] font-black tracking-[-0.03em] lg:text-[15px]">{tc(g.id)}</span>
                      <span className="mt-0.5 line-clamp-2 min-h-[30px] break-keep px-0.5 text-[11px] leading-[15px] text-black/45 max-lg:hidden">{desc(g)}</span>
                      <span className="mt-1 block border-t border-black/[0.06] pt-1.5 [&>span]:justify-start"><TopOne podium={podiums?.get(g.href)} /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <AdSlot placement="home" className="mx-auto mt-8 max-w-3xl" />

            <section id="open-match" className="mt-8 scroll-mt-24">
              <h2 className="mb-3 text-[20px] font-black tracking-[-0.04em] lg:text-[24px]">{th('evOpenTitle')}</h2>
              {openMatch}
            </section>
            <IconCollectionLink className="mt-4 lg:hidden" />
          </div>

          {/* desktop rail */}
          <aside className="hidden min-w-0 flex-col gap-4 lg:flex">
            {ready && (
              <section className={`p-4 ${CARD}`}>
                {user ? (
                  <>
                    <Link href={{ pathname: '/records', hash: 'my-icon' }} className="flex items-center gap-3 transition hover:opacity-80">
                      <Stone name={name || 'me'} size={48} />
                      <span className="min-w-0 flex-1"><b className="block truncate text-[17px] font-black tracking-[-0.03em]">{name || th('noName')}</b><span className="flex items-center text-[11px] font-bold text-black/40">{th('myRecords')}<ChevronRight size={11} /></span></span>
                    </Link>
                    <div className="mt-3 flex gap-2">{pieceBox}{blackBox}</div>
                  </>
                ) : signIn}
                {recent.length > 0 && (
                  <div className="mt-4 border-t border-black/[0.07] pt-3">
                    <h2 className="text-[11px] font-black tracking-[0.08em] text-black/40">{th('recentTitle')}</h2>
                    <div className="mt-2 flex justify-between gap-1">{recent.map((g, i) => recentRow(g, i, 50))}</div>
                  </div>
                )}
              </section>
            )}
            <FeedList items={feed} />
            <IconCollectionLink />
            <div className="sticky top-24"><AdSlot placement="rail" /></div>
          </aside>
        </div>
        <p className="mt-6 text-center text-[11px] font-bold text-black/30">{th('rankNote')}</p>
      </div>
    </main>
  );
}
