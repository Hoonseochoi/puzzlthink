"""Step 4: score every hint word against every hidden word of each level's pool, and write the game data.

Levels (<data>/levels.json; without it one level, 기본, from src/pool.tsv with the original blend):
  {"basic": {"pool": "src/pool_basic.tsv", "blend": "ft:0.4,bge-m3:0.6", "curve": "v2"},
   "plus":  {"pool": "src/pool_plus.tsv",  "blend": "...", "curve": "...", "rules": {...}}}
Every level shares the vocabulary (vocab.txt) and the association lists (assoc/<word>.tsv); each has its own
embedding blend (score_lib.Blend), rank curve (score_lib.CURVES) and floor rules (score_lib.Floors.structural).

Score of (hidden word, hint), highest rule first:
  1. the hidden word's association list (assoc/<word>.tsv) -> that number, as written
  2. otherwise the highest of
       - embedding rank among the reference nouns -> % (the level's rank curve)
       - written together as one common word (대기+열)          -> compound floor
       - 우리말샘 relation (비슷한말, 상위어, ...)               -> REL_FLOOR
       - the hint contains the hidden word (딸기 -> 딸기잼)      -> CONTAIN_FLOOR
       - a close neighbour of a listed word (케이크 -> 케익)      -> that word's number minus NEAR_PENALTY

Output: <data>/game/<level>/ scores.npy (targets x words, uint16 = % x 10), feel.npy (the embedding-only %,
which is all the AI player knows when it guesses), targets.json; <data>/game/words.txt; and the three files
loaded into Postgres by load_game.sh (hw_targets.tsv carries each hidden word's level).
"""
import json, os, sys
import numpy as np
from score_lib import COMPOUND_FLOOR, Blend, Floors, load_assoc, partial_overlap, rank_pct

DATA = sys.argv[1] if len(sys.argv) > 1 else 'data'
OUT = f'{DATA}/game'; os.makedirs(OUT, exist_ok=True)
CONTAIN_FLOOR, CONTAIN_MAX_RANK = 95, 2000   # 딸기잼 yes, 서큐버스 no
NEAR_PENALTY = [(2, 3), (5, 5), (12, 8)]   # (neighbour rank up to, points off)
FITS_FROM = 85                             # a hint also fits another hidden word that scores this or more
NEAR_MIN, NEAR_MAX_RANK = 80, 8000         # only spread strong associations, to hints the model also finds related

levels = json.load(open(f'{DATA}/levels.json')) if os.path.exists(f'{DATA}/levels.json') else \
    {'basic': {'pool': 'src/pool.tsv', 'blend': 'ft:0.4,bge-m3:0.6', 'curve': 'v2'}}
