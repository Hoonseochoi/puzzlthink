import { getTranslations } from 'next-intl/server';
import type { GameId } from '@/lib/gameCatalog';

/** Top of a game's entry screen: name, tagline, key facts and core rules, from the games overview copy. */
export default async function GameIntroHero({ locale, id, tone = 'dark' }: { locale: string; id: GameId; tone?: 'dark' | 'light' }) {
  const t = await getTranslations({ locale, namespace: 'Games' });
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const key = `games.${id}` as const;
  const rules = t.raw(`${key}.rules`) as string[];
  const dark = tone === 'dark';
  const muted = dark ? 'text-white/55' : 'text-black/55';
  const card = dark ? 'border-white/10 bg-white/[0.03]' : 'border-black/[0.07] bg-white/60';
  const facts: [string, string][] = [
    [t('players'), t(`${key}.players`)],
    [t('pace'), t(`${key}.pace`)],
    [t('level'), t(`${key}.level`)],
  ];

  return (
    <div>
      <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">PUZZLTHINK · GAME</p>
      <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{tc(id)}</h2>
      <p className={`mt-3 max-w-2xl break-keep text-sm leading-7 sm:text-base ${muted}`}>{t(`${key}.tagline`)}</p>

      <dl className="mt-6 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label} className={`rounded-[12px] border px-3.5 py-3 ${card}`}>
            <dt className={`text-[10px] font-black tracking-[0.14em] ${dark ? 'text-white/40' : 'text-black/40'}`}>{label}</dt>
            <dd className="mt-1 break-keep text-[13px] font-bold leading-5">{value}</dd>
          </div>
        ))}
      </dl>

      <div className={`mt-5 rounded-[14px] border p-4 sm:p-5 ${card}`}>
        <h3 className={`text-xs font-black tracking-[0.14em] ${dark ? 'text-white/45' : 'text-black/45'}`}>{t('rules')}</h3>
        <ol className="mt-3 flex flex-col gap-2">
          {rules.map((rule, i) => (
            <li key={rule} className={`flex gap-3 text-[13px] leading-6 ${dark ? 'text-white/75' : 'text-black/70'}`}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink)">{i + 1}</span>
              <span className="break-keep">{rule}</span>
            </li>
          ))}
        </ol>
        <p className={`mt-4 border-t pt-3 text-xs leading-6 ${dark ? 'border-white/10 text-white/45' : 'border-black/10 text-black/45'}`}><b className="font-black">{t('origin')}</b> · {t(`${key}.origin`)}</p>
        <p className={`mt-1 text-[10px] leading-5 ${dark ? 'text-white/30' : 'text-black/35'}`}>{tc('unofficialNotice')}</p>
      </div>
    </div>
  );
}
