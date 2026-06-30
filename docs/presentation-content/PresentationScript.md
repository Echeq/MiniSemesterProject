# PivotPoint — Presentation Script

> Professional slide deck for project presentation.
> Each slide includes: **Title** · **On-screen content** · **Speaker notes** · **Diagram references**

---

## Slide 1 — Title Slide

**On-screen:**
```
PivotPoint

Real-time Kanban Board
React 19 · Supabase · Vite 8

Presented by [Your Name]
[Date]
```

**Speaker notes:**
"Good morning/afternoon everyone. Today I'm excited to present PivotPoint — a real-time collaborative Kanban board built with modern web technologies. Let me walk you through what we built, why we built it, and how it works under the hood."

**Diagrams:** None

---

## Slide 2 — Agenda

**On-screen:**
```
Agenda
├── The Problem
├── The Solution: PivotPoint
├── Architecture Overview
├── Key Features
│   ├── Task Management
│   ├── Real-time Collaboration
│   └── Views & Export
├── Tech Stack
├── Database & RBAC
├── Development Workflow
└── Demo
```

**Speaker notes:**
"Here's what we'll cover. We'll start with the problem we set out to solve, then walk through the solution architecture, key features, the technology choices we made, and finally a live demo."

**Diagrams:** None

---

## Slide 3 — The Problem

**On-screen:**
```
The Problem
┌──────────────────────────────────────────┐
│  ✗ Disconnected task tracking tools      │
│  ✗ No real-time collaboration            │
│  ✗ Complex setup, heavy infrastructure   │
│  ✗ Expensive per-seat licensing          │
│  ✗ Limited customization                 │
└──────────────────────────────────────────┘

Teams need:
  ✓ Lightweight · Real-time · Affordable · Customizable
```

**Speaker notes:**
"Traditional project management tools are either too heavy — think Jira with its complex setup — or too limited. Most lack real-time collaboration out of the box, charge per user, and lock you into their workflow. We wanted something lightweight, real-time by design, and fully customizable. That's PivotPoint."

**Diagrams:** None

---

## Slide 4 — The Solution: PivotPoint

**On-screen:**
```
PivotPoint
─────────────────────
A real-time Kanban board that just works.

┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Drag & Drop │  │ Live Sync    │   │ Role-based   │
│  Kanban      │──│ across all   │──│ Access       │
│  Board       │   │ clients      │   │ Control      │
└──────────────┘   └──────────────┘   └──────────────┘

┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Multiple    │   │ Export to    │   │ 5 Languages  │
│  Views       │──│ XLSX / PDF   │──│ RTL Support   │
│  (Gantt,3D)  │   │ CSV          │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
```

**Speaker notes:**
"PivotPoint is a full-featured Kanban board with drag-and-drop, real-time synchronization across all connected clients, role-based access control, multiple view modes including Gantt charts and a 3D visualization, export capabilities, and internationalization support for five languages including Arabic right-to-left layout."

**Diagrams:** None

---

## Slide 5 — Core Business Process Flow

**On-screen:**
```
User Journey
══════════════

   Visit App ──→ Env Check ──→ Auth ──→ Role Check ──→ Board
                    │            │          │
                    ↓            ↓          ↓
               Setup Hint    Sign Up    ┌──────────┐
                            / Sign In   │ Unknown  │→ Request Access
                                         │ Member   │→ Read assigned
                                         │ Admin    │→ Full CRUD
                                         └──────────┘
```

**Speaker notes:**
"Let me walk you through the user journey. A visitor lands on the app — if environment variables are missing, they see a helpful setup hint. Otherwise they authenticate via Supabase Auth. Once logged in, the system checks their role: unknown users see a request-access screen, members can view and edit their assigned tasks, and admins have full control over everything. From there, the Kanban board is the main workspace."

**Diagrams:** `diagram-business-flow.svg` — Show the complete business flow diagram.

---

## Slide 6 — Architecture Overview

**On-screen:**
```
Architecture
══════════════

┌─────────────────────────────────────────┐
│         React 19 + Vite 8               │
│  ┌──────────┐  ┌─────────────────────┐  │
│  │  Custom   │  │      Views          │  │
│  │  Hooks    │  │  Kanban | Gantt | 3D│  │
│  │  (10)     │  │  Dashboard | List   │  │
│  └────┬─────┘  └─────────────────────┘  │
│       │ supabase-js                      │
└───────┼─────────────────────────────────┘
        │
   ┌────┴────────────────────────────┐
   │         Supabase                │
   │  ┌──────┐ ┌─────────┐ ┌──────┐ │
   │  │ Auth │ │PostgREST│ │Real- │ │
   │  │      │ │  API    │ │time  │ │
   │  └──────┘ └────┬────┘ └──┬───┘ │
   │                │         │      │
   │          ┌─────┴─────────┴───┐  │
   │          │   PostgreSQL      │  │
   │          │   24 migrations   │  │
   │          └───────────────────┘  │
   └────────────────────────────────┘
```

