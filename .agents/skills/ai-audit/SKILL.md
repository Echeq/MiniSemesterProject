---
name: ai-audit
description: Lightweight interactive code quality auditor. Scans files for security, performance, maintainability, best practices, and documentation issues with regression tracking and confidence scoring.
allowed-tools: Read, Glob, Grep, Bash, Write
triggers:
  - "@ai-audit"
  - "@ai-audit --full"
  - "@ai-audit --fix"
  - "@ai-audit --list"
  - "@ai-audit --diff"
---

# ROLE: Code Auditor

Read files, detect patterns, score quality. Output to `/docs/ai-audit/AUDIT_REPORT_{DATE}.md`. ALWAYS ask before scanning.

## Quick Start

| Mode | Trigger | What happens |
|---|---|---|
| Interactive | `@ai-audit` | 6-step interview: scope → depth → categories → scan → findings → report |
| Full | `@ai-audit --full` | Deep scan all categories, no questions, with regression check |
| Fix | `@ai-audit --fix` | Auto-fix High + Critical findings from last report |
| Diff | `@ai-audit --diff` | Compare last 2 reports, show what changed (new/fixed/regressed) |
| List | `@ai-audit --list` | Show past audits with date, score, grade |

## Categories & Scoring

| Category | Weight | Checks | Severity levels |
|---|---|---|---|
| Security | 35% | Secrets, injections, weak auth, outdated deps, exposed config | 🔴 Critical 10 / 🟠 High 5 / 🟡 Medium 2 / 🔵 Low 1 |
| Performance | 20% | N+1 queries, sync I/O in async, missing cache, large loops | Same scale |
| Maintainability | 20% | Cyclo complexity >10, duplication, file >500 lines, func >50 | Same scale |
| Best Practices | 15% | Missing types, side effects, god objects, naming | Same scale |
| Documentation | 10% | Missing docs, stale README, no inline comments | Same scale |

Score = Security×.35 + Perf×.20 + Maint×.20 + BestP×.15 + Docs×.10. Grade: A ≥ 90, B ≥ 70, C ≥ 50, D < 50.

## Regression Tracking

After each audit, saves last score + finding count to `.agents/memory/ai-audit/last-audit.json`. On next audit:
- **Improved**: "Up from 72 B to 85 B 🟢 — 2 Critical issues fixed"
- **Regressed**: "Down from 85 B to 72 B 🔴 — 3 new Critical issues"
- **First audit**: "Baseline established"

## Modes

### INTERACTIVE (`@ai-audit`)
1. **Scope** — "Whole repo or a specific directory?"
2. **Depth** — "Quick (grep patterns) or deep (read every file)?"
3. **Categories** — "All, Security only, Security+Perf, or Custom"
4. **Language** — Auto-detect (.ts, .js, .py, .md). Confirm.
5. **Scan** — Progress: "Scanning X files..." Run regression check.
6. **Findings** — Group by severity → report → `/docs/ai-audit/`.

### FULL (`@ai-audit --full`)
All categories, deep scan (read every file), no questions. Includes regression check. Uses defaults.

### FIX (`@ai-audit --fix`)
Read latest report. Auto-fix 🔴 Critical + 🟠 High findings. Respects `<!-- MANUAL -->`. Skip findings you're unsure about.

### DIFF (`@ai-audit --diff`)
Read last 2 reports. Show: new issues, fixed issues, score change. Table format:

| Metric | Last | Current | Δ |
|---|---|---|---|
| Score | 72 B | 85 B | +13 🟢 |
| Critical | 3 | 1 | -2 🟢 |

### LIST (`@ai-audit --list`)
Read `/docs/ai-audit/AUDIT_REPORT_*.md` files, display table of date + score + grade.

## Notes

- Quick mode uses grep patterns. Deep mode reads every file.
- Language adaptation: TS/JS → `eval`, `process.env`, `innerHTML`; Python → `exec`, `pickle`, `shell=True`; Markdown → broken links, stale refs.
- No scan? → "No files found." Permissions issue? → skip file, note. Binary? → skip. Cancelled? → save partial.

> [!IMPORTANT]
> Findings have confidence levels based on detection method: pattern match (70%), file read confirmed (85%), cross-referenced (95%). Low-confidence findings are labeled `[unverified]`.
