-- Timed challenges (결!합!, 헥사곤, 네모 세기) are scored in the browser. challenge_review lists results worth a look, with
-- the reasons, for the periodic anomaly check: left the board, impossible numbers, or far above everyone else.
-- Thresholds come from the first 64 results (2026-11-21): 결!합! top players score about 5–6 per board,
-- 네모 세기 boards take 20 s or more each.
create or replace view public.challenge_review with (security_invoker = true) as
with r as (
  select g.id, g.played_at, g.user_id, coalesce(nullif(btrim(p.nickname), ''), 'Player') as nickname, g.game, g.detail,
         case g.game when 'gyulhap' then g.detail ->> 'mode' when 'hexagon' then 'challenge' else 'nemo_' || (g.detail ->> 'difficulty') end as board,
         coalesce(nullif(g.detail ->> 'score', ''), g.detail ->> 'correct')::numeric as score
    from public.game_results g
    left join public.profiles p on p.id = g.user_id
   where g.mode = 'solo'
     and ((g.game = 'gyulhap' and g.detail ->> 'mode' in ('challenge10', 'challenge5'))
       or (g.game = 'hexagon' and g.detail ->> 'mode' = 'challenge')
       or (g.game = 'nemo_count' and g.detail ? 'correct'))
)
select r.id, r.played_at, r.nickname, r.user_id, r.board, r.score,
       array_remove(array[
         case when r.detail ? 'voided' then 'voided_left_board' end,
         case when coalesce((r.detail ->> 'exits')::int, 0) between 1 and 2 then 'left_board_' || (r.detail ->> 'exits') end,
         -- 결!합!: points per board well above the best players, or a very high score
         case when r.game = 'gyulhap' and (r.detail ->> 'rounds')::numeric > 0 and r.score / (r.detail ->> 'rounds')::numeric > 7 then 'gyul_points_per_board' end,
         case when r.game = 'gyulhap' and r.score >= case r.board when 'challenge10' then 100 else 60 end then 'gyul_high_score' end,
         -- 헥사곤: more found than there were answers, or a score above what was found
         case when r.game = 'hexagon' and (r.detail ->> 'found')::int > (r.detail ->> 'answers')::int then 'hex_found_over_answers' end,
         case when r.game = 'hexagon' and r.score > (r.detail ->> 'found')::int then 'hex_score_over_found' end,
         -- 네모 세기: more correct than tried, or boards solved faster than a person counts
         case when r.game = 'nemo_count' and (r.detail ->> 'correct')::int > (r.detail ->> 'attempted')::int then 'nemo_correct_over_attempted' end,
         case when r.game = 'nemo_count' and (r.detail ->> 'avgMs')::numeric < 15000 then 'nemo_avg_under_15s' end,
         case when r.game = 'nemo_count' and (r.detail ->> 'fastestMs')::numeric < 8000 then 'nemo_fastest_under_8s' end,
         case when r.game = 'nemo_count' and (r.detail ->> 'correct')::int >= 20 then 'nemo_high_score' end
       ], null) as reasons,
       r.detail
  from r;
revoke all on public.challenge_review from public, anon, authenticated;
