#!/bin/sh
# Grant a PLAY TESTER icon to testers by email (supabase/migrations/20271130000000_app_testers.sql).
#   scripts/play/grant-icon.sh <14d|founder> <emails.txt | email ...> [--dry-run]
#     14d      → pt-14d      testers who stayed through the closed test
#     founder  → pt-founder  the first group of testers
# A file holds one email per line (the CSV from scripts/play/testers.sh works). Each email is matched to a current
# (not withdrawn) tester in app_testers, the address they signed up with, else to a sign-in email. The icon goes on at
# once unless the member shows a contest / #1 / 2048 / HIDDEN MISSION icon, and pops up as "새 아이콘" on their next
# visit. Already held = nothing happens. --dry-run only lists who would get it. Writes to the LIVE database.
set -eu
case "${1:-}" in 14d|founder) ICON="pt-$1" ;; *) echo "usage: $0 <14d|founder> <emails.txt | email ...> [--dry-run]" >&2; exit 1 ;; esac
shift
DRY=0; EMAILS=""
for a in "$@"; do
  if [ "$a" = "--dry-run" ]; then DRY=1
  elif [ -f "$a" ]; then EMAILS="$EMAILS $(tr -d '\r' < "$a" | tr ',;' '\n\n' | tr -s ' \n' '\n')"
  else EMAILS="$EMAILS $a"; fi
done
LIST=$(printf '%s\n' $EMAILS | tr 'A-Z' 'a-z' | grep '@' | sort -u | paste -sd, -)
[ -n "$LIST" ] || { echo "no emails given" >&2; exit 1; }

# TESTERS_CONTAINER / TESTERS_DB only for trying the script on a scratch container.
docker exec -i "${TESTERS_CONTAINER:-supabase-db}" psql -U postgres -d "${TESTERS_DB:-postgres}" -X -v ON_ERROR_STOP=1 \
  -v icon="$ICON" -v list="$LIST" -v dry="$DRY" <<'SQL'
\pset footer off
with wanted as (select distinct btrim(e) as email from unnest(string_to_array(:'list', ',')) e where btrim(e) <> ''),
matched as (
  select w.email,
         coalesce((select t.user_id from public.app_testers t where t.email = w.email and t.withdrawn_at is null),
                  (select u.id from auth.users u where lower(u.email) = w.email limit 1)) as user_id
    from wanted w
)
select m.email,
       case when m.user_id is null then 'NOT FOUND'
            when exists (select 1 from public.profile_icons i where i.user_id = m.user_id and i.icon = :'icon' and i.revoked_at is null) then 'already has it'
            when :'dry' = '1' then 'would grant'
            when public.grant_tester_icon(m.user_id, :'icon') then 'granted'
            else 'not granted' end as result,
       coalesce(nullif(p.nickname, ''), '-') as nickname
  from matched m left join public.profiles p on p.id = m.user_id
 order by 2, 1;
SQL
