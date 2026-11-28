// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- playwright is loaded from PW at run time, so it has no types here
// @ts-nocheck
// 현자의 징표 / 명제 바둑 rewards: headless screenshots for the owner (reports/piece-tokens/, git-ignored).
// Runs against `next dev` started with a fake Supabase URL (NEXT_PUBLIC_SUPABASE_URL=http://mock-supabase.localhost):
// every request to it is answered here, and every request that is not localhost is blocked, so nothing reaches the
// live database. The cube sheet needs the temporary page src/app/[locale]/dev-token-sheet (not committed).
// Usage: PW=<path to playwright/index.mjs> BASE=http://localhost:3124 node --import ./scripts/proposition-go/resolve-ts.mjs scripts/piece-tokens/shots.ts
import { mkdirSync } from 'node:fs';
import { type Tier, generate, publicPart } from '../../src/lib/propositionGo';

const { chromium } = await import(process.env.PW ?? 'playwright');
const BASE = process.env.BASE ?? 'http://localhost:3124';
const OUT = 'reports/piece-tokens';
mkdirSync(OUT, { recursive: true });

const day = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
const yesterday = new Date(Date.parse(`${day}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
const set = ([1, 2, 3] as Tier[]).map((t) => generate(t, 2_000_000 + 11 * t));
const USER = { id: '9f1a2b3c-0000-4000-8000-00000000abcd', aud: 'authenticated', role: 'authenticated', email: 'tester@example.test', app_metadata: { provider: 'google' }, user_metadata: { full_name: '테스터', nickname: '테스터' }, created_at: '2026-11-01T00:00:00Z' };

// ── scenario state, changed between screens ──
let news: unknown[] = [];
const wallet = { pieces: 15, tokens: 12, black_pieces: 3 };
let propStatus: 'none' | 'done' = 'none';
const PODIUM_Y = [{ rank: 1, nickname: '테스터', total: 158400, hints: 0 }, { rank: 2, nickname: '명제왕', total: 171250, hints: 1 }, { rank: 3, nickname: '로직러', total: 205900, hints: 0 }];
const PODIUM_T = [{ rank: 1, nickname: '바둑알', total: 142300, hints: 0 }, { rank: 2, nickname: '테스터', total: 268100, hints: 1 }, { rank: 3, nickname: '퍼즐러버', total: 311000, hints: 2 }];
const result = { done: true, run: 'r1', day, result: 'clear', ms: 238100, penalty: 30000, total: 268100, splits: [61000, 140000, 238100], hints: [1, 0, 0], stoneHints: [0, 0, 0], solved: 3, flag: null, rank: 2, players: 41, streak: 4, crown: false, reward: { id: 77, amount: 1, seen: false }, fastMs: 300000 };
const view = () => ({ done: false, run: 'r1', day, stage: 0, elapsed: 21000, limit: 600000, splits: [], hints: [0, 0, 0], puzzle: publicPart(set[0]), hint: null, pieces: wallet.pieces, tokens: wallet.tokens, blackPieces: wallet.black_pieces, stoneHints: [0, 0, 0], givens: [], hintsLeft: 3 });
const board = (week: number) => [
  ['식빵곰', 31, { wallgo: 5, janggi: 5, flip_omok: 5, point_omok: 5, blind_gomoku: 5, proposition_go: 6 }], ['2048장인', 27, { merge2048: 5, wallgo2: 5, janggi: 5, monorail: 5, proposition_go: 7 }],
  ['십이지신', 22, { janggi: 5, wallgo: 5, heavy13: 5, nine_mens_morris: 5, proposition_go: 2 }], ['테스터', 18, { wallgo: 5, flip_omok: 4, janggi: 3, proposition_go: 6 }],
  ['세모네모', 15, { wallgo: 5, janggi: 5, monorail: 5 }], ['코딩곰', 12, { point_omok: 5, wallgo: 5, janggi: 2 }],
].map(([n, p, g], i) => ({ rank: i + 1, nickname: n, avatar_url: null, pieces: week === 3 ? Math.max(1, Math.round((p as number) / 3)) : p, per_game: g, last_win: '2026-11-30T10:00:00Z', is_me: n === '테스터', prev_rank: i === 3 ? 5 : i + 1 }));

function rpc(name: string, body: Record<string, unknown>) {
  switch (name) {
    case 'my_wallet': return wallet;
    case 'my_piece_news': return news;
    case 'mark_piece_news_seen': news = []; return null;
    case 'competition_ranking': return board(3);
    case 'competition_final': return board(Number(body.p_week ?? 2));
    case 'prop_today': return propStatus === 'done'
      ? { day, players: 41, ready: true, top: { nickname: '바둑알', total: 142300 }, status: 'done', streak: 4, pieces: wallet.pieces, tokens: wallet.tokens, result }
      : { day, players: 40, ready: true, top: { nickname: '바둑알', total: 142300 }, status: 'none', streak: 3, pieces: wallet.pieces, tokens: wallet.tokens, blackPieces: wallet.black_pieces };
    case 'prop_start': return view();
    case 'prop_podium': return body.p_day === yesterday ? PODIUM_Y : PODIUM_T;
    case 'prop_ranking': return PODIUM_T.map((r) => ({ ...r, avatar_url: null, is_me: r.nickname === '테스터' }));
    default: return [];
  }
}

const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
const exp = Math.floor(Date.now() / 1000) + 3600 * 6;
const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER.id, role: 'authenticated', aud: 'authenticated', exp, email: USER.email })}.sig`;
const SESSION = { access_token: token, refresh_token: 'mock-refresh', token_type: 'bearer', expires_in: 21600, expires_at: exp, user: USER };

const browser = await chromium.launch(process.env.PW_EXE ? { executablePath: process.env.PW_EXE } : {});
const log: string[] = [];
async function context(time?: string) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, locale: 'ko-KR', hasTouch: true, isMobile: true });
  if (time) await ctx.clock.setFixedTime(new Date(time));
  await ctx.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'mock-supabase.localhost') {
      if (url.pathname.startsWith('/rest/v1/rpc/')) {
        const name = url.pathname.split('/').pop()!;
        let body: Record<string, unknown> = {};
        try { body = route.request().postDataJSON() ?? {}; } catch { /* none */ }
        log.push(`rpc ${name}`);
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rpc(name, body)) });
      }
      if (url.pathname === '/auth/v1/user') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(USER) });
      if (url.pathname === '/rest/v1/profiles') {
        const row = { id: USER.id, nickname: '테스터', nickname_set: true, full_name: '테스터', avatar_url: null, show_in_hall: true, created_at: '2026-11-01T00:00:00Z', last_seen_at: null, total_seconds: 3600 };
        const one = (route.request().headers().accept ?? '').includes('pgrst.object');
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(one ? row : [row]) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return route.continue();
    return route.abort();
  });
  await ctx.addInitScript((s) => { try { localStorage.setItem('puzzlthink-auth-v2', s); localStorage.setItem('puzzlthink:nickname-seen', '1'); localStorage.setItem('puzzlthink:app-tester-dismiss', JSON.stringify({ n: 9, at: Date.now() })); } catch { /* */ } }, JSON.stringify(SESSION));
  return ctx;
}
const settle = async (page) => { await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(900); };
const shot = async (page, name, full = false) => { await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full }); log.push(`shot ${name}.png`); };
const closeNews = async (page) => { await page.locator('[data-piece-news] button', { hasText: '확인' }).click(); await page.waitForTimeout(500); };

