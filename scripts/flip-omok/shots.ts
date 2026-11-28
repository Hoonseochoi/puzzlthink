// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- playwright is loaded from PW at run time, so it has no types here
// @ts-nocheck
// Screenshots of the "전략적 뒤집기" prototype at 375×812 (reports/flip-omok-rules/, Korean captions in the file names).
// Plays red with the engine (reading the board from the page's data-v attributes): takes the first flip chance it
// gets, films the flip, then plays on to the end. Every request that is not localhost is blocked.
//   PW=<path to playwright/index.mjs> BASE=http://localhost:3123 npx tsx scripts/flip-omok/shots.ts
import { mkdirSync } from 'node:fs';
import { NEXT_RULES, actionsAt, chooseAction, legalActions, newState, type NState } from '../../src/lib/flipOmokNext';
import type { Cell } from '../../src/lib/flipOmok';

const { chromium } = await import(process.env.PW ?? 'playwright');
const BASE = process.env.BASE ?? 'http://localhost:3123';
const OUT = 'reports/flip-omok-rules/shots';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.PW_EXE ? { executablePath: process.env.PW_EXE } : {});
const log: string[] = [];

async function run(tag: string, reduced: boolean) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, locale: 'ko-KR', hasTouch: true, isMobile: true, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await ctx.route('**/*', (route) => { const u = new URL(route.request().url()); return u.hostname === 'localhost' || u.hostname.endsWith('.localhost') ? route.continue() : route.abort(); });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => log.push(`pageerror ${e.message}`));
  let n = 0;
  const shot = async (caption: string) => { n++; const f = `${OUT}/${tag}${String(n).padStart(2, '0')}-${caption}.png`; await page.screenshot({ path: f }); log.push(f); };
  await page.goto(`${BASE}/flip-omok?rules=next#play`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForSelector('button[data-v]', { timeout: 60000 });
  if (!reduced) await shot('시작-튜토리얼-세줄-뒤집기3개');

  const readState = async (): Promise<NState> => {
    const cells = await page.$$eval('button[data-v]', (bs) => bs.map((b) => [Number(b.getAttribute('data-v')), b.getAttribute('data-lock') ? 1 : 0]));
    const s = newState(NEXT_RULES);
    cells.forEach(([v, l], i) => { s.board[i] = v as Cell; s.locked[i] = l; });
    const diamonds = await page.$$eval('[aria-label$="/3"]', (els) => els.slice(0, 2).map((e) => Number(e.getAttribute('aria-label')!.split('/')[0])));
    s.charges = [0, diamonds[0] ?? 3, diamonds[1] ?? 3];
    s.turn = 1;
    return s;
  };
  const myTurn = async () => (await page.locator('h1').innerText()).includes('차례');
  const waitMine = async () => {
    for (let k = 0; k < 120; k++) {
      const h = await page.locator('h1').innerText();
      if (h.includes('노려요') && !log.some((l) => l.includes('COCO-뒤집기-예고'))) await shot('COCO-뒤집기-예고-금색-표적');
      if (h.includes('승리') || h.includes('무승부') || (await myTurn())) return h;
      await page.waitForTimeout(100);
    }
    return '';
  };
  const click = (at: number) => page.locator('button[data-v]').nth(at).click();

  let filmed = false, lockShot = false;
  for (let move = 0; move < 80; move++) {
    const h = await waitMine();
    if (!h || h.includes('승리') || h.includes('무승부')) break;
    const s = await readState();
    const legal = legalActions(NEXT_RULES, s);
    const flipChance = !filmed && legal.find((a) => a.flips.length >= 1 && s.charges[1] > 0);
    if (flipChance) {
      await click(flipChance.at);
      await page.waitForTimeout(300);
      await shot(`선택-놓기-또는-놓고뒤집기-${flipChance.flips.length}개-미리보기`);
      await page.getByRole('button', { name: /놓고 뒤집기/ }).click();
      if (reduced) { await page.waitForTimeout(200); await shot('움직임-줄이기-뒤집기-콜아웃만'); }
      else for (const [ms, cap] of [[60, '뒤집기-0.06초-콜아웃'], [220, '뒤집기-0.28초-돌이-돈다'], [300, '뒤집기-0.58초-충격파'], [700, '뒤집기-1.3초-고정-자물쇠']] as const) { await page.waitForTimeout(ms); await shot(cap); }
      filmed = true;
      if (reduced) break;
      continue;
    }
    if (filmed && !lockShot && s.charges[1] < 3) { await shot('뒤집기-1회-사용-다이아-2개-남음'); lockShot = true; }
    const a = chooseAction(NEXT_RULES, s, 'normal');
    // Place quietly with the engine's choice (a flip it would choose is taken through the panel).
    await click(a.at);
    await page.waitForTimeout(150);
    if (await page.getByRole('button', { name: /^놓기/ }).count()) await page.getByRole('button', { name: a.flips.length ? /놓고 뒤집기/ : /^놓기/ }).click();
  }
  if (!reduced) {
    await page.waitForTimeout(4500);
    await shot('결과-뒤집기-사용-횟수');
  }
  await ctx.close();
}

await run('', false);
// COCO doesn't flip every game: play extra games until its preview has been caught once.
for (let k = 0; k < 4 && !log.some((l) => l.includes('COCO-뒤집기-예고')); k++) await run(`coco${k}-`, false);
await run('rm-', true);
await browser.close();
console.log(log.join('\n'));
void actionsAt;
