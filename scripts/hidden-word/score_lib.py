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

# Embedding rank among the reference nouns -> %, straight lines between these points on a log-rank axis.
# The model alone never reaches the 95% cut: that takes a list entry, a dictionary synonym, a compound or a
# close neighbour of a listed word. The tail drops fast, so words the model finds unrelated read as unrelated.
RANK_CURVE = [(1, 93), (3, 92), (10, 90), (30, 88), (100, 84), (300, 78), (1000, 68), (3000, 52), (10000, 30), (33000, 8)]

def rank_pct(ranks):
    xs = np.log([r for r, _ in RANK_CURVE]); ys = [p for _, p in RANK_CURVE]
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


def load_relations(data):
    """Keep the strongest relation for each directed pair, matching the DB's key."""
    pairs = {}
    path = f'{data}/relations.tsv'
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
        self.rel = load_relations(data)
        self.assoc = load_assoc(data)

    def structural(self, t, h, rank):
        f = 0
        if (t + h in self.toks or h + t in self.toks): f = COMPOUND_FLOOR     # 대기열, 대기층
        if rank <= REL_MAX_RANK:
            f = max(f, REL_FLOOR.get(self.rel.get((t, h)), 0), REL_FLOOR.get(self.rel.get((h, t)), 0))
        return f

    def assoc_floor(self, t, h):
        return self.assoc.get((t, h), 0)
