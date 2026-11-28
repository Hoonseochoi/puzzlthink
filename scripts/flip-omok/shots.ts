// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- playwright is loaded from PW at run time, so it has no types here
// @ts-nocheck
// 뒤집기 오목 「전략적 뒤집기」 headless check + screenshots (reports/flip-omok-rules/final/, Korean captions in file names).
// Runs against `next dev` started with a fake Supabase URL (NEXT_PUBLIC_SUPABASE_URL=http://mock-supabase.localhost,
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=mock). Realtime is a tiny relay in this script (Phoenix frames, presence and
// broadcast, the binary broadcast push included), shared by two browser contexts so a room is really played; every
// request that is not localhost is blocked, so nothing reaches the live database.
//   PW=<playwright/index.mjs> PW_EXE=<chrome-headless-shell> BASE=http://localhost:3123 npx tsx scripts/flip-omok/shots.ts [ai|room|all]
import { mkdirSync } from 'node:fs';
import { FLIP_CHARGES, chooseMove, flipsFor, isFlipped, type Board, type Cell, type Player } from '../../src/lib/flipOmok';

const { chromium } = await import(process.env.PW ?? 'playwright');
const BASE = process.env.BASE ?? 'http://localhost:3123';
const PART = process.argv[2] ?? 'all';
const OUT = 'reports/flip-omok-rules/final';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.PW_EXE ? { executablePath: process.env.PW_EXE } : {});
const log: string[] = [];
const fails: string[] = [];
const check = (ok: boolean, what: string) => { log.push(`${ok ? 'PASS' : 'FAIL'} ${what}`); if (!ok) fails.push(what); };
const shot = async (page, caption: string) => { const f = `${OUT}/${caption}.png`; await page.screenshot({ path: f }); log.push(`shot ${f}`); };

// ── realtime relay ──────────────────────────────────────────────────────────────────────────────────────────────
type Conn = { ws: any; joins: Map<string, { joinRef: string; key: string }> };
const topics = new Map<string, Map<Conn, { key: string; meta: any; ref: string }>>();
let oldHostMode = false; // strip the rules fields from states on their way to guests: what an old host would send
let refSeq = 0;
const send = (c: Conn, arr: unknown[]) => { try { c.ws.send(JSON.stringify(arr)); } catch { /* closed */ } };
function presenceOf(topic: string) {
  const out: Record<string, { metas: unknown[] }> = {};
  for (const { key, meta, ref } of topics.get(topic)?.values() ?? []) (out[key] ??= { metas: [] }).metas.push({ ...meta, phx_ref: ref });
  return out;
}
function diff(topic: string, joins: Record<string, unknown>, leaves: Record<string, unknown>) {
  for (const c of topics.get(topic)?.keys() ?? []) send(c, [c.joins.get(topic)?.joinRef ?? null, null, topic, 'presence_diff', { joins, leaves }]);
}
function leave(c: Conn, topic: string) {
  const members = topics.get(topic);
  const mine = members?.get(c);
  members?.delete(c);
  if (mine) diff(topic, {}, { [mine.key]: { metas: [{ ...mine.meta, phx_ref: mine.ref }] } });
}
function decodeBinary(buf: Buffer) {
  if (buf[0] !== 3) return null;
  const [jl, rl, tl, el, ml, enc] = [buf[1], buf[2], buf[3], buf[4], buf[5], buf[6]];
  let o = 7;
  const take = (n: number) => { const s = buf.subarray(o, o + n).toString('utf8'); o += n; return s; };
  const joinRef = take(jl), ref = take(rl), topic = take(tl), event = take(el); take(ml);
  const payload = enc === 1 ? JSON.parse(buf.subarray(o).toString('utf8')) : null;
  return { joinRef, ref, topic, event, payload };
}
function relay(from: Conn, topic: string, event: string, payload: unknown) {
  for (const c of topics.get(topic)?.keys() ?? []) {
    if (c === from) continue;
    let p = payload;
    if (oldHostMode && event === 'state' && p && typeof p === 'object') { p = { ...p }; delete p.rules; delete p.charges; delete p.rulesMove; delete p.stale; }
    send(c, [null, null, topic, 'broadcast', { type: 'broadcast', event, payload: p }]);
  }
}
async function wire(ctx) {
  await ctx.routeWebSocket(/mock-supabase\.localhost/, (ws) => {
    const c: Conn = { ws, joins: new Map() };
    ws.onMessage((msg) => {
      if (typeof msg !== 'string') {
        const m = decodeBinary(Buffer.from(msg));
        if (!m) return;
        if (m.ref) send(c, [m.joinRef, m.ref, m.topic, 'phx_reply', { status: 'ok', response: {} }]);
        relay(c, m.topic, m.event, m.payload);
        return;
      }
      const [joinRef, ref, topic, event, payload] = JSON.parse(msg);
      const ok = (response = {}) => send(c, [joinRef, ref, topic, 'phx_reply', { status: 'ok', response }]);
      if (topic === 'phoenix') return ok();
      if (event === 'phx_join') {
        c.joins.set(topic, { joinRef, key: payload?.config?.presence?.key || `k${++refSeq}` });
        if (!topics.has(topic)) topics.set(topic, new Map());
        ok({ postgres_changes: [] });
        send(c, [joinRef, null, topic, 'presence_state', presenceOf(topic)]);
        return;
      }
      if (event === 'phx_leave') { leave(c, topic); c.joins.delete(topic); return ok(); }
      if (event === 'presence') {
        const key = c.joins.get(topic)?.key ?? 'anon';
        const members = topics.get(topic)!;
        const prev = members.get(c);
        const entry = { key, meta: payload.payload, ref: `r${++refSeq}` };
        members.set(c, entry);
        ok();
        diff(topic, { [key]: { metas: [{ ...entry.meta, phx_ref: entry.ref }] } }, prev ? { [key]: { metas: [{ ...prev.meta, phx_ref: prev.ref }] } } : {});
        return;
      }
      if (event === 'broadcast') { ok(); relay(c, topic, payload.event, payload.payload); return; }
      ok();
    });
    ws.onClose(() => { for (const t of [...c.joins.keys()]) leave(c, t); });
  });
}

