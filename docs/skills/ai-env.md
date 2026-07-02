# ai-env

Environment configuration manager. Scans code for env vars, generates .env.example, updates .gitignore, validates .env files, and detects hardcoded secrets.

> **Trigger:** `@ai-env`

## Quick Start
1. Run `@ai-env --scan` to find missing env vars
2. Run `@ai-env --init` to generate `.env.example`
3. Run `@ai-env --validate` to check current `.env`

**Example:** `@ai-env` → full environment audit

## Description

Scans source code for environment variable usage, maintains `.env.example` in sync with actual usage, validates `.env` files, and detects hardcoded secrets.

## Usage

| Command | Action |
|---|---|
| `@ai-env` | Full environment audit |
| `@ai-env --scan` | Scan for missing env vars |
| `@ai-env --init` | Generate `.env.example` |
| `@ai-env --validate` | Validate `.env` files |
| `@ai-env --audit` | Full audit report |

---

**[⬆ Back to Top](#)** | **[📂 Skill Index](/docs/README.md)**
---

**[? Back to Top](#) | [?? Skill Index](../README.md)**

