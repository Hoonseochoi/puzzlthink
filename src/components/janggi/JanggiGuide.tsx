import { getTranslations } from 'next-intl/server';
import type { PieceType } from '@/lib/janggi';
import JanggiDiagram, { JanggiMoveChart, type JanggiDiagramSpec } from './JanggiDiagram';
import JanggiPiece from './JanggiPiece';
import { hanjaFont } from './theme';
import AdSlot from '@/components/AdSlot';

type Item = { title: string; body: string; tag?: string };
type Faq = { q: string; a: string };

const PIECES: PieceType[] = ['wang', 'jang', 'sang', 'ja', 'hu'];

// One diagram per entry in JanggiGuide.special and JanggiGuide.strategies, same order.
const SPECIAL: JanggiDiagramSpec[] = [
  { pieces: [['ja', 0, 1, 1], ['wang', 1, 0, 1], ['wang', 0, 3, 1], ['jang', 0, 3, 2]], arrows: [[2, 1, 1, 1, 'capture']], hands: [[0, ['ja']]] },
  { pieces: [['wang', 1, 0, 1], ['jang', 1, 0, 0], ['wang', 0, 3, 1]], hands: [[0, ['sang']]], arrows: [[4, 0, 2, 2, 'drop']], dots: [[1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [3, 0], [3, 2]], blocked: [[0, 2]] },
  { pieces: [['hu', 0, 0, 2], ['wang', 1, 0, 1], ['wang', 0, 3, 1]], arrows: [[1, 2, 0, 2]], glow: [[0, 2]] },
  { pieces: [['wang', 0, 0, 0], ['wang', 1, 1, 2], ['sang', 1, 2, 2]], glow: [[0, 0]], arrows: [[1, 0, 0, 0]] },
];
const STRATEGY: (JanggiDiagramSpec | 'values')[] = [
  { pieces: [['sang', 0, 3, 0], ['wang', 0, 3, 1], ['jang', 0, 3, 2], ['ja', 0, 2, 1], ['jang', 1, 0, 0], ['wang', 1, 0, 1], ['sang', 1, 0, 2], ['ja', 1, 1, 1]], arrows: [[2, 1, 1, 1, 'capture'], [0, 1, 1, 1, 'capture']] },
  { pieces: [['wang', 0, 2, 1], ['jang', 0, 3, 2], ['sang', 0, 3, 0], ['wang', 1, 0, 1], ['jang', 1, 1, 0]], glow: [[2, 1]], dots: [[1, 1], [1, 2], [2, 0], [2, 2]] },
  'values',
  { pieces: [['sang', 0, 2, 0], ['sang', 0, 3, 1], ['wang', 0, 3, 2], ['jang', 1, 1, 1], ['wang', 1, 0, 1]], glow: [[2, 0], [3, 1]], arrows: [[2, 0, 3, 1], [3, 1, 2, 0]] },
  { pieces: [['wang', 1, 0, 1], ['sang', 1, 0, 2], ['wang', 0, 3, 1], ['ja', 0, 2, 1]], hands: [[0, ['jang']]], dots: [[1, 0], [1, 1], [1, 2], [2, 0], [2, 2], [3, 0], [3, 2]], blocked: [[0, 0]] },
  { pieces: [['wang', 1, 2, 2], ['jang', 0, 3, 1], ['wang', 0, 3, 0], ['ja', 1, 1, 0]], arrows: [[2, 2, 3, 2], [3, 1, 3, 2, 'capture']], glow: [[3, 2]] },
];

export default async function JanggiGuide({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'JanggiGuide' });
  const rules = t.raw('rules') as string[];
  const special = t.raw('special') as Item[];
  const strategies = t.raw('strategies') as Item[];
  const faq = t.raw('faq') as Faq[];

  return (
    <section id="guide" className="relative z-10 border-t border-white/10 bg-[#0a0c10] px-5 py-16 text-[#eceff4]">
      <AdSlot placement="inline" tone="dark" className="mx-auto mb-12 max-w-3xl" />
      <article className="mx-auto max-w-4xl">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#e8c170]">{t('eyebrow')}</span>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{t('title')}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/55">{t('intro')}</p>

        <h2 className="mt-12 text-xl font-extrabold">{t('rulesTitle')}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-white/55">{rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>

        <h2 className="mt-14 text-xl font-extrabold">{t('piecesTitle')}</h2>
        <p className="mt-2 text-sm leading-7 text-white/55">{t('piecesIntro')}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PIECES.map((type) => (
            <section key={type} className="rounded-[16px] border border-white/10 bg-white/[0.03] p-3 text-center">
              <div className="mx-auto w-24"><JanggiMoveChart type={type} label={t(`piece_${type}`)} /></div>
              <h3 className="mt-3 text-sm font-extrabold">{t(`piece_${type}`)}</h3>
              <p className="mt-1 text-[11px] leading-5 text-white/50">{t(`pieceDesc_${type}`)}</p>
            </section>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('specialTitle')}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {special.map((item, i) => (
            <section key={item.title} className="flex flex-col gap-4 rounded-[16px] border border-white/10 bg-white/[0.03] p-4 min-[480px]:flex-row">
              <div className="mx-auto w-44 shrink-0 min-[480px]:mx-0 min-[480px]:w-36">{SPECIAL[i] && <JanggiDiagram spec={SPECIAL[i]} label={item.title} />}</div>
              <div className="min-w-0"><h3 className="text-sm font-extrabold">{item.title}</h3><p className="mt-1.5 text-[13px] leading-6 text-white/55">{item.body}</p></div>
            </section>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('strategyTitle')}</h2>
        <p className="mt-2 text-sm leading-7 text-white/55">{t('strategyIntro')}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {strategies.map((item, i) => (
            <section key={item.title} className="flex flex-col gap-4 rounded-[16px] border border-white/10 bg-white/[0.03] p-4 min-[480px]:flex-row">
              <div className="mx-auto w-44 shrink-0 min-[480px]:mx-0 min-[480px]:w-36">
                {STRATEGY[i] === 'values' ? (
                  <div className="flex h-full items-center justify-center gap-1 py-6">
                    {(['ja', 'sang', 'jang'] as PieceType[]).map((type, k) => (
                      <span key={type} className="flex items-center gap-1">
                        {k > 0 && <span className={`${hanjaFont.className} text-lg text-[#e8c170]`}>‹</span>}
                        <JanggiPiece type={type} owner={0} showReading={false} className={k === 0 ? 'h-8 w-8' : k === 1 ? 'h-10 w-10' : 'h-12 w-12'} />
                      </span>
                    ))}
                  </div>
                ) : STRATEGY[i] && <JanggiDiagram spec={STRATEGY[i] as JanggiDiagramSpec} label={item.title} />}
              </div>
              <div className="min-w-0">
                {item.tag && <span className="rounded border border-[#e8c170]/40 px-1.5 py-0.5 text-[9px] font-black tracking-[0.12em] text-[#e8c170]">{item.tag}</span>}
                <h3 className="mt-2 text-sm font-extrabold">{item.title}</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-white/55">{item.body}</p>
              </div>
            </section>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-extrabold">{t('faqTitle')}</h2>
        <dl className="mt-4 space-y-5">{faq.map((item) => <div key={item.q}><dt className="text-sm font-extrabold">{item.q}</dt><dd className="mt-1 text-sm leading-7 text-white/55">{item.a}</dd></div>)}</dl>
        <p className="mt-12 text-[11px] leading-5 text-white/30">{t('disclaimer')}</p>
      </article>
    </section>
  );
}
