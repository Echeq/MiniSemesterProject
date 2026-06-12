-- Fix: signup failed with a 500 when display_name metadata exceeded the
-- 100-char cap added in 20260612120000 — the handle_new_user trigger
-- inserted the raw value, the check constraint fired, and the whole
-- auth.users insert rolled back. Truncate at the trigger instead;
-- profile creation must never block signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(new.raw_user_meta_data ->> 'display_name', ''),
        split_part(new.email, '@', 1)
      ),
      100
    )
  );
  return new;
end;
$$;
