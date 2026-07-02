## Module: M1 - User & Permission Management

### Description
Implement user authentication and role-based permission system.

### Tasks

#### Backend / Supabase
- [x] Configure Supabase Auth (email/password login)
- [x] Set up role system (Admin / Member)
- [x] Create function to invite team members via email
- [x] Add RLS policies for role-based access

#### Frontend
- [x] Create Login page (email/password form)
- [x] Create Register / Sign Up page
- [x] Create Profile settings page
- [x] Create Team member invitation interface
- [x] Add role selector when inviting members

### Acceptance Criteria
- [x] User can register with email
- [x] User can login with email/password
- [x] Admin can invite new members
- [x] Admin can assign roles (Admin/Member)
- [x] Members cannot access admin-only features
- [x] Profile settings save changes

### Dependencies
- None (can start immediately)

### Estimated Time
- Backend: 4 hours
- Frontend: 4 hours
- Total: 8 hours

### Labels
`backend` `frontend` `auth` `M1`


## Module: M1 - Profile Settings

### Description
Allow users to update their profile information.

### Tasks
- [x] Create Profile page layout
- [x] Add avatar upload (to Supabase Storage)
- [x] Add name and email update form
- [x] Add change password form
- [x] Add delete account option (with confirmation)

### Acceptance Criteria
- [x] User can upload/change avatar
- [x] User can update display name
- [x] User can change password
- [x] User can delete account (with confirmation modal)
- [x] All changes reflect immediately in UI

### Dependencies
- Issue #1 (Auth setup)

### Estimated Time
- 4 hours

### Labels
`frontend` `profile` `M1`

## Module: M2 - Project Management

### Description
Allow users to create and manage projects.

### Tasks

#### Backend / Supabase
- [x] Create `projects` table in Supabase
- [x] Add RLS policies for project access
- [x] Create `project_members` junction table
- [x] Create API functions: createProject, getProjects, archiveProject
- [x] Create `updateProject` API (useProjects.js updateProject function)

#### Frontend
- [x] Create Project list page
- [x] Create Create Project modal/form (CreateProjectModal.jsx — includes name, description, color, icon)
- [x] Create Project settings page (ProjectSettingsModal.jsx)
- [x] Add project archive/delete functionality
- [x] Add project color picker and icon selector (preset palette + preset icons)

### Acceptance Criteria
- [x] User can create a new project
- [x] User can see list of their projects
- [x] User can edit project details (name, description, color, icon) — via ProjectSettingsModal
- [x] User can archive/delete projects
- [x] Archived projects are hidden from main list

### Dependencies
- Issue #1 (Auth)
- Issue #2 (Profile)

### Estimated Time
- Backend: 3 hours
- Frontend: 5 hours
- Total: 8 hours

### Labels
`backend` `frontend` `project` `M2`

## Module: M3 - Task Management (Part 1)

### Description
Basic CRUD operations for tasks.

### Tasks

#### Backend / Supabase
- [x] Create `tasks` table in Supabase
- [x] Add RLS policies (role-based: admin sees all, member sees assigned only)
- [x] Create API: createTask, getTasks, updateTask, deleteTask
- [x] Add validation for required fields (DB: title 1-200, description ≤5000; frontend: required + maxLength)

#### Frontend
- [x] Create TaskCard component
- [x] Create Create Task modal/form
- [x] Create Edit Task modal
- [x] Create Delete Task confirmation
- [x] Display tasks in a simple list view

### Acceptance Criteria
- [x] User can create a task with title, description, due date
- [x] User can view list of tasks
- [x] User can edit any task field
- [x] User can delete a task (with confirmation)
- [x] Tasks persist after page refresh

### Dependencies
- Issue #3 (Project Management)

### Estimated Time
- Backend: 3 hours
- Frontend: 5 hours
- Total: 8 hours

### Labels
`backend` `frontend` `tasks` `M3` `core`

## Module: M3 - Task Management (Part 2)

### Description
Implement task status workflow with drag and drop.

### Tasks

#### Backend / Supabase
- [x] Add `status` field to tasks table (todo/doing/done)
- [x] Add `order` field for task sorting
- [x] Create API: updateTaskStatus, reorderTasks (via generic updateTask with position field)

#### Frontend
- [x] Install @dnd-kit (or vue-draggable)
- [x] Create Kanban columns (Todo, Doing, Done)
- [x] Implement drag & drop between columns
- [x] Implement drag & drop to reorder within column
- [x] Save order after drag (API call)

