-- 슬리더링크 challenge runs keep their moves and the server's suspicion signals (✕ bursts, clean streaks after a wipe)
-- for review. Signals don't block a record; flags (slither_finish_checked's p_flag) still do.
alter table public.slither_runs add column if not exists signals jsonb;
alter table public.slither_runs add column if not exists steps jsonb;
