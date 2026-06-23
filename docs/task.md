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
- [ ] Create `updateProject` API

#### Frontend
- [x] Create Project list page
- [x] Create Create Project modal/form
- [ ] Create Project settings page
- [x] Add project archive/delete functionality
- [ ] Add project color picker and icon selector (DB columns exist, UI pending)

### Acceptance Criteria
- [x] User can create a new project
- [x] User can see list of their projects
- [ ] User can edit project details (name, description, color) — pending: settings page + updateProject API
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
- [ ] Add `priority` field (P0, P1, P2, P3)
- [ ] Create `labels` table
- [ ] Create `task_labels` junction table
- [x] Add `due_date` field (reminders not implemented)

#### Frontend
- [ ] Add priority selector (P0-P3 with colors)
- [ ] Create Label manager (create/edit/delete labels)
- [ ] Add multi-select for task labels
- [x] Add date picker for due date (native `<input type="date">`)
- [x] Highlight overdue tasks
- [x] Show due date on TaskCard

### Acceptance Criteria
- [ ] User can set priority (P0 red, P1 orange, etc.)
- [ ] User can create custom labels
- [ ] User can assign multiple labels to a task
- [x] User can set due date
- [x] Overdue tasks show red warning
- [ ] Filters work with priority and labels

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
- [ ] Create `task_dependencies` table
- [ ] Create API: assignTask, getDependencies, checkBlockedTasks

#### Frontend
- [x] Add assignee selector (team members list)
- [x] Show avatar of assignee on TaskCard
- [ ] Create dependency picker UI
- [ ] Show dependency lines in Gantt (prepare for M4.2)
- [ ] Block status change if blocked by incomplete task

### Acceptance Criteria
- [x] User can assign task to any project member
- [x] Assigned user sees task in their dashboard
- [ ] User can set task dependencies (Task A blocks Task B)
- [ ] UI shows blocked tasks
- [ ] Cannot complete blocked tasks

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
- [ ] Add quick filters (show/hide columns)
- [x] Make responsive (columns stack on mobile)
- [ ] Add loading skeleton

### Acceptance Criteria
- [x] Kanban board is the default dashboard view
- [x] Tasks load and display correctly
- [x] Drag & drop works smoothly
- [x] Mobile: columns stack vertically
- [x] Clicking task opens edit modal
- [ ] Performance is good (>100 tasks)

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
- [ ] Install Gantt library (dhtmlx-gantt or frappe-gantt)
- [ ] Create GanttView component
- [ ] Map tasks to Gantt tasks (start date, end date, progress)
- [ ] Add zoom controls (day, week, month)
- [ ] Show dependency lines
- [ ] Allow drag to adjust dates (update API)
- [ ] Allow drag to adjust dependencies
- [ ] Export Gantt as PNG

### Acceptance Criteria
- [ ] Users can switch to Gantt view
- [ ] Tasks appear as bars on timeline
- [ ] Dependencies shown as arrows
- [ ] Dragging task bar updates due date
- [ ] Zoom in/out works
- [ ] Export to PNG works

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
- [ ] Install Three.js and dependencies
- [ ] Create DataSphere component
- [ ] Set up 3D scene, camera, renderer
- [ ] Create particle system (particles = tasks)
- [ ] Map task completion to sphere color (red→green)
- [ ] Add rotation animation
- [ ] Map in-progress tasks to flowing particles
- [ ] Map overdue tasks to pulsing effect
- [ ] Add mouse interaction (drag to rotate, zoom)
- [ ] Add hover tooltip with task details

### Visual Mapping
| Data | Visual |
|------|--------|
| Total tasks | Particle count |
| Completion rate | Sphere color (red → green) |
| In-progress | Flowing particles |
| Overdue | Pulsing effect |
| Time progress | Rotation speed |

### Acceptance Criteria
- [ ] 3D sphere renders with particles
- [ ] Color changes based on completion %
- [ ] Hover shows task details
- [ ] Works on modern browsers (WebGL)
- [ ] Doesn't kill performance (<200 tasks)

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
- [ ] Add filtering support to getTasks API
- [ ] Add sorting parameters (order_by, order_direction)

#### Frontend
- [ ] Create ListView component (table/grid)
- [ ] Add filter sidebar/panel
- [ ] Filters: status, priority, assignee, label, due date range
- [ ] Add sorting by any column
- [ ] Save filter preferences (localStorage or DB)
- [ ] Toggle between compact and detailed view

### Acceptance Criteria
- [ ] Users can switch to List view
- [ ] Filters work together (AND logic)
- [ ] Sorting works on any column
- [ ] Filter preferences persist after page reload
- [ ] Bulk edit possible (checkboxes)

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
- [ ] Add "Someone is editing" indicator (optional)
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
- [ ] Install SheetJS (xlsx) for Excel export
- [ ] Install jsPDF + html2canvas for PDF export
- [ ] Create Export button with menu (Excel/PDF)
- [ ] Export current filtered view to Excel
- [ ] Export current filtered view to PDF
- [ ] Add option to select columns to export
- [ ] Format dates and priorities correctly in exports

### Acceptance Criteria
- [ ] Click Export → Excel downloads .xlsx file
- [ ] Excel contains all tasks from current view
- [ ] Click Export → PDF downloads .pdf file
- [ ] PDF is readable and formatted well
- [ ] Filters apply to exported data

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
- [ ] Create `system_logs` table
- [ ] Create `logActivity` function (from your skill)
- [ ] Create backup function (export all project data)
- [ ] Add system configuration table

#### Frontend
- [x] Create Admin Panel (only visible to Admins)
- [ ] Add Log viewer page (filter by user, action, date)
- [ ] Add Export Backup button (download all data as JSON)
- [ ] Add Restore from Backup (upload JSON)
- [ ] Add System Settings page (configurable options)

### Acceptance Criteria
- [x] Only Admins can access admin panel
- [ ] Logs show user actions (login, create task, delete, etc.)
- [ ] Admin can export full database backup
- [ ] Admin can restore from backup
- [ ] System settings persist after restart

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
- [x] Write unit tests for critical functions (89 tests passing, components + hooks + i18n)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile testing (iOS, Android)
- [ ] Performance testing (>200 tasks)

#### Polish
- [ ] Add loading states everywhere
- [ ] Add error boundaries
- [ ] Add 404 page
- [ ] Add empty states (no tasks, no projects)
- [ ] Add animations (fade, slide)
- [x] Dark mode (bonus) — Already implemented via useTheme() + CSS vars

#### Deployment
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Set up custom domain (optional)
- [ ] Verify Supabase is production ready

#### Documentation
- [x] Update README with setup instructions
- [x] Add API documentation
- [ ] Add user manual
- [ ] Prepare presentation slides

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