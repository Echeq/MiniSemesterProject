# PivotPoint — Extended Presentation Script (English)

**Total duration:** < 10 minutes  
**Speakers:** memerzxz (~3.5 min), goanar (~3 min), Echeq (~3 min)

---

## memerzxz — Introduction & Topics 1-4

---

### [Slide 1] Title — (15s)

"Good morning everyone. I'm [Name], and I'm excited to present PivotPoint — a real-time collaborative Kanban board. Built with React 19 on the frontend and Supabase on the backend, it's designed to be lightweight, real-time by default, and production ready."

---

### [Slide 2] Agenda — (15s)

"Here's our roadmap. We'll start with the problem we identified, walk through our solution and architecture, highlight key features — task management, real-time collaboration, and multiple views — then cover the tech stack, database design, and finish with a live demo."

---

### [Slide 3] Topic 1: The Problem — (40s)

"Traditional project management tools have significant drawbacks. Let me list them:

**First — disconnected tools.** Most teams use a mix of spreadsheets, emails, and basic task trackers. Nothing talks to each other.

**Second — no real-time collaboration.** You update a task, your teammate doesn't see it until they refresh the page.

**Third — complex setup.** Jira requires dedicated infrastructure and configuration. It's overkill for most teams.

**Fourth — expensive licensing.** Per-seat costs add up quickly, especially for growing teams.

**And fifth — limited customization.** Most SaaS tools lock you into their workflow.

So what do teams actually need? Something lightweight, real-time, affordable, and customizable. That's exactly what PivotPoint delivers."

---

### [Slide 4] Topic 2: The Solution — (35s)

"PivotPoint is a full-featured Kanban board that addresses all five problems. Let me show you what it does:

First, a **drag-and-drop Kanban board** — the primary interface. Tasks flow through Todo → Doing → Done.

Second, **live synchronization** across all connected clients. When one person moves a task, everyone sees it instantly. No refresh needed.

Third, **role-based access control** with three tiers: Admin, Member, and Unknown — enforced at the database level via Row-Level Security.

Fourth, **multiple views** beyond just Kanban — a Gantt chart for timeline planning, a 3D sphere for a unique spatial perspective, a dashboard with project statistics, and a sortable list view.

Fifth, **export capabilities** — Excel, PDF, and CSV with customizable column selection.

And finally, **internationalization** — 5 languages including Arabic with full right-to-left layout support."

---

### [Slide 5] Topic 3: Business Process Flow — (45s)

"Let me walk you through the complete user journey, which you can see in our business flow diagram.

A visitor navigates to the app. First, the system checks if Supabase environment variables are configured. If not, the user sees a helpful setup hint page — this is important for developers cloning the project.

If configured, the user authenticates through Supabase Auth — either signing in or signing up.

Once authenticated, the system checks their role. There are three possibilities:

- **Unknown users** — first-time signups without an invitation. They see an empty board with a request-access button. They can't see any tasks until an admin approves them.

- **Members** — users who were invited by an admin or had their join request approved. They can view all tasks but only edit tasks assigned to them.

- **Admins** — the first user to ever sign up becomes admin automatically. Admins have full CRUD on all tasks and can manage team members.

After the role check, the user lands on the Kanban board — the central workspace."

---

### [Slide 6] Topic 4: Architecture Overview — (55s)

"Now let's look at the architecture — you can follow along with our system diagram.

The frontend is built with **React 19** and **Vite 8**. We have about **40 React components** organized in a flat structure under `src/components/`. All business logic is encapsulated in **10 custom hooks** — hooks like `useBoard` for task operations, `useAuth` for authentication, `useProjects` for project CRUD, `usePresence` for online status, and `useTaskEditing` for showing who's editing what.

The frontend has **5 view modes**: Kanban, List, Gantt, 3D Sphere, and Dashboard — each implemented as a separate component.

Now the backend. This is the key decision: **there is no custom server**. The entire backend is **Supabase** — a Firebase-like platform that provides everything we need:

- **Auth** — email/password authentication out of the box
- **PostgREST API** — an auto-generated REST API from our PostgreSQL schema, with full Row-Level Security
- **Realtime** — WebSocket subscriptions on database changes
- **Storage** — for file uploads like avatars
- **PostgreSQL** — the relational database

The database is the source of truth, managed through **29 SQL migration files** in `supabase/migrations/`. Every schema change goes through a migration — no raw SQL changes in production.

The communication between frontend and backend happens through the `supabase-js` client library, which handles auth tokens, REST calls, and realtime subscriptions transparently."

---

## goanar — Topics 5-8

---

### [Slide 7] Topic 5: Task Management — (55s)

"Task management is the heart of PivotPoint. Let me walk through the features visible on this slide.

**CRUD operations.** Users can create, read, update, and delete tasks. The task creation form supports title, description, due date, status, priority, assignee, and project — all in a single modal.

