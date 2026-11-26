"""Play whole AI matches against the live hw_* functions with stand-in players, and check the server's work.

Goes through PostgREST with the publishable key, exactly like the browser, so grants are tested too; or, with
psql:<database>, straight into a scratch database in the DB container (signed in as <user id> when given), for
testing migrations and data before they go live.
Checks on every reply: the AI's word and seed never leak, points add up, a turn ends when it should, the level holds.
Usage: play_bots.py <game dir> <env file | psql:<database>> [matches] [level] [user id]
  game dir: <data>/game/<level> (build_game.py), or <data> for the old single-level layout
"""
import json, os, subprocess, sys, urllib.request
import numpy as np

DATA, ENV = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 20
LEVEL = sys.argv[4] if len(sys.argv) > 4 else None
UID = sys.argv[5] if len(sys.argv) > 5 else None
GAME = DATA if os.path.exists(f'{DATA}/feel.npy') else f'{DATA}/game'
rng = np.random.default_rng(11)
E = np.load(f'{GAME}/feel.npy').astype(np.float32)
words = open(f'{GAME}/words.txt', encoding='utf-8').read().split(); idx = {w: i for i, w in enumerate(words)}
meta = json.load(open(f'{GAME}/targets.json', encoding='utf-8')); pool = [x['word'] for x in meta]
lists = {x['word']: x['list'] for x in meta}

if ENV.startswith('psql:'):
    DB = ENV[5:]
    def rpc(name, body):
        q = lambda v: "'" + str(v).replace("'", "''") + "'"
        args = {'hw_start': lambda b: q(b['p_level']) if 'p_level' in b else '',
                'hw_act': lambda b: f"{q(b['p_game'])}::uuid, {q(json.dumps(b['p_action'], ensure_ascii=False))}::jsonb"}[name](body)
        claims = f"set request.jwt.claims = {q(json.dumps({'sub': UID}))};" if UID else ''
        out = subprocess.run(['docker', 'exec', '-i', 'supabase-db', 'psql', '-U', 'postgres', '-d', DB, '-tAq', '-v', 'ON_ERROR_STOP=1'],
                             input=f'{claims} select public.{name}({args});', capture_output=True, text=True, check=True).stdout
        return json.loads(out.strip().splitlines()[-1])
else:
    env = dict(line.strip().split('=', 1) for line in open(ENV) if '=' in line and not line.startswith('#'))
    URL, KEY = env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']
    def rpc(name, body):
        req = urllib.request.Request(f'{URL}/rest/v1/rpc/{name}', json.dumps(body).encode(),
                                     {'apikey': KEY, 'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json', 'User-Agent': 'hw-bots'})  # the gateway refuses urllib's default agent
        return json.load(urllib.request.urlopen(req))

def check(v):
    assert 'aiWords' not in v and 'seed' not in v and 'envelopes' not in v, 'leak: AI words'
    assert not any(k in v['cfg'] for k in ('aiNoise', 'aiBase', 'aiGap', 'aiWarm', 'aiWarmN', 'aiClose')), 'leak: AI settings'
    if v['phase'] == 'guess': assert 'word' not in v['t'], 'leak: the word being guessed'
    if LEVEL: assert v.get('level', 'basic') == LEVEL, f"level {v.get('level')} != {LEVEL}"
    if v.get('t'):   # every hidden word of the match belongs to the level's pool
        assert v['t'].get('word') is None or v['t']['word'] in pool, f"{v['t']['word']} not in the pool"
    for w in v.get('hand', []): assert w in pool, f'{w} not in the pool'
    return v

def my_hint(v, style):
    t = v['t']; used = {h['w'] for h in t['hints']} | {w for g in t['guesses'] for w in g['w']}   # the AI's wrong answers are on the board too
    own = [(w, s) for w, s in lists[t['word']] if w not in used and s < 98]
    if rng.random() < 0.25: return own[int(rng.integers(len(own)))][0]
    believed = [(w, s + rng.normal(0, 3)) for w, s in own]
    cand = [x for x in believed if x[1] >= v['cfg']['cut']] or sorted(believed, key=lambda x: -x[1])[:3]
    if style == 'naive': return max(cand, key=lambda x: x[1])[0]
    ti = pool.index(t['word'])
    return max(cand, key=lambda x: (E[:, idx[x[0]]] >= E[ti, idx[x[0]]] - 3).sum() + rng.random())[0]

