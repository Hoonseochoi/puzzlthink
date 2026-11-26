import type { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from '@/i18n/routing';
import AdSlot from '@/components/AdSlot';
import { guideByGame, guideLocale, guidePath } from '@/content/guides';
import type { GameId } from '@/lib/gameCatalog';
import { Section, card, prose, rich } from './GuideBlocks';

const UI = {
  ko: { eyebrow: 'GAME GUIDE', level: { beginner: '입문', intermediate: '중급', advanced: '고급' }, more: '전체 공략에서 더 보기', moreBody: '이 아래는 공략 페이지에만 있어요.', open: '전체 공략 읽기', faq: '자주 묻는 질문' },
  en: { eyebrow: 'GAME GUIDE', level: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }, more: 'More in the full guide', moreBody: 'These sections are on the guide page only.', open: 'Read the full guide', faq: 'FAQ' },
} as const;

/** FAQ of a game's guide, for the game page's FAQPage JSON-LD (it must match the FAQ GameArticle shows). */
export const guideFaq = (game: GameId, locale: string) => guideByGame(game)?.[guideLocale(locale)].faq ?? null;

/**
 * The condensed guide on a game page, built from the same src/content/guides file as /<game>/guide: intro, the
 * sections marked onGamePage (origin, rules, edge cases, first strategy), the FAQ and a link to the full guide.
 * It goes in GameGate's `guide` slot — below the start panel and tutorial, and not rendered while a game is running —
 * in place of the short TextGuide. Server component; no client JS.
 */
export default function GameArticle({ locale, game, extra }: { locale: string; game: GameId; extra?: ReactNode }) {
  const guide = guideByGame(game);
  if (!guide) return null;
  const loc = guideLocale(locale);
  const c = guide[loc];
  const ui = UI[loc];
  const path = guidePath(game);
  const flagged = c.sections.filter((s) => s.onGamePage);
  const shown = flagged.length ? flagged : c.sections.slice(0, 3);
  const rest = c.sections.filter((s) => !shown.includes(s));

  return (
    <section id="guide" className="relative z-10 border-t border-white/10 bg-[#0a0c10] px-5 py-16 text-[#eceff4]">
      <AdSlot placement="inline" tone="dark" className="mx-auto mb-12 max-w-3xl" />
      <article className="mx-auto max-w-3xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-(--accent)">{ui.eyebrow}</span>
        <h1 className="mt-3 break-keep text-3xl font-black tracking-[-0.04em] sm:text-4xl">{c.gamePageTitle ?? c.title}</h1>
        {/* Only the first intro paragraph: the rest introduces the long page. */}
        <p className={`mt-5 ${prose} text-white/60`}>{rich(c.intro[0])}</p>
        <Link href={path} className="mt-6 inline-flex items-center gap-2 rounded-full border border-(--accent)/50 bg-(--accent)/15 px-4 py-2 text-sm font-black text-(--accent) transition hover:bg-(--accent)/25"><BookOpen size={15} />{ui.open} →</Link>
        {extra}

        {shown.map((section) => <Section key={section.id} section={section} idPrefix="guide-" levelLabel={section.level ? ui.level[section.level] : undefined} />)}

        {rest.length > 0 && (
          <aside data-play-hide="articles" className={`mt-14 p-6 ${card}`}>
            <p className="text-lg font-black">{ui.more}</p>
            <p className="mt-1 text-sm text-white/50">{ui.moreBody}</p>
            <ul className="mt-4 space-y-1.5 text-sm font-bold">
              {rest.map((s) => <li key={s.id}><Link href={`${path}#${s.id}`} className="text-white/70 hover:text-(--accent)">→ {s.title}</Link></li>)}
            </ul>
            <Link href={path} className="mt-5 inline-flex items-center gap-2 rounded-full bg-(--accent) px-5 py-2.5 text-sm font-black text-black/85 hover:brightness-110"><BookOpen size={15} />{ui.open}</Link>
          </aside>
        )}

        <h2 className="mt-16 text-2xl font-black tracking-[-0.03em]">{ui.faq}</h2>
        <dl className="mt-5 space-y-5">{c.faq.map((f) => <div key={f.q}><dt className="font-black">{f.q}</dt><dd className="mt-1 break-keep text-sm leading-7 text-white/60">{rich(f.a)}</dd></div>)}</dl>
        {c.disclaimer && <p className="mt-12 text-[11px] leading-5 text-white/30">{c.disclaimer}</p>}
      </article>
    </section>
  );
}
