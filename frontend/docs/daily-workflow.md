# Daily Workflow

## Setup

```bash
cd frontend
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in your Supabase project credentials.

## Git Branching

- `main` — stable, reviewed code
- `feat/*` — new features
- `fix/*` — bug fixes

Always create a feature branch off `main`:

```bash
git checkout main
git pull
git checkout -b feat/my-feature
```

## OpenCode Commands

In any PR description or commit message:

- `@ai-log` — Log the last interaction to `docs/log/`
- `@ai-commit` — Stage all changes and create a conventional commit

## Lint & Typecheck

```bash
npm run build
```

The build step includes `tsc -b` which catches type errors.
