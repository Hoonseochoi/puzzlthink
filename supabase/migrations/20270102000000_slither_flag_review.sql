-- 슬리더링크: a suspicious clear counts first and is judged later. The flag is still stored with the run, but no longer
-- blocks the record; slither_review lists clears to look at, fastest first (under 5 minutes is the hard part to believe).
create or replace function public.slither_finish_checked(p_run uuid, p_user uuid, p_cleared boolean, p_hints integer, p_flag text, p_marks integer, p_erases integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.slither_runs; c public.slither_challenges; took integer; ok boolean; place integer; total integer; mine integer;
        rival uuid; rival_name text; took_n integer; lost_n integer;
begin
  select * into r from public.slither_runs where id = p_run and user_id = p_user and finished_at is null for update;
  if not found then raise exception 'not_found'; end if;
  took := (extract(epoch from now() - r.started_at) * 1000)::int;
  select * into c from public.slither_challenges where id = r.challenge_id for update;
  ok := p_cleared and took <= 3 * 3600 * 1000 and (r.kind = 'new' or took <= c.holder_ms + 1500);
  update public.slither_runs
     set finished_at = now(), ms = took, hints = greatest(0, least(coalesce(p_hints, 0), 9)), result = case when ok then 'clear' else 'fail' end,
         flag = case when p_cleared then p_flag end, mark_moves = p_marks, erase_moves = p_erases
   where id = r.id;
  if ok and r.kind = 'new' and c.published_at is null then
    update public.slither_challenges set published_at = now(), first_user = p_user, first_ms = took, holder = p_user, holder_ms = took where id = c.id;
  elsif ok and r.kind = 'beat' then
    rival := c.holder;
    if rival is not null and rival <> p_user then
      insert into public.slither_takeovers (challenge_id, taker, loser) values (c.id, p_user, rival);
      took_n := public.slither_took(p_user, rival);
      lost_n := public.slither_took(rival, p_user);
      rival_name := (select coalesce(nullif(btrim(p.nickname), ''), 'Player') from public.profiles p where p.id = rival);
    end if;
    update public.slither_challenges set holder = p_user, holder_ms = least(took, c.holder_ms), takeovers = takeovers + 1 where id = c.id;
  end if;
  if ok then
    select x.rnk, x.maps into place, mine from public.slither_owner_rows() x where x.user_id = p_user;
    select count(*)::int into total from public.slither_owner_rows();
  end if;
  return jsonb_build_object('ok', ok, 'ms', took, 'rank', place, 'total', total, 'maps', mine, 'flagged', false,
    'rival', rival_name, 'took_n', took_n, 'lost_n', lost_n);
end; $$;
revoke all on function public.slither_finish_checked(uuid, uuid, boolean, integer, text, integer, integer) from public, anon, authenticated;
grant execute on function public.slither_finish_checked(uuid, uuid, boolean, integer, text, integer, integer) to service_role;

-- Clears to judge: flagged, with suspicion signals, or under 5 minutes. Fastest first. Not exposed to the site.
create or replace view public.slither_review with (security_invoker = true) as
select r.id, r.finished_at, coalesce(nullif(btrim(p.nickname), ''), 'Player') as nickname, r.user_id, r.kind, r.challenge_id,
       round(r.ms / 60000.0, 1) as minutes, r.mark_moves, r.erase_moves, r.hints, r.flag,
       r.signals -> 'suspects' as suspects, (r.signals -> 'away' ->> 'n')::int as away_n, round(((r.signals -> 'away' ->> 'ms')::numeric) / 1000) as away_s,
       (r.signals ->> 'markBurst')::int as mark_burst, (r.signals ->> 'cleanShare')::numeric as clean_share, (r.signals ->> 'wrongLines')::int as wrong_lines,
       c.holder = r.user_id as holds_board
  from public.slither_runs r
  join public.slither_challenges c on c.id = r.challenge_id
  left join public.profiles p on p.id = r.user_id
 where r.result = 'clear'
   and (r.flag is not null or r.ms < 5 * 60000 or jsonb_array_length(coalesce(r.signals -> 'suspects', '[]'::jsonb)) > 0)
 order by r.ms;
revoke all on public.slither_review from public, anon, authenticated;
