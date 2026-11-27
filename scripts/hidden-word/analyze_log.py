"""Turn the 히든 워드 play log (hw_log_hints / hw_log_answers / hw_log_refused) into word-data upgrade work.
Read-only: runs SELECTs through `docker exec <container> psql`.

Usage: analyze_log.py <report> [options]        DB_NAME=hw_dev to read the scratch database (default: postgres)
  missing   [--level basic|plus] [--top N] [--min M]   players' hints NOT on the hidden word's list, most frequent first,
            with the number shown and how often the opponent found the word in that stage → list candidates
  misscored [--level ..] [--min M]   hints whose number looks wrong against play: typed by many players but shown low,
            or shown at 90%+ yet the word is rarely found in that stage
  words     [--level ..]   per hidden word and group: found at stage 1/2/3/never by MORA (player hid it) and by players
            (MORA hid it); easiest / hardest words, smallest and most guessable groups
  unknown   [--level ..] [--top N]   words people typed that the game does not have: refused as not in the vocabulary
            (logged from 11/28) and answers that are not hidden words of the level → vocabulary / new hidden words
  weekly    one summary line for the status report (last 7 days)
  live-pairs [--n N]   the most frequent unlisted hints as a tab-separated file to grade by hand (eval/live_pairs.tsv)
"""
import argparse, os, subprocess, sys

DB = os.environ.get('DB_CONTAINER', 'supabase-db')
NAME = os.environ.get('DB_NAME', 'postgres')

def q(sql):
    out = subprocess.run(['docker', 'exec', '-i', DB, 'psql', '-U', 'postgres', '-d', NAME, '-tA', '-F', '\t', '-v', 'ON_ERROR_STOP=1'],
                         input='set default_transaction_read_only = on;\n' + sql, capture_output=True, text=True)
    if out.returncode: sys.exit(out.stderr)
    return [l.split('\t') for l in out.stdout.splitlines() if l and l != 'SET']

def lv_filter(a, col='h.level'):
    return f"and {col} = '{a.level}'" if a.level else ''

# A player's hint in a 'set' turn (the player hides, MORA answers) or in a room, and whether the opponent found the word
# in the same stage. Rooms have no stage: a room hint counts as found if the word was ever found in that room.
HINTS = """
  with h as (
    select h.*, exists (select 1 from public.hw_log_answers a where a.match_id = h.match_id and a.round = h.round and a.turn = h.turn
                         and a.correct and (h.stage is null or a.stage = h.stage)) found
      from public.hw_log_hints h where h.who in ('player', 'room', 'room?') {lv})"""

def missing(a):
    rows = q(HINTS.format(lv=lv_filter(a)) + f"""
      select h.level, h.target, h.word, count(*) n, count(distinct h.match_id) players, round(avg(h.score), 1) shown,
             round(100.0 * avg(h.found::int)) found_pct
        from h where not exists (select 1 from public.hw_hints l where l.target = h.target and l.word = h.word)
       group by 1, 2, 3 having count(distinct h.match_id) >= {a.min} order by n desc, players desc limit {a.top}""")
    print(f"{'level':5} {'hidden':6} {'hint':10} {'times':>5} {'matches':>7} {'shown':>6} {'found':>6}")
    for lv, t, w, n, p, s, f in rows: print(f"{lv:5} {t:6} {w:10} {n:>5} {p:>7} {s:>6} {f:>5}%")
    tot = q(HINTS.format(lv=lv_filter(a)) + """
      select count(*), count(*) filter (where not exists (select 1 from public.hw_hints l where l.target = h.target and l.word = h.word)) from h""")[0]
    print(f"\nplayer hints {tot[0]}, not on the word's list {tot[1]} ({100 * int(tot[1]) / max(1, int(tot[0])):.0f}%)")

def misscored(a):
    base = HINTS.format(lv=lv_filter(a)) + f"""
      , g as (select h.level, h.target, h.word, count(distinct h.match_id) players, round(avg(h.score), 1) shown, round(100.0 * avg(h.found::int)) found_pct,
                     exists (select 1 from public.hw_hints l where l.target = h.target and l.word = h.word) listed
                from h group by 1, 2, 3 having count(distinct h.match_id) >= {a.min})"""
    print('-- typed by many players but shown under 50% (players find it related; the list or the model does not)')
    for r in q(base + " select * from g where shown < 50 order by players desc limit 30"):
        print('  ', ' '.join(r[:3]), f"players {r[3]} shown {r[4]} found {r[5]}% {'(listed)' if r[6] == 't' else ''}")
    print('-- shown at 90%+ but the word is found in that stage in 10% or less (the number promises more than it gives)')
    for r in q(base + " select * from g where shown >= 90 and found_pct <= 10 order by players desc limit 30"):
        print('  ', ' '.join(r[:3]), f"players {r[3]} shown {r[4]} found {r[5]}% {'(listed)' if r[6] == 't' else ''}")

