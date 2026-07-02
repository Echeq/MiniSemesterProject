# TaskFlow — Current System, Features & Setup

> This document describes the project **as it runs today**. Earlier docs may reference an older Vue 3 + NestJS approach that has been replaced. Use this file as a summary reference.

## Stack

| Layer | Technology |
|---|---|
| Frontend | **React 19 + Vite 8**, Tailwind CSS v4 |
| Drag & drop | `@dnd-kit/core@6` / `@dnd-kit/sortable@10` / `@dnd-kit/utilities@3` |
| Backend | **Supabase** (PostgreSQL + Auth + RLS + Realtime + Storage + Presence) |
| Client SDK | `@supabase/supabase-js` |
| Export | `jspdf` (PDF export available) |
| i18n | i18next + react-i18next (en, es, zh, id, ar) |
| Testing | Vitest 4 (jsdom) |

There is **no application server** — the React app talks directly to Supabase over PostgREST, Realtime, and Storage. All backend logic lives in SQL migrations under `supabase/migrations/` (14 files: tables, RLS policies, triggers, RPCs).

## Project layout

```
frontend/            React + Vite app (the UI)
  src/
    api/             supabaseClient.js
    components/       Board, Column, TaskCard, TaskModal, Sidebar, Topbar,
                      InsightsPanel, AuthForm, ProfileModal, AdminModal,
                      Avatar, Modal, InviteDialog, InvitationPopup,
                      AccountModal, ProfileMenu, ProfileSettings,
                      TaskActionSheet, ThemeToggle
    hooks/            useAuth, useBoard, useProfile, useProjects, useMembers,
                      useInvitations, useTaskStats, usePresence, useTheme,
                      useIsMobile
    locales/          en.json, es.json, id.json, zh.json, ar.json
    i18n.js           i18next configuration
    App.jsx           Root component
    main.jsx          Entry point
  tests/              27 test files (26 default + api.test.js excluded)
supabase/
  migrations/        14 SQL migrations (schema source of truth)
  seed.sql           Sample data for local dev
```

## Setup

### 1. Database (Supabase)

Create a Supabase project, then apply migrations:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or apply via Supabase Dashboard SQL Editor.

### 2. Configure the frontend

Create `frontend/.env`:

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-key>
VITE_TEST_USER_EMAIL=test@example.com
VITE_TEST_USER_PASSWORD=your-password
```

### 3. Run

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

> For local dev, disable email confirmation: Supabase Dashboard → Authentication → Settings → Disable "Confirm email".

## Features

### Boards & Tasks
- Kanban board with **To Do / Doing / Done** columns, drag-and-drop ordering (fractional `position` — single-row updates per move).
- Create / edit / delete tasks with title, description, due date, status, **assignee**, and **project**.
- **Realtime** — task changes from any client appear instantly (Supabase Realtime WebSocket).

### Projects
- Sidebar project switcher: **All tasks**, **Shared board** (no project), or a specific project.
- Any member can create projects; **admins** can archive / restore / delete.
- Each project has a color and icon (customizable).
- **Project members** — junction table with per-project roles (`admin`/`member`). Creator auto-added as admin.

### Smart Views (filter across all projects)
- **My tasks** — assigned to you.
- **Due soon** — not done, due within 7 days.
- **Overdue** — not done, past due.
- Views show only columns with matching tasks; "due soon" and "overdue" show contextual messages.

### Insights Panel (right side)
- Progress ring (Done / Doing / To Do composition + % complete).
- Key attributes: total, overdue, due-soon.
- Top contributors with proportional bars.
- Toggle from the topbar; scope-aware and live.

### Roles, Invitations & Admin
- **Roles:** `admin` | `member` | `unknown` (`profiles.role`).
- First signup → `admin`. Invited email → `member`. Others → `unknown`.
- **Admin panel** (admins only): manage member roles, send/revoke invitations.
- Invitations apply the chosen role automatically when the invitee signs up.
- RPCs: `admin_set_role()`, `is_admin()`, `delete_own_account()`, `set_project_status()`.

### Profile & Account
- **Profile panel** (avatar menu → Account settings): Overview tab (stats) and Settings tab (display name, avatar upload, change password, delete account).
- Avatar storage: `avatars/` bucket, public read, authenticated upload.

### Team Presence
- Sidebar **Team** section lists members with avatars and live **online/offline indicator** via Supabase Realtime Presence.

### Theming
- **Light / dark** toggle in the topbar (persisted to `localStorage` key `taskflow-theme`, defaults to OS preference).

### Internationalization
- 5 languages: English, Spanish, Indonesian, Chinese, Arabic. Stored in `localStorage` key `lang`. Arabic is RTL.

### Mobile
- Adaptive layout: columns stack vertically below 639px. Touch drag supported.

## Database Summary

| Table | Key Columns |
|---|---|
| `profiles` | `id`, `display_name`, `avatar_url`, `role`, `created_at` |
| `tasks` | `title`, `description`, `status`, `due_date`, `position`, `created_by`, `assignee`, `project_id` |
| `projects` | `name`, `description`, `status`, `color`, `icon`, `created_by` |
| `project_members` | `project_id`, `user_id`, `role` (unique on project+user) |
| `invitations` | `invited_email`, `role`, `status`, `invited_by` |
| `join_requests` | `requester_id`, `admin_email`, `status` |

**RPCs:** `is_admin`, `admin_set_role`, `set_project_status`, `delete_own_account`, `delete_account()` (legacy wrapper), `log_activity`, `get_logs`, `restore_from_backup`, `get_profile_preferences`, `set_profile_preferences`, `check_blocked_tasks`, `add_task_dependency`, `export_all_data`, `get_filtered_tasks`, `get_notifications`

**Storage:** public `avatars` bucket (`{userId}/{file}`)

**See [Database](database.md) for full schema, RLS details, and migration history.**
---

**[? Back to Top](#) | [?? Documentation Index](../INDEX.md)**

