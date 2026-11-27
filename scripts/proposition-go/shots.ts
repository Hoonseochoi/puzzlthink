// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- playwright is loaded from PW at run time, so it has no types here
// @ts-nocheck
// 명제 바둑 headless check + screenshots for the owner (reports/proposition-go/).
// Runs against `next dev` started with a fake Supabase URL (NEXT_PUBLIC_SUPABASE_URL=http://mock-supabase.localhost):
// every request to it is answered here (the prop_* RPCs are emulated with the real generator and answers, the rest
// return empty), and every request that is not localhost is blocked, so nothing reaches the live database.
// Usage: PW=<path to playwright/index.mjs> BASE=http://localhost:3123 node --import ./scripts/proposition-go/resolve-ts.mjs scripts/proposition-go/shots.ts
import { existsSync, mkdirSync } from 'node:fs';
import { type Tier, encodeCells, generate, publicPart } from '../../src/lib/propositionGo';

const { chromium } = await import(process.env.PW ?? 'playwright');
const BASE = process.env.BASE ?? 'http://localhost:3123';
const OUT = 'reports/proposition-go';
mkdirSync(OUT, { recursive: true });

// ── mock server state ───────────────────────────────────────────────────────────────────────────────────────────
const day = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
const set = ([1, 2, 3] as Tier[]).map((t) => generate(t, 1_000_000 + 7 * t));
const run = { id: '11111111-2222-3333-4444-555555555555', started: 0, stage: 0, splits: [] as number[], hints: [0, 0, 0], done: null as null | Record<string, unknown> };
let pieces = 3;
const USER = { id: '9f1a2b3c-0000-4000-8000-00000000abcd', aud: 'authenticated', role: 'authenticated', email: 'tester@example.test', app_metadata: { provider: 'google' }, user_metadata: { full_name: '테스터' }, created_at: '2026-11-01T00:00:00Z' };
const view = () => ({ done: false, run: run.id, day, stage: run.stage, elapsed: Date.now() - run.started, limit: 600000, splits: run.splits, hints: run.hints, puzzle: publicPart(set[run.stage]), hint: run.hints[run.stage] ? set[run.stage].hint : null, pieces });
const result = (kind: 'clear' | 'giveup') => {
  const ms = Date.now() - run.started, hintN = run.hints.reduce((a, b) => a + b, 0);
  return { done: true, run: run.id, day, result: kind, ms, penalty: hintN * 30000, total: kind === 'clear' ? ms + hintN * 30000 : null, splits: run.splits, hints: run.hints, solved: run.splits.length, flag: null, rank: kind === 'clear' ? 4 : null, players: 38, streak: 3, crown: false };
};
const RANK = [['명제왕', 61234, 0], ['바둑알', 72410, 0], ['로직러', 80555, 1], ['테스터', 0, 1], ['퍼즐러버', 131200, 0]];

function rpc(name: string, body: Record<string, unknown>) {
  switch (name) {
    case 'prop_today': return run.done ? { day, players: 38, ready: true, top: { nickname: '명제왕', total: 61234 }, status: 'done', streak: 3, pieces, result: run.done }
      : { day, players: 37, ready: true, top: { nickname: '명제왕', total: 61234 }, status: run.started ? 'running' : 'none', streak: 2, pieces };
    case 'prop_start': if (!run.started) run.started = Date.now(); return run.done ?? view();
    case 'prop_hint': if (!run.hints[run.stage] && pieces > 0) { run.hints[run.stage] = 1; pieces--; } return view();
    case 'prop_solve': {
      if (body.p_stage !== run.stage) return view();
      if (body.p_cells !== encodeCells(set[run.stage].answer)) return { ...view(), wrong: true };
      run.splits.push(Date.now() - run.started); run.stage++;
      if (run.stage < 3) return view();
      run.done = result('clear');
      return run.done;
    }
    case 'prop_giveup': run.done = result('giveup'); return run.done;
    case 'prop_ranking': {
      const me = run.done?.total as number | undefined;
      return RANK.map(([n, t, h], i) => ({ rank: i + 1, nickname: n, avatar_url: null, total: n === '테스터' ? me ?? 99000 : t, hints: n === '테스터' ? run.hints.reduce((a, b) => a + b, 0) : h, is_me: n === '테스터' }));
    }
    case 'piece_balance': return pieces;
    default: return [];
  }
}

