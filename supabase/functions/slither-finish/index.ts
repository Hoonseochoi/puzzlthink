// 슬리더링크 challenge clear check. The browser sends every move it made; this function rebuilds the board from
// the run's seed, replays the moves (replay.ts) and only then records the clear through slither_finish_checked (service role only).
// A replay that does not end on the answer is not a clear. A clear that looks solved elsewhere and copied in
// (no ✕ marks, almost no erasing, or faster than a person can solve it) is kept off the records.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { checkRun } from './replay.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (!user) return json({ error: 'sign_in' }, 401);

  let body: { run?: unknown; steps?: unknown };
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
  return json(data);
});
