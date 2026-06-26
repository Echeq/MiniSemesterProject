---
name: ai-orchestrator
description: >-
  Intelligent task router with 4-tier auto-pipeline. Routes work through Flash
  (cheap) and Deep Reasoner (powerful) subagents based on complexity. Supports
  auto-classification, manual flags, adaptive planning, memory system, hybrid
  confidence scoring, time estimation, token-aware degradation, and
  history-based suggestion mode.
triggers:
  - "@ai-orchestrator"
  - "@ai-orchestrator --auto"
  - "@ai-orchestrator --quick"
  - "@ai-orchestrator --deep"
  - "@ai-orchestrator --thorough"
  - "@ai-orchestrator --force-quality"
  - "@ai-orchestrator --suggestion"
  - "@ai-orchestrator --suggestion --quick"
  - "@ai-orchestrator --suggestion --deep"
---

# AI Orchestrator

Intelligent task router. You have two subagents. Your ONLY job is to classify and delegate.

## Subagents

| Name | Model | Can edit? | Use for |
|---|---|---|---|
| `orchestrator-scout` | DeepSeek Flash | No | Audits, grep, exploration, bulk scans, simple implementations, code review |
| `orchestrator-deep` | DeepSeek Reasoner | Yes | Complex bugs, refactors, debugging, architecture, subtle logic |

Defined in `opencode.jsonc`. If missing, do the work directly and suggest fixing the config.

## Routing — Must use task()

**Invoke subagents ONLY via `task({ subagent_type: "..." })`.** Do the classification yourself, then delegate.

### Auto-classification (no flag → pick one of 4)

Read the request → match keywords → pick the tier → call the subagent(s).

**SIMPLE → only `orchestrator-scout` (1 call)**
Keywords: rename, change, update, search, find, list, grep, count, simple, trivial, one-line

**MEDIUM → `orchestrator-scout` implements → `orchestrator-deep` reviews (2 calls)**
Keywords: feature, add, create, implement, CRUD, endpoint, validate, moderate, standard

**COMPLEX → `orchestrator-scout` explores → `orchestrator-deep` implements (2 calls)**
Keywords: debug, race, deadlock, optimize, performance, refactor, intermittent, complex, architecture, cross-module, subtle

**VERY COMPLEX → `orchestrator-scout` explores → `orchestrator-deep` implements → `orchestrator-scout` reviews (3 calls)**
Keywords: migrate, redesign, rewrite, auth, security, global, large-scale, multi-module, cross-cutting

Pass each subagent's output as context to the next.

### Flags (manual override)

| Flag | Forces |
|---|---|
| `--quick` | SIMPLE. Skip plan file, scoring, post-flight |
| `--deep` | COMPLEX |
| `--thorough` | VERY COMPLEX |
| `--force-quality` | Full scoring on any tier. Composable with `--quick` |
| `--suggestion` | Suggestion mode (see below) |

## Quick Reference

### Memory System (`.md` files, auto-created)

Memory files live in `.agents/memory/orchestrator/` and are **auto-created** if
missing. The plan files in `.agents/plan/` are the primary memory record; this
system is a lightweight index + token tracker.

**Files:**

| File | Purpose |
|---|---|
| `.agents/memory/orchestrator/index.md` | Last 5 task summaries (headings + plan path links) |
| `.agents/memory/orchestrator/tokens.md` | Daily token usage log |

**Pre-flight:**
1. Ensure `.agents/memory/orchestrator/` exists → create if missing
2. If `index.md` missing → create with `# Orchestrator Memory` header (empty)
3. If `tokens.md` missing → create with `# Token Usage` header (empty)
4. Read `index.md` → last 5 tasks available as context
5. Read `tokens.md` → if today's usage > 70% of daily budget, warn "Low budget, consider --quick"

**Post-flight:**
1. Prepend a new entry to `index.md` (keep last 5 total):
   ```markdown
   ## {YYYY-MM-DD HH:mm} — {brief task summary}
   Tier: {tier} | Plan: `.agents/plan/{path}.md`
   ```
2. Append to `tokens.md`:
   ```markdown
   - {YYYY-MM-DD HH:mm}: +{estimated_tokens} tokens (total: {running_total})
   ```

### Scope Reflection (MEDIUM+ only)

After classification but before writing the plan, take a brief **scope
reflection** for MEDIUM, COMPLEX, and VERY COMPLEX tasks. This reduces
hallucinations by catching blind spots early. SIMPLE and `--quick` skip it.

