-- 설문하기 (기록실 탭): polls with checkbox options, votes and comments.
--   1. Only accounts listed in poll_creators can create a poll, add options to it, or delete it.
--      Rows are added by hand on the live DB (by account id), never in a migration (this repo is public).
--   2. Anyone can read polls, results and comments; voting and commenting need a signed-in player.
--   3. One vote per player per poll (single choice) or any number of options (multi); voting again replaces it.
--   4. Comments: at most 200 characters, one per 5 seconds, same word / personal-info filter as the lounge
--      (lounge_check). A player can delete their own comment; a creator can delete any.
-- Every rule is checked in the functions below (SECURITY DEFINER); the tables have RLS on and no policies.
-- Not applied automatically: run by hand on supabase-db (see selfhost notes).

create table if not exists public.poll_creators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.poll_creators enable row level security;

create table if not exists public.polls (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 60),
  multi boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists polls_created_at on public.polls (created_at desc);
alter table public.polls enable row level security;

create table if not exists public.poll_options (
  id bigint generated always as identity primary key,
  poll_id bigint not null references public.polls (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 40),
  sort int not null default 0,
  unique (poll_id, label)
);
create index if not exists poll_options_poll on public.poll_options (poll_id, sort);
alter table public.poll_options enable row level security;

create table if not exists public.poll_votes (
  poll_id bigint not null references public.polls (id) on delete cascade,
  option_id bigint not null references public.poll_options (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (option_id, user_id)
);
create index if not exists poll_votes_poll_user on public.poll_votes (poll_id, user_id);
alter table public.poll_votes enable row level security;

create table if not exists public.poll_comments (
  id bigint generated always as identity primary key,
  poll_id bigint not null references public.polls (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  body text not null check (char_length(body) between 1 and 200),
  created_at timestamptz not null default now()
);
create index if not exists poll_comments_poll on public.poll_comments (poll_id, created_at desc);
create index if not exists poll_comments_user on public.poll_comments (user_id, created_at desc);
alter table public.poll_comments enable row level security;

-- Helpers ----------------------------------------------------------------------------------------
create or replace function public.poll_is_creator(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select p_user is not null and exists (select 1 from public.poll_creators where user_id = p_user);
$$;
revoke all on function public.poll_is_creator(uuid) from public, anon, authenticated;

/** One poll as JSON: options with vote counts, voters, comment count, and the caller's own picks. */
create or replace function public.poll_json(p_poll bigint, p_me uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', p.id, 'title', p.title, 'multi', p.multi, 'created_at', p.created_at,
    'voters', (select count(distinct v.user_id) from public.poll_votes v where v.poll_id = p.id),
    'comments', (select count(*) from public.poll_comments c where c.poll_id = p.id),
    'options', coalesce((
      select jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label,
               'votes', (select count(*) from public.poll_votes v where v.option_id = o.id)) order by o.sort, o.id)
        from public.poll_options o where o.poll_id = p.id), '[]'::jsonb),
    'mine', coalesce((select jsonb_agg(v.option_id) from public.poll_votes v where v.poll_id = p.id and v.user_id = p_me), '[]'::jsonb)
  ) from public.polls p where p.id = p_poll;
$$;
revoke all on function public.poll_json(bigint, uuid) from public, anon, authenticated;

-- Reading ----------------------------------------------------------------------------------------
/** Newest polls first, plus whether the caller may create polls. */
create or replace function public.poll_list(p_limit int default 20)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'can_create', public.poll_is_creator(auth.uid()),
    'polls', coalesce((select jsonb_agg(public.poll_json(p.id, auth.uid()) order by p.created_at desc, p.id desc)
                         from (select id, created_at from public.polls order by created_at desc, id desc limit greatest(1, least(coalesce(p_limit, 20), 50))) p), '[]'::jsonb)
  );
$$;
grant execute on function public.poll_list(int) to anon, authenticated;

/** A poll's comments, newest first (at most 100). */
create or replace function public.poll_comments_list(p_poll bigint)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'body', c.body, 'created_at', c.created_at,
                                               'mine', c.user_id = auth.uid()) order by c.created_at desc, c.id desc), '[]'::jsonb)
    from (select * from public.poll_comments where poll_id = p_poll order by created_at desc, id desc limit 100) c;
$$;
grant execute on function public.poll_comments_list(bigint) to anon, authenticated;

