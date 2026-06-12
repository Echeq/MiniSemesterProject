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
├── ai-skills/                    # AI assistant skills & scripts
│   ├── scripts/
│   │   ├── new-ai-log.sh         # Bash script for AI logging (Mac/Linux)
│   │   └── new-ai-log.ps1        # PowerShell script for AI logging (Windows)
│   └── skills/
│       └── ai-log-generate.md    # @ai-log skill definition
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

### Setup Supabase

1. Create a free account at https://supabase.com
2. Create a new project
3. Copy your `URL` and `anon key` from Project Settings > API
4. Create a `.env` file in the frontend folder:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

## AI Logging System

Every AI interaction is logged to `docs/log/` for team traceability.

### How It Works

1. After using AI to generate or modify code, type `@ai-log` in the chat
2. The skill auto-detects your PC name, date, time, and git branch
3. You provide: prompt, AI response, file path, code before/after, AI tool
4. A log file is created at `docs/log/AI-LOG-YYYY-MM-DD-HHMMSS-PCNAME.txt`

### Log Format

Each log file contains auto-detected metadata plus the prompt, AI response, affected file, and code diff in a clear, structured layout.

### Standalone Scripts

If you are not using OpenCode, run the scripts directly:

**Windows:**
```powershell
.\ai-skills\scripts\new-ai-log.ps1
```

**Mac/Linux:**
```bash
chmod +x ai-skills/scripts/new-ai-log.sh
./ai-skills/scripts/new-ai-log.sh
```
