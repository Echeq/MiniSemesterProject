-- TaskFlow backend hardening
-- 1. created_by is immutable: the insert policy enforces created_by =
--    auth.uid(), but the permissive update policy let any user rewrite it.
--    Column-level grants close that hole (PostgREST respects them).
-- 2. Index the created_by FK so profile deletes don't scan tasks.
-- 3. Cap free-text columns; title was capped but these were unbounded.

-- ============================================================
-- 1. Make created_by (and timestamps) immutable via column grants
-- ============================================================
revoke update on table public.tasks from authenticated;
grant update (title, description, status, due_date, position, assignee)
  on table public.tasks to authenticated;

-- ============================================================
-- 2. Missing FK index
-- ============================================================
create index tasks_created_by_idx on public.tasks (created_by);

-- ============================================================
-- 3. Length caps on free-text columns
-- ============================================================
alter table public.tasks
  add constraint tasks_description_length check (char_length(description) <= 5000);

alter table public.profiles
  add constraint profiles_display_name_length check (char_length(display_name) <= 100);
