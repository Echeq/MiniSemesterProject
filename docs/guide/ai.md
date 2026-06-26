# AI Guide

This project uses **OpenCode** as the AI-powered CLI assistant.

## Configuration

The project's OpenCode config is at `opencode.json` (root) with skills in `.agents/skills/`. The AGENTS.md file provides workspace-level instructions.

## Commands

| Command | What it does |
|---|---|
| `@ai-log` | Log last AI interaction to `docs/log/` |
| `@ai-commit` | Stage all changes + create a conventional commit |

## Supabase MCP

The project connects to Supabase via OpenCode's MCP server for AI-driven database operations. Each team member authenticates individually:

```bash
opencode mcp auth supabase
```

This opens a browser for OAuth login. No credentials are stored in the repository. Once authenticated, the AI can list tables, run SQL queries, apply migrations, and manage the database.

## Daily workflow

1. Open the project in OpenCode (AGENTS.md auto-loads)
2. Ask the AI for what you need
3. After the AI responds, type `@ai-log`
4. When done, type `@ai-commit`

## Example session

```
$ opencode
> Create a Kanban column component
[AI writes the component]

@ai-log
✅ Log saved to docs/log/AI-LOG-2026-06-12-094512-DESKTOP-ABC.txt

@ai-commit
✅ Commit created: feat: add Kanban column component
```
