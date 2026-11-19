-- 슬리더링크: a clear only counts once the slither-finish Edge Function has replayed the moves on the server.
-- slither_finish (called by the browser) can now only end a run as not cleared (give up, time up, leaving the page).
-- Runs that end on the answer but look copied in (no ✕ marks, almost no erasing, too fast) are kept with a flag and stay off the records.

alter table public.slither_runs add column if not exists flag text;
alter table public.slither_runs add column if not exists mark_moves integer;
alter table public.slither_runs add column if not exists erase_moves integer;

create or replace function public.slither_finish_checked(p_run uuid, p_user uuid, p_cleared boolean, p_hints integer, p_flag text, p_marks integer, p_erases integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.slither_runs; c public.slither_challenges; took integer; ok boolean; place integer; total integer; mine integer;
begin
  select * into r from public.slither_runs where id = p_run and user_id = p_user and finished_at is null for update;
  if not found then raise exception 'not_found'; end if;
  took := (extract(epoch from now() - r.started_at) * 1000)::int;
  select * into c from public.slither_challenges where id = r.challenge_id for update;
  ok := p_cleared and p_flag is null and took <= 3 * 3600 * 1000 and (r.kind = 'new' or took <= c.holder_ms + 1500);
  update public.slither_runs
     set finished_at = now(), ms = took, hints = greatest(0, least(coalesce(p_hints, 0), 9)), result = case when ok then 'clear' else 'fail' end,
         flag = case when p_cleared then p_flag end, mark_moves = p_marks, erase_moves = p_erases
   where id = r.id;
  if ok and r.kind = 'new' and c.published_at is null then
    update public.slither_challenges set published_at = now(), first_user = p_user, first_ms = took, holder = p_user, holder_ms = took where id = c.id;
  elsif ok and r.kind = 'beat' then
    update public.slither_challenges set holder = p_user, holder_ms = least(took, c.holder_ms), takeovers = takeovers + 1 where id = c.id;
  end if;
  if ok then
    select x.rnk, x.maps into place, mine from public.slither_owner_rows() x where x.user_id = p_user;
    select count(*)::int into total from public.slither_owner_rows();
  end if;
  return jsonb_build_object('ok', ok, 'ms', took, 'rank', place, 'total', total, 'maps', mine, 'flagged', p_cleared and p_flag is not null);
end; $$;
revoke all on function public.slither_finish_checked(uuid, uuid, boolean, integer, text, integer, integer) from public, anon, authenticated;
grant execute on function public.slither_finish_checked(uuid, uuid, boolean, integer, text, integer, integer) to service_role;
