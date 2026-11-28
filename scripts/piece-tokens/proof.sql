-- 현자의 징표 / 명제 바둑 rewards: proof run for 20271203000000_piece_tokens.sql inside ONE transaction ending in ROLLBACK.
-- Inline the \i lines before piping into the container (psql runs inside docker and cannot see this path).
\set ON_ERROR_STOP 1
\pset footer off
begin;
set local statement_timeout = '180s';

-- ===== throwaway members (created before the migration so 1W exchange sees them; excluded from the member totals)
-- T time travel · D ledger · E straddle · B1..B4 명제 바둑
set local session_replication_role = replica;  -- no triggers (signup, badges, live events) for throwaway rows
insert into auth.users (id, aud, role, email)
select ('00000000-0000-4000-8000-0000000000' || s)::uuid, 'authenticated', 'authenticated', 'throwaway-' || s || '@example.invalid'
  from unnest(array['a1', 'd1', 'e1', 'b1', 'b2', 'b3', 'b4']) s;
insert into public.profiles (id, nickname, show_in_hall)
select ('00000000-0000-4000-8000-0000000000' || s)::uuid, 'zz-test-' || s, true from unnest(array['a1', 'd1', 'e1', 'b1', 'b2', 'b3', 'b4']) s;
create temp table testers on commit drop as select ('00000000-0000-4000-8000-0000000000' || s)::uuid as user_id from unnest(array['a1', 'd1', 'e1', 'b1', 'b2', 'b3', 'b4']) s;
insert into public.game_results (id, user_id, game, mode, result, detail, played_at)
select gen_random_uuid(), u::uuid, g, 'ai', 'win', '{"difficulty":"hard"}', t from (
  select '00000000-0000-4000-8000-0000000000a1' u, 'wallgo' g, timestamptz '2026-11-20 12:00+09' + n * interval '1 minute' t from generate_series(1, 40) n   -- T 1W: 40 → 30
  union all select '00000000-0000-4000-8000-0000000000a1', 'wallgo', timestamptz '2026-11-27 12:00+09' + n * interval '1 minute' from generate_series(1, 8) n -- T 2W wallgo 8 → 5
  union all select '00000000-0000-4000-8000-0000000000a1', 'janggi', timestamptz '2026-11-27 13:00+09' + n * interval '1 minute' from generate_series(1, 3) n -- T 2W janggi 3
  union all select '00000000-0000-4000-8000-0000000000d1', 'wallgo', timestamptz '2026-11-20 12:00+09'                                                   -- D 1W: 1
  union all select '00000000-0000-4000-8000-0000000000d1', 'wallgo', timestamptz '2026-11-27 12:00+09' union all select '00000000-0000-4000-8000-0000000000d1', 'janggi', timestamptz '2026-11-27 12:00+09' -- D 2W: 2
  union all select '00000000-0000-4000-8000-0000000000e1', 'wallgo', timestamptz '2026-11-20 12:00+09'                                                   -- E 1W: 1
  union all select '00000000-0000-4000-8000-0000000000e1', 'wallgo', timestamptz '2026-11-27 12:00+09') s;                                              -- E 2W: 1
set local session_replication_role = origin;

-- ===== BEFORE
create temp table members on commit drop as
  select id as user_id from public.profiles union select distinct user_id from public.game_results union select distinct user_id from public.piece_spends;
delete from members where user_id in (select user_id from testers);
create temp table bal_before on commit drop as select user_id, public.piece_balance(user_id) as b from members;
create temp table board_before on commit drop as select * from public.competition_ranking(500);
create temp table hashes on commit drop as select 'before'::text as at,
  (select md5(string_agg(t::text, '|' order by t.rank)) from public.competition_ranking(500) t) as board2,
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.black_piece_rows(public.hell_week_of(now())) t) as bp_now,
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.black_piece_rows(1) t) as bp_1,
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.hall_ranking() t) as hall,
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from (select game, count(*) from public.hard_clears group by game) t) as hc,
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.piece_race_final t) as prf,
  (select md5(string_agg(t::text, '|' order by t.rank)) from public.competition_final(1, 100) t) as board1,
  (select md5(coalesce(string_agg(m.user_id::text || ':' || public.lounge_pieces(m.user_id), '|' order by m.user_id), '')) from members m) as lounge;