-- Creating (creators only) -----------------------------------------------------------------------
create or replace function public.poll_create(p_title text, p_options text[], p_multi boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  v_title text := btrim(regexp_replace(coalesce(p_title, ''), '\s+', ' ', 'g'));
  v_opts text[];
  new_id bigint;
begin
  if not public.poll_is_creator(me) then return jsonb_build_object('ok', false, 'reason', 'forbidden'); end if;
  if v_title = '' or char_length(v_title) > 60 then return jsonb_build_object('ok', false, 'reason', 'title'); end if;
  select array_agg(o order by i) into v_opts from (
    select distinct on (o) o, i from (
      select btrim(regexp_replace(x, '\s+', ' ', 'g')) as o, i from unnest(coalesce(p_options, '{}')) with ordinality as u(x, i)
    ) s where o <> '' order by o, i
  ) d;
  if coalesce(array_length(v_opts, 1), 0) < 2 then return jsonb_build_object('ok', false, 'reason', 'options'); end if;
  if array_length(v_opts, 1) > 20 or exists (select 1 from unnest(v_opts) o where char_length(o) > 40) then
    return jsonb_build_object('ok', false, 'reason', 'options');
  end if;
  insert into public.polls (title, multi, created_by) values (v_title, coalesce(p_multi, false), me) returning id into new_id;
  insert into public.poll_options (poll_id, label, sort) select new_id, o, i from unnest(v_opts) with ordinality as u(o, i);
  return jsonb_build_object('ok', true, 'poll', public.poll_json(new_id, me));
end; $$;
revoke all on function public.poll_create(text, text[], boolean) from public, anon;
grant execute on function public.poll_create(text, text[], boolean) to authenticated;

/** Adds one more checkbox option to an existing poll. */
create or replace function public.poll_add_option(p_poll bigint, p_label text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  v_label text := btrim(regexp_replace(coalesce(p_label, ''), '\s+', ' ', 'g'));
begin
  if not public.poll_is_creator(me) then return jsonb_build_object('ok', false, 'reason', 'forbidden'); end if;
  if not exists (select 1 from public.polls where id = p_poll) then return jsonb_build_object('ok', false, 'reason', 'missing'); end if;
  if v_label = '' or char_length(v_label) > 40 then return jsonb_build_object('ok', false, 'reason', 'options'); end if;
  if (select count(*) from public.poll_options where poll_id = p_poll) >= 20 then return jsonb_build_object('ok', false, 'reason', 'options'); end if;
  insert into public.poll_options (poll_id, label, sort)
    values (p_poll, v_label, coalesce((select max(sort) from public.poll_options where poll_id = p_poll), 0) + 1)
    on conflict (poll_id, label) do nothing;
  return jsonb_build_object('ok', true, 'poll', public.poll_json(p_poll, me));
end; $$;
revoke all on function public.poll_add_option(bigint, text) from public, anon;
grant execute on function public.poll_add_option(bigint, text) to authenticated;

create or replace function public.poll_delete(p_poll bigint)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.poll_is_creator(auth.uid()) then return false; end if;
  delete from public.polls where id = p_poll;
  return found;
end; $$;
revoke all on function public.poll_delete(bigint) from public, anon;
grant execute on function public.poll_delete(bigint) to authenticated;

-- Voting (signed-in players) ---------------------------------------------------------------------
/** Replaces the caller's picks in a poll. An empty list takes the vote back. */
create or replace function public.poll_vote(p_poll bigint, p_options bigint[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  v_multi boolean;
  v_opts bigint[] := coalesce((select array_agg(distinct x) from unnest(coalesce(p_options, '{}')) x where x is not null), '{}');
begin
  if me is null then return jsonb_build_object('ok', false, 'reason', 'login'); end if;
  select multi into v_multi from public.polls where id = p_poll;
  if v_multi is null then return jsonb_build_object('ok', false, 'reason', 'missing'); end if;
  if not v_multi and array_length(v_opts, 1) > 1 then return jsonb_build_object('ok', false, 'reason', 'single'); end if;
  if exists (select 1 from unnest(v_opts) x where not exists (select 1 from public.poll_options o where o.id = x and o.poll_id = p_poll)) then
    return jsonb_build_object('ok', false, 'reason', 'options');
  end if;
  perform pg_advisory_xact_lock(hashtext('poll:' || p_poll || ':' || me::text));
  delete from public.poll_votes where poll_id = p_poll and user_id = me;
  insert into public.poll_votes (poll_id, option_id, user_id) select p_poll, x, me from unnest(v_opts) x;
  return jsonb_build_object('ok', true, 'poll', public.poll_json(p_poll, me));
end; $$;
revoke all on function public.poll_vote(bigint, bigint[]) from public, anon;
grant execute on function public.poll_vote(bigint, bigint[]) to authenticated;

-- Comments (signed-in players) -------------------------------------------------------------------
create or replace function public.poll_comment(p_poll bigint, p_body text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  v_body text := btrim(regexp_replace(coalesce(p_body, ''), '\s+', ' ', 'g'));
  last_at timestamptz;
  bad text;
  nick text;
begin
  if me is null then return jsonb_build_object('ok', false, 'reason', 'login'); end if;
  if not exists (select 1 from public.polls where id = p_poll) then return jsonb_build_object('ok', false, 'reason', 'missing'); end if;
  if v_body = '' then return jsonb_build_object('ok', false, 'reason', 'empty'); end if;
  if char_length(v_body) > 200 then return jsonb_build_object('ok', false, 'reason', 'long'); end if;
  perform pg_advisory_xact_lock(hashtext('poll-comment:' || me::text));
  select max(created_at) into last_at from public.poll_comments where user_id = me;
  if last_at is not null and now() - last_at < interval '5 seconds' then return jsonb_build_object('ok', false, 'reason', 'fast'); end if;
  bad := public.lounge_check(v_body, public.poll_is_creator(me));
  if bad is not null then return jsonb_build_object('ok', false, 'reason', bad); end if;
  select left(coalesce(nullif(btrim(nickname), ''), 'Player'), 16) into nick from public.profiles where id = me;
  insert into public.poll_comments (poll_id, user_id, name, body) values (p_poll, me, coalesce(nick, 'Player'), v_body);
  return jsonb_build_object('ok', true);
end; $$;
revoke all on function public.poll_comment(bigint, text) from public, anon;
grant execute on function public.poll_comment(bigint, text) to authenticated;

create or replace function public.poll_comment_delete(p_id bigint)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.poll_comments where id = p_id and (user_id = auth.uid() or public.poll_is_creator(auth.uid()));
  return found;
end; $$;
revoke all on function public.poll_comment_delete(bigint) from public, anon;
grant execute on function public.poll_comment_delete(bigint) to authenticated;
