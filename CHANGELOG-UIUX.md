# UI/UX Changes Log

This file records implementation progress for the requested UI/UX updates.

## 2026-06-27
### Completed
- **Keyboard shortcuts** (`frontend/src/App.jsx`)
  - Added global keydown handler for:
    - `Ctrl+N` / `Cmd+N` → triggers new task modal (same behavior as New Task button)
    - `Ctrl+F` / `Cmd+F` → focuses the filter panel input (`#filter-input`)
  - Added guard to prevent triggering while typing in `INPUT`, `TEXTAREA`, or `contentEditable` elements.
- **AGENTS.md audit & update** (DESKTOP-OFM9AMO)
  - Verified all project files, configs, tests, and DB schema against the live Supabase project
  - Confirmed no missing backends — backend is pure Supabase; `backend/` is dead NestJS scaffold
  - Documented RPC drift: 6 functions live in the DB but not in `supabase/migrations/` (added via Supabase MCP)
  - Added `usePolling: true` Vite quirk, Priority P0-P3, Labels/dependencies, and 4 missing RPCs to AGENTS.md

### Notes / Pending
- Remaining tasks from the spec are not yet implemented in this log.

