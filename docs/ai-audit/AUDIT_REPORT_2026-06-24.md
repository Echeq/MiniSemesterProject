# Performance Audit Report — 2026-06-24

## Focus: Interaction to Next Paint (INP)

### Findings & Fixes

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | 🔴 Critical | `useBoard.js:92-125` | **Realtime handler sin batch**: cada evento Realtime disparaba una consulta SELECT individual + `setTasks`. Eventos de tareas fuera del scope actual también se procesaban. Con múltiples usuarios, esto inundaba el main thread. | **Batch con `requestAnimationFrame`**: los eventos se acumulan y procesan en el próximo frame. Pre-filtrado por `projectId` — tareas fuera del scope actual se descartan sin SELECT. |
| 2 | 🟠 High | `Board.jsx:47-70` | **`handleDragEnd` se recreaba en cada cambio de tareas**: si llegaba un Realtime update durante un drag, `DndContext` recibía un nuevo callback y se re-configuraba. | **`useRef` para tasks/byStatus**: el callback ahora es estable (solo depende de `updateTask`). La referencia a tasks se actualiza vía `useEffect`. |
| 3 | 🟠 High | `Board.jsx:93-94` | **`onDragStart` inline**: creado en cada render, causaba re-render de `DndContext` | Extraído a `useCallback` estable con `tasksRef` |
| 4 | 🟠 High | `Board.jsx:29-32` | **`byStatus` recomputado en cada render**: filtraba todo el array de tareas | **`useMemo`** con dependencia `[tasks]` |
| 5 | 🟠 High | `Column.jsx:27` | **`SortableContext items`**: `tasks.map(t => t.id)` creaba nuevo array en cada render | **`useMemo`** con `[tasks]` |
| 6 | 🟠 Medium | `Column.jsx` | **Sin `React.memo`**: se re-renderizaba aunque sus props no cambiaran | Envuelto en `memo()` |
| 7 | 🟠 Medium | `TaskCard.jsx` | **Sin `React.memo`**: cada card se re-renderizaba cuando cualquier tarea cambiaba | Envuelto en `memo()` |
| 8 | 🟡 Medium | `Sidebar.jsx` | **Cómputos repetidos en cada render**: `projProgress()` filtraba stats O(n*m), `onlineMembers` se ordenaba en cada render | **`useMemo`** para `progressMap` (O(n) precomputado), `onlineMembers`, `active`, `archived`, contadores |
| 9 | 🟡 Medium | `InsightsPanel.jsx` | **Sin memo**: se re-renderizaba en cada cambio de tasks | `memo()` + `useMemo` para arcs SVG |
| 10 | 🟡 Medium | `App.jsx:197` | **`onTaskClick` inline**: nueva referencia en cada render, rompía memoización de Column/TaskCard | **`useCallback`** estable |
| 11 | 🟡 Medium | `App.jsx:199` | **`banner` inline**: nuevo React element en cada render, rompía memoización de Board | **`useMemo`** para `memoBanner` |
| 12 | 🟡 Medium | `Board.jsx:37` | **`visibleStatuses` no-op filter**: `visibleCols.filter(s => visibleCols.includes(s))` siempre devolvía `visibleCols` sin filtrar | Corregido a `STATUSES.filter(s => visibleCols.includes(s))` |

### Pending improvements (not implemented)

| # | Severity | File | Issue |
|---|----------|------|-------|
| 13 | 🟠 High | `useBoard.js:41-67` | `enrichTasksData()` hace 2 queries extra (task_labels + task_dependencies) en cada refetch. Para boards grandes (>50 tareas), añade latencia al render inicial. |
| 14 | 🟡 Medium | `ExportMenu.jsx:86` | `generatePDF()` corre jsPDF síncronamente en el main thread. Para boards grandes, la generación del PDF congela la UI varios ms. |
| 15 | 🔵 Low | `Avatar.jsx:10-13` | `pickGradient()` recalcula hash en cada render. Podría cachearse por nombre. |

### Resumen

Las optimizaciones aplicadas eliminan las causas principales de INP alto:

1. **Realtime ya no inunda el main thread** — batching + pre-filtro por scope
2. **Drag & drop estable** — DndContext ya no se re-configura durante el drag
3. **Render mínimo** — Column, TaskCard, InsightsPanel solo se re-renderizan cuando realmente cambian
4. **Sidebar eficiente** — cómputos O(n*m) reemplazados por Map precomputado O(n)
