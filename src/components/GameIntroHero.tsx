import { getTranslations } from 'next-intl/server';
import { Gauge, Timer, Users, type LucideIcon } from 'lucide-react';
import type { GameId } from '@/lib/gameCatalog';
import { Link } from '@/i18n/routing';
import type { ReplayGame } from '@/lib/logicReplay';
import LogicReplayButton from '@/components/logic/LogicReplay';
import GameRankCard from '@/components/GameRankCard';
import { GameUpdatesSection } from '@/components/GameUpdates';
import { hasGameUpdates } from '@/lib/gameUpdates';
import { hasRankCard } from '@/lib/rankings';

/** Games with a 공략 page: a "처음이라면?" button sits beside the title (슬리더링크 · 마슈 · 노노그램). */
const STRATEGY: Partial<Record<GameId, '/slitherlink/guide' | '/masyu/guide' | '/nonogram/guide' | '/star-battle/guide' | '/binairo/guide' | '/one-stroke/guide' | '/color-link/guide' | '/magic-square/guide'>> = { magicswap: '/magic-square/guide', slitherlink: '/slitherlink/guide', binairo: '/binairo/guide', onestroke: '/one-stroke/guide', colorlink: '/color-link/guide', starbattle: '/star-battle/guide', masyu: '/masyu/guide', nonogram: '/nonogram/guide' };

/** Games with a solve replay: a "플레이 영상으로 배우기" button sits beside the guide button. */
const REPLAY: Partial<Record<GameId, ReplayGame>> = { magicswap: 'magicswap', slitherlink: 'slitherlink', binairo: 'binairo', onestroke: 'onestroke', colorlink: 'colorlink', starbattle: 'starbattle', masyu: 'masyu', nonogram: 'nonogram' };

/** Top of a game's entry screen: name, tagline, ranking, key facts and update notes, then the core rules. */
export default async function GameIntroHero({ locale, id, tone = 'dark', Title = 'h2' }: {
  locale: string; id: GameId; tone?: 'dark' | 'light';
  /** 'h1' on a page with no guide below the board (the guide normally carries the page's h1). */
  Title?: 'h1' | 'h2';
}) {
  const t = await getTranslations({ locale, namespace: 'Games' });
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const key = `games.${id}` as const;
  const rules = t.raw(`${key}.rules`) as string[];
  const dark = tone === 'dark';
  const card = dark ? 'border-white/10 bg-white/[0.035]' : 'border-black/[0.07] bg-white/60';
  const line = dark ? 'divide-white/10' : 'divide-black/[0.07]';
  const facts: [LucideIcon, string, string][] = [
    [Users, t('players'), t(`${key}.players`)],
    [Timer, t('pace'), t(`${key}.pace`)],
    [Gauge, t('level'), t(`${key}.level`)],
  ];

  return (
    <div className="@container">
      <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">PUZZLTHINK · GAME</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <Title className="whitespace-nowrap text-[2.6rem] font-black leading-[1.05] tracking-[-0.05em] sm:text-6xl">{tc(id)}</Title>
        {(STRATEGY[id] || REPLAY[id]) && <div className="flex shrink-0 flex-wrap justify-end gap-2">
        {REPLAY[id] && <LogicReplayButton game={REPLAY[id]} variant="learn" />}
        {STRATEGY[id] && (
          <Link href={STRATEGY[id]} className="group mt-1 flex shrink-0 flex-col items-end rounded-[14px] border border-(--accent)/50 bg-(--accent)/15 px-3.5 py-2 text-right shadow-[0_0_24px_color-mix(in_srgb,var(--accent)_25%,transparent)] transition hover:bg-(--accent)/25">
            <span className={`text-[11px] font-bold ${dark ? 'text-white/60' : 'text-black/55'}`}>{t('firstTime', { game: tc(id) })}</span>
            <span className="text-sm font-black text-(--accent)">{t('firstTimeCta')} <span className="inline-block transition group-hover:translate-x-0.5">→</span></span>
          </Link>
        )}
        </div>}
      </div>
      <p className={`mt-3.5 max-w-2xl break-keep text-[15px] leading-[1.75] sm:text-[17px] ${dark ? 'text-white/70' : 'text-black/65'}`}>{t(`${key}.tagline`)}</p>

      {/* Who is on top: first thing under the title. */}
      {hasRankCard(id) && <div className="mt-5"><GameRankCard game={id} tone={tone} /></div>}

      {/* Key facts: one card, a row each when the column is narrow and three columns from 560px (container width). */}
      <dl className={`mt-3 grid grid-cols-1 divide-y overflow-hidden rounded-2xl border backdrop-blur @min-[560px]:grid-cols-3 @min-[560px]:divide-x @min-[560px]:divide-y-0 ${card} ${line}`}>
        {facts.map(([Icon, label, value]) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 @min-[560px]:items-start">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-(--accent)/15 text-(--accent)"><Icon size={16} /></span>
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3 @min-[560px]:block">
              <dt className={`shrink-0 text-[11px] font-black tracking-[0.08em] ${dark ? 'text-white/45' : 'text-black/45'}`}>{label}</dt>
              <dd className="break-keep text-right text-[13.5px] font-bold leading-5 @min-[560px]:mt-0.5 @min-[560px]:text-left">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {/* What changed lately (the badge opens the full history; src/lib/gameUpdates.ts). */}
      {hasGameUpdates(id) && <div className="mt-3"><GameUpdatesSection game={id} tone={tone} /></div>}

      <div className={`mt-3 rounded-2xl border p-4 backdrop-blur sm:p-5 ${card}`}>
        <h3 className="flex items-center gap-2 text-[15px] font-black"><span className="h-3.5 w-1 rounded-full bg-(--accent)" />{t('rules')}</h3>
        <ol className={`mt-2 divide-y ${line}`}>
          {rules.map((rule, i) => (
            <li key={rule} className={`flex gap-3 py-3 text-[14px] leading-[1.7] ${dark ? 'text-white/80' : 'text-black/75'}`}>
              <span className="mt-[3px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] bg-(--accent)/15 font-mono text-[11px] font-black text-(--accent)">{i + 1}</span>
              <span className="break-keep">{rule}</span>
            </li>
          ))}
        </ol>
        <p className={`border-t pt-3 text-xs leading-6 ${dark ? 'border-white/10 text-white/50' : 'border-black/10 text-black/50'}`}><b className="font-black">{t('origin')}</b> · {t(`${key}.origin`)}</p>
        <p className={`mt-1 text-[10px] leading-5 ${dark ? 'text-white/30' : 'text-black/35'}`}>{tc('unofficialNotice')}</p>
      </div>
    </div>
  );
}
