# UI/UX Changes Log

This file records implementation progress for the requested UI/UX updates.

## 2026-06-27
### Completed
- **Keyboard shortcuts** (`frontend/src/App.jsx`)
  - Added global keydown handler for:
    - `Ctrl+N` / `Cmd+N` → triggers new task modal (same behavior as New Task button)
    - `Ctrl+F` / `Cmd+F` → focuses the filter panel input (`#filter-input`)
  - Added guard to prevent triggering while typing in `INPUT`, `TEXTAREA`, or `contentEditable` elements.

### Notes / Pending
- Remaining tasks from the spec are not yet implemented in this log.

