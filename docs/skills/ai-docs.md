# ai-docs

Generates, updates, and audits Markdown documentation in `/docs/`. Also handles AI interaction logs via the `--log` sub-module.

> **Trigger:** `@ai-docs`

## Quick Start
1. Run `@ai-docs` to generate skill documentation
2. Use `@ai-docs --log` to log an AI interaction
3. Use `@ai-docs audit` to check doc quality

**Example:** `@ai-docs` → rebuilds skill index and pages

## Description

Generates skill documentation pages from `.agents/skills/`, updates them incrementally, audits compliance with documentation standards, and logs AI interactions.

## Usage

| Command | Action |
|---|---|
| `@ai-docs` | Generate skill index + all skill pages |
| `@ai-docs pro <dir>` | Deep-dive architectural doc |
| `@ai-docs update <name>` | Incremental update of one skill page |
| `@ai-docs audit` | Compliance check |
| `@ai-docs --log` | Log AI interaction |
| `@ai-docs --log --compact` | Compact log files into date dirs |

---

**[⬆ Back to Top](#)** | **[📂 Skill Index](/docs/README.md)**
---

**[? Back to Top](#) | [?? Skill Index](../README.md)**

