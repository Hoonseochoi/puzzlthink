<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 업데이트 내역 (game update notes) — every session

When your change ships something players of a game will notice (rules, AI, modes, controls, a bug they hit),
add a note for it in `src/lib/gameUpdates.ts` in the same commit. It shows in the game's "업데이트" popup.

- Newest entry first in that game's `items`; `date` is 'MM/DD' (KST); Korean and English, one-line `title` + 1–2 sentence `desc`.
- Say what changed for the player, not how the code changed. Skip refactors, SEO, analytics, internal fixes.
- If you undo or rework a change that already has a note, edit that note instead of adding another.
- A game with no notes yet: add it to `GAME_UPDATES` and put `<GameUpdates game="<id>" />` before `<BugReport />` in its header(s).
