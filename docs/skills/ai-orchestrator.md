# ai-orchestrator

Intelligent task router with 4-tier auto-pipeline. Routes work through Flash (cheap) and Deep Reasoner (powerful) subagents based on complexity.

> **Trigger:** `@ai-orchestrator`

## Quick Start
1. Run `@ai-orchestrator <task>` to auto-classify and route
2. Use `--quick`, `--deep`, or `--thorough` flags to override
3. Review plan, results, and confidence score

**Example:** `@ai-orchestrator --quick Fix typo in README` → SIMPLE tier, one subagent

## Description

Supports auto-classification, manual flags, adaptive planning, memory system, hybrid confidence scoring, time estimation, token-aware degradation, and history-based suggestion mode.

## Usage

| Command | Action |
|---|---|
| `@ai-orchestrator <task>` | Auto-classify and execute |
| `@ai-orchestrator --quick <task>` | Force SIMPLE tier |
| `@ai-orchestrator --deep <task>` | Force COMPLEX tier |
| `@ai-orchestrator --thorough <task>` | Force VERY COMPLEX tier |
| `@ai-orchestrator --suggestion` | Suggestion mode from history |

---

**[⬆ Back to Top](#)** | **[📂 Skill Index](/docs/README.md)**
