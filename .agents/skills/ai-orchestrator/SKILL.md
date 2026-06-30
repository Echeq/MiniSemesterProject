---
name: ai-orchestrator
description: >-
  Intelligent task router with 4-tier auto-pipeline. Routes through Flash
  (cheap) and Deep Reasoner (powerful) subagents. Mandatory plan files.
triggers:
  - "@ai-orchestrator"
  - "@ai-orchestrator --auto"
  - "@ai-orchestrator --quick"
  - "@ai-orchestrator --deep"
  - "@ai-orchestrator --thorough"
---

# AI Orchestrator

## Subagents

| Name | Model | Can edit? | Use |
|---|---|---|---|
| `orchestrator-scout` | DeepSeek Flash | No | Explore, audit, grep, review, simple tasks |
| `orchestrator-deep` | DeepSeek Reasoner | Yes | Complex bugs, refactors, architecture |

Defined in `opencode.jsonc`. If missing, work directly and suggest fixing config.

## Routing — 4-tier auto-classification

Read request → match keywords → pick tier → `task({ subagent_type: "..." })` passing context.

| Tier | Pipeline | Keywords |
|---|---|---|
| SIMPLE | Scout → done | rename, typo, search, grep, list, count, trivial, one-line |
| MEDIUM | Scout implements → Deep reviews | feature, add, create, endpoint, validate, moderate |
| COMPLEX | Scout explores → Deep implements | debug, refactor, optimize, performance, race, cross-module |
| VERY COMPLEX | Scout explores → Deep implements → Scout reviews | migrate, redesign, rewrite, auth, security, global |

### Flags

| Flag | Forces |
|---|---|
| `--quick` | SIMPLE. No plan file, no memory update. Execute direct |
| `--deep` | COMPLEX |
| `--thorough` | VERY COMPLEX |

## Plan file — ALWAYS write one (unless `--quick` flag present)

**Every single `@ai-orchestrator` invocation must write a PLAN file first.**
This is not optional. The only exception is when the user includes the
literal `--quick` flag. "I forgot", "it was just an idea", "it was a quick
question" are not valid reasons to skip it.

Why: The plan is the agent's external memory. Without it, context resets
between turns and the agent repeats work or loses track.

### Steps

1. Auto-create `.agents/plan/` and `.agents/memory/` if missing
2. Write `.agents/plan/PLAN_{YYYYMMDD}_{HHmmss}.md` with:
   ```markdown
   ## Objective
   <one line>

   ## Files
   - <path> — <why>

   ## Steps
   1. ...
   2. ...
   ```
3. Confirm to user: "Plan: `.agents/plan/PLAN_...md`"
4. Execute via `task()` — pass plan path to subagent as context
5. After execution, append a line to `.agents/memory/index.md`:
   ```markdown
   - {YYYY-MM-DD HH:mm} — <brief> (plan: PLAN_...md)
   ```

Keep last 5 entries in index.md. Remove oldest if >5.

## Workflow

### Direct (`@ai-orchestrator <task>` or with flag)
1. Classify (or use flag)
2. If not `--quick`: write plan file
3. Execute pipeline via `task()` calls
4. Present result (1-3 lines)
5. If not `--quick`: update index.md

### Interactive (`@ai-orchestrator` alone)
Ask what task → classify → same steps as Direct.

### Auto (`@ai-orchestrator --auto <task>`)
Same as Direct, no confirmations.

## Error handling

- Missing subagent → work directly, suggest fixing `opencode.jsonc`
- Directory write fails → create `.agents/plan/` or `.agents/memory/` and retry

Base directory: D:\myAI-Skills\.agents\skills\ai-orchestrator
