# TaskFlow — User Manual

## 1. Getting Started

### Sign Up
1. Open the app in your browser.
2. Enter your email, password, and display name.
3. Click **Sign Up**.
4. The first user to sign up becomes an **Admin**. All subsequent users join as **Unknown** until an admin invites them.

### Sign In
1. Enter your email and password.
2. Click **Sign In**.

### Profile Settings
- Click your avatar in the top-right corner → **Account**.
- Upload an avatar (jpg, png, gif, webp — max 2MB).
- Change your display name, email, or password.
- Delete your account (requires confirmation).
- View your task statistics (To Do, Doing, Done).

---

## 2. Kanban Board

The board has three columns: **To Do**, **Doing**, **Done**.

### Create a Task
1. Click the **+ New task** button in the top bar.
2. Fill in the title (required, 1-200 chars), description (optional, max 5000 chars), and due date.
3. Assign a team member (optional).
4. Select a project (optional).
5. Click **Create**.

### Edit a Task
- Click any task card to open the edit modal.
- Modify any field and changes save automatically.

### Delete a Task
- Open the task, click **Delete**, confirm.

### Drag & Drop
- Drag a card between columns to change its status.
- Drag within a column to reorder.
- Works on both desktop (mouse) and mobile (touch).

---

## 3. Smart Views

Use the sidebar to filter your board:

| View | Shows |
|---|---|
| **All tasks** | Every task across all projects |
| **Shared board** | Tasks not linked to any project |
| **My tasks** | Only tasks assigned to you |
| **Due soon** | Tasks due within 7 days |
| **Overdue** | Past-due tasks not yet done |

---

## 4. Projects

### Create a Project
1. Click the **+** button next to "Projects" in the sidebar.
2. Enter a project name (max 120 chars).
3. Click **Add**.

### Switch Projects
- Click any project in the sidebar to see only its tasks.
- Active projects show a progress bar (% of tasks done).

### Archive / Delete
- Hover over a project → click the archive icon to hide it.
- Click the trash icon to delete the project and all its tasks.
- Archived projects appear in the "Archived" section at the bottom.

---

## 5. Real-time Collaboration

- All changes sync instantly across all open browsers.
- When someone creates, edits, or moves a task, every client updates automatically.
- The **Team** panel in the sidebar shows who is online (green dot).

---

## 6. Export

- Click the **Export** button in the top bar.
- Choose **PDF** or **CSV** to download the current view.
- The exported file contains: title, status, priority, assignee, due date.

---

## 7. Admin Features

> Only visible to users with the **Admin** role.

### Admin Panel
- Click the shield icon in the sidebar → **Admin panel**.

### Member Management
- View all users and their roles.
- Promote members to admin or demote admins to member.

### Invitations
- Send an invitation by email with a role (Admin / Member).
- When the invited person signs up, they automatically get that role.
- Revoke pending invitations at any time.

---

## 8. Theme & Language

- Click the sun/moon icon in the top bar to toggle **dark/light mode**.
- Your preference is saved automatically.
- The app supports **English, Spanish, Chinese, Indonesian** — switch via your browser or saved preference.

---

## 9. Keyboard Shortcuts

| Key | Action |
|---|---|
| `Esc` | Close any open modal |

---

## 10. Troubleshooting

| Problem | Solution |
|---|---|
| "Supabase not configured" | Create `frontend/.env` with your Supabase credentials |
| Blank board after sign in | An admin must invite you or assign you a role |
| Channel subscription error | Check your internet connection — auto-reconnect is built-in |
