# Project Structure

```
MiniSemesterProject/
├── .opencode/
│   ├── scripts/
│   │   ├── new-ai-log.ps1          # PowerShell script for AI logging (Windows)
│   │   └── new-ai-log.sh           # Bash script for AI logging (Mac/Linux)
│   └── skills/
│       ├── ai-commit/
│       │   └── SKILL.md            # @ai-commit skill
│       └── ai-log-generate/
│           └── SKILL.md            # @ai-log skill
├── backend/
│   ├── prisma/
│   │   └── schema.prisma           # Database models (User, Project, Task, Tag, …)
│   ├── src/
│   │   ├── app.controller.ts       # Root NestJS controller
│   │   ├── app.controller.spec.ts
│   │   ├── app.module.ts           # Root module (import feature modules here)
│   │   ├── app.service.ts
│   │   └── main.ts                 # NestJS entrypoint
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── .env                        # DATABASE_URL, REDIS_URL
│   ├── .prettierrc
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package.json
│   ├── prisma.config.ts            # Prisma 6 config (schema path, datasource)
│   ├── tsconfig.build.json
│   └── tsconfig.json
├── docs/
│   ├── guide/
│   │   ├── ai.md                   # OpenCode + AI skills guide
│   │   └── structure.md            # This file
│   ├── log/                        # AI interaction log files
│   └── setup/
│       ├── index.md                # Setup guides index
│       ├── backend.md              # NestJS + Prisma + Redis setup
│       ├── frontend.md             # Vue 3 setup
│       ├── npm.md                  # (legacy)
│       └── supabase.md             # (legacy)
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts           # Fetch wrapper for backend API
│   │   ├── assets/
│   │   ├── components/             # Vue components (add as needed)
│   │   ├── composables/            # Vue composables (add as needed)
│   │   ├── pages/
│   │   │   └── HomePage.vue
│   │   ├── stores/
│   │   │   └── task.ts             # Pinia store example
│   │   ├── App.vue
│   │   ├── main.ts                 # Vue SPA entrypoint
│   │   └── style.css
│   ├── .vscode/
│   │   └── extensions.json
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── supabase/                       # (legacy, empty)
├── AGENTS.md                       # Instructions for AI workers (/init)
└── README.md
```
