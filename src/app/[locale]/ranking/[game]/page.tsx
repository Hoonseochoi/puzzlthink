import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Crown, DoorOpen, Swords, Timer, Trophy } from 'lucide-react';
import ShareButtons from '@/components/ShareButtons';
import { Link } from '@/i18n/routing';
import { CERT_GAMES } from '@/lib/hardClear';
import { formatMs } from '@/lib/nemoCount';
import { type GameRanking, fetchGameRanking, gameFromSlug, hasHall, hasOpen, rankImagePath, rankPath, rankSlug } from '@/lib/rankings';
import { pageMetadata } from '@/lib/seo';
import type { GameId } from '@/lib/stats';
import RankMove from '@/components/RankMove';

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

export default async function RankingPage({ params }: Params) {
  const { locale, game: slug } = await params;
  setRequestLocale(locale);
  const game = gameFromSlug(slug);
  if (!game) notFound();
  const t = await getTranslations({ locale, namespace: 'Ranking' });
  const name = CERT_GAMES[game][locale === 'en' ? 'en' : 'ko'];
  const r: GameRanking = await fetchGameRanking(game);

  return (
    <main className="min-h-screen bg-[#f3f0e8] px-4 pb-20 pt-10 text-[#17201e] sm:px-5 sm:pt-14">
      <div className="mx-auto max-w-3xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#ff6b4a]">RANKING</span>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{t('title', { game: name })}</h1>
        <p className="mt-3 max-w-2xl break-keep text-sm leading-6 text-black/55">{t('intro', { game: name })}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={CERT_GAMES[game].href} className="flex items-center gap-2 rounded-2xl bg-[#17201e] px-5 py-3 text-sm font-black text-white"><Swords size={16} />{t('challenge', { game: name })}</Link>
          <Link href="/records" className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-bold text-black/70">{t('myRecords')}</Link>
        </div>

        <div className="mt-8 grid gap-4">
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
            {(Object.keys(CERT_GAMES) as GameId[]).filter((g) => g !== game).map((g) => (
              <Link key={g} href={`/ranking/${rankSlug(g)}`} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-black/65 hover:bg-[#fff8e6]">{CERT_GAMES[g][locale === 'en' ? 'en' : 'ko']}</Link>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
