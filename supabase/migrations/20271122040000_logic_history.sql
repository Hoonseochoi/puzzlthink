-- 로직 퍼즐 챌린지 (마슈 · 노노그램 · 스타배틀 · 비나이로 · 한붓길 · 컬러 잇기) map history, the 슬리더링크 way:
-- who first cleared a board (NEW) and each takeover after, with times, oldest first.
create or replace function public.logic_history(p_id text)
returns table(nth integer, kind text, nickname text, ms integer, at timestamptz, is_me boolean)
language sql stable security definer set search_path = public as $$
  select (row_number() over (order by r.finished_at))::integer, r.kind, coalesce(nullif(btrim(p.nickname), ''), 'Player'), r.ms, r.finished_at,
         auth.uid() is not null and r.user_id = auth.uid()
    from public.logic_runs r
    join public.logic_boards b on b.id = r.board_id and b.published_at is not null
    left join public.profiles p on p.id = r.user_id
   where r.board_id = p_id and r.result = 'clear'
   order by r.finished_at
   limit 50;
$$;
revoke all on function public.logic_history(text) from public;
grant execute on function public.logic_history(text) to anon, authenticated;
