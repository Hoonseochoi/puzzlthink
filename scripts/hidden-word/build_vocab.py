"""Step 1: pick the hint vocabulary from fastText Korean vectors.

Two kinds of words:
  ref   clean common nouns + 명사형 (나무, 차, 딱딱함). Ranks and % are measured against these only,
        so adding more words below does not shift anyone's score.
  extra other words a player may still type as a hint: 고유명사 (테슬라), compounds (인공지능),
        other noun suffixes, plus every word of the AI association lists (data/assoc_words.txt).

Input : data/ft_top1m.vec  (first 1M lines of cc.ko.300.vec, frequency order, header removed)
        data/assoc_words.txt (optional, one word per line)
Output: data/vocab.txt     (ref words first, then extras; frequency order inside each)
        data/vocab.json    {"ref": number of ref words}
        data/ft.npy        (float16, L2-normalised fastText vectors, same order; zeros if fastText lacks the word)
"""
import json, os, re, sys
import numpy as np
from kiwipiepy import Kiwi
from score_lib import load_assoc

DATA = sys.argv[1] if len(sys.argv) > 1 else 'data'
REF_LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 40000
EXTRA_LIMIT = int(sys.argv[3]) if len(sys.argv) > 3 else 40000
HANGUL = re.compile(r'^[가-힣]{1,8}$')
REF_SUFFIX = {'님', '꾼', '자', '가', '사', '쟁이', '보', '뱅이'}  # 주인님, 살림꾼, 실직자, 무술가
PRED = {'VA', 'VA-I', 'VA-R', 'VV', 'VV-I', 'VV-R'}
UNKNOWN_ID = 2  # Kiwi's id for a noun it guessed (not in its dictionary): typos, junk
# one-syllable tokens that are particles, endings or filler in web text (차, 개, 양, 회 are allowed)
ONE_SYLLABLE_STOP = set('의은는을를이가에와과도로만나랑께서및그고저제으르라네뭐거되히크엔엘디아어오야응헐흠뉴딜웜쿨윌것수데바뿐듯척겸측')
NOMINAL_STOP = {'있음', '없음', '같음', '않음', '보임', '되었음', '하였음', '했음', '됨', '함', '임'}

def classify(word, toks):
    """'ref', 'extra' or None."""
    tags = [t.tag for t in toks]
    if not toks or any(t.id == UNKNOWN_ID for t in toks):
        return None
    if len(word) == 1:
        ok = len(toks) == 1 and tags[0] in ('NNG', 'NR', 'IC', 'NNB') and word not in ONE_SYLLABLE_STOP
        return 'ref' if ok else None
    if ''.join(t.form for t in toks) == word:
        if tags == ['NNG'] or (tags == ['NNG', 'XSN'] and toks[1].form in REF_SUFFIX):
            return 'ref'
        if tags == ['NNP']:
            return 'extra'                                   # 테슬라
        if 2 <= len(toks) <= 3 and all(t in ('NNG', 'NNP', 'XSN', 'XPN') for t in tags) and tags[0] != 'XSN':
            return 'extra'                                   # 인공지능, 교통사고
    # 명사형 (딱딱함, 아름다움, 물음): adjective/verb stem + ㅁ/음, no tense marker
    if word in NOMINAL_STOP or 'EP' in tags:
        return None
    if toks[-1].form in ('ᆷ', '음') and toks[-1].tag in ('EF', 'ETN'):
        head = tags[:-1]
        if (len(head) == 1 and head[0] in PRED) or head in (['XR', 'XSA'], ['NNG', 'XSA'], ['XR', 'XSA-I']):
            return 'ref'
    return None

forced = [hint for _, hint in load_assoc(DATA)]
if os.path.exists(f'{DATA}/pool.txt'):
    with open(f'{DATA}/pool.txt', encoding='utf-8') as pool:
        forced.extend(pool.read().split())
if os.path.exists(f'{DATA}/assoc_words.txt'):
    with open(f'{DATA}/assoc_words.txt', encoding='utf-8') as extra_words:
        forced.extend(extra_words.read().split())
forced = [w for w in forced if HANGUL.fullmatch(w)]
forced_set = set(forced)

kiwi = Kiwi()
cands = []
with open(f'{DATA}/ft_top1m.vec', encoding='utf-8', errors='ignore') as f:
    for line in f:
        w, _, rest = line.partition(' ')
        if HANGUL.match(w):
            cands.append((w, rest))
print('hangul tokens', len(cands))

def is_plain_noun(w):
    """Kiwi's best reading of a lone word can miss the noun (별, 섬, 봄): accept it if any of the
    top readings is the word as a single dictionary noun."""
    for toks, _ in kiwi.analyze(w, top_n=4):
        if len(toks) == 1 and toks[0].form == w and toks[0].tag == 'NNG' and toks[0].id != UNKNOWN_ID:
            return True
    return False

ref, extra, ftvec = [], [], {}
for (w, rest), toks in zip(cands, kiwi.tokenize((w for w, _ in cands))):
    kind = classify(w, toks)
    if kind != 'ref' and (len(w) > 1 or w not in ONE_SYLLABLE_STOP) and is_plain_noun(w):
        kind = 'ref'
    if kind is None and w not in forced_set:
        continue
    if kind == 'ref' and len(ref) >= REF_LIMIT:
        kind = 'extra'
    if kind != 'ref' and len(extra) >= EXTRA_LIMIT and w not in forced_set:
        continue
    v = np.asarray(rest.split(), dtype=np.float32)
    if v.shape[0] != 300 or not np.isfinite(v).all() or np.linalg.norm(v) == 0:
        continue
    ftvec[w] = v / np.linalg.norm(v)
    (ref if kind == 'ref' else extra).append(w)

missing = [w for w in dict.fromkeys(forced) if w not in ftvec]   # association words fastText never saw
words = ref + extra + missing
V = np.zeros((len(words), 300), np.float16)
for i, w in enumerate(words):
    if w in ftvec:
        V[i] = ftvec[w]
np.save(f'{DATA}/ft.npy', V)
open(f'{DATA}/vocab.txt', 'w').write('\n'.join(words) + '\n')
json.dump({'ref': len(ref)}, open(f'{DATA}/vocab.json', 'w'))
print(f'ref {len(ref)}, extra {len(extra)}, association-only {len(missing)}')