fl = Floors(DATA); assoc = load_assoc(DATA)
words = None
rows_t, rows_h = [], []
for level, conf in levels.items():
    m = Blend(DATA, conf['blend']); rules = conf.get('rules', {})
    meaning = Blend(DATA, rules['compound_by_meaning']) if rules.get('compound_by_meaning') else None
    if words is None: words = m.words
    assert m.words == words
    clusters = {}
    for line in open(f"{DATA}/{conf['pool']}", encoding='utf-8'):
        name, members = line.rstrip('\n').split('\t')
        for w in members.split(): clusters[w] = name
    targets = list(clusters)
    has_vec = m.has_vec

    def blend_all(i):
        w = words[i]
        look = np.fromiter((partial_overlap(w, h) or (h != w and h in w) for h in words), bool, len(words))
        return m.row(i, look, fallback=rules.get('no_ft_fallback', False))

    # rules.near_words: a word list (file in <data>) that neighbours are taken from. The 기본 build keeps its
    # first vocabulary here, so words added for 확장 do not push old neighbours out and its numbers stay put.
    near_ok = has_vec.copy()
    if rules.get('near_words'):
        allowed = set(open(f"{DATA}/{rules['near_words']}", encoding='utf-8').read().split())
        near_ok &= np.fromiter((w in allowed for w in words), bool, len(words))
    near_cache = {}
    def neighbours(i):
        """The 12 closest words to word i (reference nouns and extras), nearest first."""
        if i not in near_cache:
            b = blend_all(i); b[i] = -np.inf; b[~near_ok] = -np.inf
            near_cache[i] = np.argsort(-b)[:NEAR_PENALTY[-1][0]]
        return near_cache[i]

    scores = np.zeros((len(targets), len(words)), np.uint16)
    feel = np.zeros((len(targets), len(words)), np.uint8)   # what the AI player goes by when it guesses
    meta = []
    for ti, t in enumerate(targets):
        i = m.idx[t]
        b = blend_all(i)
        ref = np.sort(np.delete(b[:m.ref], i) if i < m.ref else b[:m.ref])
        ranks = np.maximum(1, len(ref) - np.searchsorted(ref, b, side='right') + 1)
        pct = rank_pct(ranks, conf.get('curve'))
        if not rules.get('no_ft_fallback'): pct[~has_vec] = 0   # words fastText never saw have no embedding score (기본)
        feel[ti] = np.rint(pct).astype(np.uint8)        # the model's own number, before any list or floor
        listed = {h: s for (tt, h), s in assoc.items() if tt == t and h in m.idx}
        by_meaning = rules.get('compound_by_meaning')
        if by_meaning:   # the compound's meaning alone (a meaning model, no fastText: its sub-words make 목금 look like 목)
            mb = meaning.row(i); mref = np.sort(np.delete(mb[:m.ref], i) if i < m.ref else mb[:m.ref])
            base = rank_pct(np.maximum(1, len(mref) - np.searchsorted(mref, mb, side='right') + 1), conf.get('curve'))
        for j, h in enumerate(words):
            f = fl.structural(t, h, ranks[j], {**rules, 'compound_floor': 0} if by_meaning else rules)
            if by_meaning and (t + h in fl.toks or h + t in fl.toks):
                # a piece of a compound means what the whole word means: 수영+장 -> 수영장 (close to 수영), 목+요일 -> 목요일 (not)
                whole = [base[m.idx[c]] for c in (t + h, h + t) if c in m.idx]
                cf = rules.get('compound_floor', COMPOUND_FLOOR)
                f = max(f, min(cf, max(whole) + rules.get('compound_bonus', 0)) if whole else (cf if len(h) >= rules.get('compound_min_len', 1) else 0))
            if len(t) >= 2 and t in h and h != t and ranks[j] <= rules.get('contain_max_rank', CONTAIN_MAX_RANK): f = max(f, CONTAIN_FLOOR)
            if f > pct[j]: pct[j] = f
        for h, s in listed.items():
            if s < NEAR_MIN or not has_vec[m.idx[h]]: continue
            for k, j in enumerate(neighbours(m.idx[h])):
                hw = words[j]
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
    d = f'{OUT}/{level}'; os.makedirs(d, exist_ok=True)
    np.save(f'{d}/scores.npy', scores); np.save(f'{d}/feel.npy', feel)
    open(f'{d}/words.txt', 'w', encoding='utf-8').write('\n'.join(words) + '\n')
    json.dump(meta, open(f'{d}/targets.json', 'w', encoding='utf-8'), ensure_ascii=False)
    for ti, x in enumerate(meta):
        rows_t.append(f"{x['word']}\t{x['cluster']}\t\\\\x{scores[ti].astype('<u2').tobytes().hex()}\t\\\\x{feel[ti].tobytes().hex()}\t{level}\n")
        for h, sc in x['list']:   # the AI's own hints, with how many other words of the same pool each fits
            rows_h.append(f"{x['word']}\t{h}\t{sc:g}\t{int((np.delete(scores[:, m.idx[h]], ti) >= FITS_FROM * 10).sum())}\n")
    print(level, len(targets), 'hidden words x', len(words), 'hint words')

open(f'{OUT}/words.txt', 'w', encoding='utf-8').write('\n'.join(words) + '\n')
with open(f'{OUT}/hw_vocab.tsv', 'w', encoding='utf-8') as f:
    for j, w in enumerate(words): f.write(f'{w}\t{j}\n')
open(f'{OUT}/hw_targets.tsv', 'w', encoding='utf-8').write(''.join(rows_t))
open(f'{OUT}/hw_hints.tsv', 'w', encoding='utf-8').write(''.join(rows_h))
