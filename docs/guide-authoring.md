# Writing a game guide page

Every game can have a long-form guide at `/[locale]/<game>/guide` (e.g. `/ko/wallgo/guide`). One file per game holds
the whole guide in Korean and English; the route, table of contents, JSON-LD, sitemap entry, `/guides` hub card and
the "자세한 공략 보기" / "처음이라면? 공략 보기" links all appear automatically once that file exports a guide.

Pilots to copy from: `src/content/guides/wallgo.tsx` and `src/content/guides/janggi.tsx`.

## The one file you touch

`src/content/guides/<url-slug>.ts` — the slug is the game's catalog href without the slash (`src/lib/gameCatalog.ts`):
`wallgo-2`, `card-janggi`, `2048`, `play` (sudoku) … Every catalog game already has this file as a stub that exports
`null`. Replace the stub with your guide:

- No board pictures → keep `.ts`.
- Pictures → rename to `.tsx` (`git mv x.ts x.tsx`) and pass React nodes as `figure` / `node`. Use the game's existing
  **server** diagram components (no `'use client'`), as the pilots use `WallGoDiagram` and `JanggiDiagram`.

Do **not** edit `src/content/guides/index.ts`, `ko.json` / `en.json`, the renderer or the route — nothing else is
needed, which is what lets several authors work in parallel without conflicts. If the game's short inline guide is a
`TextGuide` (most are), set `inlineNamespace` to its namespace (e.g. `'WallGo2Guide'`) so the link appears there.

The 8 logic puzzles (슬리더링크, 마슈, 노노그램, 비나이로, 한붓길, 컬러 잇기, 마방진 스왑, 스타배틀) already have
their own guide pages (`src/app/[locale]/<game>/guide`, listed in `src/content/guides/legacy.ts`); leave them alone.

## Two places, one source

The same file feeds two pages:

- **`/<game>/guide`** (`GuidePage`) — the full guide: every section, walkthrough, glossary, CTA, related games.
- **The game page** (`GameArticle`) — a condensed article below the board: the first intro paragraph, the sections
  marked `onGamePage: true`, the FAQ, and a box linking to the sections that live only on the guide page.

Rule (keep it consistent so Google sees two different pages, not duplicates): mark **background, rules, edge cases
and the beginner strategy** `onGamePage`; walkthroughs, intermediate/advanced strategy, mistakes, mode notes and
the glossary stay on the guide page only. Set `gamePageTitle` to the game page's existing search-tuned `<h1>` (the
inline guide's `title` message). Write `intro[0]` so it reads on its own; later intro paragraphs appear only on the
guide page.

Wiring the game page (your own game's `src/app/[locale]/<slug>/page.tsx`, no shared file):

```tsx
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
const faq = guideFaq('wallgo2', locale)!;              // FAQPage JSON-LD must match the visible FAQ
// …
guide={<GameArticle locale={locale} game="wallgo2" />}  // replaces <TextGuide … /> in GameGate's guide slot
```

`GameArticle` replaces the short `TextGuide` rather than stacking a second guide. It is a server component (no client
JS) and sits in GameGate's `guide` slot: below the start panel and tutorial, and not rendered at all while a game is
running, so it never touches the board. Keep any game-specific extras with the `extra` prop (벽바둑 passes its
벽바둑 II link). The old namespace's messages can stay in ko/en.json if other components (tutorials) still read them.

## Schema (`src/content/guides/types.ts`)

```ts
const guide: GameGuide = {
  game: 'wallgo2',                          // catalog id; must match the file you are in
  origin: { kind: 'show', show: 'dp3' },    // or { kind: 'classic' } / { kind: 'original' }; show ids: SHOWS in src/lib/seo.ts
  updated: '2026-11-26',                    // YYYY-MM-DD of this revision
  related: ['wallgo', 'pointOmok'],         // catalog ids; linked at the bottom
  inlineNamespace: 'WallGo2Guide',          // optional, see above
  ko: { meta, title, lead, intro, summary, sections, faq, cta, disclaimer? },
  en: { …same shape, a real translation… },
};
export default guide;
```

- `meta`: `<title>`, meta description (~120–160 chars), keywords people actually search.
- `title` is the page `<h1>`; `lead` one line under it; `intro` 1–3 paragraphs; `summary` one line for the hub card.
- `sections`: each `{ id, title, level?, lead?, onGamePage?, blocks }` becomes an `<h2>` with an anchor in the table of contents.
  `level: 'beginner' | 'intermediate' | 'advanced'` adds the 입문/중급/고급 badge.
- Blocks: `p`, `h3`, `list` (`ordered?`), `cards` (title/body/tag?/figure?, `columns: 1` for wide cards with a
  picture beside the text), `steps` (numbered walkthrough), `table`, `figure`, `callout` (`tip` / `warn` / `note`),
  `glossary`. `**bold**` works inside any text.
- `faq`: also emitted as FAQPage JSON-LD. `cta`: the play-button panel. `disclaimer`: the fan-project notice for show games.

Typical section order (all optional — include only what is true for the game): background → rules → edge cases →
walkthrough → beginner / intermediate / advanced strategy → common mistakes → mode notes (AI levels, hell mode,
friend rooms, open matches) → glossary.

## Quality bar

- **Every rule and number must match the code.** Read the game's `src/lib/<game>.ts`, its components (timers, turn
  skips, room rules in `src/lib/<game>Room.ts`, AI levels) and its existing inline guide messages. Note the files you
  checked in a comment at the top of the guide file.
- At least ~3,000 Korean characters of substance (English of comparable depth). Go deeper than the inline guide —
  edge cases, a concrete worked example, positions with coordinates, counting — do not paraphrase it.
- Do not invent facts about TV shows, episodes or history. If you cannot verify an external fact, leave it out.
- No filler or keyword stuffing; each paragraph should teach something.
- Korean in the site's friendly 해요체; English a natural translation, not a stub.
- Diagrams must be legal positions under the real rules. Check what each piece can reach before you write about it.

## Check it locally

```bash
npx tsc --noEmit
```

```bash
npx eslint src/content/guides
```

```bash
npm run dev
```

Open `http://localhost:3000/ko/<slug>/guide`, `/en/<slug>/guide`, `/ko/guides` and the game page `/ko/<slug>` (the
condensed article is under the start panel; press start and check the board looks exactly as before, at a phone
width too). To confirm the text is in the
server HTML: `curl -s http://localhost:3000/ko/<slug>/guide | grep -c '<h2'`. Finish with `npx next build`; the guide
should appear among the prerendered `/[locale]/[game]/guide` paths.

## Route design (for reference)

`src/app/[locale]/[game]/guide/page.tsx` serves every registered guide (`generateStaticParams` from the registry,
`dynamicParams = false`, so slugs without a guide 404). Static `[locale]/<game>/guide` folders — the 8 logic-puzzle
pages — take precedence over the dynamic segment, so they keep working unchanged.