async function context(width: number, height: number, init?: string) {
  const mobile = width < 600;
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, locale: 'ko-KR', hasTouch: mobile, isMobile: mobile });
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === 'mock-supabase.localhost') return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return u.hostname === 'localhost' || u.hostname.endsWith('.localhost') ? route.continue() : route.abort();
  });
  await wire(ctx);
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => log.push(`pageerror ${e.message}`));
  page.on('dialog', (d) => d.accept());
  return { ctx, page };
}

// ── board helpers ───────────────────────────────────────────────────────────────────────────────────────────────
const readBoard = async (page): Promise<Board> => (await page.$$eval('button[data-v]', (bs) => bs.map((b) => Number(b.getAttribute('data-v'))))) as Cell[];
/** Diamonds shown in the chips above the board, red then blue. */
const readCharges = async (page): Promise<number[]> => page.$$eval('[role="img"][aria-label$="/3"]', (els) => els.slice(0, 2).map((e) => Number(e.getAttribute('aria-label')!.split('/')[0])));
const tapPoint = (page, at: number) => page.locator('button[data-v]').nth(at).click();
const heading = async (page) => (await page.locator('h1').first().innerText()).trim();

/** Every geometric sandwich (ignoring locks), for the lock check. */
function naiveRuns(board: Board, at: number, p: Player): number[][] {
  const out: number[][] = [];
  const r0 = Math.floor(at / 15), c0 = at % 15;
  const own = (v: number) => (v === 0 ? 0 : v === 1 || v === 3 ? 1 : 2);
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]]) {
    const run: number[] = [];
    let r = r0 + dr, c = c0 + dc;
    while (r >= 0 && r < 15 && c >= 0 && c < 15 && own(board[r * 15 + c]) === 3 - p) { run.push(r * 15 + c); r += dr; c += dc; }
    if (run.length && r >= 0 && r < 15 && c >= 0 && c < 15 && own(board[r * 15 + c]) === p) out.push(run);
  }
  return out;
}

