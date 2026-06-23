# TaskFlow — Presentation Outline

> Estimated: 10 slides, 12-15 minutes

---

## Slide 1 — Title

- **TaskFlow** — Visual Task Scheduling & Management for Small Teams
- Team: 陈昌发 (PM), 孔刚 (Frontend), 周奕龙 (Backend)
- 华中科技大学 — Mini Semester Project 2026

---

## Slide 2 — Problem

- Small teams use sticky notes, spreadsheets, or WhatsApp to track tasks
- No real-time visibility on who's doing what
- Deadlines get missed without alerts
- One-paragraph setup

---

## Slide 3 — Solution

- Real-time Kanban board with drag & drop
- Role-based access (admin / member)
- Smart views: My tasks, Due soon, Overdue
- Multi-project support with team presence (who's online)
- **Live demo next**

---

## Slide 4 — Live Demo (Core Features)

Show the running app:
1. Sign in / Sign up
2. Create a task, drag between columns
3. Show smart view: "My tasks"
4. Open another browser — show real-time sync
5. Show dark mode toggle + language switch

---

## Slide 5 — Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, @dnd-kit |
| Backend | Supabase (Auth, PostgREST, Realtime, Storage, PostgreSQL) |
| Testing | Vitest (57 unit tests) |
| AI Tooling | OpenCode (MCP, @ai-commit, @ai-log) |
| Docs | i18next (4 languages), jsPDF (export) |

---

## Slide 6 — Architecture

- **No custom server** — React SPA talks directly to Supabase
- SQL migrations are the single source of truth (9 files)
- Row-Level Security: admin sees all, member sees assigned only, unknown sees nothing
- Realtime: WebSocket broadcast on every INSERT/UPDATE/DELETE
- Presence: online user tracking via Realtime Presence
- Diagram: Browser → Supabase (Auth + PostgREST + Realtime + Storage) → PostgreSQL

---

## Slide 7 — Key Features Deep-Dive

| Feature | Tech |
|---|---|
| Drag & Drop | @dnd-kit (core + sortable) — cross-column + within-column, mobile touch |
| Position System | float8 fractional indexing — midpoint on reorder, no re-indexing |
| Smart Views | Client-side filters — mine, due ≤7d, overdue |
| Export | PDF + CSV from current view |
| Theme | CSS variable system — light/dark toggle, localStorage persistence |
| i18n | 4 languages — en, es, zh, id |

---

## Slide 8 — Testing & Quality

- 57 unit tests (Vitest + Testing Library)
- Components: Board, Column, TaskCard, TaskModal, AuthForm, ProfileSettings
- Hooks: useAuth, useBoard, useProfile, positionBetween
- API integration tests (excluded from CI, run manually)
- AI-assisted code audit: 1 migration bug found and fixed, 11 dead files removed

---

## Slide 9 — Challenges & Learnings

| Challenge | Solution |
|---|---|
| @dnd-kit version incompatibility (core@6, sortable@10) | Careful import management |
| Migration duplicate policy crash | Added `IF NOT EXISTS` |
| Realtime merge with joined data | Re-fetch row with assignee join before merging |
| Position drift over time | float8 precision avoids re-indexing entirely |
| AI-assisted development | OpenCode MCP for migrations, components, docs |

---

## Slide 10 — Results & Future

### What we built (Week 2 target)
- ✅ Auth + roles + invitations
- ✅ Task CRUD + drag & drop
- ✅ Real-time sync + presence
- ✅ Projects + members + colors
- ✅ Priority + labels + dependencies
- ✅ PDF/CSV export
- 🔄 Smart notifications (Week 3)

### Dashboard numbers
- 9 SQL migrations
- 57 tests, 0 failures
- 19 components, 10 hooks
- 4 languages
- 75% of requirements complete (target by Week 2)

---

## Backup Slides (if time permits)

### B1 — Database Schema
- 6 tables: profiles, tasks, projects, project_members, invitations, join_requests
- 4 RPCs: is_admin, admin_set_role, set_project_status, delete_own_account
- 3 triggers: handle_new_user, handle_new_project_member, handle_updated_at

### B2 — RLS Deep-Dive
- Role-based policies on every table
- Column-level grants: created_by immutable
- First user → admin bootstrap via trigger

### B3 — AI Workflow
- OpenCode + AGENTS.md for context
- @ai-log for tracking every interaction
- @ai-commit for conventional commits
- MCP Supabase for AI-driven DB operations
