# Preparation: PivotPoint Presentation v7.2

> **Goal**: Professional 14-slide bilingual (Chinese + English) deck for 3-person, 10-minute presentation.
> All 9 required topics covered. Bilingual text throughout (Chinese primary, English secondary).

---

## Time Budget

| Segment | Slides | Time |
|---|---|---|
| Opening | 1–2 | 1:00 |
| Project Overview | 3 | 0:45 |
| Business Process | 4 | 0:45 |
| Core Features (3 slides) | 5–7 | 2:30 |
| Architecture | 8 | 1:00 |
| Challenges & Technical Highlights | 9–10 | 1:30 |
| Individual Contributions | 11 | 0:45 |
| Lessons Learned | 12 | 0:45 |
| Live Demo | 13 | 1:30 |
| Thank You | 14 | 0:15 |
| **Total** | **14** | **~10:30** |

---

## Changes from v7.1

| # | Change | Priority |
|---|---|---|
| 1 | **Bilingual** — every text has Chinese (primary) + English (secondary) | HIGH |
| 2 | Title: added "Group 5 – Software Engineering Training" | HIGH |
| 3 | GitHub link moved from title to final slide only | HIGH |
| 4 | Slide 4: embedded Mermaid flowchart diagram (mmdc PNG) | HIGH |
| 5 | Slides 5-7: screenshot placeholders (red border, "IMAGEN DE X") | HIGH |
| 6 | Challenges & Solutions: added Problem→Solution columns | HIGH |
| 7 | Technical Highlights moved after Challenges (new order) | HIGH |
| 8 | Split Features into 3 slides (Task / Real-time / Views) | MEDIUM |
| 9 | Slide 3: added target users ("small teams needing Jira alternative") | MEDIUM |
| 10 | Architecture: embedded Mermaid diagram PNG | MEDIUM |
| 11 | Individual Contributions: photo placeholder per member | MEDIUM |
| 12 | Lessons Learned: added teamwork/collaboration lesson | MEDIUM |
| 13 | Slide numbers on every slide | LOW |
| 14 | Views: emoji icons next to each view | LOW |
| 15 | Live Demo: timing badges per step (~2 min total) | LOW |
| 16 | Final slide: "Thank You" in 5 languages | LOW |
| 17 | Agenda renamed from "Table of Contents" to "Agenda" | LOW |

---

## Slide-by-Slide Summary

| Slide | Title (CN) | Title (EN) | Key Content |
|---|---|---|---|
| 1 | PivotPoint 实时协同看板 | Real-time Collaborative Dashboard | Group 5, team, tech stack |
| 2 | 会议议程 | Agenda | 11 items in 4×3 grid |
| 3 | 项目概览 | Project Overview | Problem vs Solution, target users |
| 4 | 核心业务流程 | Core Business Process | Mermaid flowchart + role rules |
| 5 | 核心功能：任务管理 | Task Management | Table + screenshot placeholder |
| 6 | 核心功能：实时协作 | Real-time Collaboration | Mermaid sequence diagram + features |
| 7 | 核心功能：视图与导出 | Views & Export | 5 view cards + export/i18n/theme |
| 8 | 架构与技术栈 | Architecture & Tech Stack | Mermaid diagram + tech table |
| 9 | 挑战与解决方案 | Challenges & Solutions | 6 problem→solution table rows |
| 10 | 技术亮点 | Technical Highlights | 4 cards: Algorithm/DB/Realtime/Testing |
| 11 | 个人贡献 | Individual Contributions | 3 member cards + photo placeholder |
| 12 | 经验与收获 | Lessons Learned | 6 numbered lessons (2×3 grid) |
| 13 | 现场演示 | Live Demo | 6 steps with timing + screenshot spots |
| 14 | 谢谢 | Thank You | 5-language thanks, Q&A, GitHub |

---

## Design Spec

| Element | Value |
|---|---|
| Theme | Dark (navy `#161B22`), indigo accent `#6366F1` |
| Font | Calibri throughout |
| Chinese text | Primary, 14-16pt, white bold |
| English text | Secondary, 9-11pt, muted gray |
| Screenshot placeholders | Red dashed border, "IMAGEN DE X" centered |
| Diagrams | Mermaid PNG with dark background |
| Slide numbers | Bottom-right, subtle gray |

---

## Speaker Allocation

| Member | Slides | Est. Time |
|---|---|---|
| @goanarbolkong | 5–7 (Features) | ~2:30 |
| @MemerZxZ | 8–10 (Architecture, Challenges, Tech) | ~2:30 |
| @Echeq | 1–4, 11–14 (Opening, Overview, Contributions, Lessons, Demo) | ~5:30 |

---

## Files

| File | Path |
|---|---|
| PPT | `docs/presentation-content/PivotPoint-v7.2.pptx` |
| Preparation | `docs/presentation-content/preparation-ppt-7.2.md` |
| Business Flow Diagram | `temp/business_flow.png` (Mermaid) |
| Architecture Diagram | `temp/architecture.png` (Mermaid) |
| Realtime Sequence | `temp/realtime_flow.png` (Mermaid) |

---

## Screenshots Needed

| Slide | Placeholder Label | Description |
|---|---|---|
| 5 | TASK MANAGEMENT UI | Show Kanban board with tasks in 3 columns |
| 6 | REAL-TIME COLLABORATION | Two browser windows side by side |
| 7 | VIEWS INTERFACE | Gantt chart or 3D sphere view |
| 13 step 1 | DEMO STEP 1 | Auth form |
| 13 step 2 | DEMO STEP 2 | Create project / task modal |
| 13 step 3 | DEMO STEP 3 | Drag-and-drop in action |

## Photos Needed

| Slide | Member | Placement |
|---|---|---|
| 11 | @goanarbolkong | Below name, above deliverables |
| 11 | @MemerZxZ | Below name, above deliverables |
| 11 | @Echeq | Below name, above deliverables |
