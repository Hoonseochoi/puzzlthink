// Rendering of game-theory article sections. Same look as the guide pages (GuideBlocks), plus inline links
// and payoff matrices. Server component.
import { Fragment, type ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { card, prose } from '@/components/guide/GuideBlocks';
import type { GTBlock, GTSection } from '@/content/game-theory/types';

const BOLD = /\*\*(.+?)\*\*/g;

function bold(text: string, key: string): ReactNode[] {
  return text.split(BOLD).map((part, i) => (i % 2 ? <strong key={`${key}b${i}`} className="font-black text-white/90">{part}</strong> : <Fragment key={`${key}t${i}`}>{part}</Fragment>));
}

/** `**bold**` and `[label](/path)` inside article strings. */
export function richText(text: string): ReactNode {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...bold(text.slice(last, m.index), `s${n}`));
    const [, label, href] = m;
    const cls = 'font-bold text-(--accent) underline decoration-(--accent)/40 underline-offset-4 hover:decoration-(--accent)';
    out.push(href.startsWith('http')
      ? <a key={`l${n}`} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{bold(label, `l${n}`)}</a>
      : <Link key={`l${n}`} href={href} className={cls}>{bold(label, `l${n}`)}</Link>);
    last = m.index + m[0].length;
    n += 1;
  }
  if (last < text.length) out.push(...bold(text.slice(last), 'e'));
  return out;
}

function Matrix({ block }: { block: Extract<GTBlock, { type: 'matrix' }> }) {
  const marked = (r: number, c: number) => block.mark?.some(([mr, mc]) => mr === r && mc === c);
  return (
    <figure className={`overflow-x-auto p-4 ${card}`}>
      <table className="mx-auto border-separate border-spacing-1.5 text-center text-sm">
        <thead>
          <tr>
            <th rowSpan={2} className="px-2 text-left align-bottom text-[11px] font-bold text-white/45">
              <span className="block text-(--accent)">{block.rowPlayer} ↓</span>
              <span className="block">{block.colPlayer} →</span>
            </th>
            {block.cols.map((c) => <th key={c} scope="col" className="min-w-[96px] px-3 py-2 text-xs font-black text-white/80">{richText(c)}</th>)}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={row}>
              <th scope="row" className="px-3 py-2 text-left text-xs font-black text-(--accent)">{richText(row)}</th>
              {block.cells[r].map(([a, b], c) => (
                <td key={c} className={`rounded-xl px-3 py-3 font-mono text-[15px] font-bold ${marked(r, c) ? 'bg-(--accent)/15 text-white ring-2 ring-(--accent)/70' : 'bg-white/[0.04] text-white/75'}`}>
                  <span className="text-(--accent)">{a}</span><span className="text-white/35">, </span><span>{b}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {block.caption && <figcaption className="mt-3 break-keep text-center text-xs leading-5 text-white/50">{richText(block.caption)}</figcaption>}
    </figure>
  );
}

function Block({ block }: { block: GTBlock }) {
  switch (block.type) {
    case 'p': return <p className={prose}>{richText(block.text)}</p>;
    case 'h3': return <h3 className="pt-2 text-lg font-black">{richText(block.text)}</h3>;
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className="space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className={`flex gap-3 ${prose}`}>
              {block.ordered
                ? <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent) text-xs font-black text-black/80">{i + 1}</span>
                : <span className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-(--accent)" />}
              <span>{richText(item)}</span>
            </li>
          ))}
        </Tag>
      );
    }
    case 'table':
      return (
        <div className={`overflow-x-auto ${card}`}>
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            {block.caption && <caption className="px-4 pt-4 text-left text-xs font-bold text-white/45">{richText(block.caption)}</caption>}
            <thead><tr>{block.head.map((h) => <th key={h} scope="col" className="border-b border-white/10 px-4 py-3 text-xs font-black tracking-[0.06em] text-(--accent)">{h}</th>)}</tr></thead>
            <tbody>{block.rows.map((row, r) => <tr key={r} className="border-b border-white/[0.06] last:border-0">{row.map((cell, c) => <td key={c} className={`break-keep px-4 py-3 align-top leading-6 ${c === 0 ? 'font-bold text-white/85' : 'text-white/60'}`}>{richText(cell)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'matrix': return <Matrix block={block} />;
    case 'figure':
      return (
        <figure className={`mx-auto w-full max-w-xl p-4 ${card}`}>
          {block.node}
          {block.caption && <figcaption className="mt-3 break-keep text-center text-xs leading-5 text-white/50">{richText(block.caption)}</figcaption>}
        </figure>
      );
    case 'callout': {
      const tone = block.tone ?? 'tip';
      const color = tone === 'warn' ? 'border-[#ff5d6c]/40 bg-[#ff5d6c]/[0.07]' : tone === 'note' ? 'border-white/15 bg-white/[0.04]' : 'border-(--accent)/40 bg-(--accent)/[0.07]';
      return (
        <aside className={`rounded-[16px] border p-5 ${color}`}>
          {block.title && <p className={`font-black ${tone === 'warn' ? 'text-[#ff8a95]' : tone === 'note' ? 'text-white/85' : 'text-(--accent)'}`}>{richText(block.title)}</p>}
          <p className={`break-keep text-sm leading-7 text-white/70 ${block.title ? 'mt-1.5' : ''}`}>{richText(block.text)}</p>
        </aside>
      );
    }
    case 'glossary':
      return (
        <dl className={`divide-y divide-white/[0.07] ${card}`}>
          {block.items.map((item) => (
            <div key={item.term} className="grid gap-1 px-5 py-4 sm:grid-cols-[160px_1fr] sm:gap-5">
              <dt className="font-black text-(--accent)">{item.term}</dt>
              <dd className="break-keep text-sm leading-7 text-white/65">{richText(item.def)}</dd>
            </div>
          ))}
        </dl>
      );
  }
}

export function GTSectionView({ section }: { section: GTSection }) {
  return (
    <section id={section.id} className="mt-16 scroll-mt-20">
      <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-[28px]">{section.title}</h2>
      {section.lead && <p className="mt-3 break-keep text-[15px] leading-7 text-white/55">{richText(section.lead)}</p>}
      <div className="mt-6 space-y-5">{section.blocks.map((block, i) => <Block key={i} block={block} />)}</div>
    </section>
  );
}
