-- 후원자 커버: a one-time thank-you popup the first time a supporter opens the site after the cover was granted.
alter table public.supporter_covers add column if not exists thanked_at timestamptz;

-- True once per supporter (and marks it shown).
create or replace function public.claim_supporter_thanks()
 returns boolean language plpgsql security definer set search_path to 'public'
as $$
declare hit boolean;
begin
  update public.supporter_covers set thanked_at = now() where user_id = auth.uid() and thanked_at is null returning true into hit;
  return coalesce(hit, false);
end; $$;
revoke all on function public.claim_supporter_thanks() from public, anon;
grant execute on function public.claim_supporter_thanks() to authenticated;

notify pgrst, 'reload schema';
