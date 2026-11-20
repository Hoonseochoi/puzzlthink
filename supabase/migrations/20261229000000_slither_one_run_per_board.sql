-- 슬리더링크: one try per board, also as a constraint. slither_start_beat already refuses a second run
-- ('tried') the moment the first is handed out, whatever happens to it after; this makes it impossible at the table.
create unique index if not exists slither_runs_one_per_board on public.slither_runs (challenge_id, user_id);
