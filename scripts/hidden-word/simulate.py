"""Play the AI match many times with scripted players, to tune the rules and the AI (not used at play time).

The AI's own policies (ai_hints, ai_guess) are the ones ported to SQL in the hw_* functions; the
"human" players here are stand-ins of different skill:
  setter  naive  gives the hint they believe scores highest
          sly    among hints they believe reach the cut, gives the one that fits the most other words
  guesser sigma  how far their feel for a similarity number is from the real one (small = sharp)
Usage: simulate.py <data> [matches]
"""
import json, sys
import numpy as np

DATA = sys.argv[1] if len(sys.argv) > 1 else 'data'
N = int(sys.argv[2]) if len(sys.argv) > 2 else 3000
rng = np.random.default_rng(7)

CUT = 95            # a hint at or above this ends the hint phase
STAGES = 3
MAX_HINTS = 5       # hints per stage before the closest word is revealed
SET_POINTS = [1, 2, 3]    # setter, each stage the word survives
GUESS_POINTS = [6, 3, 1]  # guesser, by the stage of the correct answer
AI_NOISE = 5.0      # the AI's feel for how related two words are is this far off (fixed per pair for a match)
AI_BASE = 60        # shown numbers above this pull the AI towards words related to the hint, below push away
AI_GAP = 3.0        # the AI spends its chance when its two best answers are this close

S = np.load(f'{DATA}/game/scores.npy').astype(np.float32) / 10
E = np.load(f'{DATA}/game/feel.npy').astype(np.float32)     # what a guesser goes by: the model's own number
words = open(f'{DATA}/game/words.txt', encoding='utf-8').read().split()
idx = {w: i for i, w in enumerate(words)}
meta = json.load(open(f'{DATA}/game/targets.json', encoding='utf-8'))
T = len(meta); tword = [x['word'] for x in meta]; tcol = np.array([idx[w] for w in tword])
lists = [[(idx[h], s) for h, s in x['list']] for x in meta]

def fits(t, h):
    """How many other pool words a hint fits about as well as it fits word t."""
    return int((E[:, h] >= E[t, h] - 3).sum()) - 1

def belief(clues, noise, banned):
    """How well each pool word explains the (hint column, shown %) pairs: related to the high ones, not to the low."""
    v = np.zeros(T)
    for h, s in clues:
        v += (s - AI_BASE) / (100 - AI_BASE) * (E[:, h] + noise[:, h % noise.shape[1]])
    v[list(banned)] = -np.inf
    return v