const ctx = await context();
const page = await ctx.newPage();
page.on('pageerror', (e) => log.push(`PAGE ERROR ${e.message}`));

// 1. the cube sheet
await page.goto(`${BASE}/ko/dev-token-sheet`); await settle(page); await page.waitForTimeout(1800);
await shot(page, '01-현자의징표-크기별-교환애니메이션-비용표시', true);

// 2. home: the 1W exchange popup, then the profile strip with the token chip
news = [{ kind: 'exchange', id: 1, period: 1, amount: 12, at: '2026-12-03T00:00:00Z' }];
await page.goto(`${BASE}/ko`); await settle(page);
await page.locator('[data-piece-news="exchange"]').waitFor({ timeout: 8000 });
await page.waitForTimeout(500); await shot(page, '02-교환팝업-1W-애니메이션중');
await page.waitForTimeout(1800); await shot(page, '03-교환팝업-1W-피스12개를-징표12개로');
await closeNews(page); await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, '04-홈-프로필줄-징표칩');

// 3. 명제 바둑 entry: yesterday's #1 popup, then the podium (today / yesterday)
news = [{ kind: 'prop_top', id: 78, day: yesterday, amount: 5, rank: 1, podium: PODIUM_Y, at: '2026-11-29T15:12:00Z' }];
await page.goto(`${BASE}/ko/proposition-go?mode=daily#play`); await settle(page);
await page.locator('[data-piece-news="prop_top"]').waitFor({ timeout: 8000 }); await page.waitForTimeout(900);
await shot(page, '05-어제1위-팝업-피스5개-포디움');
await closeNews(page);
await page.locator('[data-pg-podium]').scrollIntoViewIfNeeded(); await shot(page, '06-명제바둑-입장화면-오늘-포디움');
await page.locator('[data-pg-podium] button', { hasText: '어제' }).click(); await page.waitForTimeout(700);
await shot(page, '07-명제바둑-입장화면-어제-포디움');

