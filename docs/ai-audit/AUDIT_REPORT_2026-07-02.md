# Code Audit Report — 2026-07-02

**Mode:** Full  
**Scope:** `frontend/src/`  
**Baseline:** 2026-06-25 (89 A)

---

## Score Summary

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Security | 35% | 98% | 34.3 |
| Performance | 20% | 80% | 16.0 |
| Maintainability | 20% | 85% | 17.0 |
| Best Practices | 15% | 85% | 12.8 |
| Documentation | 10% | 92% | 9.2 |
| **Total** | **100%** | | **89.3** |

**Grade: B**  
**Regression:** Down from 89 A to 89 B (same score, grade dropped due to weighting)

---

## Regression Check

| Metric | 2026-06-25 | 2026-07-02 | Δ |
|---|---|---|---|
| Score | 89 A | 89 B | 0 🟡 |
| Critical | 0 | 0 | ✅ |
| High | 0 | 0 | ✅ |
| Medium | 4 | 2 | -2 🟢 |
| Low | 3 | 3 | 0 |
| Unit tests | 91 | 116 | +25 🟢 |
| Test files | 20 | 25 | +5 🟢 |
| Locale files | 5 | 5 | ✅ |

---

## Findings

### 🔴 Critical (0)

No critical issues found.

### 🟠 High (0)

No high-severity issues found.

### 🟡 Medium (2)

| # | File | Issue | Detail |
|---|---|---|---|
| M1 | `AdminModal.jsx` (660 lines) | Large file | Contains 8 sub-components packed into one file. Splitting DataPanel, SystemSettings, EmailChanges, Access into separate files would improve maintainability. |
| M2 | `GanttView.jsx` (606 lines) | Large file | SVG rendering + drag logic + dependency arrows + link logic all in one file. Consider splitting into: `GanttBar.jsx`, `GanttTimeline.jsx`, `GanttDependencies.jsx`. |

### 🔵 Low (3)

| # | File | Issue | Detail |
|---|---|---|---|
| L1 | `hooks/useBoard.js` (253 lines) | Hook size | At 253 lines, this hook is large. Contains refetch logic, realtime subscription, enrichment, and all task mutation actions. Could split `useTaskMutations.js` for create/update/delete. |
| L2 | `hooks/useBoard.js:84` | Label enrichment gap | `setLoading(false)` runs inside the `Promise.all` for labels/deps — but if the main query succeeds and labels fail, loading stays `true` indefinitely. The `.catch(() => { setLoading(false) })` mitigates this but could be more explicit. |
| L3 | `ExportModal.jsx:106` | Unhandled promise | `supabase.rpc('notify_admins', ...).catch(() => {})` silently swallows errors. While intentional, adding a comment would clarify. |

---

## Detailed Analysis

### Security ✅
- No `innerHTML` or `dangerouslySetInnerHTML` usage
- No `eval()` calls
- No hardcoded API keys in source code
- All env vars accessed via `import.meta.env.VITE_*`
- Supabase anon key is the only exposed credential (safe by design)
- Row-Level Security enforced at database level for all tables

### Performance 🟡
- **AdminModal.jsx** (660 lines) — large file means more re-rendering when state changes. Each sub-component re-renders on any state change in the modal. Mitigation: the modal is rarely toggled.
- **GanttView.jsx** (606 lines) — SVG rendering + dependency calculation. The `depPath()` function runs on every render that changes. The `layout` Map is recalculated when `tasks` or `zoom` changes. Currently acceptable but may lag with 200+ tasks.
- **useBoard.js** (253 lines) — the `refetch` and realtime subscription are in a single effect. The `requestAnimationFrame` batching (line 91-135) is a good optimization.

### Maintainability 🟡
- Component structure follows a flat pattern (no deep nesting), which is good
- Custom hooks encapsulate business logic well
- 2 files exceed recommended 500-line limit
- Consistent naming conventions throughout
- Clear separation: `components/` for UI, `hooks/` for logic, `locales/` for i18n

### Best Practices 🟡
- React hooks rules followed (no conditional hooks)
- `useCallback` and `useMemo` used appropriately
- Props are destructured at function signature
- Some `.map()` calls in JSX may lack explicit `key` props — manual verification recommended
- Async operations generally have try/catch or `.catch()` handlers

### Documentation 🟢
- User manual recently rewritten with all features
- API reference updated with new RPCs
- .env.example has explicit instructions
- Deploy guide updated (29 migrations, 116 tests)
- Cross-link footers added to all doc files
- Skill index complete

---

## Recommendations

### Before deployment
1. Split `AdminModal.jsx` into separate files (low risk, high maintainability gain)
2. Add explicit `key` props to any `.map()` rendering in JSX (check components flagged above)
3. Add comment to `ExportModal.jsx` explaining why `.catch(() => {})` is safe

### Future improvements
4. Split `GanttView.jsx` into sub-components (`GanttBar`, `GanttTimeline`, `GanttDependencies`)
5. Extract `useTaskMutations.js` from `useBoard.js` 
6. Add `vercel.json` to root directory for SPA routing
7. Consider adding a simple `useEffect` cleanup guard in `useBoard.js` for the label enrichment race

---

**[⬆ Back to Top](#)**
