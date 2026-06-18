# Architecture

## Overview

TaskFlow is a single-page Kanban application. The frontend is a **React 19** SPA that communicates directly with **Supabase** — there is no custom server. Supabase provides authentication, a PostgreSQL database with Row-Level Security, realtime WebSocket broadcasts, and presence tracking.

```
┌──────────────────────────────────────────────────────────────┐
│                      Browser (React 19)                       │
│                                                              │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ AuthForm│  │  Board   │  │ Sidebar  │  │   Topbar     │  │
│  │ (sign   │  │ (DnD +   │  │ (project │  │  (views,     │  │
│  │  in/up) │  │ Columns) │  │ switcher,│  │   insights,  │  │
│  │          │  │          │  │ presence)│  │   theme)     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │              │               │         │
│  ┌────▼──────────────▼──────────────▼───────────────▼──────┐  │
│  │                @supabase/supabase-js                     │  │
│  │    REST (PostgREST)  │  Realtime (WebSocket)  │  Storage │  │
│  └──────────────────────┬──────────────────────────────────┘  │
└─────────────────────────┼─────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
  ┌──────────────┐ ┌────────────┐ ┌──────────────┐
  │ Supabase Auth │ │ PostgREST  │ │  Realtime    │
  │  /auth/v1/   │ │ /rest/v1/  │ │  WebSocket   │
  │ sign in/up   │ │ CRUD on    │ │ postgres_    │
  │ session mgmt │ │ tables     │ │ changes +    │
  │              │ │            │ │ presence     │
  └──────────────┘ └────────────┘ └──────────────┘
                          │
                          ▼
                 ┌────────────────┐
                 │   PostgreSQL   │
                 │                │
                 │  profiles      │
                 │  tasks         │
                 │  projects      │
                 │  project_      │
                 │    members     │
                 │  invitations   │
                 │  join_requests │
                 │  (RLS enforced)│
                 └────────────────┘
```

---

## Frontend Flow

### Entry point

`index.html` → `src/main.jsx` → `App.jsx`

`App.jsx` checks if `supabase` is configured (env vars present). If not, it renders a setup hint. Otherwise, it shows the auth gate.

### Auth gate

The `AuthGate` component calls `useAuth()`, which checks for an existing session via `supabase.auth.getSession()` and listens to `onAuthStateChange`. If no session exists, the user sees `AuthForm` (sign in / sign up). Once authenticated, the user enters `BoardPage`.

### Board page

`BoardPage` wires together:

| Hook / Component | Role |
|---|---|
| `useAuth()` | Session state + auth state listener |
| `useBoard(projectId)` | Task CRUD + realtime subscription (scoped to project) |
| `useProfile(session)` | Current user profile fetch/update |
| `useProjects()` | Project listing, create, archive, delete |
| `useMembers()` | All profiles (for assignee picker + admin panel) |
| `usePresence(session, profile)` | Online users via Realtime Presence |
| `useTaskStats()` | Lightweight task rows for sidebar counts |
| `useTheme()` | Dark/light theme toggle (localStorage) |
| `useIsMobile()` | Breakpoint 639px for layout switch |
| `useInvitations()` | Admin-only invitation CRUD |
| `Board` | Kanban columns with drag-and-drop |
| `Sidebar` | Project switcher, smart views, team presence, actions |
| `Topbar` | View selector, insights toggle, theme toggle |
| `TaskModal` | Create / edit / delete task dialog |
| `TaskActionSheet` | Mobile bottom sheet for task actions |
| `ProfileModal` / `ProfileMenu` | User menu with account settings, sign out |
| `AdminModal` | Admin panel (role management, invitations) |
| `InsightsPanel` | Progress ring, stats, top contributors |

### Layout

Two layouts, toggled by `useIsMobile()` (breakpoint: 639px):

- **Desktop:** horizontal row of columns inside a `DndContext`. Each column is a `SortableContext` with `verticalListSortingStrategy`.
- **Mobile:** vertical stack of columns. Each column has a fixed header and a scrollable card list.

### Drag and Drop

