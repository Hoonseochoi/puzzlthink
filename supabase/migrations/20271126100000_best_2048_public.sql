-- 벽바둑 II: a player's square pieces are drawn as the highest 2048 block character they have earned.
-- Nickname → highest tier (2048 … 131072). Who earned which icon is already public (icon_holders).
create or replace function public.best_2048_public()
returns table(nickname text, tier integer)
language sql stable security definer
set search_path to 'public'
as $$
  select p.nickname, max(substr(i.icon, 2)::integer)
    from public.profile_icons i
    join public.profiles p on p.id = i.user_id
   where i.revoked_at is null and i.icon ~ '^m[0-9]+$' and p.nickname is not null and btrim(p.nickname) <> ''
   group by p.nickname;
$$;
revoke all on function public.best_2048_public() from public;
grant execute on function public.best_2048_public() to anon, authenticated, service_role;
