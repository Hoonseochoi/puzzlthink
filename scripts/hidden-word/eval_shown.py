"""The number a player is shown for a hint that is not on the hidden word's list (model + floors), against the
evaluation grades. Run after build_game.py on a data dir whose pools cover the evaluation's hidden words.

Usage: eval_shown.py <data> [level ...]     (levels default: every dir in <data>/game)
Prints per level, over the pairs whose hint is not on the list: Spearman rho with the grade, mean absolute
error, rho on one-syllable hints only, within-word concordance, and the pairs it gets most wrong.
"""
import json, os, sys
import numpy as np
from scipy.stats import spearmanr
HERE = os.path.dirname(os.path.abspath(__file__))

def load(path):
    return [(t, h, float(g)) for t, h, g, *_ in (l.rstrip('\n').split('\t') for l in open(path, encoding='utf-8') if l.strip() and not l.startswith('#'))]

def conc(rows):
    by = {}
    for t, h, g, s in rows: by.setdefault(t, []).append((g, s))
    ok = tot = 0
    for xs in by.values():
        for a in range(len(xs)):
            for b in range(a + 1, len(xs)):
                if xs[a][0] != xs[b][0]:
                    tot += 1; ok += ((xs[a][0] - xs[b][0]) * (xs[a][1] - xs[b][1]) > 0) + 0.5 * (xs[a][1] == xs[b][1])
    return ok / max(tot, 1)

DATA = sys.argv[1]
levels = sys.argv[2:] or sorted(os.listdir(f'{DATA}/game'))
pairs = {'live': load(f'{HERE}/eval/live_pairs.tsv'), 'design': load(f'{HERE}/eval/design_pairs.tsv')}
show = json.load(open(f'{HERE}/show_scores.json', encoding='utf-8')); show.pop('_note')
pairs['show'] = [(t, h, float(p)) for t, hs in show.items() for h, p in hs.items()]
rows_all = {k: [] for k in pairs}
for level in levels:
    d = f'{DATA}/game/{level}'
    if not os.path.exists(f'{d}/scores.npy'): continue
    S = np.load(f'{d}/scores.npy') / 10
    words = open(f'{d}/words.txt', encoding='utf-8').read().split(); idx = {w: i for i, w in enumerate(words)}
    meta = json.load(open(f'{d}/targets.json', encoding='utf-8')); tw = {x['word']: i for i, x in enumerate(meta)}
    listed = {x['word']: {h for h, _ in x['list']} for x in meta}
    for k, ps in pairs.items():
        rows_all[k] += [(t, h, g, S[tw[t], idx[h]]) for t, h, g in ps if t in tw and h in idx and (k == 'show' or h not in listed[t])]
for k, rows in rows_all.items():
    if len(rows) < 5: continue
    rho = spearmanr([r[2] for r in rows], [r[3] for r in rows])[0]
    one = [r for r in rows if len(r[1]) == 1]
    one_rho = spearmanr([r[2] for r in one], [r[3] for r in one])[0] if len(one) > 5 else float('nan')
    print(f"{k:7} n {len(rows):4} rho {rho:.3f} mae {np.mean([abs(r[3] - r[2]) for r in rows]):5.1f} one-syllable rho {one_rho:.3f} (n {len(one)}) conc {conc(rows):.3f}")
if '-v' in os.environ.get('SHOWN_FLAGS', ''):
    rows = rows_all['live'] + rows_all['design']
    print('over:', ' '.join(f'{t}-{h}:{s:.0f}/{g:.0f}' for t, h, g, s in sorted(rows, key=lambda r: r[2] - r[3])[:20]))
    print('under:', ' '.join(f'{t}-{h}:{s:.0f}/{g:.0f}' for t, h, g, s in sorted(rows, key=lambda r: r[3] - r[2])[:20]))
