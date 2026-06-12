# new-ai-log.ps1 — Create an AI interaction log file
# Usage: .\new-ai-log.ps1

# --- Auto-detected fields ---
$PC_NAME   = $env:COMPUTERNAME
$DATE      = Get-Date -Format "yyyy-MM-dd"
$TIME      = Get-Date -Format "HHmmss"
$BRANCH    = git branch --show-current 2>$null
if (-not $BRANCH) { $BRANCH = "unknown" }

# --- Prompt user ---
Write-Host "=== AI Log Generator ==="
Write-Host ""

$PROMPT       = Read-Host -Prompt "What was your prompt?"
$AI_RESPONSE  = Read-Host -Prompt "What was the AI response?"
$FILE_PATH    = Read-Host -Prompt "Which file path(s)?"
Write-Host "Paste the code BEFORE (then press Enter, type 'END' on a new line, press Enter):"
$CODE_BEFORE  = @()
while (($line = Read-Host) -ne "END") { $CODE_BEFORE += $line }
Write-Host "Paste the code AFTER (then press Enter, type 'END' on a new line, press Enter):"
$CODE_AFTER   = @()
while (($line = Read-Host) -ne "END") { $CODE_AFTER += $line }
$AI_TOOL      = Read-Host -Prompt "Which AI tool was used?"

# --- Build filename ---
$FILENAME     = "AI-LOG-$DATE-$TIME-$PC_NAME.txt"
$OUTPUT_DIR   = "docs\log"
$null = New-Item -ItemType Directory -Path $OUTPUT_DIR -Force
$OUTPUT_FILE  = Join-Path -Path $OUTPUT_DIR -ChildPath $FILENAME

# --- Write log ---
@"
╔══════════════════════════════════════════════════════════════╗
║                    AI INTERACTION LOG                        ║
╚══════════════════════════════════════════════════════════════╝

PC Name:      $PC_NAME
Date:         $DATE
Time:         $TIME
Git Branch:   $BRANCH
AI Tool:      $AI_TOOL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$PROMPT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI RESPONSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$AI_RESPONSE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE AFFECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$FILE_PATH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODE BEFORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$($CODE_BEFORE -join "`n")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODE AFTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$($CODE_AFTER -join "`n")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"@ | Out-File -FilePath $OUTPUT_FILE -Encoding utf8

Write-Host ""
Write-Host "✅ Log saved to $OUTPUT_FILE"
