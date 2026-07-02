# Requirements Traceability Matrix

> Maps `task.md` items to actual code implementation. Status: ✅ done / 🔄 partial / ❌ not started.

---

## M1 — User & Permission Management (100%)

| Task | Status | Implementation |
|---|---|---|
| Supabase Auth (email/password) | ✅ | `frontend/src/hooks/useAuth.js` · `supabaseClient.js` |
| Role system (admin/member/unknown) | ✅ | `supabase/migrations/20260616100000_role_system.sql` · `20260617120000_rbac_projects_invitations.sql` |
| Role assignment via `handle_new_user` trigger | ✅ | `supabase/migrations/20260612100000_initial_schema.sql` |
| RLS policies (role-based access) | ✅ | `20260612100000` · `20260612120000` · `20260616100000` · `20260617120000` |
| Login page | ✅ | `frontend/src/components/AuthForm.jsx` |
| Register/Sign Up page | ✅ | `frontend/src/components/AuthForm.jsx` |
| Profile settings page | ✅ | `frontend/src/components/ProfileModal.jsx` |
| Team invitation interface | ✅ | `frontend/src/components/AdminModal.jsx` · `useInvitations.js` |
| Role selector on invite | ✅ | `frontend/src/components/AdminModal.jsx` |
| Admin can promote/demote (admin_set_role RPC) | ✅ | `supabase/migrations/20260617120000_rbac_projects_invitations.sql` |

---

## M1 — Profile Settings (100%)

| Task | Status | Implementation |
|---|---|---|
| Avatar upload (Supabase Storage) | ✅ | `supabase/migrations/20260612140000_avatars_storage.sql` · `ProfileModal.jsx` |
| Display name edit | ✅ | `frontend/src/components/ProfileModal.jsx` |
| Email change | ✅ | `frontend/src/components/ProfileModal.jsx` |
| Password change (min 6 chars) | ✅ | `frontend/src/components/ProfileModal.jsx` |
| Account deletion (2-step confirm) | ✅ | `frontend/src/components/ProfileModal.jsx` · RPC `delete_own_account()` |
| Changes reflect immediately (refetchProfile) | ✅ | `frontend/src/components/ProfileModal.jsx` · `App.jsx` |

---

## M2 — Project Management (44% → target 100%)

| Task | Status | Implementation |
|---|---|---|
| `projects` table | ✅ | `supabase/migrations/20260617120000_rbac_projects_invitations.sql` |
| RLS policies for projects | ✅ | Same migration |
| `project_members` junction table | ✅ | `supabase/migrations/20260618120000_project_members_and_colors.sql` |
| `createProject` / `getProjects` / `archiveProject` / `deleteProject` | ✅ | `frontend/src/hooks/useProjects.js` |
| `updateProject` API | ❌ | **Pending** — no `updateProject` in useProjects yet |
| Project list (sidebar) | ✅ | `frontend/src/components/Sidebar.jsx` |
| Create project modal | ✅ | `frontend/src/components/Sidebar.jsx` (inline form) |
| Project settings page (edit name/desc) | ❌ | **Pending** |
| Project color picker & icon selector | ❌ | **Pending** — DB columns exist (`color`, `icon`), no UI |
| Archive/delete (admin only) | ✅ | `frontend/src/hooks/useProjects.js` · `Sidebar.jsx` |
| Color/icon columns on `projects` table | ✅ | `supabase/migrations/20260618120000_project_members_and_colors.sql` |

---

## M3-P1 — Task CRUD (86%)

| Task | Status | Implementation |
|---|---|---|
| `tasks` table (11 columns) | ✅ | `supabase/migrations/20260612100000_initial_schema.sql` |
| `task_status` enum (todo/doing/done) | ✅ | Same migration |
| RLS for tasks (role + assignee) | ✅ | Multiple migrations |
| `createTask` / `getTasks` / `updateTask` / `deleteTask` | ✅ | `frontend/src/hooks/useBoard.js` |
| DB validation (title 1-200, desc ≤5000) | ✅ | `supabase/migrations/20260612120000_backend_hardening.sql` |
| Column-level grants (created_by immutable) | ✅ | Same migration |
| TaskCard component | ✅ | `frontend/src/components/TaskCard.jsx` |
| Create/Edit task modal | ✅ | `frontend/src/components/TaskModal.jsx` |
| Delete confirmation | ✅ | `frontend/src/components/TaskModal.jsx` |
| Kanban view (3 columns) | ✅ | `frontend/src/components/Board.jsx` · `Column.jsx` |
| RLS by project_id | ❌ | **Pending** — members can see all projects' tasks |

