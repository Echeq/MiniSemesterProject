-- TaskFlow seed data (local development only)
-- Run after the initial migration. Requires at least one auth user;
-- create one via Supabase CLI or sign up once through the app, then run: supabase db seed

-- Seed tasks for the first user found (dev convenience).
-- Idempotent: skips entirely if the board already has any tasks.
with first_user as (
  select id from public.profiles
  where not exists (select 1 from public.tasks)
  order by created_at limit 1
)
insert into public.tasks (title, description, status, due_date, position, created_by)
select t.title, t.description, t.status::public.task_status, t.due_date, t.position, first_user.id
from first_user,
     (values
        ('Set up Supabase project',      'Create project, copy URL + anon key into frontend/.env', 'done',  null::date,                       1024.0),
        ('Design Kanban board layout',   'Three columns: To Do / Doing / Done',                     'done',  null,                             2048.0),
        ('Implement drag & drop',        'Use @dnd-kit/core for column + card dragging',            'doing', (current_date + interval '3 days')::date, 1024.0),
        ('Wire up realtime updates',     'Subscribe to task changes via supabase_realtime',         'doing', (current_date + interval '5 days')::date, 2048.0),
        ('Add task due-date picker',     'Date input on the task form, show badge on cards',        'todo',  (current_date + interval '7 days')::date, 1024.0),
        ('Mobile responsive pass',       'Columns stack vertically on small screens',               'todo',  null,                             2048.0)
     ) as t(title, description, status, due_date, position)
on conflict do nothing;
