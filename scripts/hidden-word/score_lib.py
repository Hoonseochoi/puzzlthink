"""Shared scoring: blend of fastText (문맥적 공생) and bge-m3 (의미적 거리), plus bonus floors."""
import glob, json, os
import numpy as np

class Model:
    def __init__(self, data='data'):
        self.words = open(f'{data}/vocab.txt').read().split()
        self.idx = {w: i for i, w in enumerate(self.words)}
        self.F = np.load(f'{data}/ft.npy').astype(np.float32)
        self.B = np.load(f'{data}/bge.npy').astype(np.float32)
        if self.F.shape != (len(self.words), 300) or self.B.shape != (len(self.words), 1024):
            raise ValueError('Vocabulary and embedding files are out of sync. Run embed.py after build_vocab.py.')
        if len(self.idx) != len(self.words):
            raise ValueError('Vocabulary contains duplicate entries.')
        self.s = json.load(open(f'{data}/blend.json'))
        meta = f'{data}/vocab.json'
        self.ref = json.load(open(meta))['ref'] if os.path.exists(meta) else len(self.words)  # ranks use words[:ref]

    def z(self, t):
        """z-scores of every vocab word against word index t: (zF, zB)."""
        s = self.s
        return (self.F @ self.F[t] - s['mu_ft']) / s['sd_ft'], (self.B @ self.B[t] - s['mu_bge']) / s['sd_bge']

    def blend(self, zf, zb):
        return self.s['w_ft'] * zf + self.s['w_bge'] * zb

SUFFIX_SYLLABLES = set('님자사가꾼보')  # 손님/주인님 share a suffix, not a look-alike stem

def partial_overlap(a, b):
    """Shares a syllable but neither word contains the other (도시 vs 도로, not 소나무 vs 나무)."""
    return bool((set(a) & set(b)) - SUFFIX_SYLLABLES) and a not in b and b not in a

def guarded(m, target, hint, zf, zb):
    """Blend score; for look-alike words, the meaning part may not exceed the context part."""
    if partial_overlap(target, hint):
        zb = min(zb, zf)
    return m.blend(zf, zb)

class Blend:
    """A weighted sum of z-scored cosine similarities from several embeddings: spec 'ft:0.4,bge-m3:0.6'.
    ft = fastText (<data>/ft.npy); any other name = <data>/emb/<name>.npy (embed_models.py); bge-m3 may also be
    <data>/bge.npy. z-scores use the mean and spread over random pairs of reference nouns; the 기본 build keeps
    the numbers in <data>/blend.json for ft and bge-m3, so its scores do not move."""
    def __init__(self, data, spec):
        self.words = open(f'{data}/vocab.txt', encoding='utf-8').read().split()
        self.idx = {w: i for i, w in enumerate(self.words)}
        self.ref = json.load(open(f'{data}/vocab.json'))['ref']
        self.parts = [(c.split(':')[0], float(c.split(':')[1])) for c in spec.split(',')]
        legacy = json.load(open(f'{data}/blend.json')) if os.path.exists(f'{data}/blend.json') else {}
        self.V, self.mu, self.sd = {}, {}, {}
        for name, _ in self.parts:
            path = f'{data}/ft.npy' if name == 'ft' else f'{data}/emb/{name}.npy'
            if name == 'bge-m3' and not os.path.exists(path): path = f'{data}/bge.npy'
            V = np.load(path).astype(np.float32)
            if V.shape[0] != len(self.words): raise ValueError(f'{path} does not match vocab.txt: run embed_models.py again')
            key = {'ft': 'ft', 'bge-m3': 'bge'}.get(name)
            if key and f'mu_{key}' in legacy:
                mu, sd = legacy[f'mu_{key}'], legacy[f'sd_{key}']
            else:
                rng = np.random.default_rng(0); i = rng.integers(0, self.ref, 4000); j = rng.integers(0, self.ref, 4000)
                c = (V[i] * V[j]).sum(1); mu, sd = float(c.mean()), float(c.std())
            self.V[name], self.mu[name], self.sd[name] = V, mu, sd
        self.has_vec = np.linalg.norm(self.V['ft'], axis=1) > 0 if 'ft' in self.V else np.ones(len(self.words), bool)

    def row(self, i, look=None, fallback=False):
        """Blend score of every word against word i. look: words that look like word i (shared syllables):
        for those, no meaning part may exceed the fastText part (see guarded). fallback: a word fastText never
        saw (키큰동물) gets the meaning parts alone, reweighted, instead of no score."""
        zf = (self.V['ft'] @ self.V['ft'][i] - self.mu['ft']) / self.sd['ft'] if 'ft' in self.V else None
        b = np.zeros(len(self.words), np.float32); meaning = np.zeros(len(self.words), np.float32); wm = 0.0
        for name, w in self.parts:
            z = zf if name == 'ft' else (self.V[name] @ self.V[name][i] - self.mu[name]) / self.sd[name]
            if name != 'ft':
                meaning += w * z; wm += w
                if zf is not None and look is not None: z = np.where(look, np.minimum(z, zf), z)
            b += w * z
        if fallback and zf is not None and wm > 0:
            b = np.where(self.has_vec, b, meaning / wm)
        return b

