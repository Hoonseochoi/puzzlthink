-- Where people signed up: the sign-in button they used (header, result screen, open room, …) and the page.
-- Set once, only right after the account was created. Applied already.
alter table public.profiles add column if not exists signup_source text;
alter table public.profiles add column if not exists signup_path text;

create or replace function public.set_signup_source(p_source text, p_path text)
returns void language sql security definer set search_path = public as $$
  update public.profiles
     set signup_source = left(coalesce(nullif(btrim(p_source), ''), 'other'), 24),
         signup_path = left(nullif(btrim(p_path), ''), 80)
   where id = auth.uid() and signup_source is null and created_at > now() - interval '30 minutes';
$$;
revoke all on function public.set_signup_source(text, text) from public;
revoke execute on function public.set_signup_source(text, text) from anon;
grant execute on function public.set_signup_source(text, text) to authenticated;
