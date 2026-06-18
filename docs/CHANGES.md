# TaskFlow — Current System, Features & Setup

> This document describes the project **as it runs today**. Earlier docs in this
> folder describe an older Vue 3 + NestJS approach that has been replaced — they
> are kept for history but are no longer accurate. Use this file as the source of
> truth.

## Stack

| Layer | Technology |
|---|---|
| Frontend | **React 19 + Vite**, plain CSS variables + Tailwind utilities |
| Drag & drop | `@dnd-kit/core` / `sortable` |
| Backend | **Supabase** (PostgreSQL + Auth + Row Level Security + Realtime + Storage) |
| Client SDK | `@supabase/supabase-js` |
| Export | `xlsx`, `jspdf` (available) |

There is **no application server** — the React app talks directly to Supabase
over PostgREST, Realtime, and Storage. All backend logic lives in SQL migrations
under `supabase/migrations/` (tables, RLS policies, triggers, RPCs).

## Project layout

```
frontend/            React + Vite app (the UI)
  src/
    api/             supabaseClient.js
    components/       Board, Column, TaskCard, TaskModal, Sidebar, Topbar,
                      InsightsPanel, ProfileModal, AdminModal, Avatar, Modal, …
    hooks/            useAuth, useBoard, useProfile, useProjects, useMembers,
                      useInvitations, useTaskStats, usePresence, useTheme
supabase/
  migrations/        schema, RLS, triggers, RPCs (the backend)
  seed.sql           sample data for local dev
  README.md          schema + API contract reference
```

## Setup

### 1. Apply the database (Supabase)
Create a Supabase project, then apply every file in `supabase/migrations/` in
filename order — via the dashboard **SQL Editor**, or the CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### 2. Configure the frontend
Create `frontend/.env` with your project's **Project URL** and **anon/publishable
key** (Settings → API):

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-key>
```

### 3. Run
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

> For local dev, turn **off** email confirmation (Supabase → Authentication →
> Sign In / Providers → Email) so sign-up logs you straight in.

### First admin
The **first account to sign up becomes `admin` automatically** (handled by the
`handle_new_user` trigger). Everyone after that is a `member`. To force an
account to admin manually:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

## Features

### Boards & tasks
- Kanban board with **To Do / Doing / Done** columns, drag-and-drop ordering
  (fractional `position` so each move is a single-row update).
- Create / edit / delete tasks with title, description, due date, status,
  **assignee**, and **project**.
- **Realtime** — task changes from any client appear instantly.

### Projects
- Sidebar project switcher: **All tasks**, **Shared board** (no project), or a
  specific project.
- Any member can create projects; **admins** can archive / restore / delete.
- Each active project shows a **live completion progress bar** in the sidebar.

### Smart views (filter across all projects)
- **My tasks** — assigned to you.
- **Due soon** — not done, due within 7 days.
- **Overdue** — not done, past due.
- These views show only columns that contain matching tasks, and **Due soon /
  Overdue** display a contextual message (including an "all caught up" state).

### Insights panel (right side)
- Progress ring (Done / Doing / To Do composition + % complete).
- Key attributes: total, overdue, due-soon.
- Top contributors with proportional bars.
- Toggle from the topbar; scope-aware and live.

### Roles, invitations & admin
- Roles: `admin` | `member` (`profiles.role`).
- **Admin panel** (admins only): manage member roles, send/revoke invitations.
- Invitations apply the chosen role automatically when the invitee signs up.

### Profile & account
- **Profile panel** (avatar menu → Account settings) with two tabs:
  - **Overview** — your stats (progress, overdue, due-soon), active work, role,
    join date.
  - **Settings** — display name, avatar upload, change password, delete account.

### Team presence
- Sidebar **Team** section lists members with avatars and a live **online/offline
  indicator** via Supabase Realtime Presence.

### Theming
- **Light / dark** toggle in the topbar (persisted to `localStorage`, defaults to
  OS preference). Light is a clean off-white; both use frosted-glass surfaces.

## Database summary

See `supabase/README.md` for the full schema and supabase-js API contract.
Key objects:

- **`profiles`** — `id`, `display_name`, `avatar_url`, `role`; auto-created on
  signup.
- **`tasks`** — `title`, `description`, `status`, `due_date`, `position`,
  `created_by`, `assignee`, `project_id`.
- **`projects`** — `name`, `description`, `status` (active/archived), `created_by`.
- **`invitations`** — `email`, `role`, `status`, `invited_by`.
- **RPCs** — `admin_set_role`, `set_project_status`, `delete_own_account`,
  `is_admin`.
- **Storage** — public `avatars` bucket (`<user-id>/<file>`).
