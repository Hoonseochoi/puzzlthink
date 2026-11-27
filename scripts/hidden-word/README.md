# 히든 워드 game data

Builds the similarity tables and AI hint lists for the 히든 워드 AI match. Nothing here runs at play
time: the game is a set of Postgres functions (`supabase/migrations/20271126000000_hidden_word.sql`, levels in
`20271127000000_hidden_word_levels.sql`) that read the tables built here. No AI model is called during play.

## Two word sets (levels)

| level | pool | groups | similarity model | MORA |
|---|---|---|---|---|
| `basic` 기본 | 60 words (`src/pool_basic.tsv`) | 11 familiar groups + the show's 6 words | fastText 0.4 + bge-m3 0.6 (unchanged) | hw_cfg() as before |
| `plus` 확장 | 186 words (`src/pool_plus.tsv`) | 30 look-alike groups (감정, 직업, 장소, 음식, 문화, 과학, 때 …) | fastText 0.4 + bge-m3 0.3 + KURE-v2 0.3, compound rule by meaning | one warm-up, closes on the shared end, noise 3 |

Since `20271127100000_hidden_word_plus_game.sql` the `plus` level is its own game, 히든 워드 확장판 (`/hidden-word-plus`,
game id `hidden_word_plus`, board `hidden_word_plus`, crown `c-hidden_word_plus`); the data and build are unchanged.

Both share one vocabulary (`hw_vocab`, 78,016 typable words) and are built and loaded together. `<data>/levels.json`
says each level's pool, blend, rank curve and floor rules; build_game.py reads it (without it: one level, the old layout).
기본 is rebuilt to the exact same numbers as before for every word it had (checked cell by cell, 4.4M cells): its
neighbour words and dictionary relations are pinned to the first build (`rules.near_words`, `rules.relations`).

## How a similarity number is made

For a hidden word of the pool and any hint word, highest rule first:

1. **Association list** of the hidden word (`assoc/<word>.tsv`, AI-written and graded, 70–130 hints each,
   every meaning of a 다의어): the hint scores exactly the listed number.
2. Otherwise the highest of
   - **Embedding rank** → % (rank curve `CURVES['v2']` in `score_lib.py`), ranked among ~34k reference nouns.
     A level's blend (`score_lib.Blend`) is a weighted sum of z-scored cosine similarities. On its own it tops out
     at 93%, under the 95% cut.
   - **Compound**: the two words written together are a common web token (대기+열) → 90.
     확장 (`compound_by_meaning`): the hint gets what the whole word means to the hidden word, by a meaning model
     (KURE-v2), capped at 90: 수영+장 → 수영장 is close to 수영, 목+요일 → 목요일 is not close to 목.
   - **우리말샘 relation** (관계적 구조): 비슷한말 96, 상위어·하위어·반대말·대립어 85.
   - **Contains the hidden word** (딸기 → 딸기잼) → 95.
   - **Close neighbour of a listed hint** (케이크 → 케익): that hint's number minus 3–8.
   - 확장 (`no_ft_fallback`): a word fastText never saw (키큰동물, 펭수) is scored by the meaning models alone
     instead of 0, so MORA can read such hints.

## Models (local, on the Mac mini; licences allow this use)

| name | Hugging Face id | licence | used |
|---|---|---|---|
| fastText cc.ko.300 | Facebook fastText Common Crawl Korean | CC BY-SA 3.0 | 기본, 확장 |
| bge-m3 | `BAAI/bge-m3` | MIT | 기본, 확장 |
| KURE-v2 | `nlpai-lab/KURE-v2` (768-dim, Korean retrieval) | Apache-2.0 | 확장 |
| tried, not used | `nlpai-lab/KURE-v1` (MIT), `dragonkue/BGE-m3-ko` (Apache-2.0), `Qwen/Qwen3-Embedding-0.6B` (Apache-2.0), `intfloat/multilingual-e5-large-instruct` (MIT), `Snowflake/snowflake-arctic-embed-l-v2.0` (Apache-2.0) | | |

