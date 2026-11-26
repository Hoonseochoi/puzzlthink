-- 회원탈퇴 (account deletion). Google Play requires an in-app way to delete an account and its data, and a web page
-- for it; the site's /account-deletion page calls delete_my_account() for a signed-in player (website and Play app).
--
-- What happens to a deleted player's data:
--  * auth.users row deleted → every table with a foreign key to it follows (ON DELETE CASCADE): profiles (nickname),
--    game_crowns, hard_clears, hell_clears, play_time, profile_icons, stone_choices, supporter_covers, piece_spends,
--    piece_race_final, black_piece_final, logic_runs, slither_runs, lounge_messages, lounge_reports (as reporter),
--    lounge_bans, lounge_staff, poll_votes, poll_comments, poll_creators, crown_losses, slither_takeovers; and
--    SET NULL where a shared object only remembers who held/made it (logic_boards, slither_challenges, polls,
--    nemo_duel_runs) — the boards, polls and duels stay for everyone else.
--  * Rows that hold the user id without a foreign key are deleted here: game_results (the player's own records;
--    other players' results are their own rows and stay), hw_results, hw_games, activity_days, rank_snapshots,
--    live_hall_seen, lounge_send_log.
--  * Kept but anonymised: bug_reports (user id and contact email cleared, the report text stays for fixing bugs),
--    lounge_reports.reported_user (cleared; the moderation record stays), the nickname in the public live feed
--    (live_events) and on 네모 세기 duel links (nemo_duels.creator) becomes '탈퇴한 플레이어'.
--  * rpc_cache (cached rankings, which carry nicknames) is cleared so no ranking shows the old nickname.
-- Rankings are computed from the remaining rows, so the player simply drops out of them.
--
-- Tested on a scratch database built from every migration in supabase/migrations (run
-- supabase/tests/play_store/run.sh). Apply by hand on the live DB, like the other migrations.

create or replace function public.delete_account_data(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_nick text;
  v_gone constant text := '탈퇴한 플레이어';
begin
  if p_user is null then
    raise exception 'no user';
  end if;
  select nickname into v_nick from public.profiles where id = p_user;

  -- The player's own rows without a foreign key.
  delete from public.game_results where user_id = p_user;
  delete from public.hw_results where user_id = p_user;
  delete from public.hw_games where user_id = p_user;
  delete from public.activity_days where user_id = p_user;
  delete from public.rank_snapshots where user_id = p_user;
  delete from public.live_hall_seen where user_id = p_user;
  delete from public.lounge_send_log where user_id = p_user;

  -- Kept for operations, without anything that points at the person.
  update public.bug_reports set user_id = null, contact_email = null where user_id = p_user;
  update public.lounge_reports set reported_user = null where reported_user = p_user;

  -- Public texts that copied the nickname.
  if v_nick is not null and v_nick <> '' then
    update public.live_events set name = v_gone where name = left(v_nick, 16);
    update public.live_events set other = v_gone where other = left(v_nick, 16);
    update public.nemo_duels set creator = v_gone where creator = v_nick;
  end if;

  -- Everything with a foreign key to the account (see the list above), then the account itself.
  delete from auth.users where id = p_user;

  -- Cached rankings may still carry the nickname.
  delete from public.rpc_cache;
end;
$$;

revoke all on function public.delete_account_data(uuid) from public, anon, authenticated;

-- Self-service: the signed-in player deletes their own account. p_confirm must be 'DELETE' (the page asks the player
-- to type 탈퇴 / DELETE first; the client sends the constant), so a stray call cannot delete anything.
create or replace function public.delete_my_account(p_confirm text)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not signed in';
  end if;
  if p_confirm is distinct from 'DELETE' then
    raise exception 'confirmation required';
  end if;
  perform public.delete_account_data(v_user);
  return true;
end;
$$;

revoke all on function public.delete_my_account(text) from public, anon;
grant execute on function public.delete_my_account(text) to authenticated;

-- For requests that arrive by email (contact@puzzlthink.com): run as the database owner, e.g.
--   select public.delete_account_data((select id from auth.users where email = 'person@example.com'));
-- Not callable through the API (no grant to anon / authenticated).