def my_guess(v, noise):
    t = v['t']; score = np.zeros(len(pool)); tried = set()
    clues = [(h['w'], h['s']) for h in t['hints']]
    tried |= {h['w'] for h in t['hints']}   # a word shown as a hint is never the answer
    for g in t['guesses']:
        for w, s in zip(g['w'], g['s']): clues.append((w, s)); tried.add(w)
    for w, s in clues: score += (s - 60) / 40 * (E[:, idx[w]] + noise[:, idx[w] % 997])
    order = [pool[i] for i in np.argsort(-score) if pool[i] not in tried]
    two = t['chance'] and t['stage'] >= 2 and v.get('pieces', 0) >= 1 and rng.random() < 0.5   # a second answer costs a 피스
    return order[:2] if two else order[:1]

def match(style, sigma):
    v = check(rpc('hw_start', {'p_level': LEVEL} if LEVEL and LEVEL != 'basic' else {})); gid = v['id']; noise = rng.normal(0, sigma, (len(pool), 997)); calls = 1; log = []
    act = lambda a: check(rpc('hw_act', {'p_game': gid, 'p_action': a}))
    while v['phase'] != 'over':
        calls += 1; before = (v['me'], v['ai'])
        if v['phase'] == 'envelope': v = act({'t': 'envelope', 'i': int(rng.integers(6))})
        elif v['phase'] == 'pick': v = act({'t': 'pick', 'word': v['hand'][int(rng.integers(len(v['hand'])))]})
        elif v['phase'] == 'hint': v = act({'t': 'hint', 'word': my_hint(v, style)}); assert 'error' not in v, v['error']
        elif v['phase'] == 'guess': v = act({'t': 'guess', 'words': my_guess(v, noise)}); assert 'error' not in v, v['error']
        elif v['phase'] == 'turnEnd':
            t = v['t']; log.append((t['kind'], v['round'], t['solved'], t['me'], t['ai']))
            # the turn's points must match the rules
            c = v['cfg']; m = v['round']; won = c['guessPoints'][t['solved'] - 1] * m if t['solved'] else 0
            held = sum(c['setPoints'][:(t['solved'] - 1 if t['solved'] else 3)]) * m
            want = (held, won) if t['kind'] == 'set' else (won, held)
            assert (t['me'], t['ai']) == want, f'points {t} want {want}'
            v = act({'t': 'next'})
        assert v['me'] >= before[0] and v['ai'] >= before[1]
    assert v['me'] == sum(x[3] for x in log) and v['ai'] == sum(x[4] for x in log) and len(log) == 4
    if UID: assert v.get('recorded'), 'a signed-in match was not recorded'
    for h in v['history']: assert h['word'] in pool
    return v['me'], v['ai'], log, calls

if __name__ == '__main__':
    for style, sigma in (('naive', 12), ('sly', 6)):
        rows = [match(style, sigma) for _ in range(N)]
        me = np.array([r[0] for r in rows]); ai = np.array([r[1] for r in rows])
        turns = [x for r in rows for x in r[2]]
        for kind, label in (('set', '내가 출제'), ('guess', 'AI 출제')):
            st = np.array([x[2] for x in turns if x[0] == kind])
            print(f'  {label}: 정답 단계 ' + ' '.join(f'{k or "X"}:{(st == k).mean() * 100:3.0f}%' for k in (1, 2, 3, 0)))
        print(f'{style}/±{sigma} {N}판: 내 승점 {me.mean():.1f} ({me.min()}~{me.max()}), AI {ai.mean():.1f}, 승률 {(me > ai).mean() * 100:.0f}%, 판당 호출 {np.mean([r[3] for r in rows]):.0f}회')
    print('모든 응답 검사 통과 (AI 단어 비노출, 승점 계산 일치)')