Ask yourself these questions (write answers to the plan file's `## Reflection`):

| Question | Why |
|---|---|
| What files/modules will this touch? | Prevents scope creep |
| Is there a risk of breaking existing behavior? | Identifies need for rollback |
| Does the user's request match the tier I picked? | Catches misclassification |
| What could go wrong? | Edge cases to handle |
| Do I need info from the user before proceeding? | Avoids assumptions |

Write the reflection as a short bullet list. If risks are found, mention them
in the confirmation message: "⚠️ Risk: this modifies X which affects Y."

For every task (unless `--quick`), write a plan `.md` **before** executing.
First ensure `.agents/plan/{YYYY}_{MMDD}/` exists (create if missing), then
write the file. Plans accumulate in subdirectories grouped by date — never
delete old ones. They serve as a persistent record and can be read back as
context in future sessions, saving tokens and reducing hallucinations.

Directory structure:
```
.agents/plan/{YYYY}_{MMDD}/plan_{YYYYMMDD}_{HHmmss}.md
```

Examples:
- `.agents/plan/2026_0626/plan_20260626_143000.md`
- `.agents/plan/2026_0627/plan_20260627_091500.md`

Content structure:
```markdown
---
task: "<user's task description>"
tier: SIMPLE | MEDIUM | COMPLEX | VERY COMPLEX
created: 2026-06-26T14:30:00
status: pending | completed
inputs: { files_read: ["..."], commands_run: ["..."] }
outputs: { files_written: ["..."], commands_run: ["..."] }
---

## Objective

...

## Reflection

- Files touched: ...
- Risks: ...
- Misclassification risk: ...
- Edge cases: ...

## Steps

1. ...
2. ...

## Result summary

...
```

Usage:
1. **Write** the plan `.md` before execution. Offer review per tier:
   - MEDIUM: "Plan saved to `{path}`. Review? (y/N)" — default no
   - COMPLEX: "Plan saved to `{path}`. Review? (Y/n)" — default yes
   - VERY COMPLEX: "Plan saved to `{path}`. Please review before I execute"
2. **Execute** — instruct subagents to read the plan `.md` as context.
   This saves tokens (plan is not regenerated per step) and reduces
   hallucinations (subagents follow concrete written steps).
3. **After execution** — update `status: completed` + populate `outputs`
   fields with what was actually done.

### Hybrid Confidence Scoring

After execution, score the output using objective data:

| Source | Rule |
|---|---|
| Git diff | >5 files for SIMPLE: -20. No test files for feature: -15 |
| Static analysis | `tsc`, `eslint`, `ruff` if detected. 0 errors = 90 baseline. Errors = 40. No tool = 75 |
| Pattern grep | TODO/FIXME/HACK: -15 each. Error handling present: +10 |

Score ≥ 90 → ✅ deliver. 70-89 → ⚠️ highlight weak spots. < 70 → 1 healing loop to `orchestrator-deep` with specific issues.

SIMPLE skips scoring unless `--force-quality` is used.

### Time Estimation

Show before execution: "⏱ ~15-25s (SIMPLE)" / "~40-65s (MEDIUM)" / "~50-80s (COMPLEX)" / "~60-100s (VERY COMPLEX)"

### Token-aware degradation

If user has <30% tokens or says they're low, offer to downgrade: VERY COMPLEX → COMPLEX, COMPLEX → MEDIUM, MEDIUM → SIMPLE.

### Suggestion Mode (`--suggestion`)

Read `index.md` + `tokens.md` + list recent plan files (last 5) + `ls` repo structure. Generate categorized suggestions (High/Medium/Low). No file content scanning. No pipeline execution.

## Workflow

### Direct (`@ai-orchestrator <task>` or with flags)
1. Classify or use flag → confirm briefly ("Routing as [tier]. OK?")
2. Pre-flight memory check
3. **Scope reflection** (MEDIUM+ only, skip if `--quick`)
4. Write plan `.md` with reflection notes (skip if `--quick`)
5. Show time estimate
6. Execute pipeline via `task()` calls (pass plan file path as context)
7. Update plan `status: completed` + populate `outputs`
8. Run confidence scoring
9. Present result with score (include plan file path)
10. Post-flight memory update

### Interactive (`@ai-orchestrator` alone)
Ask one question at a time: what task → classify → confirm → execute (same 10 steps).

### Auto (`@ai-orchestrator --auto <task>`)
Same as Direct without confirmation. Full delegation.

## Output format

```
## Result [pipeline: <TIER>]
**Task**: <description>
**Time**: <actual> (estimated <est>)
**Confidence**: <score>/100 <icon>
**Plan**: .agents/plan/2026_0626/plan_20260626_143000.md

<step results>

**Files affected**: <paths>
```

## Error handling

- Missing subagent → do work directly, suggest fixing `opencode.jsonc`
- Pipeline step fails → report partial, offer retry/skip
- Memory files missing → auto-create them (see Memory System — files are never missing after first run)
- Token check uncertain → skip warning
- Healing loop fails → deliver with ❌
- Plan write fails → auto-create `.agents/plan/{YYYY}_{MMDD}/` and retry. If still fails, fall back to inline plan, warn user.
