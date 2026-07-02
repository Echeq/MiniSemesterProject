# PivotPoint — Presentation Script (English)

**Total duration:** < 10 minutes  
**Speakers:** memerzxz (Presentation + Topics 1-4), goanar (Topics 5-8), Echeq (Rest + Closing)

---

## memerzxz — Introduction & Topics 1-4 (~3.5 min)

### Slide 1 — Title (15s)

"Good morning everyone. Today we're presenting PivotPoint — a real-time collaborative Kanban board built with React 19 and Supabase."

---

### Slide 2 — Agenda (15s)

"Here's what we'll cover: the problem, our solution, architecture, key features, tech stack, database design, and a live demo."

---

### Slide 3 — Topic 1: The Problem (30s)

"Traditional project management tools fall short. Jira is complex and expensive. Trello lacks real-time sync. Most tools charge per user and lock you into their workflow. Teams need something lightweight, real-time, affordable, and customizable."

---

### Slide 4 — Topic 2: The Solution (30s)

"PivotPoint solves this with a real-time Kanban board that just works. Key features: drag-and-drop, live sync across all clients, role-based access, multiple views including Gantt and 3D, export to Excel/PDF/CSV, and support for 5 languages including Arabic RTL."

---

### Slide 5 — Topic 3: Business Flow (40s)

"Here's the user journey. A visitor lands on the app — if env vars are missing, they see a setup hint. Otherwise they authenticate via Supabase Auth. The system checks their role: unknown users request access, members view and edit their tasks, admins have full control. The Kanban board is the main workspace."

---

### Slide 6 — Topic 4: Architecture (50s)

"The architecture is JAMstack. Frontend: React 19 with Vite 8, 10 custom hooks encapsulating business logic, 5 view modes. Backend: pure Supabase — no custom server. Supabase provides Auth, PostgREST API, Realtime subscriptions, Storage, and PostgreSQL. The database has 29 migrations as the single source of truth."

---

## goanar — Topics 5-8 (~3 min)

### Slide 7 — Topic 5: Task Management (50s)

"Task management is the core. Users can create, edit, and delete tasks with full drag-and-drop — both within and between columns. We support P0-P3 priority levels, due dates with smart filters for overdue and due-soon tasks, assignment to team members, and task dependencies that block completion until resolved. Custom labels per project. Our positioning system uses float8 with midpoint on reorder and max+1024 on insert — no re-indexing needed."

---

### Slide 8 — Topic 6: Real-time Collaboration (45s)

"Real-time is built into the foundation. When A moves a task to Done, the hook calls Supabase, PostgreSQL processes the update, and Supabase Realtime broadcasts the change on the 'board' channel. All connected clients receive the update and re-fetch the modified row. We also track online presence — who's viewing the board — and who's editing a task. Notifications are database-driven via triggers."

---

### Slide 9 — Topic 7: Views & Export (30s)

"PivotPoint offers 5 views: Kanban with drag-and-drop, Gantt chart for timeline, 3D sphere for spatial perspective, Dashboard with stats, and List view for tabular data. Users can export to Excel, PDF, or CSV. The interface is translated into 5 languages with Arabic RTL support."

---

### Slide 10 — Topic 8: Tech Stack (25s)

"Tech stack: React 19, Vite 8, Tailwind CSS v4, @dnd-kit for drag-and-drop. Backend is entirely Supabase — no custom server. PostgreSQL with 29 migrations, Row-Level Security, and triggers. Testing with Vitest and Testing Library. CI via GitHub Actions."

---

## Echeq — Rest & Closing (~3 min)

### Slide 11 — Database Schema (30s)

"The database has 7 core tables: profiles, tasks, projects, labels, task_labels, task_dependencies, and notifications. Plus invitations, join requests, and project members for team management. Key constraints: title 1-200 chars, description max 5000, created_by immutable after insert."

---

### Slide 12 — Role-Based Access Control (35s)

"Three roles with Row-Level Security. Admins: full CRUD, manage members. Members: read-only for all tasks, can only edit assigned tasks. Unknown users: empty board, must request access. First signup ever becomes admin. Later signups check for invitations via a trigger. Admins promote users via the admin_set_role RPC."

---

### Slide 13 — Development Workflow (20s)

"Workflow: `npm install` from frontend, copy `.env.example` to `.env`, `npm run dev`. Testing with `npm test`. Database via Supabase CLI: `supabase start`, `supabase db push`. Production build with `npm run build`. CI runs tests and build on push to main."

---

### Slide 14 — Project Structure (15s)

"Project structure: frontend with 40 components and 10 hooks, supabase with 29 migrations, docs, and deploy scripts. Clean separation of concerns."

---

### Slide 15 — Demo (50s)

"Now let me show you PivotPoint in action. I'll sign in, create a project, add tasks, drag them between columns, assign members, add labels and dependencies, switch between Kanban/Gantt/3D views, export to Excel, and show real-time sync by opening a second browser."

---

### Slide 16 — Thank You (20s)

"Thank you for your attention. PivotPoint proves you can build a production-grade real-time app with just React and Supabase — no custom server. The app is built with migrations, RLS, real-time subscriptions, comprehensive tests, and CI/CD. Questions?"

---

**[⬆ Back to Top](#)**
