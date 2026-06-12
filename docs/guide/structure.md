# Project Structure

```
TaskFlow/
├── .opencode/
│   ├── scripts/
│   │   ├── new-ai-log.sh         # Bash script for AI logging (Mac/Linux)
│   │   └── new-ai-log.ps1        # PowerShell script for AI logging (Windows)
│   └── skills/
│       ├── ai-commit/
│       │   └── SKILL.md           # @ai-commit skill
│       └── ai-log-generate/
│           └── SKILL.md           # @ai-log skill
├── backend/
│   └── src/
│       ├── controllers/           # API route handlers
│       ├── middleware/             # Auth & validation middleware
│       ├── routes/                # API route definitions
│       ├── services/              # Business logic
│       └── utils/                 # Shared utilities
├── docs/
│   ├── ai-guide.md                # OpenCode + AI skills guide
│   ├── log/                       # AI interaction log files
│   ├── setup.md                   # How to run the project
│   └── structure.md               # This file
├── frontend/
│   └── src/
│       ├── api/                   # Supabase client & API calls
│       ├── components/
│       │   ├── forms/             # Task & auth forms
│       │   ├── kanban/            # Kanban board components
│       │   └── ui/                # Reusable UI components
│       ├── contexts/              # React contexts (auth, theme)
│       ├── hooks/                 # Custom React hooks
│       ├── pages/                 # Route pages (Login, Board, etc.)
│       ├── styles/                # Global styles & Tailwind config
│       └── utils/                 # Shared helpers
├── supabase/                      # Database schema & Edge Functions
├── AGENTS.md                      # Instructions for AI workers (/init)
└── README.md
```
