// Builder for game pages whose rules rest on one written source: fills in the repeated parts (updated date, the
// one-source note) so each show's files only hold the game's own copy.
import type { Bi, MatchKind, ShowGame, ShowGameCopy, Source } from './types';

type Copy = Omit<ShowGameCopy, 'sourceNote'> & { note?: string };

export function makeGame(
  base: { slug: string; kind: MatchKind; when: Bi; episode?: Bi; related: ShowGame['related']; sources: Source[]; oneSource: Bi },
  ko: Copy,
  en: Copy,
): ShowGame {
  const { note: koNote, ...koRest } = ko;
  const { note: enNote, ...enRest } = en;
  return {
    slug: base.slug,
    kind: base.kind,
    when: base.when,
    ...(base.episode ? { episode: base.episode } : {}),
    related: base.related,
    updated: '2026-11-26',
    sources: base.sources,
    ko: { ...koRest, sourceNote: base.oneSource.ko + (koNote ? ` ${koNote}` : '') },
    en: { ...enRest, sourceNote: base.oneSource.en + (enNote ? ` ${enNote}` : '') },
  };
}