---

## M3-P2 — Drag & Drop / Kanban (92%)

| Task | Status | Implementation |
|---|---|---|
| Status field (todo/doing/done) | ✅ | `supabase/migrations/20260612100000_initial_schema.sql` |
| Position float8 field for ordering | ✅ | Same migration |
| @dnd-kit integration (core@6, sortable@10, utilities@3) | ✅ | `frontend/src/components/Board.jsx` · `Column.jsx` |
| 3-column Kanban board | ✅ | `frontend/src/components/Board.jsx` |
| Cross-column drag (update status + position) | ✅ | `frontend/src/components/Board.jsx` |
| Within-column reorder (positionBetween midpoint) | ✅ | `frontend/src/hooks/useBoard.js:11` |
| Optimistic update on drag | ✅ | `frontend/src/hooks/useBoard.js` |
| Mobile touch drag (TouchSensor 200ms delay) | ✅ | `frontend/src/components/Board.jsx` |

---

## M3-P3 — Priority & Labels (31% → target 85%)

| Task | Status | Implementation |
|---|---|---|
| `priority` field (P0-P3) on tasks | ❌ | **Pending** |
| `labels` table | ❌ | **Pending** |
| `task_labels` junction table | ❌ | **Pending** |
| `due_date` field | ✅ | `supabase/migrations/20260612100000_initial_schema.sql` |
| Date picker (native `<input type="date">`) | ✅ | `frontend/src/components/TaskModal.jsx` |
| Overdue red highlight | ✅ | `frontend/src/components/TaskCard.jsx:21` |
| Due date on TaskCard | ✅ | `frontend/src/components/TaskCard.jsx` |
| Smart views (view:overdue, view:due) | ✅ | `frontend/src/App.jsx:99-108` |
| Priority selector UI (P0-P3 with colors) | ❌ | **Pending** |
| Label manager CRUD UI | ❌ | **Pending** |
| Multi-select labels on task | ❌ | **Pending** |
| Filter by priority/label | ❌ | **Pending** |

---

## M3-P4 — Task Assignment & Dependencies (38% → target 80%)

| Task | Status | Implementation |
|---|---|---|
| `assignee` field (FK → profiles) | ✅ | `supabase/migrations/20260612100000_initial_schema.sql` |
| Assignee selector in TaskModal | ✅ | `frontend/src/components/TaskModal.jsx:90` |
| Assignee avatar on TaskCard | ✅ | `frontend/src/components/TaskCard.jsx:65` |
| "My tasks" view (view:mine) | ✅ | `frontend/src/App.jsx:104` |
| Profile panel shows my task stats | ✅ | `frontend/src/components/ProfileModal.jsx` |
| `task_dependencies` table | ❌ | **Pending** |
| `checkBlockedTasks` RPC | ❌ | **Pending** |
| Dependency picker UI | ❌ | **Pending** |
| Blocked badge on TaskCard | ❌ | **Pending** |
| Prevent completing blocked tasks | ❌ | **Pending** |

---

## M4-P1 — Kanban Board Visualization (71% → target 100%)

| Task | Status | Implementation |
|---|---|---|
| KanbanBoard component | ✅ | `frontend/src/components/Board.jsx` |
| 3 columns display + drag integration | ✅ | `frontend/src/components/Board.jsx` · `Column.jsx` |
| Column task counters | ✅ | `frontend/src/components/Column.jsx` |
| Responsive layout (mobile vertical stack) | ✅ | `frontend/src/hooks/useIsMobile.js` · `Board.jsx` |
| Click task → edit modal | ✅ | `frontend/src/App.jsx` · `TaskModal.jsx` |
| Quick filters (show/hide columns) | ❌ | **Pending** |
| Loading skeleton | ❌ | **Pending** |

---

## M4-P2 — Gantt Chart (0%)

| Task | Status | Implementation |
|---|---|---|
| Gantt library + component | ❌ | **Pending** |
| All other Gantt features | ❌ | **Pending** |

---

## M4-P3 — 3D Sphere Visualization ⭐ (0%)

