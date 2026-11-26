-- 히든 워드 friend rooms (2 players). The room itself runs in the host's browser like every other room; the
-- similarity numbers stay on the server. Similarity is not open to clients (hw_score is postgres-only, so nobody
-- can look up MORA's word), so a room gets it in small, bounded pieces:
--   hw_room_deal()              six envelopes of five target words for one match → { deal, envelopes }
--   hw_room_lock(deal, word)    the setter locks a hidden word from that deal (at most 4 per deal: 2 rounds × 2 players)
--   hw_room_score(lock, words)  similarity of words to the locked word (a capped number of words per lock)
--   hw_room_reveal(lock, used)  the closest word of the hint list not used yet (out of hints or time)

create table if not exists public.hw_room_deals (
  id uuid primary key default gen_random_uuid(),
  words text[] not null,
  created_at timestamptz not null default now()
);
create table if not exists public.hw_room_locks (
  id uuid primary key default gen_random_uuid(),
  deal uuid not null references public.hw_room_deals (id) on delete cascade,
  word text not null,
  calls int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists hw_room_locks_deal on public.hw_room_locks (deal);
alter table public.hw_room_deals enable row level security;
alter table public.hw_room_locks enable row level security;

CREATE OR REPLACE FUNCTION public.hw_room_deal()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  envs jsonb := '[[],[],[],[],[],[]]'; groups jsonb := '[[],[],[],[],[],[]]';
  r record; i int; j int; start int; filled int := 0; words text[] := '{}'; did uuid;
begin
  delete from public.hw_room_deals where created_at < now() - interval '2 days';
  -- same dealing as hw_start: five words per envelope, no two from one cluster
  for r in select word, cluster from public.hw_targets order by random() loop
    exit when filled = 30;
    start := floor(random() * 6)::int;
    for i in 0..5 loop
      j := (i + start) % 6;
      if jsonb_array_length(envs -> j) < 5 and not (groups -> j ? r.cluster) then
        envs := jsonb_set(envs, array[j::text], (envs -> j) || to_jsonb(r.word));
        groups := jsonb_set(groups, array[j::text], (groups -> j) || to_jsonb(r.cluster));
        words := words || r.word;
        filled := filled + 1;
        exit;
      end if;
    end loop;
  end loop;
  if filled < 30 then return jsonb_build_object('error', 'unavailable'); end if;
  insert into public.hw_room_deals (words) values (words) returning id into did;
  return jsonb_build_object('deal', did, 'envelopes', envs, 'cfg', public.hw_cfg());
end $function$;

CREATE OR REPLACE FUNCTION public.hw_room_lock(p_deal uuid, p_word text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare d public.hw_room_deals; lid uuid;
begin
  select * into d from public.hw_room_deals where id = p_deal for update;
  if not found or not (btrim(p_word) = any (d.words)) then return null; end if;
  select id into lid from public.hw_room_locks where deal = p_deal and word = btrim(p_word);
  if lid is not null then return lid; end if;
  if (select count(*) from public.hw_room_locks where deal = p_deal) >= 4 then return null; end if;
  insert into public.hw_room_locks (deal, word) values (p_deal, btrim(p_word)) returning id into lid;
  return lid;
end $function$;

-- Per lock: 3 stages × (5 hints + 2 answers) plus slack for refused words.
CREATE OR REPLACE FUNCTION public.hw_room_score(p_lock uuid, p_words text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare l public.hw_room_locks; n int := coalesce(array_length(p_words, 1), 0);
begin
  if n < 1 or n > 2 then return null; end if;
  select * into l from public.hw_room_locks where id = p_lock for update;
  if not found or l.calls + n > 60 then return null; end if;
  update public.hw_room_locks set calls = calls + n where id = p_lock;
  return (select jsonb_agg(public.hw_score(l.word, normalize(btrim(w), NFC)) order by o) from unnest(p_words) with ordinality u(w, o));
end $function$;

CREATE OR REPLACE FUNCTION public.hw_room_reveal(p_lock uuid, p_used text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare l public.hw_room_locks; w text; sc numeric;
begin
  select * into l from public.hw_room_locks where id = p_lock for update;
  if not found or l.calls >= 60 then return null; end if;
  update public.hw_room_locks set calls = calls + 1 where id = p_lock;
  select h.word, round(h.score::numeric, 1) into w, sc from public.hw_hints h
   where h.target = l.word and not (h.word = any (coalesce(p_used, '{}')))
   order by h.score desc, h.word limit 1;
  if w is null then return null; end if;
  return jsonb_build_object('w', w, 's', sc);
end $function$;

revoke all on function public.hw_room_deal() from public;
revoke all on function public.hw_room_lock(uuid, text) from public;
revoke all on function public.hw_room_score(uuid, text[]) from public;
revoke all on function public.hw_room_reveal(uuid, text[]) from public;
grant execute on function public.hw_room_deal() to anon, authenticated;
grant execute on function public.hw_room_lock(uuid, text) to anon, authenticated;
grant execute on function public.hw_room_score(uuid, text[]) to anon, authenticated;
grant execute on function public.hw_room_reveal(uuid, text[]) to anon, authenticated;
