import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Crown, DoorOpen, Map as MapIcon, Swords, Timer, Trophy } from 'lucide-react';
import ShareButtons from '@/components/ShareButtons';
import { Link } from '@/i18n/routing';
import { CERT_GAMES } from '@/lib/hardClear';
import { formatMs } from '@/lib/nemoCount';
import { type GameRanking, fetchGameRanking, gameFromSlug, hasHall, hasOpen, rankImagePath, rankPath, rankSlug } from '@/lib/rankings';
import { pageMetadata } from '@/lib/seo';
import type { GameId } from '@/lib/stats';
import RankMove from '@/components/RankMove';
import StoneAvatar from '@/components/StoneAvatar';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';

type Params = { params: Promise<{ locale: string; game: string }> };
const MEDAL = ['🥇', '🥈', '🥉'];

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, game: slug } = await params;
  const game = gameFromSlug(slug);
  if (!game) return {};
  const t = await getTranslations({ locale, namespace: 'Ranking' });
  const name = CERT_GAMES[game][locale === 'en' ? 'en' : 'ko'];
  const base = pageMetadata({ locale, path: `/ranking/${slug}`, title: t('metaTitle', { game: name }), description: t('metaDescription', { game: name }) });
  const image = { url: rankImagePath(game, locale), width: 1200, height: 630, alt: t('metaTitle', { game: name }) };
  return { ...base, openGraph: { ...base.openGraph, images: [image] }, twitter: { ...base.twitter, images: [image.url] } };
}