# ---------- the AI (ported to SQL) ----------
def ai_hints(t, stage, used):
    """The AI's hints for one stage: one or two warm-up hints below the cut, then one at or above it.
    Stage 1 closes with the hint that fits the most other pool words, stage 3 with the one that fits the fewest."""
    own = [(h, s) for h, s in lists[t] if h not in used and h != tcol[t]]
    top = [(h, s) for h, s in own if CUT <= s < 98] or [(h, s) for h, s in own if s >= CUT]
    top.sort(key=lambda x: -(int((S[:, x[0]] >= 85).sum()) - 1) + rng.random() * 0.9)
    k = {1: 0, 2: len(top) // 2, 3: len(top) - 1}[stage]
    k = min(len(top) - 1, max(0, k + int(rng.integers(-1, 2)) * (stage == 2)))
    close = top[k]
    lo, hi = {1: (72, 86), 2: (80, 91), 3: (86, 94.5)}[stage]
    warm = [(h, s) for h, s in own if lo <= s <= hi]
    rng.shuffle(warm)
    return warm[:int(rng.integers(1, 3))] + [close]

def ai_guess(clues, noise, banned, chance):
    """The AI's answer(s): the pool word that explains the hints best; a second one with its chance when close."""
    v = belief(clues, noise, banned)
    order = np.argsort(-v)
    picks = [int(order[0])]
    if chance and v[order[0]] - v[order[1]] < AI_GAP: picks.append(int(order[1]))
    return picks

# ---------- stand-in humans ----------
def human_hints(t, style, used, miss=0.25, feel=3.0):
    out = []
    own = [(h, s) for h, s in lists[t] if h not in used]
    while len(out) < MAX_HINTS:
        left = [(h, s) for h, s in own if h not in [x for x, _ in out]]
        if rng.random() < miss:
            pool = [(h, s) for h, s in left if 70 <= s < 94]; h, s = pool[rng.integers(len(pool))]
        else:
            believed = [(h, s, s + rng.normal(0, feel)) for h, s in left if s < 98]
            cand = [x for x in believed if x[2] >= CUT] or sorted(believed, key=lambda x: -x[2])[:3]
            if style == 'naive': h, s, _ = max(cand, key=lambda x: x[2])
            else: h, s, _ = max(cand, key=lambda x: fits(t, x[0]) + rng.random())
        out.append((h, s))
        if s >= CUT: return out, None
    best = max(((h, s) for h, s in own if h not in [x for x, _ in out]), key=lambda x: x[1])
    return out, best    # the closest word is revealed

def play_set(t, style):
    """The stand-in human sets word t; returns (human points, AI points, stage the AI got it or 0)."""
    noise = rng.normal(0, AI_NOISE, (T, 997)); clues = []; banned = set(); used = set(); pts = 0; chance = True
    for stage in range(1, STAGES + 1):
        hints, shown = human_hints(t, style, used)
        if shown: hints = hints + [shown]
        clues += hints; used |= {h for h, _ in hints}
        picks = ai_guess(clues, noise, banned, chance and stage >= 2)
        if len(picks) > 1: chance = False
        if t in picks: return pts, GUESS_POINTS[stage - 1], stage
        for p in picks:
            banned.add(p); clues.append((tcol[p], S[t, tcol[p]]))   # a wrong answer's % is shown too
        pts += SET_POINTS[stage - 1]
    return pts, 0, 0

def play_guess(t, sigma):
    """The AI sets word t; the stand-in human answers. Returns (human points, AI points, stage or 0)."""
    noise = rng.normal(0, sigma, (T, 997)); clues = []; banned = set(); used = set(); ai = 0; chance = True
    for stage in range(1, STAGES + 1):
        hints = ai_hints(t, stage, used); clues += hints; used |= {h for h, _ in hints}
        lp = belief(clues, noise, banned); order = np.argsort(-lp)
        picks = [int(order[0])]
        if chance and stage >= 2 and lp[order[0]] - lp[order[1]] < AI_GAP: picks.append(int(order[1])); chance = False
        if t in picks: return GUESS_POINTS[stage - 1], ai, stage
        for p in picks:
            banned.add(p); clues.append((tcol[p], S[t, tcol[p]]))
        ai += SET_POINTS[stage - 1]
    return 0, ai, 0

def report(name, rows):
    me = np.array([r[0] for r in rows]); ai = np.array([r[1] for r in rows]); st = np.array([r[2] for r in rows])
    dist = ' '.join(f'{k or "X"}:{(st == k).mean() * 100:4.0f}%' for k in (1, 2, 3, 0))
    print(f'{name:28} 내 승점 {me.mean():.2f}  AI 승점 {ai.mean():.2f}  정답 단계 {dist}')

if __name__ == '__main__':
    print(f'{T} words, cut {CUT}, hints/stage {MAX_HINTS}, AI noise {AI_NOISE}')
    for style in ('naive', 'sly'):
        report(f'내가 출제 ({style})', [play_set(int(rng.integers(T)), style) for _ in range(N)])
    for sigma in (3, 6, 10, 15, 25):
        report(f'AI 출제 (내 감 ±{sigma})', [play_guess(int(rng.integers(T)), sigma) for _ in range(N)])
    # whole matches: two rounds, round 2 doubled
    for style, sigma in (('naive', 10), ('sly', 6), ('sly', 3)):
        tot = []
        for _ in range(N // 3):
            me = ai = 0
            for mult in (1, 2):
                a = play_set(int(rng.integers(T)), style); b = play_guess(int(rng.integers(T)), sigma)
                me += mult * (a[0] + b[0]); ai += mult * (a[1] + b[1])
            tot.append((me, ai))
        tot = np.array(tot)
        print(f'대전 {style}/±{sigma}: 내 승점 평균 {tot[:, 0].mean():.1f} (10%~90%: {np.percentile(tot[:, 0], 10):.0f}~{np.percentile(tot[:, 0], 90):.0f}), '
              f'AI {tot[:, 1].mean():.1f}, 승률 {(tot[:, 0] > tot[:, 1]).mean() * 100:.0f}% 무 {(tot[:, 0] == tot[:, 1]).mean() * 100:.0f}%')
