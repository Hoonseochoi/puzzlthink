-- Nicknames go through the same filter as 라운지 messages (public.lounge_check: profanity, sexual words, phone
-- numbers, emails, contact handles, links, resident numbers). Nicknames are shown to everyone (rankings, rooms,
-- the lounge), and Google Play's user-generated content policy expects them to be moderated like chat.
-- Saving a nickname the filter rejects fails with 'nickname_not_allowed'; existing nicknames are left as they are
-- (list them with: select id, nickname from public.profiles where public.lounge_check(nickname) is not null;).
-- Same function as 20261201000000_nickname_unique.sql plus the filter. Not applied live yet: apply by hand.

create or replace function public.update_profile(p_nickname text, p_show_in_hall boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  wanted text := nullif(left(btrim(coalesce(p_nickname, '')), 16), '');
begin
  if auth.uid() is null then return; end if;
  if wanted is not null and public.lounge_check(wanted) is not null then
    raise exception 'nickname_not_allowed';
  end if;
  if wanted is not null and exists (
    select 1 from public.profiles where lower(btrim(nickname)) = lower(wanted) and id <> auth.uid()
  ) then
    raise exception 'nickname_taken';
  end if;
  update public.profiles
     set nickname = coalesce(wanted, nickname),
         nickname_set = nickname_set or wanted is not null,
         show_in_hall = coalesce(p_show_in_hall, show_in_hall)
   where id = auth.uid();
end; $$;
revoke execute on function public.update_profile(text, boolean) from anon;
grant execute on function public.update_profile(text, boolean) to authenticated;
