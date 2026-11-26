// Rendering of guide sections and blocks, shared by the /<game>/guide page (GuidePage) and the game page (GameArticle).
import { Fragment, type ReactNode } from 'react';
import type { GuideBlock, GuideCard, GuideSection } from '@/content/guides/types';

export const card = 'rounded-[18px] border border-white/10 bg-white/[0.035]';
export const prose = 'break-keep text-[15px] leading-8 text-white/70';

/** `**bold**` inside guide strings. */
export function rich(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.length === 1 ? text : parts.map((part, i) => (i % 2 ? <strong key={i} className="font-black text-white/90">{part}</strong> : <Fragment key={i}>{part}</Fragment>));
}

function CardBody({ item }: { item: GuideCard }) {
  return (
    <div className="min-w-0">
      {item.tag && <span className="rounded border border-(--accent)/40 px-1.5 py-0.5 text-[9px] font-black tracking-[0.12em] text-(--accent)">{item.tag}</span>}
      <h3 className={`${item.tag ? 'mt-2' : ''} text-base font-black`}>{rich(item.title)}</h3>
      <p className="mt-1.5 break-keep text-sm leading-7 text-white/60">{rich(item.body)}</p>
    </div>
  );
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'p': return <p className={prose}>{rich(block.text)}</p>;
    case 'h3': return <h3 className="pt-2 text-lg font-black">{rich(block.text)}</h3>;
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className="space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className={`flex gap-3 ${prose}`}>
              {block.ordered
                ? <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent) text-xs font-black text-black/80">{i + 1}</span>
                : <span className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-(--accent)" />}
              <span>{rich(item)}</span>
            </li>
          ))}
        </Tag>
      );
    }
    case 'cards':
      return (
        <div className={`grid gap-3 ${block.columns === 1 ? '' : 'sm:grid-cols-2'}`}>
          {block.items.map((item) => (
            <div key={item.title} className={`flex flex-col gap-4 p-5 ${card} ${item.figure && block.columns === 1 ? 'sm:flex-row sm:items-center' : ''}`}>
              {item.figure && <div className={`mx-auto w-full max-w-[200px] shrink-0 ${block.columns === 1 ? 'sm:mx-0 sm:w-44' : ''}`}>{item.figure}</div>}
              <CardBody item={item} />
            </div>
          ))}
        </div>
      );
    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((item, i) => (
            <li key={item.title} className={`grid items-center gap-5 p-5 ${card} ${item.figure ? 'sm:grid-cols-[180px_1fr]' : ''}`}>
              {item.figure && <div className="mx-auto w-full max-w-[200px]">{item.figure}</div>}
              <div>
                <p className="font-mono text-[11px] font-black tracking-[0.14em] text-(--accent)">STEP {String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-1 text-base font-black">{rich(item.title)}</h3>
                <p className="mt-1.5 break-keep text-sm leading-7 text-white/60">{rich(item.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className={`overflow-x-auto ${card}`}>
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            {block.caption && <caption className="px-4 pt-4 text-left text-xs font-bold text-white/45">{block.caption}</caption>}
            <thead><tr>{block.head.map((h) => <th key={h} scope="col" className="border-b border-white/10 px-4 py-3 text-xs font-black tracking-[0.06em] text-(--accent)">{h}</th>)}</tr></thead>
            <tbody>{block.rows.map((row, r) => <tr key={r} className="border-b border-white/[0.06] last:border-0">{row.map((cell, c) => <td key={c} className={`break-keep px-4 py-3 align-top leading-6 ${c === 0 ? 'font-bold text-white/85' : 'text-white/60'}`}>{rich(cell)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'figure':
      return (
        <figure className={`mx-auto w-full ${block.wide ? 'max-w-xl' : 'max-w-[280px]'}`}>
          {block.node}
          {block.caption && <figcaption className="mt-3 break-keep text-center text-xs leading-5 text-white/45">{rich(block.caption)}</figcaption>}
        </figure>
      );
    case 'callout': {
      const tone = block.tone ?? 'tip';
      const color = tone === 'warn' ? 'border-[#ff5d6c]/40 bg-[#ff5d6c]/[0.07]' : tone === 'note' ? 'border-white/15 bg-white/[0.04]' : 'border-(--accent)/40 bg-(--accent)/[0.07]';
      return (
        <aside className={`rounded-[16px] border p-5 ${color}`}>
          {block.title && <p className={`font-black ${tone === 'warn' ? 'text-[#ff8a95]' : tone === 'note' ? 'text-white/85' : 'text-(--accent)'}`}>{rich(block.title)}</p>}
          <p className={`break-keep text-sm leading-7 text-white/70 ${block.title ? 'mt-1.5' : ''}`}>{rich(block.text)}</p>
        </aside>
      );
    }
    case 'glossary':
      return (
        <dl className={`divide-y divide-white/[0.07] ${card}`}>
          {block.items.map((item) => (
            <div key={item.term} className="grid gap-1 px-5 py-4 sm:grid-cols-[160px_1fr] sm:gap-5">
              <dt className="font-black text-(--accent)">{item.term}</dt>
              <dd className="break-keep text-sm leading-7 text-white/65">{rich(item.def)}</dd>
            </div>
          ))}
        </dl>
      );
  }
}

export function Section({ section, levelLabel, idPrefix = '' }: { section: GuideSection; levelLabel?: string; idPrefix?: string }) {
  return (
    <section id={`${idPrefix}${section.id}`} className="mt-16 scroll-mt-20">
      {levelLabel && <span className="mb-3 inline-block rounded-full border border-(--accent)/50 bg-(--accent)/10 px-3 py-1 text-[11px] font-black text-(--accent)">{levelLabel}</span>}
      <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-[28px]">{section.title}</h2>
      {section.lead && <p className="mt-3 break-keep text-[15px] leading-7 text-white/55">{rich(section.lead)}</p>}
      <div className="mt-6 space-y-5">{section.blocks.map((block, i) => <Block key={i} block={block} />)}</div>
    </section>
  );
}

