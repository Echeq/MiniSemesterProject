# npm setup (first time only)

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Scaffold a Vite + React project:
   ```bash
   npm create vite@latest . -- --template react
   ```
   This creates `package.json`, `vite.config.js`, `index.html`, and a default `src/` with App.jsx.
3. Install project dependencies:
   ```bash
   npm install supabase @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```
   - `supabase` — Supabase client SDK
   - `@dnd-kit/core` — Drag & drop engine
   - `@dnd-kit/sortable` — Sortable presets for Kanban columns
   - `@dnd-kit/utilities` — CSS transform & measurement helpers

## Run dev server

```bash
cd frontend
npm run dev
```
