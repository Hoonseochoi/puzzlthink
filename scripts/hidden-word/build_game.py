"""Step 4: score every hint word against every hidden word of the pool, and write the game data.

Score of (hidden word, hint), highest rule first:
  1. the hidden word's association list (assoc/<word>.tsv) -> that number, as written
  2. otherwise the highest of
       - embedding rank among the reference nouns -> % (RANK_CURVE)
       - written together as one common word (대기+열)          -> COMPOUND_FLOOR
       - 우리말샘 relation (비슷한말, 상위어, ...)               -> REL_FLOOR
       - the hint contains the hidden word (딸기 -> 딸기잼)      -> CONTAIN_FLOOR
       - a close neighbour of a listed word (케이크 -> 케익)      -> that word's number minus NEAR_PENALTY

Output (in <data>/game): scores.npy (targets x words, uint16 = % x 10), feel.npy (the embedding-only %,
which is all the AI player knows when it guesses), words.txt, targets.json,
and the three files loaded into Postgres by load_game.sh.
"""
import json, math, os, sys
import numpy as np
from score_lib import Model, Floors, load_assoc, partial_overlap, rank_pct

DATA = sys.argv[1] if len(sys.argv) > 1 else 'data'
OUT = f'{DATA}/game'; os.makedirs(OUT, exist_ok=True)
CONTAIN_FLOOR, CONTAIN_MAX_RANK = 95, 2000   # 딸기잼 yes, 서큐버스 no
NEAR_PENALTY = [(2, 3), (5, 5), (12, 8)]   # (neighbour rank up to, points off)
FITS_FROM = 85                             # a hint also fits another hidden word that scores this or more
NEAR_MIN, NEAR_MAX_RANK = 80, 8000         # only spread strong associations, to hints the model also finds related

m = Model(DATA); fl = Floors(DATA); assoc = load_assoc(DATA)
clusters = {}
for line in open(f'{DATA}/src/pool.tsv', encoding='utf-8'):
    name, members = line.rstrip('\n').split('\t')
    for w in members.split(): clusters[w] = name
targets = list(clusters)
has_vec = np.linalg.norm(m.F, axis=1) > 0

def blend_all(i):
    """Blend score of every word against word i, with the look-alike guard (see score_lib.guarded)."""
    zf, zb = m.z(i)
    w = m.words[i]
    look = np.fromiter((partial_overlap(w, h) or (h != w and h in w) for h in m.words), bool, len(m.words))
    zb = np.where(look, np.minimum(zb, zf), zb)
    return m.blend(zf, zb)

near_cache = {}
def neighbours(i):
    """The 12 closest words to word i (reference nouns and extras), nearest first."""
    if i not in near_cache:
        b = blend_all(i); b[i] = -np.inf; b[~has_vec] = -np.inf
        near_cache[i] = np.argsort(-b)[:NEAR_PENALTY[-1][0]]
    return near_cache[i]

scores = np.zeros((len(targets), len(m.words)), np.uint16)
feel = np.zeros((len(targets), len(m.words)), np.uint8)   # what the AI player goes by when it guesses
meta = []
for ti, t in enumerate(targets):
    i = m.idx[t]
    b = blend_all(i)
    ref = np.sort(np.delete(b[:m.ref], i) if i < m.ref else b[:m.ref])
    ranks = np.maximum(1, len(ref) - np.searchsorted(ref, b, side='right') + 1)
    pct = rank_pct(ranks)
    pct[~has_vec] = 0                               # words fastText never saw have no embedding score
    feel[ti] = np.rint(pct).astype(np.uint8)        # the model's own number, before any list or floor
    listed = {h: s for (tt, h), s in assoc.items() if tt == t and h in m.idx}
    for j, h in enumerate(m.words):
        f = fl.structural(t, h, ranks[j])
        if len(t) >= 2 and t in h and h != t and ranks[j] <= CONTAIN_MAX_RANK: f = max(f, CONTAIN_FLOOR)
        if f > pct[j]: pct[j] = f
    for h, s in listed.items():
        if s < NEAR_MIN or not has_vec[m.idx[h]]: continue
        for k, j in enumerate(neighbours(m.idx[h])):
            hw = m.words[j]
            if hw in listed or hw == t or ranks[j] > NEAR_MAX_RANK or h in hw or hw in h: continue
            off = next(p for upto, p in NEAR_PENALTY if k < upto)
            pct[j] = max(pct[j], s - off)
    for h, s in listed.items(): pct[m.idx[h]] = s
    packed = np.rint(np.minimum(pct, 99.9) * 10).astype(np.uint16)
    packed[i] = 1000
    scores[ti] = packed
    meta.append({'word': t, 'cluster': clusters[t], 'list': sorted(listed.items(), key=lambda x: -x[1])})
    print(t, end=' ', flush=True)
print()

np.save(f'{OUT}/scores.npy', scores); np.save(f'{OUT}/feel.npy', feel)
open(f'{OUT}/words.txt', 'w', encoding='utf-8').write('\n'.join(m.words) + '\n')
json.dump(meta, open(f'{OUT}/targets.json', 'w', encoding='utf-8'), ensure_ascii=False)
with open(f'{OUT}/hw_vocab.tsv', 'w', encoding='utf-8') as f:
    for j, w in enumerate(m.words): f.write(f'{w}\t{j}\n')
with open(f'{OUT}/hw_targets.tsv', 'w', encoding='utf-8') as f:
    for ti, x in enumerate(meta):
        f.write(f"{x['word']}\t{x['cluster']}\t\\\\x{scores[ti].astype('<u2').tobytes().hex()}\t\\\\x{feel[ti].tobytes().hex()}\n")
with open(f'{OUT}/hw_hints.tsv', 'w', encoding='utf-8') as f:   # the AI's own hints, with how many other pool words each fits
    for ti, x in enumerate(meta):
        for h, sc in x['list']:
            f.write(f"{x['word']}\t{h}\t{sc:g}\t{int((np.delete(scores[:, m.idx[h]], ti) >= FITS_FROM * 10).sum())}\n")
print(len(targets), 'hidden words x', len(m.words), 'hint words')
