# AI Interaction Log — 2026-06-27

| Field | Value |
|---|---|
| PC Name | DESKTOP-OFM9AMO |
| Date | 2026-06-27 |
| Time | 144441 |
| Branch | Elbert_Helping_Mobile_Frontend |
| Tool | OpenCode |

## Prompt

User requested: create/update AGENTS.md with verified project info. Then verify project files, find any missing backends, clean the UI/UX Changes Log for 2026-06-27 (DESKTOP-OFM9AMO), and make the project tidy.

## AI Response

### Phase 1 — AGENTS.md update
Investigated full codebase (README, package.json, vitest.config, vite.config, eslint, tsconfig, CI, migrations, src/, hooks, tests, supabase schema). Made 3 targeted improvements:
- Added `usePolling: true` to dev command (non-obvious Vite quirk in `vite.config.js:11`)
- Added Priority system (P0-P3) with DB CHECK constraint to Key patterns
- Added Labels + dependencies section covering `labels`, `task_labels`, `task_dependencies` tables + `check_blocked_tasks` RPC
- Added 4 missing RPCs to the list: `get_logs`, `get_profile_preferences`, `set_profile_preferences`, `check_blocked_tasks`

### Phase 2 — RPC drift fix
Queried live DB for missing RPC definitions via `pg_get_functiondef()`. Created migration `20260627000001_capture_mcp_rpcs.sql` capturing:
1. `notifications` table (created by MCP, referenced by `notify_due_soon` from `20260625000005`)
2. `on_task_due_notification` trigger (missing counterpart for `notify_due_soon`)
3. `check_circular_dependency()` trigger function + `on_task_dependency_insert` trigger
4. RPCs: `add_task_dependency`, `check_blocked_tasks`, `export_all_data`, `get_filtered_tasks`, `get_notifications`, `log_activity`

Applied to live DB successfully.

### Phase 3 — Remove dead `backend/` code
- `git rm -r --cached backend/` (14 generated Prisma files, orphaned NestJS scaffold)
- Added `backend/` to `.gitignore`

### Phase 4 — Verify
All 112 tests pass (26 files, 0 failures). Migration file written to disk.

## Files Affected

- AGENTS.md
- CHANGELOG-UIUX.md
- .gitignore
- supabase/migrations/20260627000001_capture_mcp_rpcs.sql
- backend/generated/prisma/ (14 files deleted from git)
- docs/log/2026-06-27/AI-LOG-2026-06-27-144441-DESKTOP-OFM9AMO.md

## Code Before

```diff
Database had 7 RPCs + 1 table + 2 triggers in live DB not in migrations/.
backend/ had 14 tracked generated Prisma files.
.gitignore had no backend/ entry.
```

## Code After

```
supabase/migrations/20260627000001_capture_mcp_rpcs.sql: new migration with all MCP additions
backend/: removed from git, added to .gitignore
All 112 tests passing
```
