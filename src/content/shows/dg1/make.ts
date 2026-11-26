// Small builder for the 데스게임 season-1 pages: every game is a one-on-one match of the same show, so the parts
// that repeat (kind, sources, updated date, the one-source note) are filled in here.
import type { ShowGame, ShowGameCopy } from '../types';
import { ONE_SOURCE_EN, ONE_SOURCE_KO, broadcast1, namuResults } from '../dg2/shared';

type Copy = Omit<ShowGameCopy, 'sourceNote'> & { note?: string };

export function dg1Game(slug: string, n: number, related: ShowGame['related'], ko: Copy, en: Copy): ShowGame {
  const { note: koNote, ...koRest } = ko;
  const { note: enNote, ...enRest } = en;
  return {
    slug,
    kind: 'duel',
    when: { ko: `${n}회차`, en: `Match ${n}` },
    episode: { ko: `${n}화`, en: `Episode ${n}` },
    related,
    updated: '2026-11-26',
    sources: [namuResults, broadcast1],
    ko: { ...koRest, sourceNote: ONE_SOURCE_KO + (koNote ? ` ${koNote}` : '') },
    en: { ...enRest, sourceNote: ONE_SOURCE_EN + (enNote ? ` ${enNote}` : '') },
  };
}