// 4. a running daily run: the 피스 hint button shows 징표 cost while tokens are held
await page.getByRole('button', { name: '오늘의 3문제 시작' }).click(); await page.waitForTimeout(1200);
await page.locator('button', { hasText: '징표 1' }).first().scrollIntoViewIfNeeded();
await shot(page, '08-명제바둑-힌트버튼-징표1-비용');

// 5. result screen: the challenge popup, then the result with reward line and podium
propStatus = 'done';
news = [{ kind: 'prop_fast', id: 77, day, amount: 1, at: '2026-11-30T03:00:00Z' }];
await page.goto(`${BASE}/ko/proposition-go?mode=daily#play`); await page.reload(); await settle(page);
await page.locator('[data-piece-news="prop_fast"]').waitFor({ timeout: 8000 }); await page.waitForTimeout(900);
await shot(page, '09-챌린지달성-팝업-피스+1');
await closeNews(page);
await shot(page, '10-명제바둑-결과화면-보상줄-포디움', true);
await ctx.close();

// 6. the race board on 12/03 (3W live, 2W ended, 1W hall)
news = [];
const ctx2 = await context('2026-12-03T12:00:00+09:00');
const p2 = await ctx2.newPage();
p2.on('pageerror', (e) => log.push(`PAGE ERROR ${e.message}`));
await p2.goto(`${BASE}/ko/records#competition`); await settle(p2);
await p2.locator('[role="tablist"][aria-label="피스 경쟁전 주차"]').scrollIntoViewIfNeeded(); await p2.evaluate(() => window.scrollBy(0, -60));
await shot(p2, '11-피스경쟁전-3W탭-진행중');
await p2.getByRole('tab', { name: /2W/ }).click(); await settle(p2);
await p2.evaluate(() => window.scrollBy(0, -60)); await shot(p2, '12-피스경쟁전-2W-종료');
await p2.getByRole('tab', { name: /3W/ }).click(); await settle(p2);
await p2.locator('button', { hasText: '테스터' }).first().click(); await p2.waitForTimeout(500);
await p2.locator('[data-play-game="proposition_go"]').first().scrollIntoViewIfNeeded(); await shot(p2, '13-피스경쟁전-게임별-명제바둑챌린지-행');
await p2.goto(`${BASE}/ko`); await settle(p2); await shot(p2, '14-홈-이벤트카드-3W');
await ctx2.close();
await browser.close();
console.log(log.filter((l) => !l.startsWith('rpc ')).join('\n'));
console.log('rpcs:', [...new Set(log.filter((l) => l.startsWith('rpc ')).map((l) => l.slice(4)))].join(', '));