# Embedding rank among the reference nouns -> %, straight lines between these points on a log-rank axis.
# The model alone never reaches the 95% cut: that takes a list entry, a dictionary synonym, a compound or a
# close neighbour of a listed word. The tail drops fast, so words the model finds unrelated read as unrelated.
RANK_CURVE = [(1, 93), (3, 92), (10, 90), (30, 88), (100, 84), (300, 78), (1000, 68), (3000, 52), (10000, 30), (33000, 8)]

CURVES = {'v2': RANK_CURVE}

def rank_pct(ranks, curve=None):
    pts = CURVES[curve] if isinstance(curve, str) else (curve or RANK_CURVE)
    xs = np.log([r for r, _ in pts]); ys = [p for _, p in pts]
    return np.interp(np.log(np.maximum(1, np.asarray(ranks, float))), xs, ys)

COMPOUND_FLOOR = 90
REL_FLOOR = {'비슷한말': 96, '상위어': 85, '하위어': 85, '반대말': 85, '대립어': 85}
REL_MAX_RANK = 5000

def load_assoc(data):
    """AI association lists: {(target, word): score} from data/assoc/<target>.tsv."""
    out = {}
    for path in glob.glob(f'{data}/assoc/*.tsv'):
        t = os.path.basename(path)[:-4]
        for line in open(path, encoding='utf-8'):
            parts = line.strip().split('\t')
            if len(parts) != 2 or not parts[0] or parts[0] == t:
                continue
            try:
                v = float(parts[1])
            except ValueError:
                continue
            if 0 < v <= 100 and all('가' <= ch <= '힣' for ch in parts[0]):
                out[(t, parts[0])] = max(v, out.get((t, parts[0]), 0))
    return out


def load_relations(data, name='relations.tsv'):
    """Keep the strongest relation for each directed pair, matching the DB's key."""
    pairs = {}
    path = f'{data}/{name}'
    if not os.path.exists(path):
        return pairs
    with open(path, encoding='utf-8') as records:
        for line in records:
            a, b, kind = line.rstrip('\n').split('\t')
            if kind not in REL_FLOOR:
                continue
            current = pairs.get((a, b))
            if current is None or REL_FLOOR[kind] > REL_FLOOR[current]:
                pairs[(a, b)] = kind
    return pairs


class Floors:
    """Bonus floors, same rules as public.hw_similarity."""
    def __init__(self, data):
        self.toks = set(open(f'{data}/tokens_top1m.txt').read().split('\n'))
        self.data = data
        self.rel = load_relations(data)
        self.assoc = load_assoc(data)
        self._rel = {}

    def rel_for(self, name):
        """A level may keep its own relations file (rules.relations), e.g. 기본 its first one."""
        if not name: return self.rel
        if name not in self._rel: self._rel[name] = load_relations(self.data, name)
        return self._rel[name]

    def structural(self, t, h, rank, rules=None):
        """rules (a level's build rules) may lower the compound floor or ask more of it: compound_floor,
        compound_min_len (shorter hints count only within compound_short_rank), compound_max_rank (the model must also rank the hint
        this close, so 목+요일 or 발+신 does not read as close to 목 or 발)."""
        r = rules or {}
        f = 0
        rel = self.rel_for(r.get('relations'))
        short = len(h) < r.get('compound_min_len', 1)   # a one-syllable hint counts only if the model ranks it this close
        if (t + h in self.toks or h + t in self.toks) and rank <= r.get('compound_max_rank', 10 ** 9) \
                and (not short or rank <= r.get('compound_short_rank', 0)):
            f = r.get('compound_floor', COMPOUND_FLOOR)     # 대기열, 대기층
        if rank <= REL_MAX_RANK:
            f = max(f, REL_FLOOR.get(rel.get((t, h)), 0), REL_FLOOR.get(rel.get((h, t)), 0))
        return f

    def assoc_floor(self, t, h):
        return self.assoc.get((t, h), 0)