-- old 2W race of every member (the live formula before this migration), for the full-board comparison
create temp table race_old on commit drop as
with w as (select r.user_id, r.game, count(*) n, max(r.played_at) l from public.game_results r
            where r.mode = 'ai' and r.result = 'win' and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items')
              and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
              and r.played_at >= timestamptz '2026-11-25 00:00+09' and r.played_at < timestamptz '2026-12-02 00:00+09' group by 1, 2)
select w.user_id, sum(least(w.n, 5)) - coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = w.user_id and x.spent_at >= timestamptz '2026-11-25 00:00+09'), 0) as pieces
  from w group by w.user_id;

-- ===== MIGRATION (twice: idempotent)
\timing on
\i /Users/hoons/wallgo/.claude/worktrees/piece-wallet-c71265/supabase/migrations/20271203000000_piece_tokens.sql
\i /Users/hoons/wallgo/.claude/worktrees/piece-wallet-c71265/supabase/migrations/20271203000000_piece_tokens.sql
\timing off
\echo '(migration applied twice: idempotent)'

\echo '===== C1. applying it changes nothing on the boards (hash before = after)'
insert into hashes select 'after',
  (select md5(string_agg(t::text, '|' order by t.rank)) from public.competition_ranking(500) t),
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.black_piece_rows(public.hell_week_of(now())) t),
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.black_piece_rows(1) t),
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.hall_ranking() t),
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from (select game, count(*) from public.hard_clears group by game) t),
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.piece_race_final t),
  (select md5(string_agg(t::text, '|' order by t.rank)) from public.competition_final(1, 100) t),
  (select md5(coalesce(string_agg(m.user_id::text || ':' || public.lounge_pieces(m.user_id), '|' order by m.user_id), '')) from members m);
select b.board2 = a.board2 as "2W board (top 100, with prev_rank)", b.board1 = a.board1 as "1W board", b.prf = a.prf as piece_race_final,
       b.bp_now = a.bp_now as black_piece_rows_now, b.bp_1 = a.bp_1 as black_piece_rows_w1, b.hall = a.hall as hall_ranking,
       b.hc = a.hc as hard_clear_counts, b.lounge = a.lounge as lounge_pieces
  from hashes b, hashes a where b.at = 'before' and a.at = 'after';
select count(*) as members_in_2w_race, count(*) filter (where n.pieces is distinct from o.pieces) as race_count_changed
  from race_old o left join public.piece_race_rows(2) n using (user_id) where o.user_id not in (select user_id from testers);

\echo '===== C2. spendable (tokens + this period''s pieces) before vs after'
create temp table indep on commit drop as
select m.user_id, (select coalesce(sum(least(t.n, 30)), 0) from (select count(*) n from public.game_results r where r.user_id = m.user_id and r.mode = 'ai' and r.result = 'win'
          and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items') and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
          and r.played_at < timestamptz '2026-11-25 00:00+09' group by r.game) t) as e1
  from members m;
create temp table bal_after on commit drop as
  select user_id, public.piece_balance(user_id) as b, public.piece_token_balance(user_id) as tok, public.piece_current_pieces(user_id) as cur from members;
select count(*) as members, count(*) filter (where a.b <> b.b) as changed, count(*) filter (where a.b < b.b) as went_down,
       sum(b.b) as spendable_before, sum(a.b) as spendable_after, sum(a.b - b.b) as increase, sum(a.tok) as tokens, sum(a.cur) as pieces_2w
  from bal_before b join bal_after a using (user_id);
select count(*) filter (where a.b - b.b <> i.e1) as "increase <> 1W pieces (independent)",
       count(*) filter (where a.tok <> i.e1) as "tokens <> 1W pieces",
       count(*) filter (where a.cur <> b.b) as "2W pieces changed"
  from bal_before b join bal_after a using (user_id) join indep i using (user_id);
