# User Manual

## Getting started

### Creating an account

1. Open the app in your browser
2. Click **Sign up**
3. Enter your email, password, and display name
4. The first person to sign up becomes an **admin**

### Signing in

1. Enter your email and password
2. Click **Sign in**

---

## Dashboard

The Dashboard is your personal overview page, visible when you click the **Dashboard** button in the sidebar.

| Card | What it shows |
|---|---|
| **My tasks** | Total tasks assigned to you |
| **Completed** | Tasks marked Done |
| **In progress** | Tasks in the Doing column |
| **Overdue** | Past-due, not-done tasks assigned to you |
| **Completion** | Progress ring with per-status breakdown |
| **Team** | Online members + active project count |
| **My recent tasks** | Your 6 most recently created tasks |

---

## The board

The main view is a Kanban board with three columns:

| Column | Meaning |
|---|---|
| **To Do** | Tasks not started |
| **Doing** | Tasks in progress |
| **Done** | Completed tasks |

### Creating a task

1. Click **+ New task** in the top bar
2. Enter a title (required)
3. Add description, due date, priority, assignee, and project (optional)
4. Click **Create**

### Editing a task (admin only)

Click any task card to open the edit modal. Change any field and click **Save**.

### Viewing a task (member only)

Click any task card to open a read-only detail card showing title, priority badge, description, status, due date, assignee, project, labels, and dependencies. No editing is allowed.

### Deleting a task

Open the edit modal and click **Delete**. Confirm in the dialog.

### Drag and drop

- Drag a card to move it between columns
- Drag within a column to reorder
- Works on mobile (long press to start dragging)

---

## Projects

### Creating a project (admin only)

1. Click the **+** icon next to "Projects" in the sidebar
2. Enter a name, description, color, and icon
3. Click **Create project**

### Viewing project info (members)

Hover over a project in the sidebar and click the info icon to see the project description and member list.

### Switching projects

Click a project name in the sidebar to view only its tasks.

### Editing a project (admin only)

Hover over a project in the sidebar and click the gear icon. Change name, description, color, or icon.

### Archiving a project (admin only)

Hover over an active project → click the archive icon. Archived projects are hidden from the main list.

### Restoring a project (admin only)

Scroll to the **Archived** section in the sidebar, click the restore icon.

---

## Smart views

| View | What it shows |
|---|---|
| **Dashboard** | Personal overview with stats and recent tasks |
| **All tasks** (admin only) | Every task across all projects and the shared board |
| **Shared board** (admin only) | Tasks without a project |
| **My tasks** | Tasks assigned to you |
| **Due soon** | Tasks due within 7 days |
| **Overdue** | Past-due tasks not done |

---

## Priority

Each task can have a priority level:

| Level | Color | Meaning |
|---|---|---|
| **P0 Critical** | Red | Must be done immediately |
| **P1 High** | Orange | Important |
| **P2 Medium** | Yellow | Normal |
| **P3 Low** | Green | Can wait |

Set priority in the task edit modal. Priority shows as a colored badge on task cards.

---

## Labels

### Creating labels (admin only)

1. Click the label icon in the top bar (next to the theme toggle)
2. Enter a name and pick a color
3. Click **Add label**

### Assigning labels to a task

1. Open the task edit modal
2. Under **Labels**, click a label to toggle it on/off
3. Save the task

Labels appear as colored chips on task cards.

---

## Dependencies

A task can depend on other tasks — it is **blocked** until those tasks are done.

### Setting dependencies

1. Open the task edit modal
2. Under **Blocked by**, click other tasks in the same project
3. Save

### Blocked indicator

Tasks with incomplete dependencies show a **Blocked by N** badge. Moving a blocked task to Done is prevented.

---

## Views

### Kanban view

The default view with three columns and drag-and-drop.

### List view

A sortable table with rows for title, status, priority, assignee, and due date. Click any row to edit the task. Use the toolbar to filter by status, priority, assignee, label, or due date range. Toggle **Compact** mode for a denser layout.

**Bulk edit:** Select tasks using the checkboxes. Use the toolbar to change status, priority, or delete multiple tasks at once.

### Gantt chart

Click the view switcher in the top bar and select Gantt. Tasks with due dates appear as bars on a timeline. Drag bars to adjust dates. Drag from the circle handle on a bar to create a dependency arrow between tasks. Click an arrow to remove it. Use the zoom controls to switch between Quarter Day, Half Day, Day, Week, and Month views.

### 3D sphere

Click the view switcher in the top bar and select the sphere icon. Each task is a particle on a 3D sphere. Completion rate determines the sphere color (red → green). In-progress tasks orbit as flowing amber particles. Hover over particles to see task details. Drag to rotate the sphere, scroll to zoom.

---

## Team

### Inviting members (admin only)

1. Open the **Admin panel** from the sidebar
2. Go to the **Access** tab
3. Enter an email to send an invitation
4. The invited person gets their role when they sign up

### Managing roles (admin only)

1. Open the **Admin panel** → **Members** tab
2. Click **Promote** or **Demote** next to a member
3. You cannot change your own role

### Join requests

New users who sign up without an invitation appear as **unknown** users. Admin can accept them from the **Access** tab.

### Online presence

Green dots next to member names show who is currently online. The sidebar shows who is currently editing a task.

### Notifications

The bell icon in the top bar shows notifications for task assignments, due dates, and exports. Click a notification to mark it as read.

---

## Export

1. Click the export icon in the top bar
2. The export modal opens with these options:
   - **File name** — enter a custom name (extension added automatically)
   - **Format** — choose Excel (.xlsx), PDF (.pdf), or CSV (.csv)
   - **Columns** — check/uncheck which columns to include (Title, Status, Priority, Assignee, Due Date, Description, Labels)
3. Click **Export** to download

Admin users receive a notification when anyone exports data.

---

## Themes

Click the sun/moon icon in the top bar to toggle between light and dark mode. Your preference is saved.

---

## Account settings

1. Click your avatar in the top bar → **Account settings**
2. Update your display name or upload an avatar
3. Change your password
4. Click **Delete account** to permanently remove your data (blocked if you are the only admin)

---

## Admin panel

| Tab | What you can do |
|---|---|
| **Members** | Promote/demote users between admin and member roles |
| **Access** | View join requests from unknown users, approve or deny them |
| **Email Changes** | Approve or reject pending email change requests |
| **Data** | Export full backup as JSON, restore from a previous backup |
| **System Settings** | Configure site name, default language, and default theme |
| **Logs** | View recent user actions (task created, project archived, etc.) |

---

## Keyboard shortcuts

| Shortcut | Action | Access |
|---|---|---|
| `Ctrl/Cmd + N` | Create a new task | Admin only |
| `Ctrl/Cmd + F` | Focus the filter input | All users |

---

**[⬆ Back to Top](#) | [📂 Documentation Index](../INDEX.md)**
