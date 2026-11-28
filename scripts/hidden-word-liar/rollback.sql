-- Roll back 20271205000000_hidden_word_liar.sql. Results already written stay in game_results / piece_grants /
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
  public.hwl_settle(text), public.hwl_settle_turn(text), public.hwl_begin(text, smallint[]), public.hwl_alive(text),
  public.hwl_new_code(), public.hwl_member(text, text), public.hwl_bump(text), public.hwl_norm(text), public.hwl_cfg();
drop table if exists public.hwl_offer_members, public.hwl_offers, public.hwl_queue, public.hwl_votes, public.hwl_clues,
  public.hwl_members, public.hwl_results, public.hwl_rooms;
delete from public.game_crowns where game = 'hidden_word_liar';
notify pgrst, 'reload schema';