**Speaker notes:**
"The architecture follows a modern JAMstack pattern. On the frontend we have React 19 with Vite 8, ten custom hooks that encapsulate all business logic, and five different view modes. The backend is pure Supabase — no custom server code. Supabase provides authentication, an auto-generated REST API via PostgREST, real-time subscriptions, file storage, and a PostgreSQL database with 24 migration files as the schema source of truth."

**Diagrams:** `diagram-architecture.svg` — System architecture diagram.

---

## Slide 7 — Key Features: Task Management

**On-screen:**
```
Task Management
══════════════════

┌──────────────┬────────────────────────────┐
│ Feature      │ Detail                     │
├──────────────┼────────────────────────────┤
│ CRUD         │ Create, read, update,      │
│              │ delete tasks               │
├──────────────┼────────────────────────────┤
│ Drag & Drop  │ Reorder within & between   │
│              │ columns via @dnd-kit       │
├──────────────┼────────────────────────────┤
│ Priority     │ P0 (Critical) → P3 (Low)   │
├──────────────┼────────────────────────────┤
│ Due Dates    │ Smart views: Due Soon (7d) │
│              │ Overdue · My Tasks         │
├──────────────┼────────────────────────────┤
│ Assignees    │ Assign to team members     │
├──────────────┼────────────────────────────┤
│ Dependencies │ Blocked tasks prevent      │
│              │ move to "Done"             │
├──────────────┼────────────────────────────┤
│ Labels       │ Custom labels per project  │
├──────────────┼────────────────────────────┤
│ Positioning  │ float8 · midpoint reorder  │
│              │ max+1024 insert · no re-   │
│              │ indexing                   │
└──────────────┴────────────────────────────┘
```

**Speaker notes:**
"Task management is the core of PivotPoint. Users can create, edit, and delete tasks with full drag-and-drop support — both reordering within a column and moving between columns. We support priority levels from P0 critical to P3 low, due dates with smart filters, assignment to team members, task dependencies that block completion until resolved, and customizable labels per project. Our positioning system uses float8 values with midpoint calculation on reorder and max-plus-1024 on insert — no expensive re-indexing needed."

**Diagrams:** None

---

## Slide 8 — Key Features: Real-time Collaboration

**On-screen:**
```
Real-time Collaboration
══════════════════════════

┌──────────────────────────────────────────┐
│  ┌──────────────────────────────────┐    │
│  │  User A moves task → "Done"     │    │
│  │       ↓                          │    │
│  │  supabase.from('tasks')          │    │
│  │       .update({status:'done'})   │    │
│  │       ↓                          │    │
│  │  PostgreSQL: UPDATE + trigger    │    │
│  │       ↓                          │    │
│  │  Realtime: broadcast change      │    │
│  │  on channel 'board'              │    │
│  │       ↓                          │    │
│  │  User B · User C · ...           │    │
│  │  receive live update             │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Presence: Online user indicators        │
│  Editing: See who's editing what         │
│  Notifications: Due · Overdue · Assign   │
└──────────────────────────────────────────┘
```

**Speaker notes:**
"Real-time is built into the foundation. When any user makes a change — say moving a task to Done — the custom hook calls Supabase, PostgreSQL processes the update, and Supabase Realtime broadcasts the change to every connected client on the 'board' channel. Each client re-fetches the modified row with the assignee's profile information and merges it optimistically. We also track online presence — who's currently viewing the board — and who's actively editing a task, so teams never step on each other's work. Notifications are database-driven via triggers."

**Diagrams:** `diagram-data-flow.svg` — Real-time data flow sequence diagram.

---

## Slide 9 — Key Features: Views & Export

**On-screen:**
```
Views & Export
═════════════════

Views:
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Kanban  │ │  Gantt   │ │  3D      │ │Dashboard│ │  List    │
│  (default)│ │  Chart   │ │  Sphere  │ │         │ │  View    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘

Export:
  ┌─────────┐ ┌─────────┐ ┌─────────┐
  │  XLSX   │ │   PDF   │ │   CSV   │
  │ exceljs │ │  jspdf  │ │         │
  └─────────┘ └─────────┘ └─────────┘

Internationalization:
  EN · ES · ZH · ID · AR (RTL)
```