select count(*) as token_grant_rows, sum(amount) as tokens_granted from public.piece_token_grants where period = 1 and user_id not in (select user_id from testers);
select (select count(*) from public.piece_race_final where week = 1) as w1_board_rows, (select sum(pieces) from public.piece_race_final where week = 1) as w1_board_pieces;
\echo 'members with 1W pieces who are not on the frozen 1W board, and pieces that differ from it'
select count(*) filter (where f.user_id is null) as not_on_board, coalesce(sum(i.e1) filter (where f.user_id is null), 0) as their_pieces,
       count(*) filter (where f.user_id is not null and f.pieces <> i.e1) as board_differs, coalesce(sum(i.e1 - f.pieces) filter (where f.user_id is not null), 0) as diff_sum
  from indep i left join public.piece_race_final f on f.week = 1 and f.user_id = i.user_id where i.e1 > 0;
\echo 'distribution of the increase (= tokens)'
select case when d = 0 then '0' when d <= 5 then '1-5' when d <= 20 then '6-20' when d <= 50 then '21-50' when d <= 100 then '51-100' else '>100' end as increase,
       count(*) as members, sum(d) as pieces
  from (select a.b - b.b as d from bal_before b join bal_after a using (user_id)) t group by 1 order by min(d);

\echo '===== timing (live 2W, before any freeze)'
create temp table heavy on commit drop as select user_id from public.game_results group by user_id order by count(*) desc limit 5;
select h.user_id is not null, (select count(*) from public.game_results r where r.user_id = h.user_id) as result_rows from heavy h;
\timing on
select public.piece_balance(user_id) from heavy;
select public.piece_balance(user_id) from heavy;
select count(*) from public.competition_ranking(50);
select count(*) from public.competition_ranking(50);
select count(*) from public.competition_final(1, 50);
\timing off
\echo '===== C4. ledger through spend_currency (real now, period 2)'
select public.piece_token_balance('00000000-0000-4000-8000-0000000000d1') as d_tokens, public.piece_current_pieces('00000000-0000-4000-8000-0000000000d1') as d_pieces, public.piece_balance('00000000-0000-4000-8000-0000000000d1') as d_balance;
select i as attempt, public.spend_currency('00000000-0000-4000-8000-0000000000d1', 'piece', 1, 'test', 'hint') as left_after from generate_series(1, 4) i;
select amount, from_tokens, amount - from_tokens as from_pieces from public.piece_spends where user_id = '00000000-0000-4000-8000-0000000000d1' order by id;
\echo 'straddle: E has 1 token + 1 piece, one spend of 2'
select public.piece_token_balance('00000000-0000-4000-8000-0000000000e1') as e_tokens, public.piece_current_pieces('00000000-0000-4000-8000-0000000000e1') as e_pieces;
select public.spend_currency('00000000-0000-4000-8000-0000000000e1', 'piece', 2, 'test', 'item') as left_after, public.spend_currency('00000000-0000-4000-8000-0000000000e1', 'piece', 1, 'test', 'item') as next_refused;
select amount, from_tokens, amount - from_tokens as from_pieces from public.piece_spends where user_id = '00000000-0000-4000-8000-0000000000e1' order by id;
\echo 'wallet payloads now carry tokens'
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-0000000000a1"}';
select public.my_wallet();
reset request.jwt.claims;

\echo '===== C5. 명제 바둑 (a fake day 11/27 with only throwaway runs)'
insert into public.prop_days (day, puzzles) values ('2026-11-27', (select puzzles from public.prop_days where day = '2026-11-28'));
insert into public.prop_runs (user_id, day) select user_id, '2026-11-27' from testers where user_id::text like '%00b_';
-- B1 4:59 ranked (4:29 + one 피스 hint 0:30), B2 5:01, B3 flagged fast, B4 6:00 no hints
update public.prop_runs set result = 'clear', ms = 269000, penalty_ms = 30000, hints = '{1,0,0}', finished_at = timestamptz '2026-11-27 20:00+09' where day = '2026-11-27' and user_id = '00000000-0000-4000-8000-0000000000b1';
update public.prop_runs set result = 'clear', ms = 301000, penalty_ms = 0, finished_at = timestamptz '2026-11-27 20:01+09' where day = '2026-11-27' and user_id = '00000000-0000-4000-8000-0000000000b2';
update public.prop_runs set result = 'clear', ms = 14000, penalty_ms = 0, flag = 'fast', finished_at = timestamptz '2026-11-27 20:02+09' where day = '2026-11-27' and user_id = '00000000-0000-4000-8000-0000000000b3';
update public.prop_runs set result = 'clear', ms = 360000, penalty_ms = 0, finished_at = timestamptz '2026-11-27 20:03+09' where day = '2026-11-27' and user_id = '00000000-0000-4000-8000-0000000000b4';
update public.prop_runs set result = 'clear' where day = '2026-11-27' and user_id = '00000000-0000-4000-8000-0000000000b1';  -- a second call: pays nothing
insert into public.piece_grants (user_id, source, day, amount, period) values ('00000000-0000-4000-8000-0000000000b1', 'prop_fast', '2026-11-27', 1, 2) on conflict do nothing;
select p.nickname, r.ms + r.penalty_ms as ranked_ms, r.flag, (select coalesce(sum(g.amount), 0) from public.piece_grants g where g.user_id = r.user_id and g.source = 'prop_fast') as fast_reward
  from public.prop_runs r join public.profiles p on p.id = r.user_id where r.day = '2026-11-27' order by 1;
