// Short constructors for article blocks, so the content files read like text rather than JSON.
import type { GuideBlock, GuideSection } from '@/content/guides/types';

export const p = (text: string): GuideBlock => ({ type: 'p', text });
export const h3 = (text: string): GuideBlock => ({ type: 'h3', text });
export const ul = (...items: string[]): GuideBlock => ({ type: 'list', items });
export const ol = (...items: string[]): GuideBlock => ({ type: 'list', items, ordered: true });
export const table = (head: string[], rows: string[][], caption?: string): GuideBlock => ({ type: 'table', head, rows, caption });
export const tip = (title: string, text: string): GuideBlock => ({ type: 'callout', tone: 'tip', title, text });
export const note = (title: string, text: string): GuideBlock => ({ type: 'callout', tone: 'note', title, text });
export const cards = (...items: { title: string; body: string; tag?: string }[]): GuideBlock => ({ type: 'cards', items });
export const terms = (...items: [string, string][]): GuideBlock => ({ type: 'glossary', items: items.map(([term, def]) => ({ term, def })) });
export const sec = (id: string, title: string, blocks: GuideBlock[], lead?: string): GuideSection => ({ id, title, lead, blocks });