**Drag and drop.** Powered by @dnd-kit. Tasks can be dragged within a column to reorder, or between columns to change status. We use two sensors: a PointerSensor for desktop with a 6px activation distance, and a TouchSensor for mobile with a 200ms delay to prevent accidental drags while scrolling.

**Priority system.** Four levels: P0 Critical in red, P1 High in orange, P2 Medium in yellow, P3 Low in green. Each is visually distinct on task cards.

**Due dates and smart views.** Tasks have a date picker for due dates. Three smart views filter tasks automatically: 'My Tasks' shows your assignments, 'Due Soon' shows tasks due within 7 days, and 'Overdue' shows past-due tasks.

**Assignees.** Each task can be assigned to a project member. The assignee's avatar appears on the task card for quick visual identification.

**Dependencies.** Tasks can depend on other tasks. When a task has blockers, it cannot be moved to Done — the system checks a database RPC before completing. The blocked count is shown on task cards.

**Labels.** Custom labels per project with color coding. Labels are managed through the LabelManager component and can be toggled on tasks.

**Positioning system.** Each task has a float8 position field. When reordering, we take the midpoint between adjacent tasks. When inserting, we add 1024 to the maximum. This avoids expensive re-indexing operations."

---

### [Slide 8] Topic 6: Real-time Collaboration — (50s)

"This is one of our core features. Let me explain how real-time works, referencing the data flow diagram.

When User A moves a task to Done, here's exactly what happens:

**Step 1 — Frontend.** The `useBoard` hook calls `supabase.from('tasks').update({ status: 'done' }).eq('id', taskId)`.

**Step 2 — Backend.** PostgreSQL processes the UPDATE. Row-Level Security policies verify the user has permission. The change is committed.

**Step 3 — Realtime broadcast.** Because the `tasks` table is in the `supabase_realtime` publication, Supabase Realtime picks up the change and broadcasts it on the `board` channel.

**Step 4 — All clients.** User B, User C, and every other connected client receives the change event. The `useBoard` hook in each client's browser has a subscription:

```javascript
.channel('board')
.on('postgres_changes',
  { event: '*', schema: 'public', table: 'tasks' },
  (payload) => { /* merge into state */ }
)
.subscribe()
```

**Step 5 — Optimistic merge.** The hook batches incoming events using requestAnimationFrame, deduplicates by task ID, re-fetches the modified row with enriched data (labels, dependencies, assignee profile), and merges it into the local state. All of this happens in under a second.

**Beyond task updates**, we also have:

- **Presence tracking** — the `usePresence` hook subscribes to a `presence` channel. Each user broadcasts their user ID and display name. The presence state is a shared JavaScript object that Sync's across all clients automatically. A green dot appears next to online members in the sidebar.

- **Editing indicators** — the `useTaskEditing` hook tracks which task each user is currently editing. Other users see a small avatar and 'Editing…' indicator on the task card.

- **Notifications** — database triggers on the `tasks` table insert rows into the `notifications` table for due dates, overdue tasks, and new assignments. The `useNotifications` hook fetches them via Realtime subscription."

---

### [Slide 9] Topic 7: Views & Export — (35s)

"PivotPoint offers five different views. Let me go through each:

**Kanban** — the default view. Three columns: Todo, Doing, Done. Full drag-and-drop with column visibility toggles. Mobile shows one column at a time with swipe navigation.

**Gantt chart** — built with frappe-gantt. Tasks with due dates appear as bars on a timeline. Supports zoom levels from Quarter Day to Month. Users can drag bars to adjust dates. Dependency arrows can be drawn between tasks, and clicking an arrow removes the dependency.

**3D Sphere** — built with Three.js. Each task is a particle on a sphere surface. Completion rate determines sphere color from red to green. In-progress tasks orbit as flowing amber particles. Overdue tasks trigger a pulsing red wireframe overlay. Users can drag to rotate and scroll to zoom.

**Dashboard** — a personal overview page. Shows stat cards for total tasks, completed, in progress, and overdue counts. A progress ring shows completion percentage. Team online status and recent tasks are also displayed.

**List view** — a sortable table with all the features you'd expect: column sorting, status/priority/label filters, date range filter, compact mode, and bulk edit with checkboxes for batch status changes and deletion.

**Export.** Users can export their filtered view to Excel (via exceljs), PDF (via jsPDF), or CSV. The export modal lets you choose columns, file name, and format."

---

### [Slide 10] Topic 8: Tech Stack — (30s)

"Let me quickly run through our technology choices.

**Frontend:** React 19 for UI, Vite 8 for build tooling with Rolldown Rust bundler in production. Tailwind CSS v4 for styling — we use CSS custom properties extensively for theming (light and dark mode). @dnd-kit for drag-and-drop with three different major versions for different needs.

**Backend:** Pure Supabase. No custom Express or NestJS server. Supabase handles Auth, the PostgREST REST API, Realtime WebSocket subscriptions, and file Storage.

**Database:** PostgreSQL with 29 SQL migration files as the source of truth. Row-Level Security policies on every table. Database triggers for notifications and validation.