select (public.prop_result(r.id) -> 'reward') as b1_result_reward from public.prop_runs r where r.day = '2026-11-27' and r.user_id = '00000000-0000-4000-8000-0000000000b1';
\echo 'settlement: at 11/28 00:05 nothing (the day can still finish), at 00:12 the three, again: nothing more'
select public.prop_settle_podium(timestamptz '2026-11-28 00:05+09');
select count(*) as top_grants_at_0005 from public.piece_grants where source = 'prop_top' and day = '2026-11-27';
select public.prop_settle_podium(timestamptz '2026-11-28 00:12+09');
select public.prop_settle_podium(timestamptz '2026-11-28 00:20+09');
select public.finalize_piece_weeks();
select g.rank, p.nickname, g.amount, g.period, x.total as ranked_ms from public.piece_grants g join public.profiles p on p.id = g.user_id
  left join public.prop_rank_rows('2026-11-27') x on x.user_id = g.user_id where g.source = 'prop_top' and g.day = '2026-11-27' order by g.rank;
select count(*) as prop_top_rows_for_1127 from public.piece_grants where source = 'prop_top' and day = '2026-11-27';
\echo 'they count in the 2W race (per_game proposition_go) and in the balance'
select p.nickname, r.pieces, r.per_game from public.piece_race_rows(2) r join public.profiles p on p.id = r.user_id where p.nickname like 'zz-test-b%' order by 1;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-0000000000b1"}';
select jsonb_pretty(public.my_piece_news()) as b1_news;
select public.mark_piece_news_seen('{}', (select array_agg(id) from public.piece_grants where user_id = '00000000-0000-4000-8000-0000000000b1'));
select jsonb_array_length(public.my_piece_news()) as b1_news_after_seen;
reset request.jwt.claims;

\echo '===== C3. time travel across 12/02 (throwaway T: 1W 30, 2W 8)'
select public.piece_token_balance(u.id) as t_tokens, public.piece_current_pieces(u.id) as t_2w_pieces from (select '00000000-0000-4000-8000-0000000000a1'::uuid id) u;
insert into public.piece_spends (user_id, amount, reason, spent_at) values ('00000000-0000-4000-8000-0000000000a1', 2, 'test:x', timestamptz '2026-11-29 12:00+09');
select spent_at, amount, from_tokens, amount - from_tokens as from_pieces from public.piece_spends where user_id = '00000000-0000-4000-8000-0000000000a1' order by id;
select public.piece_token_balance('00000000-0000-4000-8000-0000000000a1', timestamptz '2026-11-29 12:01+09') as tokens_after_2w_spend,
       public.piece_current_pieces('00000000-0000-4000-8000-0000000000a1', timestamptz '2026-11-29 12:01+09') as pieces_2w_after,
       (select pieces from public.piece_race_rows(2) where user_id = '00000000-0000-4000-8000-0000000000a1') as t_2w_race;
\echo 'periods around 12/02'
select t as at, public.piece_period_of(t) as period from unnest(array[timestamptz '2026-12-01 23:59:59+09', timestamptz '2026-12-02 00:00+09', timestamptz '2026-12-09 00:00+09']) t;
\echo '12/02 00:03, the weekly job has not run yet: 2W pieces already count as (pending) tokens, 3W is empty'
select public.piece_token_balance('00000000-0000-4000-8000-0000000000a1', timestamptz '2026-12-02 00:03+09') as tokens_pending_incl,
       public.piece_current_pieces('00000000-0000-4000-8000-0000000000a1', timestamptz '2026-12-02 00:03+09') as pieces_3w,
       (select count(*) from public.piece_race_rows(3, timestamptz '2026-12-02 00:03+09')) as board_3w_rows;
