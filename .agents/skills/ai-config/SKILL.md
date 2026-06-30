---
name: ai-config
description: >-
  Configuration manager for this repo. Reads and validates opencode.jsonc,
  skill frontmatter across .agents/skills/, and .gitignore consistency.
triggers:
  - "@ai-config"
  - "@ai-config --list"
  - "@ai-config --check"
  - "@ai-config --validate-opencode"
  - "@ai-config --gitignore"
allowed-tools: Read, Write, Bash, Glob, Grep
---

# AI Config

Manages and validates this repo's configuration files. Never edits code —
only config manifests.

## Commands

| Command | Action |
|---|---|
| `@ai-config` | Interactive: choose mode from list below |
| `@ai-config --list` | List all skills with name, description, triggers |
| `@ai-config --check` | Run all consistency checks (triggers, naming, .gitignore) |
| `@ai-config --validate-opencode` | Validate `opencode.jsonc` structure |
| `@ai-config --gitignore` | Check `.gitignore` for recommended entries |

## Validation rules

### Skill frontmatter
- Every skill must have `name` (kebab-case), `description`, `triggers`
- `triggers` must be unique across all skills (no overlap)
- Each trigger must start with `@` and be kebab-case
- `allowed-tools` (optional) must be subset of: Read, Write, Bash, Glob, Grep

### opencode.jsonc
- Each subagent must have `description`, `mode`, `model`, `permission`
- `mode` must be `"subagent"`
- `permission` must include `read: "allow"` and `glob: "allow"` at minimum

### .gitignore
- Check that `.agents/plan/`, `.agents/memory/`, `docs/log/`, `docs/audit/`,
  `docs/ai-audit/`, `docs/auto-report/` are covered

## Output format

```
## ai-config --list

| Skill | Description | Triggers |
|---|---|---|
| ai-docs | Generates docs | @ai-docs, @ai-docs pro... |
| ... | ... | ... |

## ai-config --check

✅ All trigger names are kebab-case with @ prefix
✅ No duplicate triggers across skills
❌ Missing .gitignore entry: .agents/memory/
```

Base directory: D:\myAI-Skills\.agents\skills\ai-config
