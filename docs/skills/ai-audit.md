# ai-audit

Lightweight interactive code quality auditor. Scans files for security, performance, maintainability, best practices, and documentation issues with regression tracking and confidence scoring.

> **Trigger:** `@ai-audit`

## Quick Start
1. Run `@ai-audit` on current changes
2. Review scan results by category
3. Apply `--fix` for auto-correctable issues

**Example:** `@ai-audit --full` → full project scan

## Description

Scans source files for common issues across security, performance, maintainability, and best practices. Tracks regressions between runs with confidence scoring.

## Usage

| Command | Action |
|---|---|
| `@ai-audit` | Scan current changes |
| `@ai-audit --full` | Full project scan |
| `@ai-audit --fix` | Auto-correct fixable issues |
| `@ai-audit --list` | List all checks |
| `@ai-audit --diff` | Show regression diff |

---

**[⬆ Back to Top](#)** | **[📂 Skill Index](/docs/README.md)**
