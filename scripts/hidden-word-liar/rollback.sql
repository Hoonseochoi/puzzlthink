-- Roll back 20271205100000_hidden_word_liar.sql. Results already written stay in game_results / piece_grants /
-- profile_icons (delete them by hand if wanted: game = 'hidden_word_liar', source in ('liar_win','liar_cit'),
-- icon in ('lw','c-hidden_word_liar')); the extended CHECK constraints are left as they are (a superset is harmless).
do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'hwl-tick';
  end if;
end $$;
drop function if exists public.hwl_q_answer(uuid, boolean), public.hwl_q_leave(), public.hwl_q_ping(), public.hwl_q_join(text),
  public.hwl_q_state(), public.hwl_q_match(), public.hwl_q_resolve(uuid), public.hwl_q_send(uuid, text, jsonb), public.hwl_cron(),
  public.hwl_refresh_crown(), public.hwl_my_stats(), public.hwl_ranking(int), public.hwl_rank_rows(), public.hwl_view(text, text),
  public.hwl_tick(text), public.hwl_ready(text, text, boolean), public.hwl_guess(text, text, text), public.hwl_vote(text, text, int),
  public.hwl_talk(text, text, text), public.hwl_clue(text, text, text, boolean), public.hwl_start(text, text), public.hwl_kick(text, text, int),
  public.hwl_leave(text, text), public.hwl_join(text, text, text), public.hwl_create(text, text), public.hwl_nick(text),
  public.hwl_step(text), public.hwl_after_vote(text), public.hwl_after_talk(text), public.hwl_finish(text, text, text),
  public.hwl_settle(text), public.hwl_pieces_today(uuid), public.hwl_settle_turn(text), public.hwl_begin(text, smallint[]), public.hwl_alive(text),
  public.hwl_new_code(), public.hwl_member(text, text), public.hwl_bump(text), public.hwl_norm(text), public.hwl_cfg();
drop table if exists public.hwl_offer_members, public.hwl_offers, public.hwl_queue, public.hwl_votes, public.hwl_clues,
  public.hwl_members, public.hwl_results, public.hwl_rooms;
delete from public.game_crowns where game = 'hidden_word_liar';

-- piece_race_rows back to its definition before this migration (every grant under 'proposition_go').
CREATE OR REPLACE FUNCTION public.piece_race_rows(p_period integer, p_cut timestamp with time zone DEFAULT 'infinity'::timestamp with time zone)
 RETURNS TABLE(user_id uuid, pieces bigint, per_game jsonb, last_win timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with b as (
    select bb.starts, least(bb.ends, p_cut) as cut from public.piece_period_bounds(p_period) bb
  ), hard as (
    select r.user_id, r.game, r.played_at, row_number() over (partition by r.user_id, r.game order by r.played_at) as nth
      from public.game_results r, b
     where r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items')
       and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
       and r.played_at >= b.starts and r.played_at < b.cut
  ), per as (
    select h.user_id, h.game, count(*)::bigint as n, max(h.played_at) as last_at
      from hard h where h.nth <= public.piece_period_cap(p_period) group by h.user_id, h.game
    union all
    select g.user_id, 'proposition_go', sum(g.amount)::bigint, max(g.created_at)
      from public.piece_grants g, b where g.period = p_period and g.created_at < b.cut group by g.user_id
  ), earned as (
    select p.user_id, sum(p.n)::bigint as n, jsonb_object_agg(p.game, p.n) as per_game, max(p.last_at) as last_at
      from (select q.user_id, q.game, sum(q.n)::bigint as n, max(q.last_at) as last_at from per q group by q.user_id, q.game) p
     group by p.user_id
  ), spent as (
    select x.user_id, sum(x.amount - x.from_tokens)::bigint as n
      from public.piece_spends x, b where x.spent_at >= b.starts and x.spent_at < b.cut group by x.user_id
  )
  select e.user_id, e.n - coalesce(s.n, 0), e.per_game, e.last_at
    from earned e left join spent s on s.user_id = e.user_id;
$function$;

notify pgrst, 'reload schema';