Checked on Hugging Face 2026-11-26. `google/embeddinggemma-300m` was skipped (gated, Gemma terms).

## Evaluation (`eval/`, `eval_models.py`, `eval_shown.py`)

- `eval/live_pairs.tsv`: the 260 most frequent hints players typed on 11/26 that are not on the word's list, graded by hand.
- `eval/design_pairs.tsv`: 266 hand-written pairs, strong to unrelated, 다의어 meanings, compounds, synonyms, category
  members, loose links, for 기본 words and 확장-type words (abstract, feelings, jobs, places, culture).
- `show_scores.json`: the 38 numbers seen on the show.

Model-only number (`eval_models.py`, Spearman ρ with the grades; conc = pairs of hints of one word put in the grades'
order; hi = pairs graded ≥85 in the model's top 300; AI@1 = a word's 95%+ hint alone points MORA at the right pool word):

| blend | live | design 기본 | design 확장 | show | conc | hi | lo | lists | AI@1 기본 | AI@1 확장 |
|---|---|---|---|---|---|---|---|---|---|---|
| ft 0.4 + bge-m3 0.6 (기본, before) | 0.298 | 0.645 | 0.618 | **0.716** | 0.766 | 0.84 | **0.89** | 0.418 | 0.559 | 0.414 |
| ft 0.4 + bge-m3 0.3 + KURE-v2 0.3 (확장) | **0.311** | **0.700** | **0.665** | 0.701 | **0.788** | **0.90** | 0.86 | **0.451** | **0.617** | **0.470** |
| KURE-v2 alone / Qwen3-0.6B alone / mE5-L-instruct alone | 0.284 / 0.236 / 0.178 | 0.648 / 0.601 / 0.664 | 0.685 / 0.536 / 0.559 | 0.670 / 0.592 / 0.508 | | | | | | |

The number shown for an unlisted hint (`eval_shown.py` on a build, live pairs): ρ 0.195 (기본 rules) → 0.290 with the
확장 blend and compound-by-meaning rule; on one-syllable hints 0.010 → 0.135. The old compound floor gave 90 to
syllable puns (목+요일, 발+신, 곰+문); dropping it for one-syllable hints alone (ρ 0.376) instead sank real compounds
(수영+장 17, 대기+권 14), so the whole-word rule is the one used.

기본 keeps its model and rules: the new blend is better on most columns but slightly worse on the show's own numbers
and on keeping unrelated words low, and the compound fix changes numbers players are used to. To move 기본 to the new
rules later, set its `blend`/`rules` in `levels.json` like 확장 (and drop `near_words`/`relations`), rebuild, load.

## The AI player

- Setting: it gives hints from its word's list — warm-ups under the cut (`aiWarm`, `aiWarmN`), then one at 95%+. The
  closing hint's place among its 95%+ hints, from the one that fits the most other pool words to the most specific, is
  `aiClose` per stage: 기본 0 / 0.5 / 1, 확장 0 / 0.15 / 0.4.
- Guessing: it only knows the embedding's own number (`feel`), never the score table: it picks the pool
  word most related to the hints shown as close and least to those shown as far, with a little noise (`aiNoise`).
  So it reasons from meaning, like a person, and a hint that fits a whole group really does hide the word.
- Rules and AI strength live in `hw_level_cfg()` (SQL) and in `simulate.py`'s arguments; keep the two in step.

## Simulations (`simulate.py`, 5,000 runs each; stand-in players)

| | 기본 | 확장 |
|---|---|---|
| MORA's word, my feel ±6 — found at stage 1 / 2 / 3 / missed | 38% / 44% / 13% / 5% | 36% / 40% / 16% / 7% |
| MORA's word, my feel ±10 | 31% / 46% / 16% / 7% | 27% / 41% / 20% / 12% |
| my word, plain hints — MORA finds it at 1 / 2 / 3 / never | 52% / 32% / 11% / 4% | 51% / 34% / 10% / 5% |
| whole match, plain player (±10): my points / MORA / win | 13.2 / 16.3 / 29% | 12.2 / 17.5 / 26% |
| whole match, sly player (±6) | 19.6 / 10.1 / 73% | 18.1 / 11.3 / 66% |

