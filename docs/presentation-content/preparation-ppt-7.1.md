# Preparation: PivotPoint Presentation v7.1

> **Goal**: Professional 12-slide deck for a 3-person, 10-minute project presentation.
> **All 9 required topics** must be covered efficiently. Every second counts.

---

## Time Budget

| Segment | Slides | Time | Speaker |
|---|---|---|---|
| Opening | 1–2 | 1:00 | Anyone |
| Problem & Business Process | 3–4 | 1:30 | Anyone |
| Core Features | 5–6 | 1:45 | Anyone |
| Tech Stack, Architecture & Technical Highlights | 7–8 | 1:30 | Anyone |
| Challenges, Contributions & Lessons | 9–11 | 2:00 | 3 members, ~40s each |
| Live Demo | 12 | 2:00 | Anyone |
| Thank You | 13 | 0:15 | Anyone |
| **Total** | **13** | **~10:00** | |

---

## Slide-by-Slide Blueprint

### Slide 1 — Title
- **Title**: PivotPoint: Real-time Collaborative Dashboard
- **Subtitle**: React 19 · Supabase · Vite 8
- **Team**: @goanarbolkong · @MemerZxZ · @Echeq
- **Style**: Full-bleed gradient background (indigo → navy), white text, minimal

### Slide 2 — Agenda (compact, 1-line-per-item)
- Project Overview · Business Process · Core Features · Tech Stack & Architecture
- Technical Highlights · Challenges & Solutions · Individual Contributions
- Lessons Learned · Live Demo
- *(9 items, single column, 2 rows, small icons)*

### Slide 3 — Project Overview
- **Left**: Problem (3 bullets: tool fragmentation, no real-time, complex & expensive)
- **Right**: Solution (3 bullets: drag-and-drop Kanban, millisecond sync, zero server ops)
- **Bottom bar**: "PivotPoint — lightweight, real-time, fully customizable"

### Slide 4 — Core Business Process
- **Visual** flowchart (use `diagram-business-flow.svg`):
  Environment Check → Auth → Role Gate (Unknown/Member/Admin) → Dashboard → Board
- **Note**: 5-step journey, mention first-user-becomes-admin rule

### Slide 5 — Core Features: Task Management
- Table (3 col): Feature | What | Why
  - CRUD + Drag-drop | @dnd-kit, cross-column | Intuitive workflow
  - Priority + Due Dates | P0–P3, smart views (mine/due/overdue) | Focus on what matters
  - Assign + Dependencies | Blockers prevent "Done" | Clear accountability
  - Labels | Custom per project | Flexible categorization

### Slide 6 — Core Features: Collaboration & Views
- **Left block** — Real-time: Realtime broadcast, Presence, Editing mutex, Notifications
- **Right block** — Views & Export: Kanban · Gantt · 3D Sphere · Dashboard · List | XLSX · PDF · CSV | 5 languages + RTL
- *(Compact 2-column layout)*

### Slide 7 — Architecture & Tech Stack
- **Layer diagram** (use `diagram-architecture.svg`):
  React 19 + Vite 8 + Tailwind 4 + @dnd-kit → supabase-js → Supabase (Auth · PostgREST · Realtime · Storage) → PostgreSQL
- **Bottom callout**: "No custom server — JAMstack + Serverless"

### Slide 8 — Technical Highlights
- **Algorithm**: `positionBetween()` — float8 midpoint reorder, max+1024 insert, no re-indexing
- **DB**: 29 SQL migrations, Row-Level Security, column-level grants
- **Real-time**: Supabase Realtime + Presence, re-fetch on INSERT/UPDATE
- **Testing**: Vitest 4, ~30 test files, CI via GitHub Actions

### Slide 9 — Challenges & Solutions
| Challenge | Solution |
|---|---|
| @dnd-kit majors incompatible | Careful import paths, no version upgrade |
| MCP migrations drift | Manual `supabase db pull` after remote changes |
| Priority column out-of-band | Reconciliation migration `20260630120000` |
| Real-time payloads lack joins | Re-fetch single row on every change |
| RLS evolution (6 iterations) | Trigger `enforce_member_task_edit` for drag-only |
| Rolldown strict JSX indentation | Consistent formatting enforced in code review |

### Slide 10 — Individual Contributions
| Member | Role | Key Deliverables |
|---|---|---|
| **@goanarbolkong** (孔刚) | Frontend Lead | DnD, Gantt, 3D Sphere, ExportMenu, LabelManager, ListView |
| **@MemerZxZ** (周奕龙) | Backend Lead | Migrations (29), RPCs, RLS, task_dependencies, notifications |
| **@Echeq** (陈昌发) | PM & QA | AGENTS.md, ErrorBoundary, tests (30+), presentation, CI |

### Slide 11 — Lessons Learned
- **Serverless works**: Supabase eliminated all backend ops — 0 servers to maintain
- **Real-time is hard**: Broadcast is easy; merge logic (re-fetch on change) is the real challenge
- **Float8 positioning**: Midpoint algorithm avoids re-indexing entirely — simple and fast
- **Migrations as source of truth**: 29 versioned SQL files give full schema history and reliable rollback

### Slide 12 — Live Demo
- **6 quick actions** (numbered, large font):
  1. Sign in → 2. Create project + tasks → 3. Drag between columns
  2. Open second browser → show real-time sync → 5. Switch to Gantt / 3D view
  3. Export to PDF
- **Callout**: "Demo time: ~2 minutes — watch the flow"

### Slide 13 — Thank You
- **Large**: THANK YOU
- **Subtitle**: Questions?
- **GitHub**: https://github.com/Echeq/MiniSemesterProject
- Same gradient background as Slide 1

---

## Design Rules

| Element | Rule |
|---|---|
| Font | Sans-serif (Calibri or system) |
| Headings | 28–32pt, bold, white (on dark bg) |
| Body | 14–18pt, light gray or white |
| Accent color | `#6366f1` (Indigo) for highlights, borders, icons |
| Background | Dark gradient (navy `#0f1117` → indigo `#1e1b4b`) for key slides; light `#f8fafc` for content-heavy slides |
| Diagrams | Embed SVGs from `docs/presentation-content/` where referenced |
| Max text | 30 words per bullet, 5 bullets per slide |

---

## Speaker Allocation

| Member | Slides | Est. Time |
|---|---|---|
| @goanarbolkong (孔刚) | Slides 5–6 (Features) | ~1:45 |
| @MemerZxZ (周奕龙) | Slides 7–9 (Architecture, Tech, Challenges) | ~2:15 |
| @Echeq (陈昌发) | Slides 1–4, 10–13 (Opening, Overview, Contributions, Lessons, Demo) | ~5:30 |

> **Note**: Adjust allocation as needed — the numbers above are rough guidelines. The group should rehearse transitions between speakers.

---

## Files Referenced

| File | Usage |
|---|---|
| `diagram-architecture.svg` | Slide 7 |
| `diagram-business-flow.svg` | Slide 4 |
| `diagram-data-flow.svg` | Slide 6 reference |
| `diagram-rbac.svg` | Slide 4 reference |
| `diagram-er.svg` | Slide 8 reference |
