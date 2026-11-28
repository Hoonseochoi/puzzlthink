// 히든 워드 확장판 open party room, six browsers, one whole game (headless Chromium, phone size).
// Runs against `next dev` started with a fake Supabase (NEXT_PUBLIC_SUPABASE_URL=http://mock-supabase.localhost,
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=mock). Every request that is not localhost is blocked. In this script:
//   - realtime: a tiny Phoenix relay (presence + broadcast) shared by the six browser contexts;
//   - auth: a signed-in session per browser in localStorage, /auth/v1/user answered here;
//   - open_room_put / open_room_list / open_room_close: an in-memory list;
//   - hw_party_*: the real functions on the scratch database hw_dev, inside one transaction that is rolled back
//     (pg_session.mjs), with 20271201300000 and 20271206000000 applied first. Nothing reaches the live database.
// The host opens the room "in the Play app" (?app=play), one guest finds it in the open-room list, four come by link.
//   PW=<playwright-core/index.mjs> PW_EXE=<chrome-headless-shell> BASE=http://localhost:3123 OUT=<dir> [N=2..6] [RELOAD_CHECK=1] \
//     node scripts/hidden-word/party_e2e.mjs
// It also prints the party channel's presence and joins, and whether guests show the host-away notice after the move.
import { mkdirSync, writeFileSync } from 'node:fs';
import { pgSession } from './pg_session.mjs';

