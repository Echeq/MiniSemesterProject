---
name: ai-docs
description: >-
  Generates, updates, and audits Markdown documentation in /docs/. Also
  handles AI interaction logs via the `--log` sub-module.
allowed-tools: Read, Write, Bash, Glob, Grep
triggers:
  - "@ai-docs"
  - "@ai-docs pro"
  - "@ai-docs professional"
  - "@ai-docs update"
  - "@ai-docs audit"
  - "@ai-docs --log"
  - "@ai-docs --log --list"
  - "@ai-docs --log --search"
  - "@ai-docs --log --last"
  - "@ai-docs --log --no-prompt"
  - "@ai-docs --log --compact"
---

# ROLE: DocMaster

Create, maintain, and audit Markdown documentation (English) in `/docs/`. Follow the standards below.

## Standards

| Rule | Detail |
|---|---|
| Language | Professional English |
| Location | `/docs/`. Subdirs: `skills/`, `guides/`, `reference/`, `audit/` |
| Skill Index | `/docs/README.md` — table with every skill as clickable link to `skills/<name>.md` |
| Cross-links | Every page ends with `**[⬆ Back to Top](#)** | **[📂 Skill Index](/docs/README.md)**` |
| Headings | H1 per file, H2 major, H3 subsection, H4 sparingly |
| Tables | Header + alignment: `| :--- | :--- |` |
| Code blocks | Always specify language (typescript, json, mermaid, etc.) |
| Admonitions | Use `> [!NOTE]`, `> [!WARNING]`, `> [!TIP]` |
| Wall-text | Break every ~4 lines into lists, tables, or code blocks |

## Quick Start

| Mode | Trigger | What happens |
|---|---|---|---|
| Generate | `@ai-docs` | Rebuilds `/docs/README.md` + all `/docs/skills/<name>.md` from `.agents/skills/` |
| Deep-dive | `@ai-docs pro <dir>` | Architectural doc with ADR, complexity, edge cases for a module |
| Update | `@ai-docs update <name>` | Incremental update of one skill page. Preserves `<!-- MANUAL -->` blocks |
| Audit | `@ai-docs audit` | Compliance check → `/docs/audit/DOCS_AUDIT_REPORT.md` with weighted score |
| Log | `@ai-docs --log` | Log AI interaction (reads `log.md` sub-module from this directory) |

## Sub-modules

This skill loads sub-module files from its own directory by flag:

| Flag | File loaded |
|---|---|
| `--log` | `log.md` |

When a flag is used, read the corresponding `.md` file and execute its
instructions directly. Each file is self-contained with no frontmatter.

## Modes

### STANDARD (`@ai-docs`)
1. Glob `.agents/skills/*/SKILL.md`
2. Extract `name`, `description`, `triggers` from frontmatter
3. Generate `/docs/README.md` (skill index)
4. Generate `/docs/skills/<name>.md` per skill using the template below

### PROFESSIONAL (`@ai-docs pro <dir>`)
1. Read files in the specified directory
2. Generate a deep-dive doc adding these sections after Technical Spec:
   - **ADR**: Why this approach over alternatives
   - **Complexity Analysis**: Time & Space (Big-O)
   - **Dependency Graph**: Imports and external services
   - **Stress / Edge Cases**: Concurrency, failure modes, edge behavior

### UPDATE (`@ai-docs update <name>`)
Incremental — NEVER full regenerate:
1. Compare `.agents/skills/<name>/SKILL.md` vs `/docs/skills/<name>.md`
2. Preserve `<!-- MANUAL -->` and `<!-- CUSTOM -->` sections
3. Sync only outdated/missing parts
4. If skills added/removed, rebuild `/docs/README.md`
5. Append `<!-- Last updated: [DATE] via @ai-docs update -->`
6. Report: "Updated X pages, skipped Y (manual edits), added Z skills"

### AUDIT (`@ai-docs audit`)
Evaluates docs against Standards. Output → `/docs/audit/DOCS_AUDIT_REPORT.md`.

| Severity | Weight | Checks |
|---|---|---|
| 🔴 Critical | 40% | Missing doc page, broken links, non-English, index missing skills |
| 🟡 Warning | 30% | Wrong heading order, missing table alignment, no code lang, paragraphs >5 lines, names not clickable |
| 🔵 Suggestion | 30% | Missing admonitions, missing cross-links |

Score = Critical% + Warning% + Suggestion%. PASS if ≥ 80%.
`--fix` auto-corrects Warnings + Suggestions. Critical issues reported for manual fix.

## Template (`/docs/skills/<name>.md`)

```markdown
# <name>
<description>

> **Trigger:** `@<trigger>`

## Quick Start
1. <what to type>
2. <what happens>
3. <outcome>

**Example:** `<trigger>` → <result>

## Description
<2-3 sentences: what it does, how it works>

## Usage
<command table or list of modes>

## Configuration
<parameters, outputs, notes>

> [!NOTE]
> <notable behavior>

---

**[⬆ Back to Top](#)** | **[📂 Skill Index](/docs/README.md)**
```

Professional mode adds: ADR, Complexity Analysis, Dependency Graph, Stress/Edge Cases after Description.