/** One AI game as red at `level`. Uses every flip it is offered until all three are spent. */
async function aiGame(width: number, height: number, level: 'normal' | 'hard', tag: string, film: boolean) {
  const { ctx, page } = await context(width, height, `try { if (!sessionStorage.getItem('x')) { localStorage.removeItem('puzzlthink_flip_omok_rules2_seen'); sessionStorage.setItem('x','1') } } catch {}`);
  await page.goto(`${BASE}/flip-omok#play`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForSelector('button[data-v]', { timeout: 120000 });
  if (level === 'hard') await page.getByRole('button', { name: '어려움', exact: true }).click();
  if (film) await shot(page, `${tag}-01-시작-새-규칙-세줄-안내`);
  let flipsUsed = 0, lockChecked = false, choiceShot = false, moves = 0, quietDefault = false, cocoShot = false;
  for (; moves < 90; moves++) {
    let h = '';
    for (let k = 0; k < 250; k++) {
      h = await heading(page);
      if (film && !cocoShot && h.includes('노려요')) { await shot(page, `${tag}-06-COCO-뒤집기-예고-금색-표적`); cocoShot = true; }
      if (/승리|무승부/.test(h) || h.includes('차례')) break;
      await page.waitForTimeout(60);
    }
    if (/승리|무승부/.test(h)) break;
    const board = await readBoard(page);
    const [mine = 0, theirs = 0] = await readCharges(page);
    // Lock respected: a geometric sandwich through a locked stone is never offered.
    if (!lockChecked) {
      for (let at = 0; at < 225 && !lockChecked; at++) {
        if (board[at]) continue;
        const lockedRun = naiveRuns(board, at, 1).find((run) => run.some((i) => isFlipped(board[i])));
        if (lockedRun) {
          const offered = flipsFor(board, at, 1);
          check(lockedRun.every((i) => !offered.includes(i)), `${tag}: a run through a locked stone is not offered (point ${at})`);
          if (!offered.length) {
            await tapPoint(page, at);
            await page.waitForTimeout(200);
            const panel = await page.getByRole('button', { name: /놓고 뒤집기/ }).count();
            check(panel === 0, `${tag}: tapping a point whose only sandwich holds a locked stone places at once`);
            if (film) await shot(page, `${tag}-05-고정-돌이-낀-줄은-뒤집기-선택이-안-뜸`);
            lockChecked = true;
            continue;
          }
          lockChecked = true;
        }
      }
      if (lockChecked && (await heading(page)).includes('생각')) continue;
    }
    const offers = mine > 0 ? [...Array(225).keys()].filter((at) => !board[at] && flipsFor(board, at, 1).length) : [];
    const engine = chooseMove(board, 1, [0, mine, theirs], 'hard');
    const flipAt = offers.length ? (offers.includes(engine.at) ? engine.at : offers[0]) : null;
    if (flipAt !== null) {
      await tapPoint(page, flipAt);
      await page.waitForTimeout(250);
      const panel = page.getByRole('button', { name: /놓고 뒤집기/ });
      check(await panel.count() > 0, `${tag}: the choice panel appears on a sandwiching point`);
      if (!quietDefault) {
        const focused = await page.evaluate(() => document.activeElement?.textContent ?? '');
        check(focused.startsWith('놓기'), `${tag}: 놓기 is the focused default ("${focused.slice(0, 12)}")`);
        quietDefault = true;
      }
      if (!choiceShot && film) { await shot(page, `${tag}-02-선택-놓기-또는-놓고뒤집기-미리보기`); choiceShot = true; }
      if (await panel.isDisabled()) { await page.getByRole('button', { name: /^놓기/ }).click(); continue; }
      const turned = flipsFor(board, flipAt, 1);
      await panel.click();
      flipsUsed++;
      if (film && flipsUsed === 1) {
        await page.waitForTimeout(90); await shot(page, `${tag}-03-뒤집기-0.1초-콜아웃`);
        await page.waitForTimeout(1000); await shot(page, `${tag}-04-뒤집기-1.1초-자물쇠-고정`);
      } else await page.waitForTimeout(150);
      const after = await readBoard(page);
      check(turned.every((i) => after[i] === 3), `${tag}: flip ${flipsUsed} turned and locked ${turned.length} stone(s)`);
      continue;
    }
    await tapPoint(page, engine.at);
    await page.waitForTimeout(120);
    if (await page.getByRole('button', { name: /놓고 뒤집기/ }).count()) await tapPoint(page, engine.at); // second tap = 놓기
  }
  const [left = -1] = await readCharges(page);
  check(left === FLIP_CHARGES - flipsUsed, `${tag}: diamonds show ${left} left after ${flipsUsed} flips`);
  log.push(`${tag}: ${moves} of my moves, flips used ${flipsUsed}, result "${await heading(page)}"`);
  await page.waitForTimeout(4500);
  if (film) await shot(page, `${tag}-07-결과-뒤집기-사용-횟수`);
  const replayBtn = page.getByRole('button', { name: /복기/ }).first();
  if (await replayBtn.count()) {
    await replayBtn.click();
    await page.waitForTimeout(2500);
    if (film) await shot(page, `${tag}-08-복기`);
    check(await page.locator('button[data-v]').count() === 225, `${tag}: replay shows the board`);
  } else check(false, `${tag}: replay button`);
  await ctx.close();
  return flipsUsed;
}

if (PART === 'all' || PART === 'ai' || PART === 'tut') {
  // Tutorial on the entry page.
  {
    const { ctx, page } = await context(375, 812);
    await page.goto(`${BASE}/flip-omok`, { waitUntil: 'networkidle', timeout: 180000 });
    const step = page.getByText('뒤집기는 한 판에 3번', { exact: true }).first();
    check(await step.count() > 0, 'tutorial has the 3-flips step');
    if (await step.count()) { await step.scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, -160)); await page.waitForTimeout(400); await shot(page, '폰-00-튜토리얼-뒤집기는-한판에-3번'); }
    const lock = page.getByText('뒤집힌 돌은 고정', { exact: true }).first();
    if (await lock.count()) { await lock.scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, -160)); await page.waitForTimeout(400); await shot(page, '폰-00b-튜토리얼-뒤집힌-돌은-고정'); }
    await ctx.close();
  }
  if (PART === 'tut') { await browser.close(); console.log(log.join('\n')); process.exit(fails.length ? 1 : 0); }
  const used: number[] = [];
  used.push(await aiGame(375, 812, 'normal', '폰-보통', true));
  used.push(await aiGame(375, 812, 'hard', '폰-어려움', false));
  used.push(await aiGame(1280, 900, 'hard', 'PC-어려움', true));
  used.push(await aiGame(1280, 900, 'normal', 'PC-보통', false));
  check(used.some((n) => n === FLIP_CHARGES), `an AI game used all three flips (${used.join(', ')})`);
}

