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

### Editing a task

Click any task card to open the edit modal. Change any field and click **Save**.

### Deleting a task

Open the edit modal and click **Delete**. Confirm in the dialog.

### Drag and drop

- Drag a card to move it between columns
- Drag within a column to reorder
- Works on mobile (long press to start dragging)

---

## Projects

### Creating a project

1. Click the **+** icon next to "Projects" in the sidebar
2. Enter a name, description, color, and icon
3. Click **Create project**

### Switching projects

Click a project name in the sidebar to view only its tasks.

### Editing a project

Hover over a project in the sidebar and click the gear icon. Change name, description, color, or icon.

### Archiving a project

Hover over an active project → click the archive icon. Archived projects are hidden from the main list.

### Restoring a project

Scroll to the **Archived** section in the sidebar, click the restore icon.

---

## Smart views

| View | What it shows |
|---|---|
| **All tasks** | Every task across all projects |
| **Shared board** | Tasks without a project |
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
| None | — | No priority set |

Set priority in the task edit modal.

---

## Labels

### Creating labels

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

Tasks with incomplete dependencies show a **Blocked by N** badge.

---

## List view

Click the list/kanban toggle in the top bar to switch between:

- **Kanban view** — columns with cards
- **List view** — table with rows (title, status, priority, assignee, due date)

Click any row to edit the task.

---

## Team

### Inviting members (admin only)

1. Open the **Admin panel** from the sidebar
2. Go to the **Invitations** tab
3. Enter an email and select a role
4. Click **Invite**

The invited person gets their role automatically when they sign up.

### Managing roles (admin only)

1. Open the **Admin panel** → **Members** tab
2. Click **Promote** or **Demote** next to a member
3. You cannot change your own role

### Online presence

Green dots next to member names show who is currently online.

---

## Export

1. Click **Export** in the top bar
2. Choose **PDF** or **CSV**
3. The file downloads with the current view's tasks

---

## Themes

Click the sun/moon icon in the top bar to toggle between light and dark mode. Your preference is saved.

---

## Account settings

1. Click your avatar in the top bar → **Account settings**
2. Update your display name or upload an avatar
3. Click **Delete account** to permanently remove your data (admin cannot delete if they are the last admin)

---

## Admin panel

| Tab | What you can do |
|---|---|
| **Members** | Promote/demote users between admin and member roles |
| **Invitations** | Invite new members by email, revoke pending invites |
| **Logs** | View recent user actions (task created, project archived, etc.) |
| **Backup** | Download all data as JSON |