function Board({ title, desc, icon, empty, rows }: { title: string; desc: string; icon: React.ReactNode; empty: string; rows: { rank: number; name: string; stat: string; prev?: number | null }[] }) {
  return (
    <section className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-5">
      <h2 className="flex items-center gap-2 text-lg font-black">{icon}{title}</h2>
      <p className="mt-1 text-xs text-black/45">{desc}</p>
      {rows.length ? (
        <ol className="mt-4 space-y-1.5">
          {rows.map((r) => (
            <li key={r.rank} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${r.rank <= 3 ? 'bg-white font-black shadow-sm' : 'bg-white/50'}`}>
              <span className="w-7 text-center font-mono">{MEDAL[r.rank - 1] ?? r.rank}</span>
              <span className="min-w-0 flex-1 truncate">{r.name}</span>
              <span className="font-mono text-xs text-black/60">{r.stat}</span>
              <RankMove rank={r.rank} prev={r.prev} />
            </li>
          ))}
        </ol>
      ) : <p className="mt-4 rounded-2xl bg-white/60 px-4 py-6 text-center text-xs text-black/45">{empty}</p>}
    </section>
  );
}

type PodiumRow = { rank: number; name: string; stat: string };

/** The top three on steps, 2nd · 1st · 3rd (empty steps wait for a name). */
function Podium({ rows, color, title, empty }: { rows: PodiumRow[]; color: string; title: string; empty: string }) {
  const by = new Map(rows.map((r) => [r.rank, r]));
  const step: Record<number, string> = {
    1: 'h-24 sm:h-32 bg-gradient-to-b from-[#ffd45c] to-[#e8a33c]',
    2: 'h-16 sm:h-24 bg-gradient-to-b from-[#eef0f4] to-[#b9bec8]',
    3: 'h-12 sm:h-16 bg-gradient-to-b from-[#f0c39a] to-[#c98a55]',
  };
  return (
    <section className="relative mt-8 overflow-hidden rounded-[28px] bg-[#17201e] px-4 pb-0 pt-5 text-white sm:px-8 sm:pt-7" style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${color}55, transparent 62%)` }}>
      <p className="flex items-center justify-center gap-1.5 text-[11px] font-black tracking-[0.18em] text-white/60"><Trophy size={13} className="text-[#ffd45c]" />{title}</p>
      {!rows.length && <p className="mt-1.5 text-center text-xs font-bold text-white/70">{empty}</p>}
      <div className="mx-auto mt-4 grid max-w-md grid-cols-3 items-end gap-2 sm:gap-4">
        {[2, 1, 3].map((place) => {
          const r = by.get(place);
          return (
            <div key={place} className="flex min-w-0 flex-col items-center text-center">
              {r ? <>
                <span className={place === 1 ? 'drop-shadow-[0_0_16px_rgba(255,196,60,.65)]' : ''}><StoneAvatar name={r.name} size={place === 1 ? 60 : 46} /></span>
                <span className="mt-1.5 w-full truncate px-1 text-xs font-black sm:text-sm">{r.name}</span>
                <span className="mt-0.5 text-[11px] font-bold text-white/55">{r.stat}</span>
              </> : <>
                <span className={`rounded-full border-2 border-dashed border-white/20 ${place === 1 ? 'h-[60px] w-[60px]' : 'h-[46px] w-[46px]'}`} />
                <span className="mt-1.5 text-[11px] font-bold text-white/35">?</span>
              </>}
              <span className={`mt-2 flex w-full items-start justify-center rounded-t-2xl pt-2 shadow-[inset_0_2px_0_rgba(255,255,255,.45)] ${step[place]}`}>
                <span className="text-3xl font-black text-white/90 sm:text-4xl" style={{ textShadow: '0 2px 0 rgba(0,0,0,.18)' }}>{place}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function RankingPage({ params }: Params) {
  const { locale, game: slug } = await params;
  setRequestLocale(locale);
  const game = gameFromSlug(slug);
  if (!game) notFound();
  const t = await getTranslations({ locale, namespace: 'Ranking' });
  const name = CERT_GAMES[game][locale === 'en' ? 'en' : 'ko'];
  const r: GameRanking = await fetchGameRanking(game);
  // The podium shows the game's main board: the map ranking, else the Hall of Fame, else the 30-minute challenge, else open matches.
  const nemoTop = r.nemo && (r.nemo.hard.length ? r.nemo.hard : r.nemo.normal.length ? r.nemo.normal : r.nemo.easy);
  const top: { title: string; rows: PodiumRow[] } = r.maps
    ? { title: t('mapsTitle'), rows: r.maps.slice(0, 3).map((x) => ({ rank: x.rank, name: x.nickname, stat: t('maps', { n: x.score }) })) }
    : hasHall(game) && r.hall.length ? { title: t('hallTitle'), rows: r.hall.slice(0, 3).map((x) => ({ rank: x.rank, name: x.nickname, stat: t('wins', { w: x.wins, g: x.games }) })) }
    : nemoTop ? { title: t('nemoTitle', { level: t(`level_${nemoTop === r.nemo!.hard ? 'hard' : nemoTop === r.nemo!.normal ? 'normal' : 'easy'}`) }), rows: nemoTop.slice(0, 3).map((x) => ({ rank: x.rank, name: x.nickname, stat: `${x.correct}` })) }
    : hasOpen(game) && r.open.length ? { title: t('openTitle'), rows: r.open.slice(0, 3).map((x) => ({ rank: x.rank, name: x.nickname ?? 'Player', stat: t('wld', { w: x.wins, l: x.losses, d: x.draws }) })) }
    : { title: hasHall(game) ? t('hallTitle') : t('openTitle'), rows: [] };

  return (
    <main className="min-h-screen bg-[#f3f0e8] px-4 pb-20 pt-10 text-[#17201e] sm:px-5 sm:pt-14">
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name, path: CERT_GAMES[game].href }, { name: t('title', { game: name }), path: `/ranking/${slug}` }]),
      ] }} />
      <div className="mx-auto max-w-3xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#ff6b4a]">RANKING</span>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{t('title', { game: name })}</h1>
        <p className="mt-3 max-w-2xl break-keep text-sm leading-6 text-black/55">{t('intro', { game: name })}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={CERT_GAMES[game].href} className="flex items-center gap-2 rounded-2xl bg-[#17201e] px-5 py-3 text-sm font-black text-white"><Swords size={16} />{t('challenge', { game: name })}</Link>
          <Link href="/records" className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-bold text-black/70">{t('myRecords')}</Link>
        </div>

        <Podium rows={top.rows} color={CERT_GAMES[game].color} title={top.title} empty={t('podiumEmpty')} />

        <div className="mt-6 grid gap-4">
          {r.maps && (
            <Board title={t('mapsTitle')} desc={t('mapsDesc')} icon={<MapIcon size={18} style={{ color: CERT_GAMES[game].color }} />} empty={t('emptyMaps')}
              rows={r.maps.map((x) => ({ rank: x.rank, name: x.nickname, stat: t('maps', { n: x.score }), prev: x.prev_rank }))} />
          )}
          {hasHall(game) && (
            <Board title={t('hallTitle')} desc={game === 'sudoku' ? t('hallDescSudoku') : t('hallDesc')} icon={<Crown size={18} className="text-[#e8a33c]" />} empty={t('empty')}
              rows={r.hall.map((x) => ({ rank: x.rank, name: x.nickname, stat: t('wins', { w: x.wins, g: x.games }), prev: x.prev_rank }))} />
          )}
          {r.nemo && (['hard', 'normal', 'easy'] as const).map((d) => (
            <Board key={d} title={t('nemoTitle', { level: t(`level_${d}`) })} desc={t('nemoDesc')} icon={<Timer size={18} className="text-[#5b6b9a]" />} empty={t('empty')}
              rows={r.nemo![d].map((x) => ({ rank: x.rank, name: x.nickname, stat: x.avg_ms ? t('nemoStat', { n: x.correct, avg: formatMs(x.avg_ms) }) : `${x.correct}` }))} />
          ))}
          {hasOpen(game) && (
            <Board title={t('openTitle')} desc={t('openDesc')} icon={<DoorOpen size={18} className="text-[#ff4d5e]" />} empty={t('emptyOpen')}
              rows={r.open.map((x) => ({ rank: x.rank, name: x.nickname ?? 'Player', stat: t('wld', { w: x.wins, l: x.losses, d: x.draws }), prev: x.prev_rank }))} />
          )}
        </div>

        <section className="mt-6 rounded-[24px] bg-[#17201e] p-5 text-white">
          <h2 className="flex items-center gap-2 text-base font-black"><Trophy size={17} className="text-[#d9b25f]" />{t('shareTitle')}</h2>
          <p className="mt-1 text-xs text-white/55">{t('shareDesc')}</p>
          <div className="mt-4 max-w-sm"><ShareButtons path={rankPath(locale, game)} imagePath={rankImagePath(game, locale)} fileName={`puzzlthink-ranking-${slug}.png`} text={t('shareText', { game: name })} /></div>
        </section>

        <nav className="mt-8">
          <p className="text-[11px] font-black tracking-widest text-black/40">{t('otherGames')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(CERT_GAMES) as GameId[]).filter((g) => g !== game && gameFromSlug(rankSlug(g))).map((g) => (
              <Link key={g} href={`/ranking/${rankSlug(g)}`} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-black/65 hover:bg-[#fff8e6]">{CERT_GAMES[g][locale === 'en' ? 'en' : 'ko']}</Link>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