if (PART === 'all' || PART === 'room') {
  const code = '4821';
  const hostInit = `try { localStorage.setItem('puzzlthink_flip_omok_host_${code}', 'flip'); localStorage.setItem('puzzlthink_nickname', '방장'); } catch {}`;
  const guestInit = `try { localStorage.setItem('puzzlthink_nickname', '손님'); } catch {}`;
  const A = await context(375, 812, hostInit);
  const B = await context(375, 812, guestInit);
  await A.page.goto(`${BASE}/flip-omok/room/${code}`, { waitUntil: 'networkidle', timeout: 180000 });
  await B.page.goto(`${BASE}/flip-omok/room/${code}`, { waitUntil: 'networkidle', timeout: 180000 });
  await A.page.waitForTimeout(2500);
  await A.page.getByRole('button', { name: '15초' }).click().catch(() => {});
  await B.page.waitForTimeout(1200);
  await shot(B.page, '방-01-손님-대기실-새-규칙-안내');
  const start = A.page.getByRole('button', { name: '대국 시작' });
  check(await start.isEnabled().catch(() => false), 'room: both seats filled, start enabled');
  await start.click();
  await A.page.waitForSelector('button[data-v]');
  await B.page.waitForSelector('button[data-v]', { timeout: 30000 });
  const pages = [A.page, B.page];
  const whoseTurn = async () => { for (const pg of pages) if ((await heading(pg)).includes('내 차례')) return pg; return null; };
  let flipped = false, timedOut = false, reconnected = false;
  for (let k = 0; k < 60 && !reconnected; k++) {
    let pg = null;
    for (let w = 0; w < 150 && !pg; w++) { pg = await whoseTurn(); if (!pg) await A.page.waitForTimeout(100); }
    if (!pg) { log.push('room: no one to move'); break; }
    const board = await readBoard(pg);
    const me: Player = board.filter(Boolean).length % 2 === 0 ? 1 : 2;
    const offer = !flipped ? [...Array(225).keys()].find((at) => !board[at] && flipsFor(board, at, me).length) : undefined;
    if (offer !== undefined) {
      await tapPoint(pg, offer);
      await pg.waitForTimeout(250);
      await shot(pg, '방-02-선택-놓기-또는-놓고뒤집기');
      await pg.getByRole('button', { name: /놓고 뒤집기/ }).click();
      const other = pg === A.page ? B.page : A.page;
      await other.waitForTimeout(250);
      await shot(other, '방-03-상대-화면-뒤집기-콜아웃');
      await other.waitForTimeout(1300);
      const ob = await readBoard(other);
      check(flipsFor(board, offer, me).every((i) => ob[i] === (me === 1 ? 3 : 4)), 'room: the flip reached the other player, locked');
      const oc = await readCharges(other);
      check(oc[me - 1] === FLIP_CHARGES - 1, `room: the other player sees ${FLIP_CHARGES - 1} diamonds for the flipper (${oc.join(',')})`);
      flipped = true;
      continue;
    }
    if (flipped && !timedOut) {
      const c0 = await readCharges(pg), b0 = await readBoard(pg);
      await pg.waitForTimeout(18000);
      const b1 = await readBoard(pg), c1 = await readCharges(pg);
      const changed = b1.map((v, i) => (v !== b0[i] ? i : -1)).filter((i) => i >= 0);
      check(changed.length === 1, `room: the timed-out turn placed one stone and flipped nothing (${changed.length} changed)`);
      check(JSON.stringify(c0) === JSON.stringify(c1), `room: no charge spent on a timeout (${c0} → ${c1})`);
      await shot(pg, '방-04-시간초과-자동-한-수-뒤집기-안-씀');
      timedOut = true;
      continue;
    }
    if (timedOut) {
      const b0 = await readBoard(B.page), c0 = await readCharges(B.page);
      await B.page.reload({ waitUntil: 'networkidle' });
      await B.page.waitForSelector('button[data-v]', { timeout: 60000 });
      await B.page.waitForTimeout(2000);
      const b1 = await readBoard(B.page), c1 = await readCharges(B.page);
      check(JSON.stringify(b0) === JSON.stringify(b1), 'room: the guest reconnects with the same board and locks');
      check(JSON.stringify(c0) === JSON.stringify(c1), `room: the guest reconnects with the same charges (${c0} / ${c1})`);
      await shot(B.page, '방-05-손님-새로고침-후-복원');
      reconnected = true;
      continue;
    }
    const mv = chooseMove(board, me, [0, 0, 0], 'normal');
    await tapPoint(pg, mv.at);
    await pg.waitForTimeout(300);
  }
  check(flipped && timedOut && reconnected, `room: flip ${flipped}, timeout ${timedOut}, reconnect ${reconnected}`);
  // An old host: its states carry no rules version. The new guest shows the notice and plays plain moves.
  oldHostMode = true;
  await A.page.getByRole('button', { name: /기권/ }).last().click().catch(() => {});
  await A.page.waitForTimeout(1500);
  await A.page.getByRole('button', { name: /한 판 더/ }).first().click().catch(() => {});
  await A.page.waitForTimeout(800);
  // Make one move from whoever is to move so a state goes out.
  for (let w = 0; w < 40; w++) { const pg = await whoseTurn(); if (pg === A.page) { const b = await readBoard(A.page); await tapPoint(A.page, chooseMove(b, 1, [0, 0, 0], 'normal').at); break; } if (pg === B.page) break; await A.page.waitForTimeout(150); }
  await B.page.waitForTimeout(2500);
  const notice = await B.page.getByText('이전 버전', { exact: false }).count();
  check(notice > 0, 'room: a new guest of an old host sees the notice');
  await shot(B.page, '방-06-이전-버전-방장-안내');
  oldHostMode = false;
  await A.ctx.close(); await B.ctx.close();
}

await browser.close();
console.log(log.join('\n'));
console.log(fails.length ? `\n${fails.length} FAILED:\n${fails.join('\n')}` : '\nall checks passed');
