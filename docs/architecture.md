# Architecture

## Overview

TaskFlow is a single-page Kanban application. The frontend is a **React 19** SPA that communicates directly with **Supabase** — there is no custom server. Supabase provides authentication, a PostgreSQL database with Row-Level Security, and realtime WebSocket broadcasts.

```
┌──────────────────────────────────────────────────────────┐
│                    Browser (React 19)                     │
│                                                          │
│  ┌─────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ AuthForm │  │              │  │                    │  │
│  │ (sign    │  │    Board     │  │   TaskModal /      │  │
│  │  in/up)  │  │  (DnD +     │  │   TaskActionSheet  │  │
│  │          │  │   Columns)   │  │                    │  │
│  └────┬─────┘  └──────┬───────┘  └────────────────────┘  │
│       │               │                                   │
│  ┌────▼───────────────▼───────────────────────────────┐   │
│  │              @supabase/supabase-js                  │   │
│  │   (supabaseClient.js — initialized with anon key)   │   │
│  └────────────────────┬────────────────────────────────┘   │
└───────────────────────┼────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌────────────┐ ┌──────────────┐
│ Supabase Auth │ │ PostgREST  │ │  Realtime    │
│  /auth/v1/   │ │ /rest/v1/  │ │  WebSocket   │
│ sign in/up   │ │ CRUD on    │ │ postgres_    │
│ session      │ │ tasks &    │ │ changes      │
│ logout       │ │ profiles   │ │ subscription │
└──────────────┘ └────────────┘ └──────────────┘
                        │
                        ▼
               ┌────────────────┐
               │   PostgreSQL   │
               │                │
               │  profiles      │
               │  tasks         │
               │  (RLS enforced)│
               └────────────────┘
```

---

## Frontend flow

### Entry point

`index.html` → `src/main.jsx` → `App.jsx`

`App.jsx` checks if `supabase` is configured (env vars present). If not, it renders a setup hint. Otherwise, it shows the auth gate.

### Auth gate (`App.jsx:138`)

The `AuthGate` component calls `useAuth()`, which checks for an existing session via `supabase.auth.getSession()` and listens to `onAuthStateChange`. If no session exists, the user sees `AuthForm` (sign in / sign up). Once authenticated, the user enters `BoardPage`.

### Board page (`App.jsx:59`)

`BoardPage` wires together:

| Hook / Component | Role |
|---|---|
| `useBoard()` | Fetches tasks, provides CRUD helpers, subscribes to realtime |
| `useProfile()` | Manages the current user's profile (display name, avatar) |
| `Board` | Renders the Kanban columns with drag-and-drop |
| `Header` | App bar with "New task" button and sign out |
| `TaskModal` | Create / edit / delete task dialog |
| `TaskActionSheet` | Mobile bottom sheet for task actions |
| `ProfileMenu` | Floating button to open profile settings |

### Board layout

Two layouts, toggled by `useIsMobile()` (breakpoint: 639px):

- **Desktop:** horizontal row of columns inside a `DndContext`. Columns share available width with `flex-1`. Each column is a `SortableContext` with `verticalListSortingStrategy`.
- **Mobile:** vertical stack of columns. Each column has a fixed header and a scrollable card list capped at `max-h-[50vh]`.

### Drag and drop

Uses `@dnd-kit/core` (`DndContext`, `DragOverlay`, `PointerSensor`/`TouchSensor`) with `@dnd-kit/sortable` (`SortableContext`, `useSortable`). On drag end, `positionBetween()` computes a fractional index midpoint between the two adjacent cards, then calls `updateTask()` with the new `position` and `status`.

---

## Data layer

### Supabase client (`src/api/supabaseClient.js`)

A single `createClient()` call using the anon key. The client is `null` if env vars are missing, which lets the app degrade gracefully instead of crashing.

### Authentication

All Supabase API calls require authentication. The frontend uses `supabase.auth` methods:

- `signInWithPassword()` — email + password
- `signUp()` — email + password + display_name in user_metadata
- `getSession()` / `onAuthStateChange()` — session management
- `signOut()` — clears session

### Database queries

All data operations use `supabase.from('tasks')` and `supabase.from('profiles')` with PostgREST query syntax:

- **Select with join:** `.select('*, assignee:profiles!tasks_assignee_fkey(display_name, avatar_url)')`
- **Insert:** `.insert({ title, description, status, position, created_by })`
- **Update:** `.update({ title, status, position })`.eq('id', taskId)
- **Delete:** `.delete()`.eq('id', taskId)

### Realtime

A single `supabase.channel('board')` subscribes to `postgres_changes` on the `tasks` table with `event: '*'`. The subscription handles INSERT, UPDATE, and DELETE events. For INSERT/UPDATE, the affected row is re-fetched with the assignee join before being merged into local state.

### Position system

Tasks are ordered within each column using a `double precision` position column. New tasks get `max + 1024`. When reordering via drag-and-drop, the frontend computes a midpoint between the two adjacent positions, avoiding a full re-index on every move.

```
positionBetween(above, below):
  both present  → (above + below) / 2
  only above    → above + 1024
  only below    → below - 1024
  none          → 1024
```

---

## Supabase backend

### Auth

Supabase Auth handles user creation, password management, and session tokens. The app uses the anon key (safe because RLS is enforced). On sign up, a database trigger (`handle_new_user`) automatically creates a row in `public.profiles`.

### Database

PostgreSQL with Row-Level Security. Two tables: `profiles` and `tasks`. All authenticated users can read all tasks, but `created_by` is immutable (column-level revoke). See [Database](database.md) for the full schema.

### Realtime

The `tasks` table is added to the `supabase_realtime` publication with `replica identity full`, so every INSERT/UPDATE/DELETE broadcasts to all connected clients with full row data.

---

## Legacy code

The project was originally built with **Vue 3 + NestJS**. During a migration, the stack changed to React 19 + Supabase. The following are **dead code** and should not be modified:

| Location | What |
|---|---|
| `frontend/src/main.ts` | Vue 3 entry point |
| `frontend/src/App.vue` | Vue 3 root component |
| `frontend/src/style.css` | Vue 3 styles |
| `frontend/src/stores/` | Pinia stores |
| `frontend/src/pages/` | Vue router pages |
| `frontend/src/composables/` | Vue composables |
| `frontend/src/assets/` | Vue asset files |
| `frontend/vite.config.ts` | Vue plugin config |
| `backend/` | Full NestJS scaffold (empty AppModule, no Prisma service) |

The **`backend/prisma/schema.prisma`** file mirrors the original design but is **not** the active schema — the Supabase migrations (`supabase/migrations/`) are the source of truth.
