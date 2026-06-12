# TaskFlow - Visual Task Manager

A simple task management system with a Kanban board for small teams.
**Works on desktop and mobile phones.**

## Team Members

| Role | Name |
|------|------|
| Frontend Lead & UI Specialist | @goanarbolkong |
| Backend Lead & API Architect | @MemerZxZ |
| Project Manager & Fullstack QA | @Echeq |

## Tech Stack

- **Frontend:** React + Vite
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime
- **Drag & Drop:** @dnd-kit/core
- **Styling:** Tailwind CSS (responsive)
- **Mobile:** Fully responsive design

## Features

- Create, edit, delete tasks
- Kanban board (To Do / Doing / Done)
- Drag & drop between columns
- Task due dates
- Mobile friendly (swipe, touch)
- Real-time updates
- User authentication

## Project Structure

```
TaskFlow/
├── .opencode/
│   ├── scripts/
│   │   ├── new-ai-log.sh         # Bash script for AI logging (Mac/Linux)
│   │   └── new-ai-log.ps1        # PowerShell script for AI logging (Windows)
│   └── skills/
│       └── ai-log-generate/
│           └── SKILL.md          # @ai-log skill definition
├── backend/
│   └── src/
│       ├── controllers/          # API route handlers
│       ├── middleware/            # Auth & validation middleware
│       ├── routes/               # API route definitions
│       ├── services/             # Business logic
│       └── utils/                # Shared utilities
├── docs/
│   └── log/                      # AI interaction log files
├── frontend/
│   └── src/
│       ├── api/                  # Supabase client & API calls
│       ├── components/
│       │   ├── forms/            # Task & auth forms
│       │   ├── kanban/           # Kanban board components
│       │   └── ui/               # Reusable UI components
│       ├── contexts/             # React contexts (auth, theme)
│       ├── hooks/                # Custom React hooks
│       ├── pages/                # Route pages (Login, Board, etc.)
│       ├── styles/               # Global styles & Tailwind config
│       └── utils/                # Shared helpers
├── supabase/                     # Database schema & Edge Functions
├── AGENTS.md                     # Instructions for AI workers (/init)
└── README.md
```

## How to Run

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node)
- Supabase account (free)

### Supabase setup

1. Create a free account at https://supabase.com
2. Create a new project
3. Copy your `URL` and `anon key` from Project Settings > API
4. Create `frontend/.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** Backend is pure Supabase — no server code to run. Database schema and Edge Functions go in `supabase/`.

### Initialize project (first time only)

```bash
cd frontend
npm create vite@latest . -- --template react
npm install supabase @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Run dev server

```bash
cd frontend
npm run dev
```

## Using OpenCode

This project uses **OpenCode** as the AI-powered CLI assistant. All collaborators use it to generate, review, and refactor code consistently.

### Installation

**Windows (PowerShell):**
```powershell
winget install opencode
```

**Mac (Homebrew):**
```bash
brew install opencode
```

**Linux (curl):**
```bash
curl -fsSL https://opencode.ai/install.sh | sh
```

### Daily Workflow (step by step)

**Step 1 — Start OpenCode**

Open a terminal in the project folder:

```bash
# Windows / Mac / Linux — all the same
opencode
```

**Step 2 — Load project context**

At the start of every session, type:

```
/init
```

This loads `AGENTS.md` and discovers the `@ai-log` skill in `.opencode/skills/`.

**Step 3 — Ask the AI for what you need**

Chat naturally. Example prompts:

- "Create a Kanban board component"
- "Fix the drag-and-drop bug in TaskCard"
- "Add a login page with Supabase Auth"

**Step 4 — Log the interaction**

After the AI finishes its response, type:

```
@ai-log
```

The AI will:
- Auto-detect your PC name, date, time, and git branch
- Read the conversation to extract the prompt, response, and file changes
- Create a log file at `docs/log/AI-LOG-YYYY-MM-DD-HHMMSS-PCNAME.txt`
- Confirm once done

**Step 5 — Repeat**

Go back to Step 3 for your next task.

### Example session

```
$ opencode
/init
> Create a Kanban column component in frontend/src/components/kanban/
[AI writes the component]

@ai-log
✅ Log saved to docs/log/AI-LOG-2026-06-12-094512-DESKTOP-ABC.txt

> Now add drag-and-drop support
[AI adds @dnd-kit logic]

@ai-log
✅ Log saved to docs/log/AI-LOG-2026-06-12-094823-DESKTOP-ABC.txt
```

### Without OpenCode (standalone scripts)

If you are not using OpenCode, run these scripts instead:

**Windows:**
```powershell
.\.opencode\scripts\new-ai-log.ps1
```

**Mac/Linux:**
```bash
chmod +x .opencode/scripts/new-ai-log.sh
./.opencode/scripts/new-ai-log.sh
```
