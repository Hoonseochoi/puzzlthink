import { getTranslations } from 'next-intl/server';
import AdSlot from '@/components/AdSlot';

type Cell = [number, number];
type Spec = {
  givens: [number, number, number][]; // row, col, digit
  target?: [number, number, number];
  rows?: number[];
  cols?: number[];
  box?: number; // 0-8, highlighted 3×3 box
  notes?: [number, number, string][];
  struck?: Cell[];
};

// One diagram per entry in SudokuGuide.techniques, same order.
const TECHNIQUES: Spec[] = [
  { givens: [[1, 5, 5], [2, 7, 5], [5, 0, 5], [7, 1, 5], [0, 0, 8], [1, 1, 3]], target: [0, 2, 5], rows: [1, 2], cols: [0, 1], box: 0 },
  { givens: [[4, 0, 3], [4, 2, 9], [4, 3, 1], [4, 4, 6], [4, 5, 2], [4, 6, 8], [4, 7, 7], [4, 8, 4]], target: [4, 1, 5], rows: [4] },
  { givens: [[4, 0, 1], [4, 1, 2], [4, 8, 3], [0, 4, 4], [2, 4, 5], [8, 4, 6], [3, 3, 7], [5, 5, 8]], target: [4, 4, 9], rows: [4], cols: [4], box: 4 },
  { givens: [[0, 0, 1], [0, 2, 5], [0, 6, 9], [0, 8, 4]], notes: [[0, 1, '2 7'], [0, 4, '2 7'], [0, 3, '2 3 6'], [0, 5, '3 7 8'], [0, 7, '2 6 8']], struck: [[0, 3], [0, 5], [0, 7]], rows: [0] },
];

function SudokuDiagram({ spec, label }: { spec: Spec; label: string }) {
  const S = 22, P = 4, W = S * 9 + P * 2;
  const at = (n: number) => P + n * S;
  const hl = (r: number, c: number) => spec.rows?.includes(r) || spec.cols?.includes(c)
    || (spec.box !== undefined && Math.floor(r / 3) * 3 + Math.floor(c / 3) === spec.box);
  return (
    <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label={label} className="h-auto w-full">
      <rect x="0" y="0" width={W} height={W} rx="8" fill="#ffffff" />
      {Array.from({ length: 81 }).map((_, i) => {
        const r = Math.floor(i / 9), c = i % 9;
        const target = spec.target && spec.target[0] === r && spec.target[1] === c;
        return <rect key={i} x={at(c)} y={at(r)} width={S} height={S} fill={target ? '#4b7bff' : hl(r, c) ? '#edf2ff' : '#ffffff'} />;
      })}
      {Array.from({ length: 10 }).map((_, i) => (
        <g key={i} stroke="#17201e" strokeOpacity={i % 3 === 0 ? 0.85 : 0.15} strokeWidth={i % 3 === 0 ? 1.4 : 0.6}>
          <line x1={at(i)} y1={P} x2={at(i)} y2={W - P} /><line x1={P} y1={at(i)} x2={W - P} y2={at(i)} />
        </g>
      ))}
      {spec.givens.map(([r, c, d]) => <text key={`g${r}${c}`} x={at(c) + S / 2} y={at(r) + S / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="800" fill="#17201e">{d}</text>)}
      {spec.notes?.map(([r, c, n]) => <text key={`n${r}${c}`} x={at(c) + S / 2} y={at(r) + S / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize="6" fontWeight="700" fill="#4b7bff">{n}</text>)}
      {spec.struck?.map(([r, c]) => <line key={`s${r}${c}`} x1={at(c) + 3} y1={at(r) + S - 3} x2={at(c) + S - 3} y2={at(r) + 3} stroke="#ff6b4a" strokeWidth="1.2" />)}
      {spec.target && <text x={at(spec.target[1]) + S / 2} y={at(spec.target[0]) + S / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="900" fill="#ffffff">{spec.target[2]}</text>}
    </svg>
  );
}

type Item = { title: string; body: string };
type Faq = { q: string; a: string };

export default async function SudokuGuide({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'SudokuGuide' });
  const rules = t.raw('rules') as string[];
  const techniques = t.raw('techniques') as Item[];
  const levels = t.raw('levels') as Item[];
  const faq = t.raw('faq') as Faq[];
  return (
    <section className="border-t border-black/[0.07] bg-[#f3f0e8] px-5 py-16 text-[#17201e]">
      <AdSlot placement="inline" tone="light" className="mx-auto mb-12 max-w-3xl" />
      <article className="mx-auto max-w-4xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#4b7bff]">{t('eyebrow')}</span>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{t('title')}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-black/60">{t('intro')}</p>

        <h2 className="mt-12 text-xl font-extrabold">{t('rulesTitle')}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-black/60">{rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>

        <h2 className="mt-14 text-xl font-extrabold">{t('techniquesTitle')}</h2>
        <p className="mt-2 text-sm leading-7 text-black/60">{t('techniquesIntro')}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {techniques.map((item, i) => (
            <section key={item.title} className="flex flex-col gap-4 rounded-[20px] border border-black/10 bg-[#f9f7f1] p-4 min-[480px]:flex-row">
              <div className="mx-auto w-44 shrink-0 min-[480px]:mx-0 min-[480px]:w-40">{TECHNIQUES[i] && <SudokuDiagram spec={TECHNIQUES[i]} label={item.title} />}</div>
              <div className="min-w-0"><h3 className="text-sm font-extrabold">{item.title}</h3><p className="mt-1.5 text-[13px] leading-6 text-black/60">{item.body}</p></div>
            </section>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('levelsTitle')}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {levels.map((item) => <section key={item.title} className="rounded-[16px] border border-black/10 bg-[#f9f7f1] p-4"><h3 className="text-sm font-extrabold">{item.title}</h3><p className="mt-1.5 text-[13px] leading-6 text-black/60">{item.body}</p></section>)}
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('faqTitle')}</h2>
        <dl className="mt-4 space-y-5">{faq.map((item) => <div key={item.q}><dt className="text-sm font-extrabold">{item.q}</dt><dd className="mt-1 text-sm leading-7 text-black/60">{item.a}</dd></div>)}</dl>
      </article>
    </section>
  );
}
