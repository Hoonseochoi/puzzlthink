-- 슬리더링크 map history: who first cleared a board (NEW) and each takeover after, with times, oldest first.
create or replace function public.slither_history(p_id text)
returns table(nth integer, kind text, nickname text, ms integer, at timestamptz, is_me boolean)
language sql stable security definer set search_path = public as $$
  select (row_number() over (order by r.finished_at))::integer, r.kind, coalesce(nullif(btrim(p.nickname), ''), 'Player'), r.ms, r.finished_at, r.user_id = auth.uid()
    from public.slither_runs r
    join public.slither_challenges c on c.id = r.challenge_id and c.published_at is not null
    left join public.profiles p on p.id = r.user_id
   where r.challenge_id = p_id and r.result = 'clear'
   order by r.finished_at
   limit 50;
$$;
revoke all on function public.slither_history(text) from public;
grant execute on function public.slither_history(text) to anon, authenticated;