**Speaker notes:**
"PivotPoint isn't just a Kanban board — it offers five different views. The default Kanban view with drag-and-drop, a Gantt chart for timeline visualization built with frappe-gantt, a 3D sphere visualization using Three.js for a unique spatial perspective, a dashboard with project statistics, and a list view for tabular data. Users can export their board to Excel, PDF, or CSV. And the entire interface is translated into five languages, with Arabic supporting full right-to-left layout."

**Diagrams:** None

---

## Slide 10 — Tech Stack

**On-screen:**
```
Tech Stack
══════════════════

┌────────────┬─────────────────────────────────┐
│ Layer      │ Technology                      │
├────────────┼─────────────────────────────────┤
│ Frontend   │ React 19 · Vite 8               │
│            │ Tailwind CSS v4 · @dnd-kit      │
│            │ JSX (no runtime TypeScript)      │
├────────────┼─────────────────────────────────┤
│ Backend    │ Supabase (Auth · PostgREST       │
│            │ · Realtime · Storage)            │
│            │ No custom server                 │
├────────────┼─────────────────────────────────┤
│ Database   │ PostgreSQL · 24 SQL migrations   │
│            │ Row-Level Security · Triggers    │
├────────────┼─────────────────────────────────┤
│ Testing    │ Vitest 4 · Testing Library       │
│            │ jsdom · ~30 test files           │
├────────────┼─────────────────────────────────┤
│ Build      │ Vite 8 (Rolldown Rust bundler   │
│            │ in production, esbuild in dev)   │
├────────────┼─────────────────────────────────┤
│ CI/CD      │ GitHub Actions (test + build     │
│            │ on push/PR to main)              │
└────────────┴─────────────────────────────────┘

Dependencies: ~40 React components · 10 custom hooks
```

**Speaker notes:**
"On the technology side: React 19 with Vite 8 for the frontend, Tailwind CSS v4 for styling, and @dnd-kit for drag-and-drop. The backend is entirely Supabase — no custom server code to maintain. PostgreSQL with 24 migration files, Row-Level Security policies, and database triggers. We have about 30 test files running on Vitest 4 with Testing Library. Build uses Vite 8 which leverages Rolldown — a Rust-based bundler — for production builds. CI is handled by GitHub Actions running tests and build on every push or PR to main."

**Diagrams:** None

---

## Slide 11 — Database Schema

**On-screen:**
```
Database Schema
══════════════════

Core Tables:
  profiles      ──→  ┌──────────────────┐
                      │      tasks       │
  projects      ──→  │ title, status,   │
                      │ priority, assign,│
  labels        ──→  │ due_date, pos    │
                      └──────────────────┘
  notifications           ↕        ↕
                    task_labels  task_dependencies

  invitations · join_requests · project_members

Key Constraints:
  · title: 1-200 chars
  · description: max 5000
  · display_name: max 100 (truncated by trigger)
  · created_by: immutable after insert
  · Priority: CHECK (P0|P1|P2|P3)
```

**Speaker notes:**
"Let's look at the database. Seven core tables: profiles tied to auth users, tasks with all their metadata, projects for grouping tasks, labels and task_labels for categorization, task_dependencies for blocker relationships, and notifications for alerts. We also have invitations, join requests, and project members for team management. Key constraints include title length of 1 to 200 characters, description up to 5000, and the created_by field is immutable after insert — enforced at the column level."

**Diagrams:** `diagram-er.svg` — Entity-relationship diagram.

---

## Slide 12 — Role-Based Access Control

**On-screen:**
```
Role-Based Access Control
═══════════════════════════

  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  Admin   │    │  Member  │    │ Unknown  │
  ├──────────┤    ├──────────┤    ├──────────┤
  │Full CRUD │    │Read-only │    │Empty     │
  │All tasks │    │Own tasks │    │board     │
  │Manage    │    │Edit own  │    │Request   │
  │members   │    │assigned  │    │access    │
  └──────────┘    └──────────┘    └──────────┘

  ┌──────────────────────────────────────────┐
  │  Signup Flow                              │
  │                                           │
  │  1st user ever ──→ admin                  │
  │  New signup    ──→ handle_new_user()       │
  │  trigger checks:                           │
  │    ├── Invitation matches? → member        │
  │    └── No invitation → unknown             │
  │                                           │
  │  Admin promotes via admin_set_role RPC     │
  └──────────────────────────────────────────┘

  RLS: Row-Level Security on every table
```

**Speaker notes:**
"Access control is handled through three roles and Row-Level Security in PostgreSQL. Admins have full CRUD on all tasks and can manage team members. Members have read-only access to all tasks but can only edit tasks assigned to them. Unknown users see an empty board and must request access. The first user to ever sign up automatically becomes admin. Subsequent signups go through a trigger that checks for pending invitations — if found, they become member; otherwise unknown. Admins can promote users through the admin_set_role RPC."

