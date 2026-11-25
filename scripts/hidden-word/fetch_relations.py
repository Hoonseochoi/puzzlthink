"""Step 4: 우리말샘 related words (비슷한말, 반대말, 상위어, 하위어, ...) for hidden-word candidates.

Usage: fetch_relations.py DATA word1 word2 ...   (or a file with one word per line via @file)
Key  : ~/.config/opendict/key  (never committed)
Output: DATA/relations.tsv  (target \t related \t type), responses cached in DATA/odict_cache/
"""
import http.client
import json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

DATA = sys.argv[1]
args = sys.argv[2:]
words = open(args[0][1:]).read().split() if args and args[0].startswith('@') else args
KEY = open(os.path.expanduser('~/.config/opendict/key')).read().strip()
CACHE = f'{DATA}/odict_cache'; os.makedirs(CACHE, exist_ok=True)
MAX_SENSES = 4
KEEP = {'비슷한말', '반대말', '상위어', '하위어', '참고 어휘', '동류 개념', '대립어', '높임말', '낮춤말', '본말', '준말'}

def call(endpoint, params, cache_name):
    path = f'{CACHE}/{cache_name}.json'
    if os.path.exists(path):
        return json.load(open(path))
    q = urllib.parse.urlencode({'key': KEY, 'req_type': 'json', **params})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(f'https://opendict.korean.go.kr/api/{endpoint}?{q}', timeout=20) as r:
                data = json.load(r)
            if 'channel' not in data:
                raise ValueError('Dictionary API returned no channel')
            with open(path + '.tmp', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False)
            os.replace(path + '.tmp', path)
            time.sleep(0.15)
            return data
        except (OSError, http.client.HTTPException, ValueError) as error:
            retryable = not isinstance(error, urllib.error.HTTPError) or error.code in (429, 500, 502, 503, 504)
            if not retryable or attempt == 3:
                raise RuntimeError(f'{cache_name}: dictionary request failed ({type(error).__name__})') from None
            time.sleep(2 ** attempt)

clean = lambda w: re.sub(r'[\d\-\^\s]', '', w)
seen = set()
if os.path.exists(f'{DATA}/relations.tsv'):
    with open(f'{DATA}/relations.tsv', encoding='utf-8') as records:
        seen = {line.split('\t')[0] for line in records if line.rstrip('\n').endswith('\t\t_done')}
out = open(f'{DATA}/relations.tsv', 'a')
for w in words:
    if w in seen: continue
    d = call('search', {'q': w, 'advanced': 'y', 'method': 'exact', 'pos': 1, 'num': 20}, f's_{w}')
    items = d.get('channel', {}).get('item', [])
    codes = [s['target_code'] for it in items for s in it.get('sense', []) if s.get('type') == '일반어'][:MAX_SENSES]
    rels = set()
    for c in codes:
        v = call('view', {'q': c, 'method': 'target_code'}, f'v_{c}')
        si = v.get('channel', {}).get('item', {}).get('senseInfo', {})
        for r in si.get('relation_info', []) or []:
            if r.get('type') in KEEP and clean(r.get('word', '')) and clean(r['word']) != w:
                rels.add((clean(r['word']), r['type']))
    out.write(''.join(f'{w}\t{rw}\t{t}\n' for rw, t in sorted(rels)) + f'{w}\t\t_done\n')
    out.flush()
    print(w, len(codes), 'senses', len(rels), 'relations', flush=True)
