# 히든 워드 game data

Builds the similarity tables and AI hint lists for the 히든 워드 AI match. Nothing here runs at play
time: the game is a set of Postgres functions (`supabase/migrations/20271126000000_hidden_word.sql`)
that read the tables built here. No AI model is called during play.

## How a similarity number is made

For a hidden word of the pool and any hint word, highest rule first:

1. **Association list** of the hidden word (`assoc/<word>.tsv`, AI-written and graded, 70–130 hints each,
   every meaning of a 다의어): the hint scores exactly the listed number.
2. Otherwise the highest of
   - **Embedding rank** → % (`RANK_CURVE` in `score_lib.py`). Blend of fastText Common Crawl vectors
     (문맥적 공생) and `BAAI/bge-m3` (의미적 거리), z-scored, 0.4 : 0.6, ranked among ~34k reference nouns.
     On its own it tops out at 93%, under the 95% cut.
   - **Compound**: the two words written together are a common web token (대기+열) → 90.
   - **우리말샘 relation** (관계적 구조): 비슷한말 96, 상위어·하위어·반대말·대립어 85.
   - **Contains the hidden word** (딸기 → 딸기잼) → 95.
   - **Close neighbour of a listed hint** (케이크 → 케익): that hint's number minus 3–8.

The embedding blend alone tracks the numbers seen on the show only loosely (rank correlation 0.69 over
38 pairs, whatever the weights), so the lists carry the quality; the embedding fills in everything else.

## The AI player

- Setting: it gives hints from its word's list — one or two warm-ups under the cut, then one at 95%+.
  Stage 1 closes with the hint that fits the most other pool words, stage 3 with the one that fits the fewest.
- Guessing: it only knows the embedding's own number (`feel`), never the score table: it picks the pool
  word most related to the hints shown as close and least to those shown as far, with a little noise.
  So it reasons from meaning, like a person, and a hint that fits a whole group really does hide the word.

## Build (Mac mini, working dir `~/puzzlthink-supabase/hidden-word`; word data stays out of the repo)

```bash
S=~/wallgo/scripts/hidden-word; export PYTHONPATH=$S; D=v2
(cd $D && ../.venv/bin/python $S/make_assoc.py)       # src/pool.tsv + src/assoc_new.txt -> pool.txt, assoc/*.tsv
.venv/bin/python $S/fetch_relations.py $D @$D/pool.txt # 우리말샘 relations (key in ~/.config/opendict/key)
.venv/bin/python $S/build_vocab.py $D                  # reference nouns + extras (Kiwi), fastText vectors
.venv/bin/python $S/embed.py $D                        # bge-m3 vectors + blend stats
.venv/bin/python $S/build_game.py $D                   # score tables, AI feel, AI hint lists -> $D/game
.venv/bin/python $S/check_scores.py $D                 # against the show's numbers; or: check_scores.py $D 딸기 케이크 봄
.venv/bin/python $S/simulate.py $D 4000                # stand-in players: is the match balanced?
$S/load_game.sh $D/game                                # replaces hw_vocab / hw_targets / hw_hints in one transaction
.venv/bin/python $S/play_bots.py $D ~/wallgo/.env.local 20   # whole matches against the live functions, with checks
```

Rules and AI strength live in `hw_cfg()` (SQL) and at the top of `simulate.py`; keep the two in step.
After editing a list only `make_assoc.py`, `build_game.py` and `load_game.sh` need to run again, unless
the list adds a word the vocabulary does not have yet (then from `build_vocab.py`).