**Diagrams:** `diagram-rbac.svg` — RBAC flow diagram.

---

## Slide 13 — Development Workflow

**On-screen:**
```
Development Workflow
═══════════════════════

Setup:
  cd frontend
  npm install
  cp .env.example .env    # Add Supabase credentials
  npm run dev              # → http://localhost:5173

Testing:
  npm test                 # Vitest (excludes api tests)
  npx vitest run tests/api.test.js   # API integration tests

Database (local):
  supabase start           # Local Supabase instance
  supabase db push         # Apply migrations
  supabase db reset        # Reset + run all migrations + seed

Build:
  npm run build            # Rolldown production build
  npm run preview          # Preview production build

CI: GitHub Actions (test → build on push/PR to main)
```

**Speaker notes:**
"The development workflow is straightforward. Install dependencies from the frontend directory, copy the environment file with Supabase credentials, and run the dev server. Testing is done with Vitest — the default test run excludes API integration tests which you run separately. For database work, the Supabase CLI provides local PostgreSQL with all migrations. Production build uses Rolldown, Vite 8's Rust-based bundler. The CI pipeline on GitHub Actions runs tests and build on every push or pull request to main."

**Diagrams:** None

---

## Slide 14 — Project Structure

**On-screen:**
```
Project Structure
═══════════════════

pivotpoint/
├── frontend/                # React 19 application
│   ├── src/
│   │   ├── main.jsx         # Entry point
│   │   ├── App.jsx          # Root component
│   │   ├── api/             # Supabase client
│   │   ├── hooks/           # 10 custom hooks
│   │   ├── components/      # ~40 UI components
│   │   └── locales/         # 5 translation files
│   ├── tests/               # ~30 test files
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api.test.js
│   └── package.json
│
├── supabase/                # Database source of truth
│   ├── migrations/          # 24 SQL files
│   └── seed.sql             # Sample data
│
├── docs/                    # Documentation
└── scripts/                 # Deploy scripts
```

**Speaker notes:**
"The project structure is clean and organized. The frontend directory contains all React code — main entry point, root App component, API client, 10 custom hooks that encapsulate business logic, about 40 UI components, and translation files for 5 languages. Tests are organized by type in the tests directory. The supabase directory holds all 24 migration files as the database source of truth plus seed data for local development."

**Diagrams:** `diagram-components.svg` — Component hierarchy diagram.

---

## Slide 15 — Demo

**On-screen:**
```
Live Demo
═════════════

  1. Sign in / Sign up
  2. Create a project
  3. Add tasks
  4. Drag & drop between columns
  5. Assign team members
  6. Add labels and dependencies
  7. Try Gantt chart and 3D sphere views
  8. Export to XLSX / PDF
  9. Show real-time sync (open second browser)
  10. Admin panel: manage roles
```

**Speaker notes:**
"Now let me show you PivotPoint in action. I'll walk through the complete workflow: signing in, creating a project, adding and managing tasks with drag-and-drop, assigning team members, setting up labels and dependencies, switching between views, and exporting data. I'll also demonstrate real-time synchronization by opening a second browser window."

**Diagrams:** None

---

## Slide 16 — Thank You

**On-screen:**
```
Thank You
═══════════

  ┌──────────────────────────────────────┐
  │                                      │
  │        PivotPoint                    │
  │   Real-time Kanban Board             │
  │                                      │
  │   Questions?                         │
  │                                      │
  │   Built with:                        │
  │   React 19 · Supabase · Vite 8      │
  │   Tailwind CSS · @dnd-kit            │
  │                                      │
  └──────────────────────────────────────┘

  https://github.com/Echeq/MiniSemesterProject
```

**Speaker notes:**
"Thank you for your attention. PivotPoint demonstrates that you can build a production-grade, real-time collaborative application with a surprisingly simple stack — just React on the frontend and Supabase on the backend, no custom server code needed. The entire application was built with modern best practices: database migrations, Row-Level Security, real-time subscriptions, comprehensive testing, and CI/CD. I'm happy to take any questions."

**Diagrams:** None

---

## Appendix — Diagram Reference

| Diagram | File | Usage |
|---|---|---|
| Architecture | `diagram-architecture.svg` | Slide 6 |
| Business Flow | `diagram-business-flow.svg` | Slide 5 |
| Entity-Relationship | `diagram-er.svg` | Slide 11 |
| Component Hierarchy | `diagram-components.svg` | Slide 14 |
| Data Flow | `diagram-data-flow.svg` | Slide 8 |
| RBAC | `diagram-rbac.svg` | Slide 12 |
