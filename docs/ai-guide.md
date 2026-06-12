# AI Guide

This project uses **OpenCode** as the AI-powered CLI assistant.

## Installation

**Windows (PowerShell):**
```powershell
winget install opencode
```

**Mac (Homebrew):**
```bash
brew install opencode
```

**Linux (curl):**
```bash
curl -fsSL https://opencode.ai/install.sh | sh
```

## Commands

| Command | When | What it does |
|---------|------|-------------|
| `/init` | Start of every session | Loads `AGENTS.md` + discovers skills |
| `@ai-log` | After every AI interaction | Logs the conversation to `docs/log/` |
| `@ai-commit` | When ready to commit | Stages all changes and creates a commit |
| Chat naturally | Anytime | Ask the AI for features, fixes, explanations |

## Daily workflow

1. Run `opencode` and type `/init`
2. Ask the AI for what you need
3. After the AI responds, type `@ai-log`
4. When done, type `@ai-commit`

## Example session

```
$ opencode
/init
> Create a Kanban column component
[AI writes the component]

@ai-log
✅ Log saved to docs/log/AI-LOG-2026-06-12-094512-DESKTOP-ABC.txt

@ai-commit
✅ Commit created: feat: add Kanban column component
```

## Without OpenCode (standalone scripts)

**Windows:**
```powershell
.\.opencode\scripts\new-ai-log.ps1
```

**Mac/Linux:**
```bash
chmod +x .opencode/scripts/new-ai-log.sh
./.opencode/scripts/new-ai-log.sh
```
