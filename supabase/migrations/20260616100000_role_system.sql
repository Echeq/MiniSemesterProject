-- Role system: join requests from unknown users (user-facing policies).
-- The role column, invitations table, handle_new_user, and admin-specific
-- policies were moved to 20260617120000_rbac_projects_invitations.sql to
-- avoid conflicting schema definitions.

-- ============================================================
-- 1. Join requests — unknown users requesting access
-- ============================================================
create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  admin_email text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now()
);

create index idx_join_requests_requester on public.join_requests (requester_id);

comment on table public.join_requests is 'Access requests from unknown users. Admins can review and invite them.';

-- ============================================================
-- 2. RLS policies for join_requests (user-facing only).
-- Admin policies are created in 20260617120000 after is_admin() exists.
-- ============================================================
alter table public.join_requests enable row level security;

create policy "Users can create own join request"
  on public.join_requests for insert
  to authenticated
  with check (requester_id = auth.uid());

create policy "Users can view own join requests"
  on public.join_requests for select
  to authenticated
  using (requester_id = auth.uid());
