# Project Structure

```
MiniSemesterProject/
├── .opencode/                     # OpenCode AI config
│   ├── scripts/                   #   PowerShell/Bash scripts for logging
│   └── skills/                    #   ai-commit / ai-log-generate skills
├── backend/                       # Legacy NestJS scaffold (dead code)
│   ├── prisma/
│   │   └── schema.prisma          #   Inactive Prisma schema (stale)
│   ├── generated/                 #   Prisma client output (gitignored)
│   ├── src/                       #   Empty NestJS modules
│   └── test/                      #   Jest e2e setup
├── docs/                          # Project documentation
│   ├── api.md                     #   Supabase API reference + Thunder Client walkthrough
│   ├── architecture.md            #   React + Supabase data flow
│   ├── database.md                #   Schema, RLS, migrations, seed
│   ├── setup.md                   #   Full setup guide
│   ├── guide/
│   │   ├── ai.md                  #   OpenCode workflow (@ai-log, @ai-commit)
│   │   └── structure.md           #   This file
│   ├── log/                       #   AI interaction logs
│   └── thunder-collection_TaskFlow-API.json  # Thunder Client collection
├── frontend/                      # Active React 19 application
│   ├── public/                    #   Static assets (favicon)
│   ├── src/                       #   Application source
│   │   ├── api/                   #   Supabase client + REST helpers
│   │   ├── components/            #   React components (AuthForm, Board, Column, ...)
│   │   ├── hooks/                 #   Custom hooks (useAuth, useBoard, useProfile, ...)
│   │   ├── App.jsx                #   Root component (auth gate + board)
│   │   ├── main.jsx               #   React entry point
│   │   └── index.css              #   Tailwind v4 entry
│   ├── tests/                     #   Vitest test files
│   ├── index.html                 #   HTML shell
│   ├── vite.config.js             #   Active Vite config (React + Tailwind)
│   ├── vitest.config.js           #   Test configuration
│   └── .env                       #   Supabase credentials (gitignored)
├── supabase/                      # Supabase database
│   ├── migrations/                #   SQL migrations (schema source of truth)
│   ├── seed.sql                   #   Dev seed data
│   └── README.md                  #   Supabase CLI usage
├── AGENTS.md                      # AI instruction file (/init)
└── README.md                      # Project landing page
```

## Key directories

| Path | Role |
|---|---|
| `frontend/src/api/` | Supabase client initialization and API helpers |
| `frontend/src/components/` | React components (Board, Column, TaskCard, Topbar, Sidebar, etc.) |
| `frontend/src/hooks/` | Custom hooks for auth, board data, profile management |
| `supabase/migrations/` | Database migration files (the real schema) |
| `docs/` | All project documentation — setup, API, architecture, database |
| `backend/` | Legacy NestJS scaffold — not active |

## Stale code (do not modify)

| Path | What |
|---|---|
| `frontend/src/main.ts` | Vue 3 entry point |
| `frontend/src/App.vue` | Vue 3 root |
| `frontend/src/style.css` | Vue 3 styles |
| `frontend/src/stores/` | Pinia stores |
| `frontend/src/pages/` | Vue router pages |
| `frontend/src/composables/` | Vue composables |
| `frontend/vite.config.ts` | Vue plugin config |
| `backend/` | Full NestJS scaffold (AppModule is empty) |
