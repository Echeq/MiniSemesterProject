# Skill: ai-log-generate

## Description

Creates a timestamped log file for every AI interaction. Each interaction produces one log file in `docs/log/`.

## Trigger

User says: `@ai-log`

## Workflow

### 1. Auto-detect

Collect these without asking:

| Field | Command |
|---|---|
| PC Name | `hostname` (or `$env:COMPUTERNAME` on Windows) |
| Date | `Get-Date -Format "yyyy-MM-dd"` / `date +%F` |
| Time | `Get-Date -Format "HHmmss"` / `date +%H%M%S` |
| Git Branch | `git branch --show-current` |

### 2. Ask the user

Prompt for each field one at a time:

- **Prompt** — What did you ask the AI?
- **AI Response** — What did the AI reply?
- **File Path** — Which file(s) were changed? (relative to project root)
- **Code Before** — What did the code look like before?
- **Code After** — What did it look like after?
- **AI Tool** — Which tool was used? (e.g. OpenCode, ChatGPT, Claude, Copilot)

### 3. Generate the log filename

Format:

```
AI-LOG-YYYY-MM-DD-HHMMSS-PCNAME.txt
```

Example: `AI-LOG-2025-06-12-091503-DESKTOP-ABC.txt`

### 4. Write the log file

Save to `docs/log/<filename>` with this exact template:

```
╔══════════════════════════════════════════════════════════════╗
║                    AI INTERACTION LOG                        ║
╚══════════════════════════════════════════════════════════════╝

PC Name:      <hostname>
Date:         <yyyy-MM-dd>
Time:         <HH:mm:ss>
Git Branch:   <branch>
AI Tool:      <tool>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<prompt text>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI RESPONSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<ai response text>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE AFFECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<file path>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODE BEFORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<code before>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODE AFTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<code after>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Confirm

Tell the user:

> ✅ Log saved to `docs/log/AI-LOG-YYYY-MM-DD-HHMMSS-PCNAME.txt`