### Acceptance Criteria
- [x] Tasks can be dragged between columns
- [x] Status updates immediately on drop
- [x] Tasks can be reordered within same column
- [x] Order persists after page refresh
- [x] Works on mobile (touch drag)

### Dependencies
- Issue #4 (Task CRUD)

### Estimated Time
- Backend: 2 hours
- Frontend: 4 hours
- Total: 6 hours

### Labels
`frontend` `drag-drop` `M3` `core`

## Module: M3 - Task Management (Part 3)

### Description
Add priority levels, labels/tags, and due date features.

### Tasks

#### Backend / Supabase
- [x] Add `priority` field (P0, P1, P2, P3) — migration 20260625000000
- [x] Create `labels` table — migration 20260625000000
- [x] Create `task_labels` junction table — migration 20260625000000
- [x] Add `due_date` field

#### Frontend
- [x] Add priority selector (P0-P3 with colors red/orange/yellow/green) — TaskModal.jsx
- [x] Create Label manager (create/edit/delete labels per project) — LabelManager.jsx
- [x] Add multi-select for task labels — TaskModal.jsx (toggle buttons with color)
- [x] Add label chips on TaskCard — colored background + white text
- [x] Add priority badge on TaskCard — colored dot + label (Critical/High/Medium/Low)
- [x] Add date picker for due date (native `<input type="date">`)
- [x] Highlight overdue tasks
- [x] Show due date on TaskCard

### Acceptance Criteria
- [x] User can set priority (P0 red, P1 orange, P2 yellow, P3 green)
- [x] User can create custom labels
- [x] User can assign multiple labels to a task
- [x] User can set due date
- [x] Overdue tasks show red warning
- [~] Filters work with priority and labels (RPC exists: get_filtered_tasks; frontend filter UI pending)

### Dependencies
- Issue #4 (Task CRUD)
- Issue #5 (Drag & Drop)

### Estimated Time
- Backend: 3 hours
- Frontend: 4 hours
- Total: 7 hours

### Labels
`backend` `frontend` `priority` `labels` `M3`

## Module: M3 - Task Management (Part 4)

### Description
Add task assignment to team members and task dependencies.

### Tasks

#### Backend / Supabase
- [x] Add `assignee` field to tasks table
- [x] Create `task_dependencies` table — migration 20260625000000
- [x] Create API: assignTask (via generic updateTask), getDependencies (via check_blocked_tasks RPC), checkBlockedTasks RPC
- [x] Add circular dependency prevention trigger — check_circular_dependency()

#### Frontend
- [x] Add assignee selector (team members list)
- [x] Show avatar of assignee on TaskCard
- [x] Create dependency picker UI — TaskModal.jsx ("Blocked by" multi-select of project tasks)
- [x] Show blocked badge on TaskCard ("Blocked by X" with lock icon)
- [x] Prevent completing blocked tasks (call checkBlockedTasks RPC before status → done in updateTask)

### Acceptance Criteria
- [x] User can assign task to any project member
- [x] Assigned user sees task in their dashboard
- [x] User can set task dependencies (via add_task_dependency RPC)
- [x] UI shows blocked tasks (badge on TaskCard)
- [x] Cannot complete blocked tasks (checkBlockedTasks wired in useBoard.updateTask)

### Dependencies
- Issue #3 (Project Members)
- Issue #4 (Task CRUD)

### Estimated Time
- Backend: 3 hours
- Frontend: 3 hours
- Total: 6 hours

### Labels
`backend` `frontend` `assignment` `dependencies` `M3`

## Module: M4 - Visualization (Part 1)

### Description
Create the main Kanban board view with all features.

### Tasks

#### Frontend
- [x] Create KanbanBoard component
- [x] Display 3 columns (Todo, Doing, Done)
- [x] Integrate drag & drop (from M3.2)
- [x] Add column task counters
- [x] Add "Add Task" button to each column
- [x] Add quick filters (show/hide columns) — toggle buttons in Board
- [x] Make responsive (columns stack on mobile)
- [x] Add loading skeleton (CardSkeleton + SidebarStatsSkeleton)

### Acceptance Criteria
- [x] Kanban board is the default dashboard view
- [x] Tasks load and display correctly
- [x] Drag & drop works smoothly
- [x] Mobile: columns stack vertically
- [x] Clicking task opens edit modal
- [x] Performance is good (>100 tasks) — single-pass reduce, lazy loading, memo, useCallback

### Dependencies
- Issue #4 (Task CRUD)
- Issue #5 (Drag & Drop)

