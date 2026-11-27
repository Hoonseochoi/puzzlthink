"""Merge graded hints (a patch in assoc_new.txt format, e.g. lv2/src/human_patch.txt) into association lists.
A hint in the patch takes the patch's score, whether it was on the list or not; everything else is kept.
Usage: apply_patch.py <assoc dir in> <patch> <assoc dir out>     prints how many hints were added and changed
"""
import glob, os, re, sys
HAN = re.compile(r'^[가-힣]{1,8}$')
src, patch, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
lists = {}
for p in glob.glob(f'{src}/*.tsv'):
    t = os.path.basename(p)[:-4]
    lists[t] = {l.split('\t')[0]: float(l.split('\t')[1]) for l in open(p, encoding='utf-8') if l.strip()}
added = changed = 0; up = down = 0
for line in open(patch, encoding='utf-8'):
    if line.startswith('#') or not line.strip(): continue
    t, *tiers = line.strip().split('|')
    if t not in lists: sys.exit(f'{t}: no list to patch')
    for tier in tiers:
        s, ws = tier.split(':'); s = float(s)
        for w in ws.split(','):
            if not HAN.match(w) or w == t: continue
            old = lists[t].get(w)
            if old is None: added += 1
            elif old != s: changed += 1; up += s > old; down += s < old
            lists[t][w] = s
for t, rows in lists.items():
    with open(f'{out}/{t}.tsv', 'w', encoding='utf-8') as f:
        for w, s in sorted(rows.items(), key=lambda x: -x[1]): f.write(f'{w}\t{s:g}\n')
print(f'{len(lists)} lists, {added} hints added, {changed} scores changed ({up} up, {down} down)')
