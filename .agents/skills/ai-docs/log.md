# ai-docs log — Log AI interactions

Log every AI interaction — prompt, response, affected file, code before/after,
and metadata. Saves to `docs/log/AI-LOG-*.md`.

## Flags

| Flag | Action |
|---|---|
| `@ai-docs --log` | Log current interaction |
| `@ai-docs --log --list` | List all past logs with date, file count |
| `@ai-docs --log --search <term>` | Search log contents for term |
| `@ai-docs --log --last` | Show the most recent log content |
| `@ai-docs --log --no-prompt` | Log everything except the prompt text (privacy) |
| `@ai-docs --log --compact` | Group all loose log files into dated subdirectories |

## 1. Security — filter secrets

Before writing any log, scan prompt + response + git diff for sensitive
patterns. **Mask** all matches. If `--no-prompt`, skip prompt entirely.

### API keys & tokens

| Pattern | Mask with |
|---|---|
| `sk-[a-zA-Z0-9]{20,}` (OpenAI-style) | `AI_API_KEY_REDACTED` |
| `sk-ant-[a-zA-Z0-9]{20,}` (Anthropic) | `AI_API_KEY_REDACTED` |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `AI_API_KEY` or similar env names followed by `=` + value | `AI_API_KEY_REDACTED` |
| `ghp_[a-zA-Z0-9]{36}` / `github_pat_[a-zA-Z0-9]{20,}` (GitHub) | `GITHUB_TOKEN_REDACTED` |
| `npm_[a-z0-9]{36}` (npm) | `NPM_TOKEN_REDACTED` |
| `eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+` (JWT) | `JWT_REDACTED` |
| `api[_-]?key`/`api[_-]?secret`/`api[_-]?token` | `API_KEY_REDACTED` |

### Credentials & auth

| Pattern | Mask with |
|---|---|
| `password`/`passwd`/`pwd` | `PASSWORD_REDACTED` |
| `secret`/`client_secret`/`app_secret` | `SECRET_REDACTED` |
| `token`/`auth_token`/`refresh_token`/`access_token` | `TOKEN_REDACTED` |
| `Bearer\s+[a-zA-Z0-9._-]{20,}` | `BEARER_TOKEN_REDACTED` |
| `https?://[^:]+:[^@]+@` (URL-embedded credentials) | `URL_CREDENTIALS_REDACTED` |
| Email regex (`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`) | `EMAIL_REDACTED` |

### Keys & certificates

| Pattern | Mask with |
|---|---|
| `-----BEGIN\s+(RSA|EC|DSA|OPENSSH|PRIVATE)\s+KEY-----` | `PRIVATE_KEY_REDACTED` |
| `-----BEGIN CERTIFICATE-----` | `CERTIFICATE_REDACTED` |
| `AKIA[0-9A-Z]{16}` (AWS access key) | `AWS_KEY_REDACTED` |

### Connection strings

| Pattern | Mask with |
|---|---|
| `mongodb(?:\+srv)?://[^@]+@` | `MONGODB_URI_REDACTED` |
| `postgres(?:ql)?://[^@]+@` | `POSTGRES_URI_REDACTED` |
| `mysql://[^@]+@` | `MYSQL_URI_REDACTED` |
| `redis://[^@]+@` | `REDIS_URI_REDACTED` |

Apply all patterns case-insensitively. **Never** include the matched value in
the log — replace the entire line or value with the mask.

After masking, verify the log contains no raw `sk-`, `ghp_`, `eyJ`, `AKIA`,
`-----BEGIN`, or `://[^:]:[^@]@` patterns. If any remain, mask the entire field.

## 2. Auto-detect

| Field | Windows | Mac/Linux |
|---|---|---|
| PC Name | `$env:COMPUTERNAME` | `hostname` |
| Date | `Get-Date -Format "yyyy-MM-dd"` | `date +%F` |
| Time | `Get-Date -Format "HHmmss"` | `date +%H%M%S` |
| Git Branch | `git branch --show-current` | `git branch --show-current` |

If the user requests privacy, use `LOCAL` instead of PC name.

## 3. Read conversation

Extract from chat — do NOT ask the user:
- **Prompt** — User's messages (skip if `--no-prompt`)
- **AI Response** — Your replies
- **File Path** — Files created or edited
- **Code Before** — `git diff` (or `--cached` if staged, or `HEAD` for all)
- **Code After** — New content
- **AI Tool** — Always `OpenCode`

Run `git diff --name-only` for file list. If git diff is empty (new files not
staged), read files before/after via `read`.

## 4. Generate filename

Format: `AI-LOG-YYYY-MM-DD-HHMMSS-PCNAME.md`
Example: `AI-LOG-2026-06-12-093931-DESKTOP-CR24C6G.md`

## 5. Write the log

Save to `docs/log/<filename>`:

```markdown
# AI Interaction Log — {date}

| Field | Value |
|---|---|
| PC Name | {pc_name} |
| Date | {date} |
| Time | {time} |
| Branch | {branch} |
| Tool | OpenCode |

## Prompt
{prompt}

## AI Response
{response}

## Files Affected
{files}

## Code Before
```diff
{before}
```

## Code After
```
{after}
```
```

## 6. Confirm

> ✅ Log saved to `docs/log/AI-LOG-2026-06-12-093931-DESKTOP-CR24C6G.md`

## Compact (`--compact`)

When `@ai-docs --log --compact` is called, organize all loose log files in
`docs/log/` into date-based subdirectories:

1. Glob `docs/log/AI-LOG-*.md` (only loose files, not inside subdirs)
2. For each file, extract the date from its filename: `AI-LOG-{YYYY-MM-DD}-*.md`
3. Create `docs/log/{YYYY-MM-DD}/` if it doesn't exist
4. Move the file into that directory
5. Report: "Compacted N files into X date directories"