Uses `@dnd-kit/core` (`DndContext`, `DragOverlay`, `PointerSensor`/`TouchSensor`) with `@dnd-kit/sortable` (`SortableContext`, `useSortable`). On drag end, `positionBetween()` computes a fractional index midpoint, then calls `updateTask()` with the new `position` and `status`.

**Version note:** `@dnd-kit/core@6`, `@dnd-kit/sortable@10`, `@dnd-kit/utilities@3` — incompatible majors, import carefully.

---

## Data Layer

### Supabase client (`src/api/supabaseClient.js`)

A single `createClient()` call using the anon key. The client is `null` if env vars are missing, which lets the app degrade gracefully.

### Authentication

All Supabase API calls require authentication. The frontend uses `supabase.auth` methods:
- `signInWithPassword()` — email + password
- `signUp()` — email + password + display_name in user_metadata
- `getSession()` / `onAuthStateChange()` — session management
- `signOut()` — clears session

### Database queries

All data operations use `supabase.from('table')` with PostgREST query syntax:
- **Select with join:** `.select('*, assignee:profiles!tasks_assignee_fkey(display_name, avatar_url)')`
- **Insert:** `.insert({ ... })`
- **Update:** `.update({ ... }).eq('id', id)`
- **Delete:** `.delete().eq('id', id)`

### Realtime

A single `supabase.channel('board')` subscribes to `postgres_changes` on the `tasks` table with `event: '*'`. For INSERT/UPDATE, the affected row is re-fetched with the assignee join before being merged into local state.

### Presence

`supabase.channel('online-users')` with Supabase Realtime Presence. `usePresence()` returns a Set of online user IDs.

### Position system

Tasks are ordered within each column using a `double precision` position column. New tasks get `max + 1024`. When reordering via drag-and-drop, `positionBetween()` computes a midpoint between adjacent positions, avoiding full re-indexing.

```
positionBetween(above, below):
  both present  → (above + below) / 2
  only above    → above + 1024
  only below    → below - 1024
  none          → 1024
```

### Project system

Multi-project board via `projects` table. `useBoard(projectId)` accepts `'all'`, `null` (shared board), or a project UUID. `useProjects()` handles listing, creating, archiving, and deleting projects. Tasks have a nullable `project_id`.

### Smart views

Client-side filters on the full board: `view:mine` (assigned to user), `view:due` (next 7 days), `view:overdue` (past due, not done). Filters are applied locally after fetching all tasks.

### Theme

`useTheme()` reads/writes `localStorage` key `taskflow-theme`. Respects `prefers-color-scheme`. Sets `document.documentElement.dataset.theme`.

### Internationalization

i18next + react-i18next. Locales at `src/locales/{en,es,id,zh}.json`. Language stored in `localStorage` key `lang`.

---

## Supabase Backend

### Auth

Supabase Auth handles user creation, password management, and session tokens. The app uses the anon key (safe because RLS is enforced). On sign up, `handle_new_user` trigger creates a `profiles` row with role assignment logic.

### Database

PostgreSQL with Row-Level Security. Tables: `profiles`, `tasks`, `projects`, `project_members`, `invitations`, `join_requests`. Role-based access (`admin`/`member`/`unknown`). Column-level permissions prevent mutation of `created_by` on tasks.

Four RPC functions: `is_admin()`, `admin_set_role()`, `set_project_status()`, `delete_own_account()`.

See [Database](database.md) for the full schema.

### Storage

`avatars/` bucket — public read, authenticated upload at `avatars/{userId}/`.

### Realtime

The `tasks` table is added to the `supabase_realtime` publication with `replica identity full`, so every INSERT/UPDATE/DELETE broadcasts to all connected clients with full row data.

---

## Legacy Code

The project was originally built with **Vue 3 + NestJS**. After migration to React 19 + Supabase, the following are **dead code** — do not modify:

| Location | What |
|---|---|
| `backend/` | Orphaned NestJS scaffold — only dist/, generated/, node_modules/, .env remain |
| `frontend/src/composables/` | Empty directory — Vue 3 remnant |
| `frontend/src/assets/` | Empty directory — Vue 3 remnant |

The **`backend/prisma/schema.prisma`** is NOT the active schema — `supabase/migrations/` is the source of truth.
