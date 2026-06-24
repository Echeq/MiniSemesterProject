# Presentation Outline

## Slide 1 — Title
- TaskFlow: Real-time Collaborative Kanban Board
- Team: @goanarbolkong, @MemerZxZ, @Echeq
- MiniSemester Project

---

## Slide 2 — Problem
- Teams lack a simple, real-time task tracker
- Existing tools are complex, expensive, or require custom servers
- Need for live collaboration without infrastructure overhead

---

## Slide 3 — Solution
- TaskFlow: a single-page Kanban app
- Drag-and-drop, real-time sync, no backend to manage
- Entire backend = Supabase (auth, database, realtime, storage)

---

## Slide 4 — Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Drag & drop | @dnd-kit (core 6, sortable 10, utilities 3) |
| Backend | Supabase (PostgREST, Auth, Realtime, Storage) |
| Testing | Vitest 4 + Testing Library |
| AI tooling | OpenCode (Supabase MCP) |

---

## Slide 5 — Architecture

```
Browser (React 19 SPA)
      │
      ├── Supabase Auth (sign in/up, sessions)
      ├── PostgREST (CRUD on tasks, projects, profiles)
      ├── Realtime (live updates via WebSocket)
      └── Storage (avatar uploads)
```

- No custom server — zero infrastructure
- Row-Level Security enforces permissions at DB level

---

## Slide 6 — Features (1/2)

- **Kanban board** with drag-and-drop between columns
- **Real-time sync** — changes appear in <1s across clients
- **Smart views**: My tasks, Due soon, Overdue
- **Projects** with colors, icons, and archive/restore
- **Task priorities** (P0–P3 with color coding)

---

## Slide 7 — Features (2/2)

- **Labels** — custom colored labels per project
- **Task dependencies** — blocking relationships with circular detection
- **List view** — table with sortable columns
- **Export** — PDF and CSV download
- **Dark/light theme** — persisted preference
- **Admin panel** — role management, audit logs, backup

---

## Slide 8 — Database Schema

10 migrations covering:
- Tables: profiles, tasks, projects, project_members, labels, task_labels
- Notifications, task_dependencies, system_logs, invitations
- RLS policies: admin sees all, member sees assigned
- RPCs: admin_set_role, check_blocked_tasks, log_activity, export_all_data

---

## Slide 9 — Security

- Row-Level Security on every table
- Column-level grants (created_by immutable)
- Role system: admin / member / unknown
- First user becomes admin automatically
- Invitation flow with role assignment on signup

---

## Slide 10 — Testing

- **82 unit tests** across 18 test files
- Components rendered with Testing Library
- Hooks tested with renderHook + mock Supabase
- API integration tests against real Supabase
- CI-ready: `npm test` runs in seconds

---

## Slide 11 — Deployment

- Static frontend (Vite build → dist/)
- Deploy to Vercel, Netlify, Cloudflare, or any static host
- Supabase project linked via `supabase link`
- Migrations applied via `supabase db push`
- Full guide in `docs/deploy.md`

---

## Slide 12 — Demo

Live walkthrough:
1. Sign in / sign up
2. Create a project
3. Create tasks with priority and labels
4. Drag between columns
5. Open two tabs — show realtime sync
6. Smart views: My tasks, Overdue
7. Export to PDF
8. Admin panel: logs, backup

---

## Slide 13 — Challenges & Lessons

- @dnd-kit versions core@6 + sortable@10 + utilities@3 — incompatible majors, careful import required
- Supabase MCP applies migrations remotely — local files must be synced manually
- Position system uses float8 midpoint + 1024 — no re-indexing needed
- Realtime payloads lack joined fields — re-fetch single row on INSERT/UPDATE

---

## Slide 14 — Future Work

- Gantt chart timeline view
- 3D data sphere visualization (Three.js)
- Advanced filter panel with saved presets
- Mobile app (React Native)
- Email notifications
- OAuth providers (Google, GitHub)

---

## Slide 15 — Q&A
