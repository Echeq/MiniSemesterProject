-- Fix notify_due_soon to skip tasks with no assignee

create or replace function public.notify_due_soon()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.due_date is not null and new.status != 'done' and new.assignee is not null then
    if new.due_date <= (now() + interval '24 hours') then
      insert into public.notifications (user_id, type, message, task_id)
      values (
        new.assignee,
        case when new.due_date < now() then 'overdue' else 'due_soon' end,
        case when new.due_date < now()
          then 'Task "' || new.title || '" is overdue'
          else 'Task "' || new.title || '" is due within 24 hours'
        end,
        new.id
      )
      on conflict do nothing;
    end if;
  end if;
  return new;
end;
$$;
