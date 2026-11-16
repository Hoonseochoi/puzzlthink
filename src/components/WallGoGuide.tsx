import { getTranslations } from 'next-intl/server';
import WallGoDiagram, { type DiagramSpec } from './WallGoDiagram';

type Strategy = { title: string; body: string; tag: string };
type Faq = { q: string; a: string };

// One diagram per entry in WallGoGuide.strategies, same order.
const DIAGRAMS: DiagramSpec[] = [
  { // corner anchor
    pieces: [[0, 'C3'], [0, 'B2'], [1, 'E3'], [2, 'C5']],
    zones: [{ player: 0, cells: ['A1', 'B1', 'C1', 'A2', 'B2', 'C2', 'A3', 'B3', 'C3'] }],
    walls: [['C1', 'right'], ['C2', 'right'], ['A3', 'down'], ['B3', 'down']],
    danger: [['C3', 'right'], ['C3', 'down']],
  },
  { // center
    pieces: [[0, 'D4'], [1, 'B2'], [2, 'F6']],
    moves: [['D4', 'D2'], ['D4', 'F4'], ['D4', 'D6'], ['D4', 'B4']],
  },
  { // three walls
    pieces: [[0, 'D4'], [1, 'D7']],
    walls: [['D4', 'up'], ['D4', 'left'], ['D4', 'right']],
    danger: [['D4', 'down']],
    moves: [['D7', 'D5']],
  },
  { // two walls in 3p
    pieces: [[0, 'D4'], [1, 'F4'], [2, 'D6']],
    walls: [['D4', 'up'], ['D4', 'left']],
    danger: [['D4', 'right'], ['D4', 'down']],
    moves: [['F4', 'E4'], ['D6', 'D5']],
  },
  { // lock an opponent in a corner
    pieces: [[1, 'A7'], [0, 'C5']],
    zones: [{ player: 1, cells: ['A6', 'B6', 'A7', 'B7'] }],
    walls: [['A6', 'up'], ['B6', 'up'], ['B6', 'right']],
    danger: [['B7', 'right']],
    moves: [['C5', 'C7']],
  },
  { // leave an awkward strip open
    pieces: [[2, 'G2'], [0, 'E5']],
    walls: [['G1', 'left'], ['G2', 'left'], ['G3', 'left'], ['G4', 'left']],
    hint: [['G4', 'down']],
    zones: [{ player: 2, cells: ['G1', 'G2', 'G3', 'G4'] }],
  },
  { // block with a piece
    pieces: [[1, 'B4'], [0, 'D4']],
    moves: [['B4', 'C4']],
    blocked: ['E4'],
    walls: [['C4', 'up'], ['C4', 'down']],
  },
  { // wall break timing (3p)
    pieces: [[0, 'D3'], [1, 'B5'], [2, 'F5']],
    walls: [['D3', 'down'], ['C4', 'right'], ['D4', 'right'], ['A4', 'down'], ['B4', 'down'], ['F4', 'down'], ['G4', 'down']],
    breakMoves: [['D3', 'D5']],
  },
];

export default async function WallGoGuide({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'WallGoGuide' });
  const rules = t.raw('rules') as string[];
  const duelRules = t.raw('duelRules') as string[];
  const strategies = t.raw('strategies') as Strategy[];
  const legend = t.raw('legend') as string[];
  const faq = t.raw('faq') as Faq[];

  return (
    <section className="relative z-10 border-t border-white/10 bg-[#0b0b0e] px-5 py-16 text-[#e6e9f0]">
      <article className="mx-auto max-w-4xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#ff4d5e]">{t('eyebrow')}</span>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{t('title')}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/55">{t('intro')}</p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-extrabold">{t('rulesTitle')}</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-white/55">
              {rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ol>
          </div>
          <div>
            <h2 className="text-xl font-extrabold">{t('duelRulesTitle')}</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-white/55">
              {duelRules.map((rule) => <li key={rule}>{rule}</li>)}
            </ol>
          </div>
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('strategyTitle')}</h2>
        <p className="mt-2 text-sm leading-7 text-white/55">{t('strategyIntro')}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/45">
          <li className="flex items-center gap-2"><i className="h-[3px] w-5 rounded bg-[#e6e9f0]" />{legend[0]}</li>
          <li className="flex items-center gap-2"><i className="h-[3px] w-5 rounded border-t-[3px] border-dashed border-[#e0283a]" />{legend[1]}</li>
          <li className="flex items-center gap-2"><i className="h-[3px] w-5 rounded border-t-[3px] border-dashed border-[#8d95a8]" />{legend[2]}</li>
          <li className="flex items-center gap-2"><i className="h-[2px] w-5 bg-[#c9cfdc]" />{legend[3]}</li>
        </ul>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {strategies.map((item, index) => (
            <section key={item.title} className="flex flex-col gap-4 rounded-[12px] border border-white/10 bg-[#121217] p-4 min-[480px]:flex-row">
              <div className="mx-auto w-48 shrink-0 min-[480px]:mx-0 min-[480px]:w-40 lg:w-44">{DIAGRAMS[index] && <WallGoDiagram spec={DIAGRAMS[index]} label={item.title} />}</div>
              <div className="min-w-0">
                <span className="rounded border border-[#e0283a]/40 px-1.5 py-0.5 text-[9px] font-black tracking-[0.12em] text-[#ff4d5e]">{item.tag}</span>
                <h3 className="mt-2 text-sm font-extrabold">{item.title}</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-white/55">{item.body}</p>
              </div>
            </section>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('faqTitle')}</h2>
        <dl className="mt-4 space-y-5">
          {faq.map((item) => (
            <div key={item.q}>
              <dt className="text-sm font-extrabold">{item.q}</dt>
              <dd className="mt-1 text-sm leading-7 text-white/55">{item.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 text-[11px] leading-5 text-white/30">{t('disclaimer')}</p>
      </article>
    </section>
  );
}
