---
name: ai-git
description: >-
  Git/GitHub skill hub. Routes `--commit`, `--release`, `--branch`, and `--pr`
  to lightweight sub-skill files in its own directory. Keeps each module small,
  focused, and token-efficient — only the requested module is loaded.
triggers:
  - "@ai-git"
  - "@ai-git --commit"
  - "@ai-git --release"
  - "@ai-git --branch"
  - "@ai-git --pr"
allowed-tools: Read, Write, Bash, Glob, Grep
---

# AI Git

Git/GitHub skill hub. Each sub-command loads its own instruction file from this
directory — only the module you need is read, saving tokens.

## Usage

| Command | Action |
|---|---|
| `@ai-git --commit` | Stage all changes and create a conventional commit |
| `@ai-git --release` | Changelog, SemVer bump, git tags, GitHub releases |
| `@ai-git --branch` | Create, switch, rename, delete branches |
| `@ai-git --pr` | Create GitHub PR from current branch (no auto-release) |
| `@ai-git` (bare) | Show this help + list available modules |

## How it works

1. Parse the flag (`--commit`, `--release`, `--branch`, `--pr`, or bare).
2. If bare → print this help table and stop.
3. Read the corresponding `.md` file from this directory:
   - `--commit` → read `commit.md`
   - `--release` → read `release.md`
   - `--branch` → read `branch.md`
   - `--pr` → read `pr.md`
4. Execute the instructions from that file directly.
5. Each file is self-contained — no frontmatter, just instructions.

## Available modules

| File | Loaded by |
|---|---|
| `commit.md` | `@ai-git --commit` |
| `release.md` | `@ai-git --release` |
| `branch.md` | `@ai-git --branch` |
| `pr.md` | `@ai-git --pr` |

## Notes

- To add a new module: create `<name>.md` in this directory and add the trigger
  to this file's frontmatter.