### Estimated Time
- 6 hours

### Labels
`frontend` `kanban` `M4` `core`

## Module: M4 - Visualization (Part 2)

### Description
Implement Gantt chart for timeline view of tasks.

### Tasks

#### Frontend
- [x] Install Gantt library (frappe-gantt)
- [x] Create GanttView component
- [x] Map tasks to Gantt tasks (start date, end date, progress)
- [x] Add zoom controls (Quarter Day, Half Day, Day, Week, Month)
- [x] Show dependency lines
- [x] Allow drag to adjust dates (update API)
- [x] Allow drag to adjust dependencies
- [x] Export Gantt as PNG

### Acceptance Criteria
- [x] Users can switch to Gantt view (via Topbar view switcher)
- [x] Tasks appear as bars on timeline
- [x] Dependencies shown as arrows
- [x] Dragging task bar updates due date
- [x] Zoom in/out works
- [x] Export to PNG works

### Dependencies
- Issue #4 (Task CRUD)
- Issue #7 (Dependencies)

### Estimated Time
- 6 hours

### Labels
`frontend` `gantt` `M4`

## Module: M4 - Visualization (Part 3) ⭐ CORE FEATURE

### Description
Create 3D sphere visualization using Three.js to show project progress.

### Tasks

#### Frontend
- [x] Install Three.js and dependencies
- [x] Create DataSphere component
- [x] Set up 3D scene, camera, renderer
- [x] Create particle system (particles = tasks)
- [x] Map task completion to sphere color (red→green)
- [x] Add rotation animation
- [x] Map in-progress tasks to flowing particles
- [x] Map overdue tasks to pulsing effect
- [x] Add mouse interaction (drag to rotate, zoom)
- [x] Add hover tooltip with task details

### Visual Mapping
| Data | Visual |
|------|--------|
| Total tasks | Particle count |
| Completion rate | Sphere color (red → green) |
| In-progress | Flowing particles |
| Overdue | Pulsing effect |
| Time progress | Rotation speed |

### Acceptance Criteria
- [x] 3D sphere renders with particles
- [x] Color changes based on completion %
- [x] Hover shows task details
- [x] Works on modern browsers (WebGL)
- [x] Doesn't kill performance (<200 tasks)

### Dependencies
- Issue #4 (Task CRUD)

### Estimated Time
- 8 hours (learning curve)

### Labels
`frontend` `threejs` `3d` `M4` `core` `star-feature`

## Module: M4 - Visualization (Part 4)

### Description
Create a table/list view with advanced filtering and sorting.

### Tasks

#### Backend / Supabase
- [x] Add filtering support via get_filtered_tasks RPC (status, priority, assignee, date range, labels)
- [x] Add sorting parameters (order_by, order_direction) in get_filtered_tasks RPC

#### Frontend
- [x] Create ListView component (table with title, status, priority, assignee, due_date)
- [x] Add filter sidebar/panel (FilterPanel.jsx with status, priority, assignee, labels, date range)
- [x] Add column sort by click on table header (toggleSort with asc/desc indicators)
- [x] Save filter preferences (localStorage or DB)
- [x] Toggle between compact and detailed view

### Acceptance Criteria
- [x] Users can switch to List view (via Topbar Kanban/List toggle)
- [x] Filters work together (AND logic via client-side filtering)
- [x] Sorting works on any column (click header asc/desc)
- [x] Filter preferences persist after page reload
- [x] Bulk edit possible (checkboxes)

### Dependencies
- Issue #4 (Task CRUD)

### Estimated Time
- Backend: 2 hours
- Frontend: 5 hours
- Total: 7 hours

### Labels
`backend` `frontend` `filters` `M4`


## Module: M5 - Real-time Collaboration ⭐ CORE FEATURE

### Description
Implement real-time updates using Supabase Realtime.

### Tasks

#### Backend / Supabase
- [x] Enable Realtime on tasks table
- [x] RLS configured for realtime subscriptions

#### Frontend
- [x] Subscribe to tasks channel (`supabase.channel('board')`)
- [x] Handle task.created event (refetch + merge)
- [x] Handle task.updated event (update in place)
- [x] Handle task.deleted event (remove from list)
- [x] Add online members indicator (`usePresence` hook)
- [x] Add "Someone is editing" indicator (blinking dot + "Editing…" on TaskCard via Realtime presence)
- [x] Handle offline/reconnect gracefully (Supabase Realtime built-in)

