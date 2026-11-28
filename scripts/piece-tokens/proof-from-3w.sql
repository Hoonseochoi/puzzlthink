-- Proof for 20271203100000_piece_tokens_from_3w.sql: ONE transaction ending in ROLLBACK. Inline the \i lines before piping into the container.
\set ON_ERROR_STOP 1
\pset footer off
begin;
set local statement_timeout = '180s';
create temp table members on commit drop as
  select id as user_id from public.profiles union select distinct user_id from public.game_results union select distinct user_id from public.piece_spends;
create temp table snap_before on commit drop as select
  (select md5(string_agg(t::text, '|' order by t.rank)) from public.competition_ranking(500) t) as board,
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.black_piece_rows(public.hell_week_of(now())) t) as bp,
  (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.hall_ranking() t) as hall,
  (select sum(public.piece_balance(m.user_id)) from members m) as spendable,
  (select count(*) from public.piece_token_grants) as grant_rows, (select sum(amount) from public.piece_token_grants) as grant_sum,
  (select count(*) from public.piece_token_grants where seen_at is not null) as seen_rows,
  (select count(*) from public.piece_spends where from_tokens > 0) as token_spends;
\echo '===== live state before (inside the transaction)'
select spendable, grant_rows, grant_sum, seen_rows, token_spends from snap_before;
create temp table seen_members on commit drop as select user_id from public.piece_token_grants where seen_at is not null;

\i /Users/hoons/wallgo/.claude/worktrees/piece-wallet-c71265/supabase/migrations/20271203100000_piece_tokens_from_3w.sql
\i /Users/hoons/wallgo/.claude/worktrees/piece-wallet-c71265/supabase/migrations/20271203100000_piece_tokens_from_3w.sql
\echo '(applied twice: idempotent)'

\echo '===== boards unchanged'
select b.board = (select md5(string_agg(t::text, '|' order by t.rank)) from public.competition_ranking(500) t) as competition_ranking_500,
       b.bp = (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.black_piece_rows(public.hell_week_of(now())) t) as black_piece_rows,
       b.hall = (select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from public.hall_ranking() t) as hall_ranking
  from snap_before b;

\echo '===== balances now = this week''s pieces only (independent: the pre-#278 formula, 2W wins capped 5 − 2W spends)'
create temp table indep on commit drop as
with w as (select r.user_id, r.played_at < timestamptz '2026-11-25 00:00+09' as w1, r.game, count(*) n from public.game_results r
            where r.mode = 'ai' and r.result = 'win' and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items')
              and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker') and r.played_at < timestamptz '2026-12-02 00:00+09' group by 1, 2, 3)
select m.user_id,
       coalesce((select sum(least(n, 30)) from w where w.user_id = m.user_id and w.w1), 0) as e1,
       coalesce((select sum(least(n, 5)) from w where w.user_id = m.user_id and not w.w1), 0)
         + coalesce((select sum(g.amount) from public.piece_grants g where g.user_id = m.user_id and g.period = 2), 0) as e2,
       coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = m.user_id and x.spent_at >= timestamptz '2026-11-25 00:00+09'), 0) as s2
  from members m;
create temp table now_bal on commit drop as select user_id, public.piece_balance(user_id) b, public.piece_token_balance(user_id) tok, public.piece_current_pieces(user_id) cur from members;
select count(*) as members, sum(n.b) as spendable_after, (select spendable from snap_before) as spendable_before,
       count(*) filter (where n.b <> greatest(0, i.e2 - i.s2)) as differs_from_independent,
       count(*) filter (where n.b > i.e2) as above_2w_pieces, count(*) filter (where n.tok <> 0) as tokens_nonzero,
       (select count(*) from public.piece_token_grants) as grant_rows, (select count(*) from public.contest_frozen where kind = 'piece_exchange') as exchange_markers
  from now_bal n join indep i using (user_id);
\echo 'a member who saw today''s popup: news now'
select set_config('request.jwt.claims', json_build_object('sub', (select user_id from seen_members limit 1))::text, true) is not null as as_member;
select public.my_piece_news() as news_now;
reset request.jwt.claims;
\echo 'the weekly job and piece_exchange(1), (2) today write no tokens'
select public.finalize_piece_weeks(); select public.piece_exchange(1); select public.piece_exchange(2);
select (select count(*) from public.piece_token_grants) as grant_rows_after_job;

\echo '===== time travel: 2026-12-02 00:03 KST (before the job runs)'
create temp table tt on commit drop as
  select i.user_id, i.e1, greatest(0, i.e2 - i.s2) as left2, public.piece_token_balance(i.user_id, timestamptz '2026-12-02 00:03+09') as tok,
         public.piece_current_pieces(i.user_id, timestamptz '2026-12-02 00:03+09') as cur3
    from indep i;
select count(*) filter (where tok > 0) as members_with_tokens, sum(tok) as tokens_total, sum(e1) as unspent_1w, sum(left2) as unspent_2w,
       count(*) filter (where tok <> e1 + left2) as differs, count(*) filter (where cur3 <> 0) as nonzero_3w,
       (select count(*) from public.piece_race_rows(3, timestamptz '2026-12-02 00:03+09')) as board_3w_rows
  from tt;
\echo 'sample (masked)'
select left(coalesce(p.nickname, '?'), 1) || '***' as nick, t.e1 as w1_left, t.left2 as w2_left, t.tok as tokens_at_0003
  from tt t left join public.profiles p on p.id = t.user_id where t.e1 > 0 and t.left2 > 0 order by t.tok desc limit 5;
\echo 'exchange rows written at 00:03 (as a spend or the job would), then one combined news item per member'
select count(*) from (select public.piece_settle(user_id, timestamptz '2026-12-02 00:03+09') from tt where tok > 0) s;
select count(distinct user_id) as members, count(*) as rows, sum(amount) as tokens, count(*) filter (where seen_at is not null) as already_seen,
       count(*) filter (where period = 1) as p1_rows, count(*) filter (where period = 2) as p2_rows from public.piece_token_grants;
select set_config('request.jwt.claims', json_build_object('sub', (select user_id from seen_members limit 1))::text, true) is not null as as_seen_member;
select jsonb_array_length(public.my_piece_news()) as items, public.my_piece_news() -> 0 ->> 'amount' as amount, public.my_piece_news() -> 0 ->> 'periods' as periods,
       (select tok from tt where user_id = (select user_id from seen_members limit 1)) as expected;
select public.mark_piece_news_seen(array[(public.my_piece_news() -> 0 ->> 'id')::int], '{}');
select jsonb_array_length(public.my_piece_news()) as items_after_seen;
reset request.jwt.claims;
rollback;