| Task | Status | Implementation |
|---|---|---|
| Three.js + DataSphere component | ❌ | **Pending** |
| All other 3D features | ❌ | **Pending** |

---

## M4-P4 — List View & Filters (0%)

| Task | Status | Implementation |
|---|---|---|
| ListView component + filter sidebar | ❌ | **Pending** |
| All other list/filter features | ❌ | **Pending** |

---

## M5 — Real-time Collaboration ⭐ (100%)

| Task | Status | Implementation |
|---|---|---|
| Realtime enabled on tasks table | ✅ | `supabase/migrations/20260612100000_initial_schema.sql` (`replica identity full`) |
| Subscribe to `supabase.channel('board')` | ✅ | `frontend/src/hooks/useBoard.js:69` |
| Handle INSERT (refetch + merge with join) | ✅ | `frontend/src/hooks/useBoard.js:79-105` |
| Handle UPDATE | ✅ | Same handler |
| Handle DELETE | ✅ | `frontend/src/hooks/useBoard.js:75-77` |
| Online users indicator (Presence) | ✅ | `frontend/src/hooks/usePresence.js` · `Sidebar.jsx` |
| Auto-reconnect on disconnect | ✅ | Supabase Realtime built-in |
| Scope-aware merge (respects project_id filter) | ✅ | `frontend/src/hooks/useBoard.js:92` |
| Position cache for new inserts | ✅ | `frontend/src/hooks/useBoard.js:97-102` |

---

## M6 — Data Export (0%)

| Task | Status | Implementation |
|---|---|---|
| jsPDF installed (PDF export) | ✅ | `frontend/package.json` |
| Export button + UI | ❌ | **Pending** |
| XLSX export logic | ❌ | **Pending** |

---

## M7 — System Administration (22% → target 55%)

| Task | Status | Implementation |
|---|---|---|
| Admin panel (admin only) | ✅ | `frontend/src/components/AdminModal.jsx` |
| Member management (role promote/demote) | ✅ | `frontend/src/components/AdminModal.jsx` |
| Invitation management (send/revoke) | ✅ | `frontend/src/hooks/useInvitations.js` · `AdminModal.jsx` |
| `system_logs` table | ❌ | **Pending** |
| `logActivity` function | ❌ | **Pending** |
| Log viewer UI | ❌ | **Pending** |
| Backup export (JSON) | ❌ | **Pending** |
| Restore from backup | ❌ | **Pending** |

---

## Final — Polish, Testing, Deployment (10%)

| Task | Status | Implementation |
|---|---|---|
| Unit tests (89 tests) | ✅ | `frontend/tests/{components,hooks}/` · `api.test.js` |
| README | ✅ | `README.md` · `frontend/README.md` · `supabase/README.md` |
| API documentation | ✅ | `docs/api.md` |
| Architecture docs | ✅ | `docs/architecture.md` · `docs/database.md` · `docs/setup.md` |
| Dark mode | ✅ | `frontend/src/hooks/useTheme.js` · `index.css` (CSS vars) |
| i18n (en/es/zh/id) | ✅ | `frontend/src/locales/` · `i18n.js` |
| Error boundaries | ❌ | **Pending** |
| 404 page | ❌ | **Pending** |
| Vercel deployment | ❌ | **Pending** |
| User manual | ❌ | **Pending** |
| Presentation slides | ❌ | **Pending** |

---

## Technical Debt & Dead Code

| Item | Action |
|---|---|
| `backend/` (NestJS scaffold) | Do not edit — orphaned directory |
| `frontend/src/composables/` (empty) | Do not edit — Vue 3 remnant |
| `frontend/src/assets/` (empty) | Do not edit — Vue 3 remnant |
| `InviteDialog.jsx` | Unused — old column names, can't work with current schema |
| `InvitationPopup.jsx` | Unused — same old-schema issue as InviteDialog |
| `TaskActionSheet.jsx` | Unused — never imported |
| `AccountModal.jsx` | Unused — replaced by `ProfileModal.jsx` |
| `ProfileSettings.jsx` | Unused — replaced by `ProfileModal.jsx` |
| `useIsMobile.js` (hook) | Unused — never imported in any source file |
| `socket.io-client` in package.json | Unused — realtime uses Supabase Realtime |
---

**[? Back to Top](#) | [?? Documentation Index](../INDEX.md)**

