-- AI 헬모드 page: the 매우 어려움 AI's own record per game ("AI 47승 0패"), from every signed-in player's hell games.
-- AI wins = players' losses, AI losses = players' wins. 벽바둑 counts 1:1 games only (same as is_hell_clear).
-- Answered from a 60-second cache (rpc_cache) since the hell page and the home banner are public.
create or replace function public.hell_ai_record_live()
returns table(game text, ai_wins integer, ai_losses integer, draws integer)
language sql stable security definer set search_path = public as $$
  select r.game,
         count(*) filter (where r.result = 'loss')::int,
         count(*) filter (where r.result = 'win')::int,
         count(*) filter (where r.result = 'draw')::int
    from public.game_results r
   where r.game in ('wallgo2', 'wallgo', 'janggi', 'russian_janggi', 'blind_gomoku')
     and r.mode = 'ai'
     and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hell'
     and (r.game not in ('wallgo', 'wallgo2') or coalesce(r.detail ->> 'players', '') = '2')
   group by r.game;
$$;
revoke all on function public.hell_ai_record_live() from public, anon, authenticated;

create or replace function public.hell_ai_record()
returns table(game text, ai_wins integer, ai_losses integer, draws integer)
language plpgsql security definer set search_path = public as $$
declare j jsonb;
begin
  j := public.rpc_cache_get('hell_ai_record', interval '60 seconds');
  if j is null then
    select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) into j from public.hell_ai_record_live() t;
    perform public.rpc_cache_put('hell_ai_record', j);
  end if;
  return query select * from jsonb_to_recordset(j) as x(game text, ai_wins integer, ai_losses integer, draws integer);
end; $$;
revoke all on function public.hell_ai_record() from public;
grant execute on function public.hell_ai_record() to anon, authenticated;

notify pgrst, 'reload schema';
