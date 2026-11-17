import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, BookOpen, Bot, Clock, Gauge, UserRound, UsersRound } from 'lucide-react';
import { Link } from '@/i18n/routing';
import JsonLd from '@/components/JsonLd';
import { GAMES } from '@/lib/gameCatalog';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Games' });
  const canonical = `${BASE_URL}/${locale}/games`;
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko/games`, en: `${BASE_URL}/en/games` } },
    openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' },
  };
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white/60 px-3.5 py-3">
      <dt className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.14em] text-black/40">{icon}{label}</dt>
      <dd className="mt-1 break-keep text-[13px] font-bold leading-5">{value}</dd>
    </div>
  );
}

export default async function GamesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Games' });
  const tc = await getTranslations({ locale, namespace: 'Common' });

  return (
    <main className="min-h-screen bg-[#f3f0e8] px-4 pb-20 pt-10 text-[#17201e] sm:px-5 sm:pt-16">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: t('title'),
        url: `${BASE_URL}/${locale}/games`,
        itemListElement: GAMES.map((game, index) => ({ '@type': 'ListItem', position: index + 1, name: tc(game.id), url: `${BASE_URL}/${locale}${game.href}` })),
      }} />
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-black tracking-[0.2em] text-black/45">{t('eyebrow')}</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{t('title')}</h1>
          <p className="mt-4 break-keep text-sm leading-7 text-black/55 sm:text-base">{t('intro')}</p>
        </header>

        <nav aria-label={t('jump')} className="mt-8 flex flex-wrap justify-center gap-2">
          {GAMES.map((game) => (
            <a key={game.id} href={`#${game.id}`} className="flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3.5 py-2 text-xs font-extrabold transition hover:bg-white">
              <span className="h-2 w-2 rounded-full" style={{ background: game.color }} />{tc(game.id)}
            </a>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-5">
          {GAMES.map((game) => {
            const key = `games.${game.id}` as const;
            const rules = t.raw(`${key}.rules`) as string[];
            const solo = game.id === 'sudoku' || game.id === 'blindGomoku';
            return (
              <article key={game.id} id={game.id} className="scroll-mt-24 overflow-hidden rounded-[24px] border border-black/10 bg-[#f9f7f1] shadow-[0_18px_50px_rgba(30,38,36,0.08)] sm:rounded-[32px]">
                <div className="h-1.5" style={{ background: game.color }} />
                <div className="p-5 sm:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">{tc(game.id)}</h2>
                      <p className="mt-1.5 break-keep text-sm leading-6 text-black/55">{t(`${key}.tagline`)}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link href={game.href} className="flex items-center gap-2 rounded-full bg-[#17201e] px-4 py-2.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5">{t('play')} <ArrowRight size={14} /></Link>
                      {game.hasGuide && <Link href={`${game.href}#guide`} className="flex items-center gap-2 rounded-full border border-black/15 bg-white/70 px-4 py-2.5 text-xs font-extrabold transition hover:bg-white"><BookOpen size={14} /> {t('guide')}</Link>}
                    </div>
                  </div>

                  <dl className="mt-5 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-4">
                    <Fact icon={<UsersRound size={12} />} label={t('players')} value={t(`${key}.players`)} />
                    <Fact icon={<Clock size={12} />} label={t('pace')} value={t(`${key}.pace`)} />
                    <Fact icon={<Gauge size={12} />} label={t('level')} value={t(`${key}.level`)} />
                    <div className="rounded-2xl border border-black/[0.07] bg-white/60 px-3.5 py-3">
                      <dt className="text-[10px] font-black tracking-[0.14em] text-black/40">{t('modes')}</dt>
                      <dd className="mt-1 flex flex-col gap-1 text-[13px] font-bold leading-5">
                        {game.id === 'nemoCount' ? (
                          <>
                            <span className="flex gap-1.5"><UserRound size={14} className="mt-0.5 shrink-0" style={{ color: game.color }} /><span className="break-keep">{t('modeSolo')} · {t(`${key}.solo`)}</span></span>
                            <span className="flex gap-1.5"><UsersRound size={14} className="mt-0.5 shrink-0" style={{ color: game.color }} /><span className="break-keep">{t('modeFriend')} · {t(`${key}.friend`)}</span></span>
                          </>
                        ) : solo ? (
                          <span className="flex gap-1.5"><UserRound size={14} className="mt-0.5 shrink-0" style={{ color: game.color }} /><span className="break-keep">{t('modeSolo')} · {t(`${key}.solo`)}</span></span>
                        ) : (
                          <>
                            <span className="flex gap-1.5"><Bot size={14} className="mt-0.5 shrink-0" style={{ color: game.color }} /><span className="break-keep">{t('modeAi')} · {t(`${key}.ai`)}</span></span>
                            <span className="flex gap-1.5"><UsersRound size={14} className="mt-0.5 shrink-0" style={{ color: game.color }} /><span className="break-keep">{t('modeFriend')} · {t(`${key}.friend`)}</span></span>
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 grid gap-5 md:grid-cols-[1.6fr_1fr]">
                    <section>
                      <h3 className="text-xs font-black tracking-[0.14em] text-black/45">{t('rules')}</h3>
                      <ol className="mt-2.5 flex flex-col gap-2">
                        {rules.map((rule, index) => (
                          <li key={rule} className="flex gap-3 text-[13px] leading-6 text-black/70">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ background: game.color }}>{index + 1}</span>
                            <span className="break-keep">{rule}</span>
                          </li>
                        ))}
                      </ol>
                    </section>
                    <section className="rounded-2xl bg-[#efebe1] p-4">
                      <h3 className="text-xs font-black tracking-[0.14em] text-black/45">{t('origin')}</h3>
                      <p className="mt-2 break-keep text-[13px] leading-6 text-black/70">{t(`${key}.origin`)}</p>
                    </section>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl break-keep text-center text-[11px] leading-5 text-black/40">{t('disclaimer')}</p>
      </div>
    </main>
  );
}
