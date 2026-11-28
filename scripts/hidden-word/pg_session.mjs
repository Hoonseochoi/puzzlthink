// One psql session on the scratch database (hw_dev) held inside a single transaction that is rolled back at the end,
// so a migration under test is never kept: open(files) runs `begin` and the files, query(q) runs one statement in a
// savepoint (an error rolls back only that statement) and returns its last output line, close() rolls back.
// Used by party_play.mjs and party_e2e.ts. Never point it at the live database.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

export function pgSession(db = 'hw_dev') {
  if (db === 'postgres') throw new Error('pg_session is for the scratch database only');
  const p = spawn('docker', ['exec', '-i', 'supabase-db', 'psql', '-U', 'postgres', '-d', db, '-tAq', '-v', 'ON_ERROR_STOP=0'], { stdio: ['pipe', 'pipe', 'pipe'] });
  let out = '', err = '', seq = 0, chain = Promise.resolve();
  p.stdout.on('data', (d) => { out += d; });
  p.stderr.on('data', (d) => { err += d; });
  const run = (body) => new Promise((resolve) => {
    const mark = `__end_${++seq}__`;
    out = ''; err = '';
    p.stdin.write(`${body}\n\\echo ${mark}\n`);
    const tick = setInterval(() => {
      const at = out.indexOf(mark);
      if (at < 0) return;
      clearInterval(tick);
      resolve({ text: out.slice(0, at).trim(), err });
    }, 2);
  });
  const queue = (fn) => { const next = chain.then(fn); chain = next.catch(() => {}); return next; };
  return {
    open: (files = [], setup = '') => queue(async () => {
      const r = await run(`begin;\n${files.map((f) => readFileSync(f, 'utf8')).join('\n')}\n${setup}`);
      if (/ERROR/.test(r.err)) throw new Error(`setup failed: ${r.err}`);
    }),
    /** One statement; `claims` sets auth.uid() for it. Returns the last output line, or null after an error. */
    query: (q, claims) => queue(async () => {
      const r = await run(`savepoint q;\n${claims ? `set local request.jwt.claims='${JSON.stringify(claims)}';\n` : ''}${q};`);
      const bad = /ERROR/.test(r.err);
      await run(bad ? 'rollback to savepoint q;' : 'release savepoint q;');
      return bad ? null : r.text.split('\n').pop() ?? '';
    }),
    close: () => queue(async () => { await run('rollback;'); p.stdin.end(); }),
  };
}