const { chromium } = await import(process.env.PW ?? 'playwright');
const BASE = process.env.BASE ?? 'http://localhost:3123';
const OUT = process.env.OUT ?? '/tmp/hwp-shots';
const MIG = process.env.MIGRATIONS ?? 'supabase/migrations';
const N = Number(process.env.N ?? 6); // browsers (2–6); the full checks expect 6
mkdirSync(OUT, { recursive: true });
const log = [];
const fails = [];
const say = (m) => { log.push(m); console.log(m); };
const check = (ok, what) => { say(`${ok ? 'PASS' : 'FAIL'} ${what}`); if (!ok) fails.push(what); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const db = pgSession('hw_dev');
await db.open([`${MIG}/20271201300000_hidden_word_open_app.sql`, `${MIG}/20271206000000_hidden_word_party_six.sql`]);
const lit = (v) => (v === null || v === undefined ? 'null' : Array.isArray(v) ? `array[${v.map(lit).join(',')}]::text[]` : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const UID = (i) => `00000000-0000-4000-8000-00000000000${i + 1}`;
const sqlCall = async (name, args) => {
  const q = `select coalesce(to_json(public.${name}(${Object.entries(args).map(([k, v]) => `${k} => ${lit(v)}`).join(', ')}))::text, 'null')`;
  return (await db.query(q, { sub: UID(0) })) ?? 'null';
};

// ── realtime relay ──────────────────────────────────────────────────────────────────────────────────────────────
const topics = new Map();
const states = []; // every room state broadcast, for the secrecy check
let refSeq = 0;
let connSeq = 0;
const trace = [];
const send = (c, arr) => { try { c.ws.send(JSON.stringify(arr)); } catch { /* closed */ } };
function presenceOf(topic) {
  const out = {};
  for (const { key, meta, ref } of topics.get(topic)?.values() ?? []) (out[key] ??= { metas: [] }).metas.push({ ...meta, phx_ref: ref });
  return out;
}
function diff(topic, joins, leaves) {
  for (const c of topics.get(topic)?.keys() ?? []) send(c, [c.joins.get(topic)?.joinRef ?? null, null, topic, 'presence_diff', { joins, leaves }]);
}
function leave(c, topic) {
  const members = topics.get(topic);
  const mine = members?.get(c);
  members?.delete(c);
  if (mine) diff(topic, {}, { [mine.key]: { metas: [{ ...mine.meta, phx_ref: mine.ref }] } });
}
function decodeBinary(buf) {
  if (buf[0] !== 3) return null;
  const [jl, rl, tl, el, ml, enc] = [buf[1], buf[2], buf[3], buf[4], buf[5], buf[6]];
  let o = 7;
  const take = (n) => { const s = buf.subarray(o, o + n).toString('utf8'); o += n; return s; };
  const joinRef = take(jl), ref = take(rl), topic = take(tl), event = take(el); take(ml);
  const payload = enc === 1 ? JSON.parse(buf.subarray(o).toString('utf8')) : null;
  return { joinRef, ref, topic, event, payload };
}
function relay(from, topic, event, payload) {
  if (topic.includes('hidden-word-party-room')) states.push(JSON.stringify(payload));
  for (const c of topics.get(topic)?.keys() ?? []) {
    if (c === from) continue;
    send(c, [null, null, topic, 'broadcast', { type: 'broadcast', event, payload }]);
  }
}
async function wire(ctx) {
  await ctx.routeWebSocket(/mock-supabase\.localhost/, (ws) => {
    const c = { ws, joins: new Map() };
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
        if (topic.includes('party-room')) trace.push(`join ${c.id ?? (c.id = ++connSeq)} ${payload?.config?.presence?.key}`);
        c.joins.set(topic, { joinRef, key: payload?.config?.presence?.key || `k${++refSeq}` });
        if (!topics.has(topic)) topics.set(topic, new Map());
        ok({ postgres_changes: [] });
        send(c, [joinRef, null, topic, 'presence_state', presenceOf(topic)]);
        return;
      }
      if (event === 'phx_leave' && topic.includes('party-room')) trace.push(`leave ${c.id ?? (c.id = ++connSeq)}`);
      if (event === 'phx_leave') { leave(c, topic); c.joins.delete(topic); return ok(); }
      if (event === 'presence') {
        const key = c.joins.get(topic)?.key ?? 'anon';
        const members = topics.get(topic);
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

// ── REST mock ───────────────────────────────────────────────────────────────────────────────────────────────────
const openRooms = new Map();
const rpcCalls = {};
async function rpc(name, args) {
  rpcCalls[name] = (rpcCalls[name] ?? 0) + 1;
  if (name === 'open_room_put') { openRooms.set(args.p_code, { game: args.p_game, code: args.p_code, variant: args.p_variant, host: args.p_host, players: args.p_players, capacity: args.p_capacity, title: args.p_title ?? '', app: args.p_app ?? null }); return 'null'; }
  if (name === 'open_room_list') return JSON.stringify([...openRooms.values()].filter((r) => r.game === args.p_game));
  if (name === 'open_room_close') { openRooms.delete(args.p_code); return 'null'; }
  if (name.startsWith('hw_party_') || name.startsWith('hw_open_')) return sqlCall(name, args);
  return 'null';
}
const user = (i) => ({ id: UID(i), aud: 'authenticated', role: 'authenticated', email: `p${i}@example.test`, app_metadata: { provider: 'google' }, user_metadata: { full_name: `P${i}` }, created_at: '2026-11-01T00:00:00Z' });

const browser = await chromium.launch(process.env.PW_EXE ? { executablePath: process.env.PW_EXE } : {});
async function context(i) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, locale: 'ko-KR', hasTouch: true, isMobile: true });
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    if (u.hostname === 'mock-supabase.localhost') {
      if (u.pathname.startsWith('/rest/v1/rpc/')) {
        const name = u.pathname.slice('/rest/v1/rpc/'.length);
        let args = {};
        try { args = JSON.parse(req.postData() || '{}'); } catch { /* none */ }
        return route.fulfill({ status: 200, contentType: 'application/json', body: await rpc(name, args) });
      }
      if (u.pathname === '/rest/v1/profiles') {   // a nickname is set, so no nickname prompt covers the page
        const row = { nickname: `플레이어${i + 1}`, nickname_set: true, created_at: '2026-11-01T00:00:00Z' };
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify((req.headers().accept ?? '').includes('vnd.pgrst.object') ? row : [row]) });
      }
      if (u.pathname === '/auth/v1/user') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user(i)) });
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
    return u.hostname === 'localhost' || u.hostname.endsWith('.localhost') ? route.continue() : route.abort();
  });
  await wire(ctx);
  const session = { access_token: `mock-${i}`, refresh_token: `mock-${i}`, token_type: 'bearer', expires_in: 86400, expires_at: Math.floor(Date.now() / 1000) + 86400, user: user(i) };
  await ctx.addInitScript(`try { localStorage.setItem('puzzlthink-auth-v2', ${JSON.stringify(JSON.stringify(session))}); } catch {}`);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => say(`pageerror[${i}] ${e.message}`));
  page.on('dialog', (d) => d.dismiss());
  return { ctx, page, i };
}
const shot = async (page, name) => { const f = `${OUT}/${name}.png`; await page.screenshot({ path: f }); say(`shot ${f}`); };

