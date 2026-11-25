"""Step 4b: compare the built scores with the numbers seen on the show, and print a few spot checks.

The six show words are in the pool and their show hints are in their lists, so the final table matches
those by construction. The honest measure is the model-only column: what the embedding rank curve gives
when the lists are taken away.
Usage: check_scores.py <data> [hidden word hint hint ...]
"""
import json, sys
import numpy as np

DATA = sys.argv[1] if len(sys.argv) > 1 else 'data'
S = np.load(f'{DATA}/game/scores.npy') / 10; E = np.load(f'{DATA}/game/feel.npy').astype(float)
words = open(f'{DATA}/game/words.txt', encoding='utf-8').read().split(); idx = {w: i for i, w in enumerate(words)}
targets = [x['word'] for x in json.load(open(f'{DATA}/game/targets.json', encoding='utf-8'))]
if len(sys.argv) > 3:
    t = targets.index(sys.argv[2])
    print(sys.argv[2], ' '.join(f'{h}:{S[t, idx[h]]:g}' if h in idx else f'{h}:없음' for h in sys.argv[3:]))
    raise SystemExit
show = json.load(open(__file__.replace('check_scores.py', 'show_scores.json'), encoding='utf-8')); show.pop('_note')
rows = [(t, h, p, S[targets.index(t), idx[h]], E[targets.index(t), idx[h]]) for t, hs in show.items() if t in targets for h, p in hs.items() if h in idx]
print(f"{'정답':4}{'힌트':6}{'방송':>6}{'최종':>7}{'모델만':>7}")
for t, h, p, s, e in rows: print(f'{t:4}{h:6}{p:>6}{s:>7.1f}{e:>7.0f}')
print(f'평균오차: 최종 {np.mean([abs(s - p) for *_, p, s, _ in rows]):.1f}%p (목록에 넣은 값), 모델만 {np.mean([abs(e - p) for *_, p, _, e in rows]):.1f}%p, {len(rows)}쌍')
for t in targets[:3]:
    r = S[targets.index(t)]
    print(f'{t}: 95%↑ {int((r >= 95).sum()) - 1}개, 90%↑ {int((r >= 90).sum()) - 1}개, 40% 미만 {int((r < 40).sum())}개')