def words(a):
    stage = """
      select t.level, t.cluster, t.word,
             count(*) filter (where a.turn = 'set') mora_n,
             count(*) filter (where a.turn = 'set' and a.correct and a.stage = 1) mora1,
             count(*) filter (where a.turn = 'set' and a.correct) mora_any,
             count(*) filter (where a.turn = 'guess') pl_n,
             count(*) filter (where a.turn = 'guess' and a.correct and a.stage = 1) pl1,
             count(*) filter (where a.turn = 'guess' and a.correct) pl_any
        from public.hw_targets t
        left join (select distinct on (match_id, round, turn) match_id, round, turn, target, level, correct, stage
                     from public.hw_log_answers where turn in ('set', 'guess')
                    order by match_id, round, turn, correct desc, stage) a on a.target = t.word and a.level = t.level
       where true {lv} group by 1, 2, 3"""
    rows = q(stage.format(lv=lv_filter(a, 't.level')))
    def pct(x, n): return 100 * int(x) / int(n) if int(n) else float('nan')
    data = [(lv, cl, w, int(mn), pct(m1, mn), pct(ma, mn), int(pn), pct(p1, pn), pct(pa, pn)) for lv, cl, w, mn, m1, ma, pn, p1, pa in rows]
    fmt = lambda d: f"{d[0]:5} {d[1]:6} {d[2]:6} players find MORA's word: stage1 {d[7]:3.0f}% ever {d[8]:3.0f}% (n {d[6]}) | MORA finds it: stage1 {d[4]:3.0f}% ever {d[5]:3.0f}% (n {d[3]})"
    ok = [d for d in data if d[6] >= 10]
    print('-- easiest for players (MORA hid it): highest stage-1 rate, at least 10 turns')
    for d in sorted(ok, key=lambda d: -d[7])[:10]: print(fmt(d))
    print('-- hardest for players')
    for d in sorted(ok, key=lambda d: (d[8], d[7]))[:10]: print(fmt(d))
    ok2 = [d for d in data if d[3] >= 10]
    print('-- easiest for MORA (the player hid it)')
    for d in sorted(ok2, key=lambda d: -d[4])[:10]: print(fmt(d))
    print('-- hardest for MORA')
    for d in sorted(ok2, key=lambda d: (d[5], d[4]))[:10]: print(fmt(d))
    groups = {}
    for d in data: groups.setdefault((d[0], d[1]), []).append(d)
    print('-- groups: size, how often a stage-1 answer was right (both sides pooled); a small group makes its category hint a 1-in-n guess')
    gl = []
    for (lv, cl), ds in groups.items():
        n = sum(d[3] + d[6] for d in ds)
        hit = sum(d[3] * (d[4] if d[3] else 0) / 100 + d[6] * (d[7] if d[6] else 0) / 100 for d in ds)
        gl.append((lv, cl, len(ds), 100 * hit / n if n else float('nan'), n))
    for g in sorted(gl, key=lambda g: (-g[3] if g[3] == g[3] else 0)): print(f"{g[0]:5} {g[1]:8} size {g[2]:2}  stage-1 right {g[3]:4.0f}%  turns {g[4]}")

def unknown(a):
    print('-- refused as not in the vocabulary (hints and answers; logged from 11/28)')
    for r in q(f"select h.level, h.kind, h.word, count(*) from public.hw_log_refused h where h.reason = 'unknown' {lv_filter(a)} group by 1, 2, 3 order by 4 desc limit {a.top}"):
        print('  ', *r)
    print("-- players' answers that are not hidden words of the level (what people think the pool holds)")
    for r in q(f"""select h.level, w, count(*) from public.hw_log_answers h, unnest(h.words) w
                    where h.who = 'player' and h.turn = 'guess' {lv_filter(a)}
                      and not exists (select 1 from public.hw_targets t where t.word = w and t.level = h.level)
                    group by 1, 2 order by 3 desc limit {a.top}"""):
        print('  ', *r)

def weekly(a):
    r = q("""
      with h as (select * from public.hw_log_hints where at > now() - interval '7 days'),
           a as (select * from public.hw_log_answers where at > now() - interval '7 days')
      select (select count(distinct match_id) from h), (select count(*) from h where who in ('player', 'room', 'room?')),
             (select count(*) from h where who in ('player', 'room', 'room?')
                and not exists (select 1 from public.hw_hints l where l.target = h.target and l.word = h.word)),
             (select count(*) from a), (select count(distinct match_id) from h where turn = 'room'),
             (select count(*) from public.hw_log_refused where at > now() - interval '7 days' and reason = 'unknown')""")[0]
    m, ph, miss, ans, rooms, unk = map(int, r)
    print(f"히든 워드 기록 7일: 대전 {m:,} (친구방 {rooms:,}) · 플레이어 힌트 {ph:,} (연상표에 없는 것 {100 * miss / max(1, ph):.0f}%) · 답 {ans:,} · 사전에 없는 단어 {unk:,}")

def live_pairs(a):
    rows = q(HINTS.format(lv='') + f"""
      select h.target, h.word, round(avg(h.score), 1), count(*) from h
       where not exists (select 1 from public.hw_hints l where l.target = h.target and l.word = h.word)
       group by 1, 2 order by 4 desc limit {a.n}""")
    print('# target\thint\tshown\ttimes   (add a grade column by hand: see eval/live_pairs.tsv)')
    for t, w, s, n in rows: print(f"{t}\t{w}\t{s}\t{n}")

if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('report', choices=['missing', 'misscored', 'words', 'unknown', 'weekly', 'live-pairs'])
    p.add_argument('--level', choices=['basic', 'plus']); p.add_argument('--top', type=int, default=20)
    p.add_argument('--min', type=int, default=3); p.add_argument('--n', type=int, default=300)
    a = p.parse_args()
    {'missing': missing, 'misscored': misscored, 'words': words, 'unknown': unknown, 'weekly': weekly, 'live-pairs': live_pairs}[a.report](a)
