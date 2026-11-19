-- Applied after the client that sends clears to the slither-finish Edge Function is live.
-- The browser's own call: ends a run without a clear, whatever it says.
create or replace function public.slither_finish(p_run uuid, p_cleared boolean, p_hints integer default 0)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.slither_runs; took integer;
begin
  select * into r from public.slither_runs where id = p_run and user_id = auth.uid() and finished_at is null for update;
  if not found then raise exception 'not_found'; end if;
  took := (extract(epoch from now() - r.started_at) * 1000)::int;
  update public.slither_runs set finished_at = now(), ms = took, hints = greatest(0, least(coalesce(p_hints, 0), 9)), result = 'fail' where id = r.id;
  return jsonb_build_object('ok', false, 'ms', took, 'rank', null, 'total', null, 'maps', null);
end; $$;
revoke all on function public.slither_finish(uuid, boolean, integer) from public, anon;
grant execute on function public.slither_finish(uuid, boolean, integer) to authenticated;