// A session for the fake user, so the game sees a signed-in member (the token never leaves this machine).
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
const exp = Math.floor(Date.now() / 1000) + 3600 * 6;
const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER.id, role: 'authenticated', aud: 'authenticated', exp, email: USER.email })}.sig`;
const SESSION = { access_token: token, refresh_token: 'mock-refresh', token_type: 'bearer', expires_in: 21600, expires_at: exp, user: USER };

const browser = await chromium.launch(process.env.PW_EXE ? { executablePath: process.env.PW_EXE } : {});
const log: string[] = [];
const fails: string[] = [];
const check = (ok: boolean, what: string) => { log.push(`${ok ? 'PASS' : 'FAIL'} ${what}`); if (!ok) fails.push(what); };

async function context(width: number, height: number, signedIn: boolean) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, locale: 'ko-KR', hasTouch: width < 600, isMobile: width < 600 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  await ctx.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'mock-supabase.localhost') {
      if (url.pathname.startsWith('/rest/v1/rpc/')) {
        const name = url.pathname.split('/').pop()!;
        let body: Record<string, unknown> = {};
        try { body = route.request().postDataJSON() ?? {}; } catch { /* none */ }
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
  if (signedIn) await ctx.addInitScript((s) => { try { localStorage.setItem('puzzlthink-auth-v2', s); } catch { /* */ } }, JSON.stringify(SESSION));
  await ctx.addInitScript(() => { try { localStorage.setItem('puzzlthink:nickname-seen', '1'); localStorage.setItem('puzzlthink:app-tester-dismiss', JSON.stringify({ n: 9, at: Date.now() })); } catch { /* */ } });
  return ctx;
}

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof context>>['newPage']>>;
const shot = async (page: Page, name: string, full = false) => { await page.waitForTimeout(450); await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full }); log.push(`shot ${name}.png`); };
const settle = async (page: Page) => { await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(600); };
/** Places stone i at cells[i], in tray order (the tray picks the next stone by itself). */
async function place(page: Page, cells: number[], upto = cells.length) {
  for (let i = 0; i < upto; i++) {
    const trayStone = page.locator('[data-pg-tray] [role="button"]').first();
    if ((await trayStone.getAttribute('aria-pressed')) !== 'true') await trayStone.click();
    await page.locator(`[data-pg-cell="${cells[i]}"]`).click();
    await page.waitForTimeout(140);
  }
}
const stateCount = async (page: Page, label: string) => page.locator(`button[aria-label="${label}"]`).count();

// ── 1. phone: home, entry, tutorial, practice, daily ───────────────────────────────────────────────────────────────
for (const [w, h, tag] of [[375, 812, '폰'], [1280, 900, '데스크톱']] as const) {
  const ctx = await context(w, h, true);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fails.push(`[${tag}] page error: ${e.message}`));

  await page.goto(`${BASE}/ko`); await settle(page);
  const row = page.getByText('PUZZLTHINK가 규칙부터 직접 만든 게임').first();
  check(await row.count() > 0, `[${tag}] home shows the ORIGINAL row`);
  await row.scrollIntoViewIfNeeded().catch(() => {});
  await shot(page, `${tag}-01-홈-오리지널-줄`);

  await page.goto(`${BASE}/ko/proposition-go`); await settle(page);
  await shot(page, `${tag}-02-명제바둑-입장화면`);

  // Tutorial: the three boards.
  await page.goto(`${BASE}/ko/proposition-go?mode=tutorial#play`); await settle(page);
  await shot(page, `${tag}-03-튜토리얼-1-시작`);
  await place(page, [3]);
  check(await stateCount(page, '참') === 3, `[${tag}] tutorial 1: three cards true`);
  await shot(page, `${tag}-04-튜토리얼-1-완료`);
  await page.getByRole('button', { name: '다음' }).click();
  await place(page, [0, 2]);
  await shot(page, `${tag}-05-튜토리얼-2-틀린자리-카드가-거짓`);
  await page.getByRole('button', { name: '무르기' }).click();
  await place(page, [1, 5].map((c) => c), 1); // blue to 1 (the tray picked blue again after undo)
  await place(page, [5]);
  check(await page.getByText('정답! 정답 배치는').count() > 0, `[${tag}] tutorial 2 solved after undo`);
  await page.getByRole('button', { name: '다음' }).click();
  await place(page, [0, 1, 5]);
  await page.waitForTimeout(500);
  check(await stateCount(page, '거짓말 카드') === 1, `[${tag}] tutorial 3: the lie is stamped`);
  await shot(page, `${tag}-06-튜토리얼-3-거짓말-발견`);

  // Practice: tier 3 from the practice set, a free hint, solve.
  if (existsSync('public/proposition-go/practice.json') && process.env.ONLY !== 'daily') {
  await page.goto(`${BASE}/ko/proposition-go?mode=practice#play`); await settle(page);
  await page.getByRole('button', { name: '힌트 보기 (연습은 무료)' }).click();
  // Partial board: two stones, to show true / false / undecided side by side.
  await page.locator('[data-pg-cell="5"]').click();
  await page.locator('[data-pg-cell="10"]').click();
  await shot(page, `${tag}-07-연습-기본-놓는중-참거짓미정-힌트카드`);
  await page.getByRole('button', { name: '정답 보기' }).click();
  await page.waitForTimeout(700);
  await shot(page, `${tag}-08-연습-정답보기`);
  } else log.push('practice skipped (no practice.json yet)');

  // Daily (phone does the full run; desktop shows the result and the side panel).
  if (tag === '폰') {
    await page.goto(`${BASE}/ko/proposition-go?mode=daily#play`); await settle(page);
    await shot(page, `${tag}-09-오늘의명제-시작전`);
    await page.getByRole('button', { name: '오늘의 3문제 시작' }).click();
    await page.waitForTimeout(900);
    await place(page, set[0].answer, 2);
    await shot(page, `${tag}-10-오늘의명제-1번-놓는중`);
    await page.getByRole('button', { name: /피스 힌트/ }).click();
    await page.waitForTimeout(600);
    check(await page.getByLabel('피스 힌트 카드 (항상 참)').count() === 1, `[${tag}] daily: piece hint card shown`);
    await shot(page, `${tag}-11-오늘의명제-피스힌트`);
    await place(page, set[0].answer.slice(2).map((c) => c), set[0].answer.length - 2);
    await page.waitForTimeout(300);
    await shot(page, `${tag}-12-오늘의명제-1번-정답-연출`);
    await page.waitForTimeout(1500);
    check((await page.locator('[data-pg-tray] [role="button"]').count()) === 5, `[${tag}] daily: puzzle 2 has five stones`);
    await place(page, set[1].answer);
    await page.waitForTimeout(1800);
    await place(page, set[2].answer, 4);
    await shot(page, `${tag}-13-오늘의명제-3번-거짓말단계`);
    await place(page, set[2].answer.slice(4), 1);
    await page.waitForTimeout(450);
    check(await stateCount(page, '거짓말 카드') === 1, `[${tag}] daily: the lie is revealed`);
    await shot(page, `${tag}-14-오늘의명제-거짓말-공개`);
    await page.waitForTimeout(2200);
    check(await page.getByText('오늘의 3문제 클리어').count() > 0, `[${tag}] daily: result card`);
    await shot(page, `${tag}-15-결과-공유카드`);
    await shot(page, `${tag}-16-결과-랭킹-전체`, true);
    await page.getByRole('button', { name: '결과 공유' }).click();
    await page.waitForTimeout(300);
    const text = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '');
    log.push(`share text:\n${text}`);
    check(text.includes('명제 바둑') && !/[0-9a-f]{5}/.test(text.split('\n')[0]), `[${tag}] share text has no answer`);
  } else {
    await page.goto(`${BASE}/ko/proposition-go?mode=daily#play`); await settle(page);
    await shot(page, `${tag}-09-오늘의명제-결과-사이드패널`);
  }

  // 뒤집기 오목 with its badge.
  await page.goto(`${BASE}/ko/flip-omok`); await settle(page);
  await shot(page, `${tag}-17-뒤집기오목-입장-오리지널배지`);
  await page.goto(`${BASE}/ko/flip-omok#play`); await settle(page);
  await shot(page, `${tag}-18-뒤집기오목-게임-헤더배지`);
  await page.goto(`${BASE}/ko/originals`); await settle(page);
  await shot(page, `${tag}-19-오리지널-시리즈-페이지`, true);
  await ctx.close();
}

// ── 2. the sheet: card states and stone moods ──────────────────────────────────────────────────────────────────────
{
  const ctx = await context(900, 760, false);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/ko/proposition-go/sheet`); await settle(page);
  await shot(page, '시트-카드상태-돌반응', true);
  await ctx.close();
}
await browser.close();
console.log(log.join('\n'));
console.log(fails.length ? `\n${fails.length} FAIL:\n${fails.join('\n')}` : '\nall checks passed');
