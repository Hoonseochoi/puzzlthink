-- Lounge: each message carries the sender's 피스 경쟁전 pieces at the time it was sent, shown before the name
-- for regular players (operators show their badge instead and get 0). Counted like competition_ranking:
-- one per win against the hard AI, at most 30 per game, 러시안 룰렛 and 인디언 포커 not counted.
-- lounge_state and lounge_send are the same as in 20271123020000_lounge_chat.sql apart from 'pieces'.
alter table public.lounge_messages add column if not exists pieces integer not null default 0;

create or replace function public.lounge_pieces(p_user uuid)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(sum(least(n, 30)), 0)::int from (
    select count(*) as n from public.game_results r
     where r.user_id = p_user and r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard'
       and r.game not in ('russian_roulette', 'indian_poker')
     group by r.game) t;
$$;
revoke all on function public.lounge_pieces(uuid) from public, anon, authenticated;

create or replace function public.lounge_state()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'messages', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'sender', public.lounge_sender(user_id), 'name', name, 'game', game, 'staff', exists (select 1 from public.lounge_staff st where st.user_id = m.user_id), 'pieces', pieces, 'text', body,
                                                                'at', (extract(epoch from created_at) * 1000)::bigint) order by id)
                            from (select * from public.lounge_messages order by id desc limit 50) m), '[]'::jsonb),
    'me', case when auth.uid() is null then null else public.lounge_sender(auth.uid()) end,
    'banned_until', (select until from public.lounge_bans where user_id = auth.uid() and until > now()),
    'ban_reason', (select reason from public.lounge_bans where user_id = auth.uid() and until > now()));
$$;
revoke all on function public.lounge_state() from public;
grant execute on function public.lounge_state() to anon, authenticated;

-- Sends a message. Returns {ok: true, id} or {ok: false, reason, until?, wait_ms?}.
-- reason: login | empty | long | fast | quota | repeat | banned | spam | profanity | sexual | phone | rrn | email | contact | link
-- (banned also carries ban_reason: repeat | reports | admin)
create or replace function public.lounge_send(p_body text, p_game text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  v_body text := btrim(regexp_replace(coalesce(p_body, ''), '\s+', ' ', 'g'));
  v_game text := case when p_game ~ '^[A-Za-z0-9_\-]{1,24}$' then p_game end;
  v_norm text;
  ban timestamptz;
  last_at timestamptz;
  n_similar int;
  recent int;
  oldest timestamptz;
  ban_reason text;
  bad text;
  nick text;
  v_staff boolean;
  v_pieces int;
  new_id bigint;
  sent_at timestamptz := now();
begin
  if me is null then return jsonb_build_object('ok', false, 'reason', 'login'); end if;
  if v_body = '' then return jsonb_build_object('ok', false, 'reason', 'empty'); end if;
  if char_length(v_body) > 200 then return jsonb_build_object('ok', false, 'reason', 'long'); end if;

  perform pg_advisory_xact_lock(hashtext('lounge:' || me::text)); -- one send at a time per player

  select until, reason into ban, ban_reason from public.lounge_bans where user_id = me and until > now();
  if ban is not null then return jsonb_build_object('ok', false, 'reason', 'banned', 'until', ban, 'ban_reason', ban_reason); end if;

  v_staff := exists (select 1 from public.lounge_staff where user_id = me);

  select max(at) into last_at from public.lounge_send_log where user_id = me and accepted;
  if not v_staff and last_at is not null and now() - last_at < interval '3 seconds' then
    return jsonb_build_object('ok', false, 'reason', 'fast', 'wait_ms', ceil(extract(epoch from (last_at + interval '3 seconds' - now())) * 1000)::int);
  end if;
  select count(*), min(at) into recent, oldest from public.lounge_send_log where user_id = me and accepted and at > now() - interval '1 minute';
  if not v_staff and recent >= 10 then
    return jsonb_build_object('ok', false, 'reason', 'quota', 'wait_ms', ceil(extract(epoch from (oldest + interval '1 minute' - now())) * 1000)::int);
  end if;

  bad := public.lounge_check(v_body, v_staff);
  if bad is not null then return jsonb_build_object('ok', false, 'reason', bad); end if;

  -- Spam: nearly the same text = same letters once repeats are squashed, or one contains the other.
  v_norm := regexp_replace(public.lounge_norm(v_body), '(.)\1+', '\1', 'g');
  select count(*) into n_similar
    from public.lounge_send_log l
   where l.user_id = me and l.at > now() - interval '5 minutes'
     and (l.norm = v_norm or (char_length(v_norm) >= 4 and char_length(l.norm) >= 4 and (position(l.norm in v_norm) > 0 or position(v_norm in l.norm) > 0)));
  if v_staff then n_similar := 0; end if;
  if n_similar >= 2 then
    insert into public.lounge_bans (user_id, until, reason) values (me, now() + interval '1 hour', 'repeat')
      on conflict (user_id) do update set until = greatest(public.lounge_bans.until, excluded.until), reason = excluded.reason, created_at = now();
    return jsonb_build_object('ok', false, 'reason', 'spam', 'until', now() + interval '1 hour');
  end if;
  if n_similar = 1 then -- refused, but remembered: the next try is the ban
    insert into public.lounge_send_log (user_id, norm, at, accepted) values (me, v_norm, sent_at, false);
    return jsonb_build_object('ok', false, 'reason', 'repeat');
  end if;

  select left(coalesce(nullif(btrim(nickname), ''), 'Player'), 16) into nick from public.profiles where id = me;
  v_pieces := case when v_staff then 0 else public.lounge_pieces(me) end;
  insert into public.lounge_messages (user_id, name, game, pieces, body, created_at) values (me, coalesce(nick, 'Player'), v_game, v_pieces, v_body, sent_at) returning id into new_id;
  insert into public.lounge_send_log (user_id, norm, at) values (me, v_norm, sent_at);

  -- Keep the last 50 messages and ten minutes of send log.
  delete from public.lounge_messages where id <= new_id - 50;
  delete from public.lounge_send_log where user_id = me and at < now() - interval '10 minutes';

  perform realtime.send(jsonb_build_object('id', new_id, 'sender', public.lounge_sender(me), 'name', coalesce(nick, 'Player'), 'game', v_game, 'staff', v_staff, 'pieces', v_pieces, 'text', v_body,
                                           'at', (extract(epoch from sent_at) * 1000)::bigint), 'msg', 'lounge', false);
  return jsonb_build_object('ok', true, 'id', new_id);
end; $$;
revoke all on function public.lounge_send(text, text) from public, anon;
grant execute on function public.lounge_send(text, text) to authenticated;
