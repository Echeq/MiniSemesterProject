# npm setup

## For new developers (cloning the repo)

```bash
cd frontend
npm install
npm run dev
```

This installs all dependencies declared in `package.json` and starts the Vite dev server at `http://localhost:5173`.

## Available commands

| Command | Action |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck (`tsc -b`) + production build (`vite build`) |
| `npm run preview` | Preview the production build |

## Notes

- All commands run from `frontend/`. There is no `package.json` at the project root.
- `.env` goes in `frontend/` (see [Supabase setup](supabase.md)).
