-- 어려움 클리어 인증서: the Nth player to beat a game's hard AI (Sudoku: solve a hard puzzle).
-- One certificate per player per game, numbered in the order of each player's first hard win.
-- Certificates are public by their unguessable id (the share link); only the nickname is shown.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg).

create table if not exists public.hard_clears (
  id text primary key,
  game text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  clear_no integer not null,
  cleared_at timestamptz not null,
  seen boolean not null default false, -- whether the player has been shown the certificate
  created_at timestamptz not null default now(),
  unique (game, user_id),
  unique (game, clear_no)
);
alter table public.hard_clears enable row level security; -- no direct access; only through the functions below

-- A win that counts as a hard clear.
create or replace function public.is_hard_clear(p_game text, p_mode text, p_result text, p_detail jsonb)
returns boolean language sql immutable as $$
  select p_result = 'win' and (
    (p_mode = 'ai' and coalesce(p_detail ->> 'difficulty', p_detail ->> 'level', '') = 'hard')
    or (p_game = 'sudoku' and p_mode = 'solo' and coalesce(p_detail ->> 'difficulty', '') = 'hard'));
$$;

-- Existing players: certificates in the order of their first hard win (shown to them on their next hard win).
insert into public.hard_clears (id, game, user_id, clear_no, cleared_at)
select substr(md5(random()::text || clock_timestamp()::text || f.user_id::text || f.game), 1, 12), f.game, f.user_id,
       row_number() over (partition by f.game order by f.first_win, f.user_id), f.first_win
  from (select game, user_id, min(played_at) as first_win
          from public.game_results
         where public.is_hard_clear(game, mode, result, detail)
         group by game, user_id) f
on conflict do nothing;

-- Issues (or returns) my certificate for a game I have beaten on hard. is_new is true the first time it is shown.
create or replace function public.claim_hard_clear(p_game text)
returns table(id text, clear_no integer, is_new boolean)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  first_win timestamptz;
  cert public.hard_clears;
begin
  if uid is null then return; end if;
  select * into cert from public.hard_clears h where h.game = p_game and h.user_id = uid;
  if not found then
    select min(r.played_at) into first_win from public.game_results r
     where r.user_id = uid and r.game = p_game and public.is_hard_clear(r.game, r.mode, r.result, r.detail);
    if first_win is null then return; end if;
    perform pg_advisory_xact_lock(hashtext('hard_clear:' || p_game));
    insert into public.hard_clears (id, game, user_id, clear_no, cleared_at)
    values (substr(md5(random()::text || clock_timestamp()::text || uid::text), 1, 12), p_game, uid,
            coalesce((select max(h.clear_no) from public.hard_clears h where h.game = p_game), 0) + 1, first_win)
    on conflict (game, user_id) do nothing;
    select * into cert from public.hard_clears h where h.game = p_game and h.user_id = uid;
  end if;
  return query select cert.id, cert.clear_no, not cert.seen;
  if not cert.seen then update public.hard_clears h set seen = true where h.id = cert.id; end if;
end; $$;
revoke all on function public.claim_hard_clear(text) from public;
grant execute on function public.claim_hard_clear(text) to authenticated;

-- One certificate for its public page and image (nickname only, never the e-mail or real name).
create or replace function public.hard_clear_cert(p_id text)
returns table(game text, clear_no integer, nickname text, cleared_at timestamptz, total integer)
language sql stable security definer set search_path = public as $$
  select h.game, h.clear_no, coalesce(nullif(p.nickname, ''), 'Player'), h.cleared_at,
         (select count(*)::int from public.hard_clears t where t.game = h.game)
    from public.hard_clears h left join public.profiles p on p.id = h.user_id
   where h.id = p_id;
$$;
revoke all on function public.hard_clear_cert(text) from public;
grant execute on function public.hard_clear_cert(text) to anon, authenticated;

-- My certificates, for the records page.
create or replace function public.my_hard_clears()
returns table(id text, game text, clear_no integer, cleared_at timestamptz)
language sql stable security definer set search_path = public as $$
  select h.id, h.game, h.clear_no, h.cleared_at from public.hard_clears h where h.user_id = auth.uid() order by h.cleared_at;
$$;
revoke all on function public.my_hard_clears() from public;
grant execute on function public.my_hard_clears() to authenticated;

-- Signed-in only (Supabase grants anon by default), and a fixed search path for the helper.
revoke execute on function public.claim_hard_clear(text) from anon;
revoke execute on function public.my_hard_clears() from anon;
alter function public.is_hard_clear(text, text, text, jsonb) set search_path = public;