Live 기본 on 11/26 (2,248 finished matches): people found MORA's word 46% / 34% / 11% at stage 1 / 2 / 3, missed 8%;
14.4 points a match against MORA's 16.0, 39% wins.

## Build (Mac mini, working dir `~/puzzlthink-supabase/hidden-word`; word data stays out of the repo)

```bash
S=~/wallgo/scripts/hidden-word; export PYTHONPATH=$S; D=levels
# $D/src: pool_basic.tsv, pool_plus.tsv (group<TAB>words), vocab_basic_v2.txt and relations_basic_v2.txt (기본 pinned);
# $D/assoc/<word>.tsv for both pools (확장 lists from x1/src/assoc_new.txt via make_assoc.py in x1); $D/levels.json
.venv/bin/python $S/fetch_relations.py $D @$D/pool.txt        # 우리말샘 relations (key in ~/.config/opendict/key)
.venv/bin/python $S/build_vocab.py $D 40000 41100             # reference nouns + extras (Kiwi), fastText; keeps every old word
.venv/bin/python $S/embed_models.py $D --reuse v2 bge-m3 kure-v2   # old words keep their exact bge-m3 vectors
.venv/bin/python $S/build_game.py $D                          # per level -> $D/game/<level>, and the three load files
.venv/bin/python $S/eval_shown.py $D                          # shown numbers vs the evaluation grades
.venv/bin/python $S/simulate.py $D/game/basic 5000
.venv/bin/python $S/simulate.py $D/game/plus 5000 warm=70-82,78-88,85-93 noise=3 close=0,0.15,0.4 warmn=1-1
DB_NAME=hw_dev $S/load_game.sh $D/game                        # a scratch database first
.venv/bin/python $S/play_bots.py $D/game/plus psql:hw_dev 30 plus <test user id>   # whole matches, with checks
$S/load_game.sh $D/game                                       # the live database (needs 20271127000000 applied)
```

Comparing models: `embed_models.py <data> <name> ...` then `eval_models.py <data> <blend> ...` (set `EXTRA_ASSOC` to a
second assoc dir to include its lists). After editing a list only `make_assoc.py`, `build_game.py` and `load_game.sh`
need to run again, unless the list adds a word the vocabulary does not have yet (then from `build_vocab.py`).
Size: hw_targets 58 MB in Postgres (13 MB before), hw_vocab 6.6 MB, hw_hints 2.5 MB; the build takes ~5 minutes.

## Play log (from 11/28; backfilled to launch)

`20271128200000_hidden_word_log.sql` keeps every hint and answer of both games for good, without any account data:
`hw_log_hints`, `hw_log_answers`, `hw_log_refused` (words the game refused, e.g. not in the vocabulary). Rows of one
match share a keyed hash of the match id, not the id itself. Written by a trigger on `hw_games`, by `hw_act` (refused
words) and by the friend-room scoring functions.

```bash
S=~/wallgo/scripts/hidden-word
$S/backfill_log.sh ~/puzzlthink-supabase/hidden-word/backup/hw_games_snapshot_20261127_0924.sql.gz   # idempotent; prints the reconciliation
python3 $S/analyze_log.py missing --top 50        # hints players type that are not on the word's list → list candidates
python3 $S/analyze_log.py misscored --min 8       # numbers that look wrong against play
python3 $S/analyze_log.py words                   # per word / group: found at stage 1 / ever, by MORA and by players
python3 $S/analyze_log.py unknown                 # words the game lacks: vocabulary and new hidden-word candidates
python3 $S/analyze_log.py weekly                  # one line for the status report
python3 $S/analyze_log.py live-pairs --n 300 > /tmp/pairs.tsv   # fresh pairs to grade for eval/live_pairs.tsv
```
In 'misscored', "found" is the opponent's success in that stage; in AI matches that opponent is MORA, so a low rate
can mean MORA cannot read the hint (one-syllable hints like 열 for 대기) rather than a wrong number. Friend rooms,
where both sides are people, give the cleaner signal as they accumulate.
