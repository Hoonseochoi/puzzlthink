"""Step 0: write pool.txt and assoc/<word>.tsv from the hand-written sources (run inside the data dir).

src/pool.tsv        group<TAB>hidden words of that group (space separated). Groups are look-alike sets
                    (fruit, body, weather ...): hints that fit a whole group are what make a word hard to find.
src/assoc_new.txt   one line per hidden word: word|score:hint,hint|score:hint,...  (AI-written, graded lists;
                    a listed hint scores exactly that number, so the list may also pin low scores)
../data/assoc/      the first-generation lists (16 tiers, 61-98.5), rescaled here to the current scale
"""
import os, re, glob
HAN = re.compile(r'^[가-힣]{1,8}$')
OLD = [(98.5, 99), (96, 98), (94, 96.5), (91.5, 95), (89.5, 93), (87, 91), (84.5, 88), (82, 85), (79.5, 82), (77, 79), (75.5, 77), (73, 74), (70, 71), (67, 68), (64, 65), (0, 62)]
rescale = lambda v: next(n for lo, n in OLD if v >= lo)
pool = [w for line in open('src/pool.tsv', encoding='utf-8') for w in line.split('\t')[1].split()]
open('pool.txt', 'w', encoding='utf-8').write('\n'.join(pool) + '\n')
new = {}
for line in open('src/assoc_new.txt', encoding='utf-8'):
    t, *tiers = line.strip().split('|')
    rows = {}
    for tier in tiers:
        s, ws = tier.split(':'); s = float(s)
        for w in ws.split(','):
            if not HAN.match(w) or w == t: print('skip', t, w); continue
            if w in rows: print('dup', t, w, rows[w], s)
            rows[w] = max(s, rows.get(w, 0))
    new[t] = rows
for t in pool:
    if t in new: rows = new[t]
    else:
        rows = {}
        for line in open(f'../data/assoc/{t}.tsv', encoding='utf-8'):
            w, s = line.strip().split('\t')
            if HAN.match(w) and w != t: rows[w] = max(rescale(float(s)), rows.get(w, 0))
    with open(f'assoc/{t}.tsv', 'w', encoding='utf-8') as f:
        for w, s in sorted(rows.items(), key=lambda x: -x[1]): f.write(f'{w}\t{s:g}\n')
    print(t, len(rows), sum(s >= 95 for s in rows.values()), end=' | ')
print('\nextra lists not in pool:', set(new) - set(pool))
