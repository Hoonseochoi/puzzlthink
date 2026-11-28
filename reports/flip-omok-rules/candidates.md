# 뒤집기 오목 — 후보 규칙 명세 (Candidate rule sets, full spec)

Engine: `src/lib/flipOmokNext.ts` (`RULESETS`), one object per rule set. The live game (`src/lib/flipOmok.ts`) is untouched.

## Rules every candidate keeps (공통)

- 15×15, red (레드) first, one stone per turn. Exact five in a row (가로·세로·대각) wins; six or more (장목) does not.
- Only the mover flips. Stepping into a gap between two enemy stones is safe (내 돌은 안 뒤집힘).
- 쌍삼 is forbidden for both sides: an action is illegal if, **after that action's flips**, the placed stone takes part in two or more open threes — unless the action makes five. "놓기" and "놓고 뒤집기" at the same point are judged separately (one may be ✕ while the other is legal). The separate flip action (`post`) places no stone and is never checked for 쌍삼.
- Unless a set says otherwise, a five that includes a stone flipped by **that same move** does not win (the live rule). It stays on the board as a dead five.
- Board full → draw. Charges left at the end mean nothing (no tie-break).
- What the opponent sees: both players' remaining charges at all times (◆◆◆), every flipped stone (other-colour ring + 🔒 when locked), and, when the AI flips, a short preview of the stones it is about to turn before the flip lands.
- Rooms (if adopted): one action per turn as now, the clock runs while the player chooses between 놓기 / 놓고 뒤집기; a timeout plays the 보통 AI's action, which may spend a charge (proposal: a timeout never spends a charge).

## The sets

| id | 이름 | When stones flip | Limit | Locked? | Flip-made five | Notes |
|---|---|---|---|---|---|---|
| `live` / `liveai` | 지금 규칙 | every move, every sandwich, 8 directions, any length | none | no | void | baseline (`liveai` = live engine + live AI) |
| `c2`, `c3`, `c5` | 뒤집기 N회 | only when the player chooses 놓고 뒤집기 and spends a charge; then every sandwich that stone makes flips | N per player per game | no | void | 놓기 is the default |
| `c3lock` | **전략적 뒤집기** (3회 + 고정) | as `c3` | 3 | **yes**: a flipped stone can never flip again; a run that contains a locked stone can't be flipped | void | recommended |
| `c3lockfive` / `c2lockfive` | 3회(2회) + 고정 + 뒤집기 5목 인정 | as `c3lock` | 3 / 2 | yes | **wins** (any five made through the placed stone or through a stone flipped by the move) | no dead fives exist |
| `c3last` | 3회 + 고정 + 마지막 반격 | as `c3lock` | 3 | yes | void | when a five is made and the opponent has a charge and a flip that turns a stone of that five, the game doesn't end: the opponent's next action **must** be such a flip (only those are legal); if it breaks the five, play goes on, otherwise the five wins |
| `c3fivelast` | 3회 + 고정 + 5목 인정 + 마지막 반격 | as `c3lock` | 3 | yes | wins (with last chance) | |
| `earn` | 충전식 뒤집기 | as charges | start 1, +1 per 6 own stones placed, max 3 | yes | void | |
| `line` | 한 줄 뒤집기 | any move may flip **one** chosen line (or none) | unlimited | no | void | the player picks the direction |
| `c3line` | 3회 + 한 줄 + 고정 | as `line`, costs a charge | 3 | yes | void | |
| `lock` | 고정 뒤집기 (자동) | every move, every sandwich (as live) | unlimited | yes | void | ping-pong impossible by construction |
| `short` | 짧은 뒤집기 | every move, but only runs of 1–2 stones | unlimited | no | void | |
| `post` | 사후 뒤집기 | never on placement; instead of placing, a turn may spend a charge to flip one run of enemy stones already sandwiched between two of your stones (any of 4 line directions) | 3 | yes | n/a (the flipped stones may complete a five: void) | no stone is placed that turn |

## AI for the variants

`chooseAction(rules, state, level)` in the same file: the live 보통/어려움 logic generalised from points to actions (a point × 놓기 / 놓고 뒤집기 / each line / the flip action). Charges enter the evaluation at `CHARGE_VALUE` = 420 window points each (≈ three open-three windows), so the AI spends one only when the flip gains more than that (breaking a four, opening its own four, …). Its threat checks include the opponent's flips (a flip that would break my block, or a flip-made five where it counts). One fix over the live AI: a dead five (one that didn't win) is worth nothing; the live AI prizes it at 1,000,000 and chases such fives (2.8 per game in live 보통 games).
