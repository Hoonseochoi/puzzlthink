"""Compare embedding blends on the evaluation set (model-only number, before any list or floor).

Usage: eval_models.py <data> <spec> [<spec> ...]      spec = component:weight,...  e.g. ft:0.4,bge-m3:0.6
  components: ft (fastText, <data>/ft.npy) or a name in <data>/emb/<name>.npy (embed_models.py)
  optional suffix @curve=<name> picks a rank curve from score_lib.CURVES (default: the live one)
Pairs: eval/live_pairs.tsv (hints players typed), eval/design_pairs.tsv (hand-written spread), show_scores.json.
Lists: <data>/assoc/*.tsv of the 기본 pool (AI-written graded lists) and, when given, EXTRA_ASSOC=<dir>.
Prints per spec:
  rho        Spearman rank correlation of the model's % with the grade (live / design 기본 / design 확장 / show)
  conc       within one hidden word, share of pairs of hints the model orders like the grades
  hi/lo      design pairs graded >= 85 that the model puts in its top 300 / graded <= 15 it puts past rank 3000
  list rho   Spearman with the association lists' own numbers (about 6k pairs)
  AI@1       a hidden word's 95%+ list hints, one at a time: share where the AI (pool word most related
             to that hint) names the right word among the pool; AI@1c: two hints (one 95+, one warm-up)
"""
import glob, json, os, sys
import numpy as np
from scipy.stats import spearmanr
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from score_lib import rank_pct, partial_overlap

DATA = sys.argv[1]
words = open(f'{DATA}/vocab.txt', encoding='utf-8').read().split(); idx = {w: i for i, w in enumerate(words)}
REF = json.load(open(f'{DATA}/vocab.json'))['ref']
_cache = {}
def comp(name):
    if name not in _cache:
        V = np.load(f'{DATA}/ft.npy' if name == 'ft' else f'{DATA}/emb/{name}.npy').astype(np.float32)
        rng = np.random.default_rng(0); i = rng.integers(0, REF, 4000); j = rng.integers(0, REF, 4000)
        c = (V[i] * V[j]).sum(1)
        _cache[name] = (V, float(c.mean()), float(c.std()))
    return _cache[name]

def load_pairs(path):
    out = []
    for line in open(path, encoding='utf-8'):
        if line.startswith('#') or not line.strip(): continue
        t, h, g = line.rstrip('\n').split('\t')[:3]
        out.append((t, h, float(g)))
    return out

def parse(spec):
    curve = None
    if '@curve=' in spec: spec, curve = spec.split('@curve=')
    return [(c.split(':')[0], float(c.split(':')[1])) for c in spec.split(',')], curve

class Blend:
    def __init__(self, spec):
        self.parts, self.curve = parse(spec)
        self.has_vec = np.linalg.norm(comp('ft')[0], axis=1) > 0
    def z(self, i):
        """z-scores per component of every word against word i."""
        return {n: (comp(n)[0] @ comp(n)[0][i] - comp(n)[1]) / comp(n)[2] for n, _ in self.parts}
    def row(self, t):
        i = idx[t]; zs = self.z(i)
        look = np.fromiter((partial_overlap(t, h) or (h != t and h in t) for h in words), bool, len(words))
        zf = zs.get('ft')
        b = np.zeros(len(words), np.float32)
        for n, w in self.parts:
            z = zs[n]
            if n != 'ft' and zf is not None: z = np.where(look, np.minimum(z, zf), z)   # look-alike guard
            b += w * z
        ref = np.sort(np.delete(b[:REF], i) if i < REF else b[:REF])
        ranks = np.maximum(1, len(ref) - np.searchsorted(ref, b, side='right') + 1)
        pct = rank_pct(ranks, self.curve)
        if 'ft' in dict(self.parts): pct[~self.has_vec] = 0
        return pct, ranks

def conc(rows):
    """Within each target, share of hint pairs (different grades) ordered the same way."""
    by = {}
    for t, h, g, p in rows: by.setdefault(t, []).append((g, p))
    ok = tot = 0
    for xs in by.values():
        for a in range(len(xs)):
            for b in range(a + 1, len(xs)):
                if xs[a][0] == xs[b][0]: continue
                tot += 1; ok += ((xs[a][0] - xs[b][0]) * (xs[a][1] - xs[b][1]) > 0) + 0.5 * (xs[a][1] == xs[b][1])
    return ok / max(tot, 1)

