# Project Structure

```
PivotPoint/
├── .opencode/                     # OpenCode AI config
│   ├── scripts/                   #   PowerShell/Bash scripts for logging
│   └── skills/                    #   ai-commit / ai-log-generate skills
├── backend/                       # Legacy NestJS scaffold (dead code — do not edit)
│   ├── dist/                      #   Build output
│   ├── generated/                 #   Prisma client output
│   ├── node_modules/              #   Dependencies
│   └── .env                       #   Legacy env
├── docs/                          # Project documentation
│   ├── api.md                     #   Supabase API reference + Thunder Client guide
│   ├── architecture.md            #   React + Supabase data flow
│   ├── database.md                #   Schema, RLS, migrations, seed
│   ├── setup.md                   #   Full setup guide
│   ├── CHANGES.md                 #   System summary + feature catalog
│   ├── task.md                    #   Module tracking (checklist)
│   ├── guide/
│   │   ├── ai.md                  #   OpenCode workflow (@ai-log, @ai-commit)
│   │   └── structure.md           #   This file
│   ├── setup/
│   │   ├── index.md               #   Setup index
│   │   ├── frontend.md            #   Frontend commands
│   │   ├── supabase.md            #   Supabase config
│   │   ├── npm.md                 #   npm quick start
│   │   └── backend.md             #   Legacy NestJS notes
│   ├── log/                       #   AI interaction logs
│   ├── weekreport/                #   Weekly team reports
│   └── thunder-collection_TaskFlow-API.json  # Thunder Client collection
├── frontend/                      # Active React 19 application
│   ├── public/                    #   Static assets (favicon.svg, icons.svg)
│   ├── src/                       #   Application source
│   │   ├── api/                   #   supabaseClient.js
│   │   ├── components/            #   React components (Board, Column, TaskCard, ...)
│   │   ├── hooks/                 #   Custom hooks (useAuth, useBoard, ...)
│   │   ├── locales/               #   i18n (en.json, es.json, id.json, zh.json)
│   │   ├── i18n.js                #   i18next configuration
│   │   ├── App.jsx                #   Root component (auth gate + board)
│   │   ├── main.jsx               #   React entry point
│   │   └── index.css              #   Tailwind v4 entry
│   ├── tests/                     #   Vitest tests (17 files)
│   │   ├── setup.js               #   Test setup (jsdom cleanup, matchMedia mock)
│   │   ├── mockSupabase.js        #   Mock Supabase factory
│   │   └── components/, hooks/    #   Component and hook tests
│   ├── index.html                 #   HTML shell
│   ├── vite.config.js             #   Vite config (React + Tailwind)
│   ├── vitest.config.js           #   Test config (globals: true, jsdom, 15s timeout)
│   ├── eslint.config.js           #   ESLint flat config
│   ├── tsconfig.json              #   TypeScript config (tooling only)
│   └── .env.example               #   Environment template
├── supabase/                      # Supabase database
│   ├── migrations/                #   9 SQL migrations (schema source of truth)
│   ├── seed.sql                   #   Dev seed data (6 sample tasks)
│   └── README.md                  #   Supabase CLI usage
├── AGENTS.md                      # AI instruction file
├── opencode.json                  # OpenCode config (Supabase MCP)
└── README.md                      # Project landing page
```

## Key directories

| Path | Role |
|---|---|
| `frontend/src/api/` | Supabase client initialization |
| `frontend/src/components/` | React components (Board, Column, TaskCard, Sidebar, Topbar, etc.) |
| `frontend/src/hooks/` | Custom hooks (useAuth, useBoard, useProfile, useProjects, etc.) |
| `frontend/src/locales/` | i18n translation files (en, es, id, zh) |
| `frontend/tests/` | Vitest test files (17 files, 89 tests) |
| `supabase/migrations/` | Database migration files (source of truth for schema) |
| `docs/` | All project documentation |

## Dead code (do not modify)

| Path | Why |
|---|---|
| `backend/` | Orphaned NestJS scaffold — only dist/, generated/, node_modules/, .env remain |
| `frontend/src/composables/` | Empty directory — Vue 3 remnant |
| `frontend/src/assets/` | Empty directory — Vue 3 remnant |