try {
  const players = [];
  for (let i = 0; i < N; i++) players.push(await context(i));
  const [host, ...guests] = players;

  // 1. The host opens an open party room from the Play app.
  await host.page.goto(`${BASE}/hidden-word-plus?app=play`, { waitUntil: 'domcontentloaded', timeout: 240000 });
  const create = host.page.getByRole('button', { name: /공개방 만들기 · 2~6명/ });
  await create.waitFor({ timeout: 180000 });
  await create.click();
  await host.page.waitForURL(/open=[a-z0-9]+&v=1/, { timeout: 60000 });
  const code = new URL(host.page.url()).searchParams.get('open');
  check(!!code, `host created open party room ${code}`);
  for (let k = 0; k < 60 && !openRooms.has(code); k++) await wait(500);
  const listed = openRooms.get(code);
  check(!!listed && listed.variant === 1 && listed.capacity === 6 && listed.app === 'play', `listed as the party variant, 6 seats, from the app (${JSON.stringify(listed)})`);

  // 2. One guest finds it in the list, the rest come by the open-room link.
  await guests[0].page.goto(`${BASE}/hidden-word-plus`, { waitUntil: 'domcontentloaded', timeout: 240000 });
  const row = guests[0].page.locator('div', { hasText: '2~6명' }).filter({ has: guests[0].page.getByRole('button', { name: '참가' }) }).last();
  await row.waitFor({ timeout: 60000 });
  check((await row.innerText()).includes('1/6'), 'the list shows the room as 2~6명, 1/6');
  await shot(guests[0].page, '01-오픈방-목록-파티-2~6명');
  await row.getByRole('button', { name: '참가' }).click();
  for (const g of guests.slice(1)) await g.page.goto(`${BASE}/hidden-word-plus?open=${code}&v=1#play`, { waitUntil: 'domcontentloaded', timeout: 240000 });

  // 3. The host waits for six, opens the waiting-room tab and starts.
  await host.page.getByRole('button', { name: /대기실/ }).click();
  await host.page.getByText(`${N}/6명`).filter({ visible: true }).first().waitFor({ timeout: 90000 });
  await wait(800);
  await shot(host.page, '02-대기실-6명-모임');
  await host.page.getByRole('button', { name: '시작하기' }).filter({ visible: true }).first().click();
  for (const p of players) await p.page.waitForURL(new RegExp(`/hidden-word-plus/party/${code}`), { timeout: 60000 });
  check(true, 'all six moved to the party room page');
  await wait(3000);
  for (const [topic] of topics) if (topic.includes('party-room')) say(`presence after the move: ${JSON.stringify(Object.fromEntries(Object.entries(presenceOf(topic)).map(([k, v]) => [k, v.metas.map((m) => ({ host: m.host ?? null, name: m.name }))])))}`);
  say(`host notice per guest: ${(await Promise.all(guests.map((g) => g.page.getByText('방장의 연결이 끊겼어요').count()))).join(',')}`);
  if (process.env.RELOAD_CHECK) { await guests[1].page.reload({ waitUntil: 'domcontentloaded' }); await wait(5000); say(`after the guest reloads: ${await guests[1].page.getByText('방장의 연결이 끊겼어요').count()}`); }

  // 4. Play the whole game by the screens alone.
  const pickWord = async (sqlText) => (await db.query(sqlText)) || '';
  let shotTable = false, shotHint = false, shotAnswer = false, lastTurnEnd = '';
  const t0 = Date.now();
  let finished = 0;
  while (Date.now() - t0 < 12 * 60_000) {
    finished = 0;
    for (const p of players) {
      const pg = p.page;
      if (await pg.getByText('승리!').count()) { finished++; continue; }
      // envelopes
      const env = pg.locator('button[aria-label$="번 봉투"]:not([disabled])');
      if (await env.count()) { await env.first().click().catch(() => {}); await wait(400); continue; }
      // pick a word
      if (await pg.getByText('모두가 맞히기 어려울 단어를 고르세요').count()) {
        await pg.locator('main section button').first().click().catch(() => {});
        await pg.getByRole('button', { name: /\(으\)로 출제/ }).click().catch(() => {});
        await wait(500);
        continue;
      }
      // the setter's hint
      const hint = pg.getByPlaceholder('힌트 단어 (한글 명사)');
      if (await hint.count()) {
        const word = (await pg.locator('strong[lang="ko"]').first().innerText()).trim();
        const shown = await pg.locator('main li span').allInnerTexts();
        if (!shotHint && players.indexOf(p) > 0) { await shot(pg, '04-출제자-힌트-입력'); shotHint = true; }
        const w = await pickWord(`select h.word from hw_hints h where h.target = ${lit(word)} and h.score < 90 and h.word <> all(${lit(shown.length ? shown : [''])}) order by random() limit 1`);
        await hint.fill(w); await hint.press('Enter'); await wait(700);
        continue;
      }
      // a guesser's answer
      const ans = pg.getByPlaceholder('히든 워드라고 생각하는 단어');
      if (await ans.count()) {
        if (!shotTable) { await shot(pg, '03-6인-테이블-답-입력'); shotTable = true; }
        // the right word sometimes (read from the setter's own screen), else a random 확장 word
        let right = '';
        for (const x of players) if (x !== p && (await x.page.getByText('내 히든 워드').count())) right = (await x.page.locator('strong[lang="ko"]').first().innerText().catch(() => '')).trim();
        const shown = await pg.locator('main li span').allInnerTexts();
        const w = right && Math.random() < 0.3 ? right : await pickWord(`select word from hw_targets where level = 'plus' and word <> all(${lit([...shown, right || ''])}) order by random() limit 1`);
        await ans.fill(w); await ans.press('Enter'); await wait(700);
        if (!shotAnswer && (await pg.getByText(/답 제출/).count())) { await shot(pg, '05-답-제출-대기'); shotAnswer = true; }
        continue;
      }
      // the end of a turn: one browser moves it on
      const next = pg.getByRole('button', { name: /다음 턴/ });
      if (await next.count()) {
        const key = await pg.locator('main section').first().innerText().catch(() => '');
        if (key !== lastTurnEnd) { lastTurnEnd = key; if (players.indexOf(p) === 2) await shot(pg, '06-턴-종료-단어-공개'); }
        await next.click().catch(() => {}); await wait(600);
      }
    }
    if (finished === N) break;
    await wait(300);
  }
  check(finished === N, `all six reached the result screen (${finished}/${N}, ${Math.round((Date.now() - t0) / 1000)} s)`);
  await shot(host.page, '07-결과-6명-6턴');
  await host.page.locator('main').evaluate((el) => el.scrollIntoView({ block: 'end' })).catch(() => {});

  // 5. What the room state carried, from the relay's view of every broadcast.
  const last = states.map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter((s) => s?.phase === 'finished' && s.history?.length).pop();
  check(!!last, 'a finished state was broadcast');
  if (last) {
    check(last.players.length === 6 && last.history.length === 6, `six players, six turns (${last.history.length})`);
    check([...last.history.map((h) => h.setter)].sort().join() === [...last.players].sort().join(), 'each player set exactly once');
    const sum = Array(6).fill(0); for (const h of last.history) h.gained.forEach((g, i) => (sum[i] += g));
    check(sum.join() === last.scores.join(), `gains add up to the scores (${last.scores.join('/')})`);
    check(last.history.every((h) => h.solved !== 0 || h.gained[h.setter] === 6), 'a word held to the end gives the setter 6 (no doubling)');
    const words = (await db.query(`select string_agg(w, ',') from hw_party_envelopes e, unnest(e.words) w where e.deal = ${lit(last.deal)}`) ?? '').split(',').filter(Boolean);
    check(words.length === 30, 'all six envelopes were dealt (30 words)');
    let leaks = 0;
    for (const raw of states) {
      let s; try { s = JSON.parse(raw); } catch { continue; }
      if (!s || s.deal !== last.deal) continue;
      const turns = [...(s.history ?? []), ...(s.t ? [s.t] : [])];
      const legit = new Set(turns.flatMap((x) => [...x.hints.map((h) => h.w), ...x.answers.flatMap((a) => a.w), ...(x.word ? [x.word] : [])]));
      leaks += words.filter((w) => raw.includes(`"${w}"`) && !legit.has(w)).length;
    }
    check(leaks === 0, `no envelope word in any of ${states.length} room-state broadcasts before it was played (${leaks})`);
    check(!rpcCalls.hw_room_score && !rpcCalls.hw_room_reveal, 'party pages never called hw_room_score / hw_room_reveal');
    say(`turns: ${last.history.map((h) => `${h.word ?? '?'}:${h.solved === -1 ? 'skip' : h.solved ? `found@${h.solved}` : 'held'}`).join(' ')}`);
  }
  for (const [topic] of topics) if (topic.includes('party-room')) say(`presence at the end: ${JSON.stringify(Object.fromEntries(Object.entries(presenceOf(topic)).map(([k, v]) => [k, v.metas.map((m) => ({ host: m.host ?? null, term: m.term ?? null, name: m.name }))])))}`);
  say(`party channel joins/leaves: ${trace.join(' | ')}`);
  say(`rpc calls: ${JSON.stringify(rpcCalls)}`);
} catch (e) {
  fails.push(String(e)); say(`ERROR ${e?.stack ?? e}`);
} finally {
  await browser.close();
  await db.close();
  writeFileSync(`${OUT}/log.txt`, log.join('\n'));
  console.log(fails.length ? `FAILED: ${fails.length}` : 'ALL PASSED');
  process.exit(fails.length ? 1 : 0);
}
