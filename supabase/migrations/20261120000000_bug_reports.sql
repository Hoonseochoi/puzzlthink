-- Bug reports sent from the in-game "오류 제보" form. Kept here even if the email relay fails.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg).

create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  game text not null,
  category text not null,
  message text not null,
  contact_email text,
  page_url text,
  user_agent text,
  screen text,
  locale text,
  user_id uuid references public.profiles (id) on delete set null,
  status text not null default 'new' check (status in ('new', 'checking', 'fixed', 'wontfix'))
);
create index if not exists bug_reports_created_idx on public.bug_reports (created_at desc);
alter table public.bug_reports enable row level security;
revoke all on public.bug_reports from anon, authenticated;

-- The only way in: one report at a time, trimmed, with a simple per-minute flood guard.
create or replace function public.submit_bug_report(
  p_game text, p_category text, p_message text, p_contact_email text default null,
  p_page_url text default null, p_user_agent text default null, p_screen text default null, p_locale text default null
) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if length(btrim(coalesce(p_message, ''))) < 5 then return false; end if;
  if (select count(*) from public.bug_reports where created_at > now() - interval '1 minute') >= 20 then return false; end if;
  insert into public.bug_reports (game, category, message, contact_email, page_url, user_agent, screen, locale, user_id)
  values (
    left(coalesce(p_game, 'unknown'), 40), left(coalesce(p_category, 'other'), 40), left(btrim(p_message), 4000),
    nullif(left(btrim(coalesce(p_contact_email, '')), 200), ''), left(p_page_url, 500), left(p_user_agent, 500),
    left(p_screen, 40), left(p_locale, 10), auth.uid()
  );
  return true;
end; $$;
revoke all on function public.submit_bug_report(text, text, text, text, text, text, text, text) from public;
grant execute on function public.submit_bug_report(text, text, text, text, text, text, text, text) to anon, authenticated;