live = load_pairs(f'{HERE}/eval/live_pairs.tsv')
design = load_pairs(f'{HERE}/eval/design_pairs.tsv')
show = json.load(open(f'{HERE}/show_scores.json', encoding='utf-8')); show.pop('_note')
show = [(t, h, float(p)) for t, hs in show.items() for h, p in hs.items()]
pool = [w for line in open(f'{DATA}/basic_pool.tsv', encoding='utf-8') for w in line.split('\t')[1].split()]
basic = set(pool)
assoc = {}
for d in [f'{DATA}/assoc'] + ([os.environ['EXTRA_ASSOC']] if os.environ.get('EXTRA_ASSOC') else []):
    for p in glob.glob(f'{d}/*.tsv'):
        t = os.path.basename(p)[:-4]
        if d == f'{DATA}/assoc' and t not in basic: continue
        assoc[t] = [(l.split('\t')[0], float(l.split('\t')[1])) for l in open(p, encoding='utf-8') if l.strip()]

def evaluate(spec, quiet=False):
    B = Blend(spec)
    need = sorted({t for t, *_ in live + design + show} | set(assoc) | basic)
    need = [t for t in need if t in idx]
    rows = {t: B.row(t) for t in need}
    get = lambda ps: [(t, h, g, rows[t][0][idx[h]]) for t, h, g in ps if t in rows and h in idx]
    L, D, S = get(live), get(design), get(show)
    Db = [r for r in D if r[0] in basic]; Dx = [r for r in D if r[0] not in basic]
    rho = lambda rs: spearmanr([r[2] for r in rs], [r[3] for r in rs])[0]
    rk = lambda t, h: rows[t][1][idx[h]]
    hi = np.mean([rk(t, h) <= 300 for t, h, g, _ in D if g >= 85]); lo = np.mean([rk(t, h) > 3000 for t, h, g, _ in D if g <= 15])
    A = [(t, h, s, rows[t][0][idx[h]]) for t, xs in assoc.items() if t in rows for h, s in xs if h in idx]
    # the AI: which pool word does a hint point to (feel of every pool word for that hint)
    res = {}
    for name, P in (('기본', [w for w in pool if w in rows]), ('확장', [t for t in assoc if t not in basic and t in rows])):
        if len(P) < 5: continue
        F = np.stack([rows[t][0] for t in P])
        a1 = []; a2 = []
        rng = np.random.default_rng(3)
        for ti, t in enumerate(P):
            xs = assoc.get(t, [])
            top = [idx[h] for h, s in xs if 95 <= s < 98 and h in idx]
            warm = [idx[h] for h, s in xs if 80 <= s <= 91 and h in idx]
            for j in top:
                a1.append(np.argmax(F[:, j]) == ti)
                if warm:
                    k = warm[rng.integers(len(warm))]
                    a2.append(np.argmax(F[:, j] + 0.5 * F[:, k]) == ti)
        res[name] = (np.mean(a1), np.mean(a2) if a2 else float('nan'))
    out = dict(spec=spec, live=rho(L), design_b=rho(Db), design_x=rho(Dx), show=rho(S), conc=conc(D), conc_live=conc(L), hi=hi, lo=lo,
               list=rho(A), list_conc=conc(A), ai=res, n=(len(L), len(Db), len(Dx), len(S), len(A)))
    if not quiet:
        ai = ' '.join(f'AI@1 {k} {v[0]:.3f}/{v[1]:.3f}' for k, v in res.items())
        print(f"{spec:44} rho live {out['live']:.3f} des기본 {out['design_b']:.3f} des확장 {out['design_x']:.3f} show {out['show']:.3f} | conc {out['conc']:.3f} live {out['conc_live']:.3f} | hi {hi:.2f} lo {lo:.2f} | list {out['list']:.3f} c{out['list_conc']:.3f} | {ai}", flush=True)
    return out

if __name__ == '__main__':
    for spec in sys.argv[2:]: evaluate(spec)
