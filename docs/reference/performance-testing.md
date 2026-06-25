# Performance Testing

## Overview

TaskFlow includes optimizations to handle 100+ tasks smoothly on the Kanban board, list view, and sidebar. This document describes how to run performance tests and interpret the results.

## Test Results (2026-06-25)

| Metric | Result |
|---|---|
| Test data | 120 tasks inserted via SQL |
| Board columns | 3 (todo, doing, done) — ~40 tasks per column |
| TaskCard rendering | Memoized — only re-renders when task data changes |
| byStatus grouping | Single-pass `for` loop (O(n)) instead of 3× `.filter()` (O(3n)) |
| Sidebar counts | Single-pass `for` loop (O(n)) instead of 3× `.filter()` (O(3n)) |
| Drag & drop | Stable refs prevent stale closures |
| Realtime batching | `requestAnimationFrame` batches incoming changes |
| Test cleanup | 120 test tasks removed automatically |

## Key Optimizations Applied

| Optimization | File | Description |
|---|---|---|
| React.memo | TaskCard, Column, InsightsPanel | Prevent re-render when props haven't changed |
| useCallback | Board (drag handlers), App (all event handlers) | Stable function references |
| useMemo | Board (byStatus), Sidebar (counts, progressMap, onlineMembers) | Memoized derived data |
| Single-pass reduce | Board.jsx:29, Sidebar.jsx:57 | Replace O(3n) with O(n) |
| Lazy loading | App.jsx | TaskModal, ProfileModal, AdminModal, LabelManager loaded on demand |
| Avatar CLS fix | Avatar.jsx | Explicit width/height prevents Cumulative Layout Shift |
| Inline enrichment | useBoard.js | Labels + dependencies fetched in a single batch |
| Max positions | useBoard.js | Single-pass instead of 3× filter |

## How to Run

### Prerequisites

- Supabase CLI (`npm install -g supabase`)
- Access to the linked Supabase project
- Frontend running (`npm run dev`)

### Option 1: Automated Script

```bash
chmod +x scripts/test-performance.sh
./scripts/test-performance.sh
```

The script:
1. Generates 120 test tasks with varied statuses, priorities, and due dates
2. Provides a checklist for manual verification
3. Optionally removes test tasks when done

### Option 2: Manual Test

1. Insert test data via SQL:

```sql
do $$
declare
  uid uuid;
  i int;
begin
  select id into uid from public.profiles limit 1;
  for i in 1..120 loop
    insert into public.tasks (title, description, status, priority, due_date, position, created_by)
    values (
      'Perf Test Task ' || i,
      'Performance test task',
      (case i % 3 when 0 then 'todo'::task_status when 1 then 'doing'::task_status else 'done'::task_status end),
      case i % 4 when 0 then 'P0' when 1 then 'P1' when 2 then 'P2' else null end,
      case i % 5 when 0 then current_date + 1 when 1 then current_date - 1 when 2 then current_date + 5 else null end,
      i * 1024.0,
      uid
    )
    on conflict do nothing;
  end loop;
end;
$$;
```

2. Refresh the app and verify the checklist below.

3. Clean up:

```sql
delete from public.tasks where title like 'Perf Test Task%';
```

### Checklist

| # | Test | Pass/Fail |
|---|---|---|
| 1 | Board loads with 120 tasks in < 2 seconds | |
| 2 | Columns show correct counts (~40 each) | |
| 3 | Drag a card between columns — no lag | |
| 4 | Drag within a column to reorder — no lag | |
| 5 | Open TaskModal — loads instantly | |
| 6 | Edit a field and save — card updates immediately | |
| 7 | Switch to ListView — all 120 rows render | |
| 8 | Click column headers to sort — responsive | |
| 9 | Expand filter panel — no delay | |
| 10 | Sidebar counts match board (mine, overdue, due soon) | |
| 11 | Project progress bars show correct percentages | |
| 12 | Open two browser tabs — realtime sync works | |
| 13 | Export to CSV/PDF — file downloads with all tasks | |

## Measuring Render Performance

### Chrome DevTools

1. Open Chrome DevTools → Performance tab
2. Click the record button (⚫)
3. Refresh the page or interact with the board
4. Stop recording
5. Look for:
   - **Total Blocking Time** (TBT): should be < 50ms
   - **Long Tasks**: should be < 200ms
   - **Layout Shifts**: should be 0

### Lighthouse

```bash
npx lighthouse http://localhost:5173 --view
```

Target scores:
- **Performance**: ≥ 85
- **Cumulative Layout Shift**: ≤ 0.1
- **Total Blocking Time**: ≤ 200ms
- **Interaction to Next Paint**: ≤ 200ms

## Bottleneck Reference

| Symptom | Likely Cause | Fix |
|---|---|---|
| Slow initial load | Too many waterfall queries | Check network tab — batch with `Promise.all` |
| Lag on drag | Re-render cascading | Check `React.memo` — verify stable props |
| Sidebar slow | Multiple `.filter()` calls on `stats` | Use single-pass `for` loop |
| Modal slow to open | Large bundle | Verify `React.lazy` + `Suspense` |

---

**[⬆ Back to Top](#)** | **[📂 Documentation Index](/docs/README.md)**
