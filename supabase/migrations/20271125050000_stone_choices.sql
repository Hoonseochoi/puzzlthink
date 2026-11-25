-- Players pick their own stone (profile picture) in 기록실 › 닉네임: one of four colours, or a champion stone they
-- earned in 피스 경쟁전 (a finished week's top three, piece_race_final). Written only through set_my_stone, which
-- checks ownership; read by everyone through stone_choices_public (by nickname, like the rankings).

create table if not exists public.stone_choices (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stone text not null check (stone ~ '^(black|white|red|blue|w[0-9]{1,3}-[123])$'),
  updated_at timestamptz not null default now()
);
alter table public.stone_choices enable row level security;

-- My options: the colours are always open; champion stones only for that week's podium.
CREATE OR REPLACE FUNCTION public.my_stone_options()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'chosen', (select c.stone from public.stone_choices c where c.user_id = auth.uid()),
    'earned', coalesce((select jsonb_agg('w' || f.week || '-' || f.rank order by f.week desc, f.rank)
                          from public.piece_race_final f where f.user_id = auth.uid() and f.rank <= 3), '[]'::jsonb)
  );
$function$;

CREATE OR REPLACE FUNCTION public.set_my_stone(p_stone text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_week int; v_rank int;
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  if p_stone is null or p_stone = '' then
    delete from public.stone_choices where user_id = auth.uid();
    return null;
  end if;
  if p_stone not in ('black', 'white', 'red', 'blue') then
    if p_stone !~ '^w[0-9]{1,3}-[123]$' then raise exception 'unknown stone'; end if;
    v_week := split_part(substr(p_stone, 2), '-', 1)::int;
    v_rank := split_part(p_stone, '-', 2)::int;
    if not exists (select 1 from public.piece_race_final f where f.user_id = auth.uid() and f.week = v_week and f.rank = v_rank) then
      raise exception 'not earned';
    end if;
  end if;
  insert into public.stone_choices (user_id, stone) values (auth.uid(), p_stone)
  on conflict (user_id) do update set stone = excluded.stone, updated_at = now();
  return p_stone;
end; $function$;

-- Everyone's choice by nickname (only players who picked one).
CREATE OR REPLACE FUNCTION public.stone_choices_public()
 RETURNS TABLE(nickname text, stone text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select p.nickname, c.stone
    from public.stone_choices c join public.profiles p on p.id = c.user_id
   where p.nickname is not null and btrim(p.nickname) <> '';
$function$;

revoke execute on function public.set_my_stone(text) from anon;
grant execute on function public.set_my_stone(text) to authenticated;
grant execute on function public.my_stone_options() to authenticated;
grant execute on function public.stone_choices_public() to anon, authenticated;

notify pgrst, 'reload schema';