### Acceptance Criteria
- [x] Opening two browsers shows same data
- [x] Creating task in browser A appears in browser B <1s
- [x] Editing task in A updates B instantly
- [x] Moving task in A updates B instantly
- [x] Shows who is online in the project
- [x] Reconnects automatically if connection lost

### Dependencies
- Issue #4 (Task CRUD)

### Estimated Time
- Backend: 1 hour
- Frontend: 4 hours
- Total: 5 hours

### Labels
`backend` `frontend` `realtime` `websocket` `M5` `core`

## Module: M6 - Data Export

### Description
Allow users to export task data to Excel and PDF.

### Tasks

#### Frontend
- [x] Install jsPDF (already in package.json)
- [x] Create ExportMenu dropdown (PDF / CSV)
- [x] Export current filtered view to PDF (jsPDF table with columns: title, status, priority, assignee, due_date)
- [x] Export current filtered view to CSV (downloadable .csv file)
- [x] Add option to select columns to export
- [x] Format dates and priorities correctly in exports

### Acceptance Criteria
- [x] Click Export → CSV downloads .csv file
- [x] Click Export → PDF downloads .pdf file
- [x] PDF is readable and formatted well
- [x] Exports use current filtered view
- [x] CSV column selection (choose which columns to include)
- [x] Date formatting in exports

### Dependencies
- Issue #4 (Task CRUD)
- Issue #11 (Filters)

### Estimated Time
- 4 hours

### Labels
`frontend` `export` `excel` `pdf` `M6`


## Module: M7 - System Administration

### Description
Admin-only features for system management.

### Tasks

#### Backend / Supabase
- [x] Create `system_logs` table — migration 20260625000000
- [x] Create `logActivity` RPC
- [x] Create backup function (export_all_data RPC — returns JSON with projects + tasks + labels + members)
- [x] Add system configuration table (system_config key-value store with RLS)

#### Frontend
- [x] Create Admin Panel (only visible to Admins)
- [x] Add Log viewer tab (filter by action, date) — LogViewer.jsx in AdminModal
- [x] Add Export Backup button (download all data as JSON via export_all_data RPC) — BackupPanel.jsx in AdminModal
- [x] Add Restore from Backup (upload JSON via restore_from_backup RPC) — RestorePanel.jsx in AdminModal
- [ ] Add System Settings page (configurable options)

### Acceptance Criteria
- [x] Only Admins can access admin panel
- [x] Logs show user actions (filterable by action and date) — LogViewer tab implemented
- [x] Admin can export full database backup — Backup tab downloads JSON
- [x] Admin can restore from backup — Restore tab uploads JSON

### Dependencies
- Issue #1 (Auth & Roles)
- Issue #4 (Task CRUD)

### Estimated Time
- Backend: 3 hours
- Frontend: 3 hours
- Total: 6 hours

### Labels
`backend` `frontend` `admin` `logs` `backup` `M7`


## Module: Final - Polish, Testing, Deployment

### Description
Final touches before submission.

### Tasks

#### Testing
- [x] Write unit tests for critical functions (82 tests passing, 18 test files: components + hooks + i18n + API integration)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile testing (iOS, Android)
- [ ] Performance testing (>200 tasks)

#### Polish
- [x] Add loading states (Board + Sidebar skeletons; AdminModal/ProfileModal use Spinner; AuthGate uses spinner)
- [x] Add error boundaries (ErrorBoundary wrapping Board + Sidebar)
- [x] Add 404 page (NotFound.jsx)
- [x] Add empty states (EmptyState wired in Board and Sidebar)
- [x] Add animations (fade, slide — glass morphism + animate-pop-in classes)
- [x] Dark mode — Already implemented via useTheme() + CSS vars

#### Deployment
- [ ] Deploy frontend to Vercel (guide exists in docs/deploy.md)
- [ ] Configure environment variables (docs/deploy.md covers this)
- [ ] Set up custom domain (optional)
- [ ] Verify Supabase is production ready (checklist in docs/deploy.md)

#### Documentation
- [x] Update README with setup instructions
- [x] Add API documentation (docs/api.md)
- [x] Add deploy guide (docs/deploy.md — local, production, branches, data migration)
- [x] Add user manual (docs/guide/user-manual.md)
- [x] Prepare presentation outline (docs/presentation-outline.md)

### Acceptance Criteria
- [ ] App works without console errors
- [ ] All features tested and working
- [ ] Deployed and accessible via URL
- [ ] Documentation complete

### Dependencies
- All previous issues

### Estimated Time
- 8 hours

### Labels
`testing` `deployment` `documentation` `final`