\echo 'a spend at 12/02 00:03 settles T''s own exchange row, then pays from tokens'
insert into public.piece_spends (user_id, amount, reason, spent_at) values ('00000000-0000-4000-8000-0000000000a1', 1, 'test:x', timestamptz '2026-12-02 00:03+09');
select period, amount from public.piece_token_grants where user_id = '00000000-0000-4000-8000-0000000000a1' order by period;
\echo 'the weekly job at 12/02 00:05 (period 3 → freeze 2, exchange 2), done here by its two steps'
create temp table w2_live on commit drop as select * from public.piece_race_rows(2);
select public.piece_race_freeze(2); select public.piece_exchange(2);
select public.piece_race_freeze(2); select public.piece_exchange(2);  -- again: nothing happens twice
select (select count(*) from public.contest_frozen where kind = 'piece' and week = 2) as frozen_flag,
       (select count(*) from public.contest_frozen where kind = 'piece_exchange' and week = 2) as exchanged_flag,
       (select count(*) from public.piece_race_final where week = 2) as w2_frozen_rows,
       (select count(*) from public.piece_race_final f join w2_live l using (user_id) where f.week = 2 and f.pieces <> l.pieces) as frozen_differs_from_live,
       (select count(*) from public.piece_token_grants where period = 2) as w2_exchange_rows,
       (select sum(amount) from public.piece_token_grants where period = 2) as w2_tokens,
       (select sum(pieces) from w2_live where pieces > 0) as w2_unspent_pieces,
       (select array_agg(icon order by icon) from public.profile_icons where icon like 'w2-%') as w2_icons;
create temp table w2_hash on commit drop as select md5(string_agg(f::text, '|' order by f.rank)) h from public.piece_race_final f where f.week = 2;
\echo '3W: T wins twice on 12/03, then spends 36 on 12/04 (tokens 35 first, then 1 of 3W) and 1 on 12/05 (3W only)'
set local session_replication_role = replica;
insert into public.game_results (id, user_id, game, mode, result, detail, played_at)
select gen_random_uuid(), '00000000-0000-4000-8000-0000000000a1', 'wallgo', 'ai', 'win', '{"difficulty":"hard"}', timestamptz '2026-12-03 12:00+09' + n * interval '1 minute' from generate_series(1, 2) n;
set local session_replication_role = origin;
select public.piece_token_balance('00000000-0000-4000-8000-0000000000a1', timestamptz '2026-12-04 00:00+09') as tokens, public.piece_current_pieces('00000000-0000-4000-8000-0000000000a1', timestamptz '2026-12-04 00:00+09') as pieces_3w;
insert into public.piece_spends (user_id, amount, reason, spent_at) values ('00000000-0000-4000-8000-0000000000a1', 36, 'test:x', timestamptz '2026-12-04 12:00+09');
insert into public.piece_spends (user_id, amount, reason, spent_at) values ('00000000-0000-4000-8000-0000000000a1', 1, 'test:x', timestamptz '2026-12-05 12:00+09');
select spent_at, amount, from_tokens, amount - from_tokens as from_pieces from public.piece_spends where user_id = '00000000-0000-4000-8000-0000000000a1' order by id;
select public.piece_token_balance('00000000-0000-4000-8000-0000000000a1', timestamptz '2026-12-06 00:00+09') as tokens_now, public.piece_current_pieces('00000000-0000-4000-8000-0000000000a1', timestamptz '2026-12-06 00:00+09') as pieces_3w_now,
       (select pieces from public.piece_race_rows(3) where user_id = '00000000-0000-4000-8000-0000000000a1') as t_3w_race,
       (select md5(string_agg(f::text, '|' order by f.rank)) from public.piece_race_final f where f.week = 2) = (select h from w2_hash) as frozen_2w_unchanged,
       (select pieces from public.piece_board(2, 100) where nickname = 'zz-test-a1') as t_on_frozen_2w_board;

rollback;