**Testing:** Vitest 4 with Testing Library, jsdom environment. 116 unit tests plus API integration tests.

**CI/CD:** GitHub Actions workflow — runs tests and build on every push or pull request to main.

**Internationalization:** i18next with 5 language files: English, Spanish, Chinese, Indonesian, Arabic."

---

## Echeq — Database, RBAC, Dev Workflow, Demo & Closing

---

### [Slide 11] Database Schema — (35s)

"Let's look at the database structure — follow along with the ER diagram.

We have **7 core tables**:

- **profiles** — linked to auth.users, stores display name, avatar URL, and role
- **tasks** — the main table with title, description, status, priority, assignee, due_date, position, project_id
- **projects** — for grouping tasks with name, description, color, icon, and status
- **labels** and **task_labels** — many-to-many relationship for task categorization
- **task_dependencies** — blocker relationships between tasks
- **notifications** — user-specific alerts for due dates, assignments, and exports

Plus supporting tables: **invitations**, **join_requests**, and **project_members** for team management.

Key constraints: title must be 1-200 characters, description max 5000, display_name max 100 (truncated automatically by a trigger). The `created_by` field on tasks is immutable after insert — enforced by column-level grants, not just application logic.

The `position` field is float8, updated client-side using midpoint calculation."

---

### [Slide 12] Role-Based Access Control — (40s)

"Access control is implemented through three roles enforced by PostgreSQL Row-Level Security. You can see the RBAC flow in our diagram.

**Admin role:** The first user to sign up automatically becomes admin via a database trigger. Admins have full CRUD on all tasks across all projects and the shared board. They can manage team members, invite users, promote members, archive and delete projects, and access the admin panel.

**Member role:** Members are users who were invited by an admin or had their join request approved. Members can view all tasks in their projects and the shared board, but they can only edit tasks assigned to them. They cannot create, delete, or change task assignments. On mobile, they see a bottom sheet with a 'View' button instead of 'Edit'. On desktop, clicking a task opens a read-only detail card.

**Unknown role:** First-time signups without an invitation are assigned the 'unknown' role by the `handle_new_user()` trigger. They see a completely empty board with a request-access button. When they submit a request, the admin receives it in the admin panel's Access tab.

The **signup flow**: A database trigger `handle_new_user()` fires on every auth signup. It checks if there's a pending invitation for the user's email. If found, the user becomes a member. If not, they become unknown. The first signup ever bypasses this and becomes admin.

Admins can change roles through the `admin_set_role` RPC, accessible from the admin panel."

---

### [Slide 13] Development Workflow — (20s)

"The development workflow is kept simple:

- `npm install` from the `frontend/` directory
- Copy `.env.example` to `.env` with Supabase credentials
- `npm run dev` starts the Vite dev server at localhost:5173
- `npm test` runs 116 unit tests
- `npx vitest run tests/api.test.js` for API integration tests
- `supabase start` for local PostgreSQL
- `supabase db push` to apply migrations
- `npm run build` for production build using Rolldown"

---

### [Slide 14] Project Structure — (15s)

"The project is organized cleanly:

`frontend/` — the React application with `src/components/` for ~40 UI components, `src/hooks/` for 10 custom hooks, `src/api/` for the Supabase client, `src/locales/` for 5 translation files. Tests live in `tests/`.

`supabase/` — database migrations (29 files) and seed data.

`docs/` — architecture docs, user manual, deploy guide, and presentation materials.

`scripts/` — deploy scripts for Supabase."

---

### [Slide 15] Live Demo — (60s)

"Now let me show you PivotPoint in action.

First, I'll sign in. Notice this is a new user — since they're the first signup, they'll become admin.

I'll create a project called 'Sprint 24', add a description and choose a color and icon.

Next, I'll create several tasks with different priorities, due dates, and assignments.

Watch as I drag a task from Todo to Doing — the status updates instantly. Now I'll reorder tasks within a column.

I'll assign a task to a team member, add a label, and set up a dependency.

Now let me switch to the Gantt chart — you can see the tasks as bars on a timeline. I'll zoom in and drag a bar to adjust the due date.

Switching to the 3D Sphere — each particle is a task. You can see the color gradient from red to green based on completion. Hovering shows task details.

Let me open the export modal, choose columns, pick Excel format, and download.

Finally, let me open a second browser window to demonstrate real-time sync. Watch when I move a task here — it updates instantly in the other window. And the online indicator shows both users connected.

That's PivotPoint."

---

### [Slide 16] Thank You — (15s)

"Thank you for your attention. PivotPoint proves that you can build a production-grade, real-time collaborative application with just React on the frontend and Supabase on the backend — no custom server code needed. The entire application was built with modern best practices: database migrations, Row-Level Security, real-time subscriptions, comprehensive testing with 116 unit tests, and CI/CD.

We're happy to answer any questions. Thank you."

---

**[⬆ Back to Top](#)**
