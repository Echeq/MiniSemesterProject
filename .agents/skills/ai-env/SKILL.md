---
name: ai-env
description: Environment configuration manager. Scans code for env vars, generates .env.example, updates .gitignore, validates .env files, and detects hardcoded secrets.
allowed-tools: Read, Write, Bash, Glob, Grep
triggers:
  - "@ai-env"
  - "@ai-env --scan"
  - "@ai-env --init"
  - "@ai-env --validate"
  - "@ai-env --audit"
---

# ai-env

Environment configuration manager. Scans code for env vars, generates .env.example, updates .gitignore, validates .env files, and detects hardcoded secrets.

> **Trigger:** `@ai-env` | `@ai-env --scan` | `@ai-env --init` | `@ai-env --validate` | `@ai-env --audit`

## Quick Start

1. Type `@ai-env` to scan your project for environment variables.
2. The skill finds all `process.env.X`, `os.getenv()`, and `.env` references in your code.
3. Choose to init: `.env.example` + `.gitignore` update + `docs/ENVIRONMENT.md` generated in one step.
4. Later, run `@ai-env --validate` to check that your `.env` matches the example.

**Example:** `@ai-env` → scans 12 files → finds 8 env vars → `--init` → creates `.env.example`, adds `.env` to `.gitignore`, generates `docs/ENVIRONMENT.md`.

## Description

Manages the full lifecycle of environment configuration. Scans code for env var usage (Node `process.env`, Python `os.getenv`, Go `os.Getenv`, etc.), generates `.env.example` with grouped and documented vars, updates `.gitignore` to exclude `.env` files, creates `docs/ENVIRONMENT.md` reference, and audits for hardcoded secrets.

## Usage

| Command | Action |
| :--- | :--- |
| `@ai-env` | Interactive: scan, review vars, optionally init |
| `@ai-env --scan` | List all env vars found with file locations |
| `@ai-env --init` | Generate `.env.example` + update `.gitignore` + create `docs/ENVIRONMENT.md` |
| `@ai-env --validate` | Compare `.env` against `.env.example` for missing/extra/stale vars |
| `@ai-env --audit` | Deep scan: committed `.env` files, hardcoded secrets, git history leaks |

## Configuration

| File | Purpose | Git |
| :--- | :--- | :--- |
| `.env.example` | Documented template of all required vars | Commit |
| `.gitignore` | Updated to exclude `.env`, `.env.local`, `.env.*.local` | Already tracked |
| `docs/ENVIRONMENT.md` | Human-readable reference for setup | Commit |
| `.env` | Actual values (never read by the skill) | Never commit |

> [!WARNING]
> The skill never reads or outputs actual `.env` values. Scan only detects variable NAMES. Audit checks for the PRESENCE of committed env files, not their contents.
>
> Hardcoded secrets found in code are flagged with file:line but values are masked in the report.

> [!TIP]
> Run `@ai-env --init` on any new project before writing code — it catches missing vars early.
> Pair with `@ai-orchestrator --quick` for fast setup with no interactive questions.

---

**[⬆ Back to Top](#)** | **[📂 Skill Index](/docs/README.md)**
