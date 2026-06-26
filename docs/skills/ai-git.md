# ai-git

Git/GitHub skill hub. Routes `--commit`, `--release`, `--branch`, and `--pr` to lightweight sub-skill files in its own directory.

> **Trigger:** `@ai-git`

## Quick Start
1. Run `@ai-git --commit` to stage and commit changes
2. Run `@ai-git --pr` to create a GitHub PR
3. Run `@ai-git --release` for changelog + release

**Example:** `@ai-git --commit` → stages, generates conventional commit message, commits

## Description

Modular Git workflow automation. Each sub-command loads its own instruction file, keeping each module small and token-efficient.

## Usage

| Command | Action |
|---|---|
| `@ai-git --commit` | Stage all + conventional commit |
| `@ai-git --release` | Changelog, version bump, tags, GitHub release |
| `@ai-git --branch` | Create, switch, rename, delete branches |
| `@ai-git --pr` | Create GitHub PR from current branch |

---

**[⬆ Back to Top](#)** | **[📂 Skill Index](/docs/README.md)**
