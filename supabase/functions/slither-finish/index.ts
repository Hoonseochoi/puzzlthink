// 슬리더링크 challenge clear check. The browser sends every move it made; this function rebuilds the board from
// the run's seed, replays the moves (replay.ts) and only then records the clear through slither_finish_checked (service role only).
// A replay that does not end on the answer is not a clear. A clear that looks solved elsewhere and copied in
// (no ✕ marks with little erasing, almost no erasing, or faster than a person can solve it) is kept off the records,
// unless the run took 20 minutes or more. Suspicion signals (✕ bursts, clean streaks after a wipe) are stored with the run.
// Deployed with verify_jwt = false: the gateway check only knows the legacy keys, so the user is checked here (auth.getUser).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { checkRun } from './replay.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
/** The new secret key (SUPABASE_SECRET_KEYS), or the legacy service_role key while it still works. */
const secretKey = () => {
  try { const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}'); if (keys.default) return keys.default as string; } catch { /* fall back */ }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), { auth: { persistSession: false } });
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (!user) return json({ error: 'sign_in' }, 401);

  let body: { run?: unknown; steps?: unknown; away?: unknown };
  try { body = await req.json(); } catch { return json({ error: 'bad_body' }, 400); }
  const runId = typeof body.run === 'string' ? body.run : '';
  if (!runId || !Array.isArray(body.steps)) return json({ error: 'bad_body' }, 400);

  const { data: run } = await admin.from('slither_runs').select('user_id, finished_at, started_at, challenge_id').eq('id', runId).maybeSingle();
  if (!run || run.user_id !== user.id || run.finished_at) return json({ error: 'not_found' }, 404);
  const { data: board } = await admin.from('slither_challenges').select('seed, dots').eq('id', run.challenge_id).single();
  if (!board) return json({ error: 'not_found' }, 404);

  const check = checkRun(board.dots, Number(board.seed), body.steps, Date.now() - new Date(run.started_at).getTime());
  const { data, error } = await admin.rpc('slither_finish_checked', {
    p_run: runId, p_user: user.id, p_cleared: check.cleared, p_hints: check.hints, p_flag: check.flag, p_marks: check.markMoves, p_erases: check.eraseMoves,
  });
  if (error) return json({ error: error.message }, 400);
  // Keep the moves and the suspicion signals with the run, for review (never fails the request).
  // `away`: [from, to] ms spans the browser reported off the board (hidden tab, another app).
  const spans = (Array.isArray(body.away) ? body.away : []).slice(0, 500)
    .filter((x): x is [number, number] => Array.isArray(x) && x.length === 2 && x.every((n) => typeof n === 'number' && Number.isFinite(n)) && x[1] >= x[0]);
  const away = { n: spans.length, ms: spans.reduce((s, [a, b]) => s + (b - a), 0), spans };
  await admin.from('slither_runs').update({ signals: { ...check.signals, away }, steps: body.steps }).eq('id', runId).then(() => {}, () => {});
  return json(data);
});
