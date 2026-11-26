-- "1위를 ○○님께 빼앗겼어요": when a game's #1 icon moves to another player, the old #1 is told at the next visit.

create table if not exists public.crown_losses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,   -- who lost the #1
  game text not null,
  taker uuid not null references auth.users (id) on delete cascade,
  lost_at timestamptz not null default now(),
  seen_at timestamptz
);
create index if not exists crown_losses_unseen_idx on public.crown_losses (user_id) where seen_at is null;
alter table public.crown_losses enable row level security;   -- read and written through the functions below

-- My unseen losses, the latest per game, skipping a #1 I have since won back.
create or replace function public.my_crown_losses()
 returns table (id bigint, game text, taker text, lost_at timestamptz)
 language sql stable security definer set search_path to 'public'
as $$
  select l.id, l.game, coalesce(nullif(btrim(p.nickname), ''), 'Player'), l.lost_at
    from (select distinct on (x.game) x.* from public.crown_losses x
           where x.user_id = auth.uid() and x.seen_at is null and x.lost_at > now() - interval '30 days'
           order by x.game, x.lost_at desc) l
    join public.game_crowns c on c.game = l.game and c.user_id <> l.user_id
    join public.profiles p on p.id = c.user_id
   order by l.lost_at desc;
$$;
revoke all on function public.my_crown_losses() from public, anon;
grant execute on function public.my_crown_losses() to authenticated;

-- Shown: every unseen loss of mine in those games is done with.
create or replace function public.mark_crown_losses_seen(p_games text[])
 returns void language sql security definer set search_path to 'public'
as $$
  update public.crown_losses set seen_at = now() where user_id = auth.uid() and seen_at is null and game = any (p_games);
$$;
revoke all on function public.mark_crown_losses_seen(text[]) from public, anon;
grant execute on function public.mark_crown_losses_seen(text[]) to authenticated;

CREATE OR REPLACE FUNCTION public.refresh_game_crowns()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  g text; v_board text; v_uid uuid; v_cur uuid; v_hall jsonb; d text;
  games text[] := array['hidden_word', 'equation_signal', 'equation_tower', 'gradation', 'card_janggi', 'color_link_duel', 'hit_stay', 'point_omok', 'merge2048', 'magicswap', 'binairo', 'onestroke',
    'colorlink', 'starbattle', 'masyu', 'nonogram', 'two_sided_poker', 'monorail', 'four_three', 'flip_omok', 'nine_mens_morris',
    'wallgo2', 'slitherlink', 'gyulhap', 'indian_poker', 'wallgo', 'heavy13', 'janggi', 'russian_janggi', 'russian_roulette',
    'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'hexagon', 'piggy_bank', 'sudoku'];
  no_hall text[] := array['nemo_count', 'gyulhap', 'slitherlink', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap', 'merge2048', 'equation_signal', 'equation_tower'];
begin
  select coalesce(jsonb_object_agg(s.game, s.user_id), '{}'::jsonb) into v_hall
    from (select distinct on (h.game) h.game, h.user_id from public.hall_ranking() h where h.rn = 1 order by h.game, h.rn, h.user_id) s;
  foreach g in array games loop
    v_uid := null;
    v_board := case g when 'slitherlink' then 'slither' when 'binairo' then 'binairo' when 'onestroke' then 'onestroke'
      when 'colorlink' then 'colorlink' when 'magicswap' then 'magicswap' when 'starbattle' then 'starbattle'
      when 'masyu' then 'masyu' when 'nonogram' then 'nonogram' when 'merge2048' then 'merge2048' when 'hidden_word' then 'hidden_word'
      when 'gyulhap' then 'gyulhap10' when 'hexagon' then 'hexagon'
      when 'equation_signal' then 'eqsignal' when 'equation_tower' then 'eqtower' end;
    if v_board is not null then
      select c.user_id into v_uid from public.challenge_rows(v_board) c where c.rnk = 1 order by c.sub nulls last, c.user_id limit 1;
    elsif g = 'nemo_count' then
      foreach d in array array['hard', 'normal', 'easy'] loop
        select b.user_id into v_uid from (
          select distinct on (r.user_id) r.user_id, (r.detail ->> 'correct')::int as correct, nullif(r.detail ->> 'avgMs', '')::int as avg_ms, r.played_at
            from public.game_results r
           where r.game = 'nemo_count' and r.mode = 'solo' and r.detail ->> 'difficulty' = d and (r.detail ->> 'correct') ~ '^[0-9]+$'
             and not (r.detail ? 'voided')
           order by r.user_id, (r.detail ->> 'correct')::int desc, nullif(r.detail ->> 'avgMs', '')::int asc nulls last, r.played_at
        ) b join public.profiles p on p.id = b.user_id
         where p.show_in_hall and b.correct > 0
         order by b.correct desc, b.avg_ms asc nulls last, b.played_at limit 1;
        exit when v_uid is not null;
      end loop;
      if v_uid is null then select o.user_id into v_uid from public.open_ranking_rows(g) o where o.rnk = 1 order by o.wins desc, o.user_id limit 1; end if;
    else
      if not (g = any(no_hall)) then v_uid := (v_hall ->> g)::uuid; end if;
      if v_uid is null and g not in ('sudoku', 'gradation') then
        select o.user_id into v_uid from public.open_ranking_rows(g) o where o.rnk = 1 order by o.wins desc, o.user_id limit 1;
      end if;
    end if;

    select c.user_id into v_cur from public.game_crowns c where c.game = g;
    if v_uid is not distinct from v_cur then continue; end if;
    if v_cur is not null then
      update public.profile_icons set revoked_at = now() where user_id = v_cur and icon = 'c-' || g and revoked_at is null;
    end if;
    if v_cur is not null and v_uid is not null then   -- taken by someone: the old #1 is told at their next visit
      insert into public.crown_losses (user_id, game, taker) values (v_cur, g, v_uid);
    end if;
    if v_uid is null then
      delete from public.game_crowns where game = g;
    else
      insert into public.game_crowns (game, user_id, since) values (g, v_uid, now())
      on conflict (game) do update set user_id = excluded.user_id, since = excluded.since;
      perform public.grant_icon(v_uid, 'c-' || g);
    end if;
  end loop;
end; $function$;

notify pgrst, 'reload schema';
