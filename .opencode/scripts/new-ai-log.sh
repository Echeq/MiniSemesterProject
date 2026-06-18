#!/usr/bin/env bash
# new-ai-log.sh — Create an AI interaction log file
# Usage: ./new-ai-log.sh

set -euo pipefail

# --- Auto-detected fields ---
PC_NAME=$(hostname)
DATE=$(date +%F)
TIME=$(date +%H%M%S)
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# --- Prompt user ---
echo "=== AI Log Generator ==="
echo ""

read -r -p "What was your prompt? " PROMPT
echo ""
read -r -p "What was the AI response? " AI_RESPONSE
echo ""
read -r -p "Which file path(s)? " FILE_PATH
echo ""
echo "Paste the code BEFORE (Ctrl+D to end):"
CODE_BEFORE=$(cat)
echo ""
echo "Paste the code AFTER (Ctrl+D to end):"
CODE_AFTER=$(cat)
echo ""
read -r -p "Which AI tool was used? " AI_TOOL

# --- Build filename ---
FILENAME="AI-LOG-${DATE}-${TIME}-${PC_NAME}.txt"
OUTPUT_DIR="docs/log"
mkdir -p "$OUTPUT_DIR"
OUTPUT_FILE="${OUTPUT_DIR}/${FILENAME}"

# --- Write log ---
{
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                    AI INTERACTION LOG                        ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  printf "PC Name:      %s\n" "$PC_NAME"
  printf "Date:         %s\n" "$DATE"
  printf "Time:         %s\n" "$TIME"
  printf "Git Branch:   %s\n" "$BRANCH"
  printf "AI Tool:      %s\n" "$AI_TOOL"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "PROMPT"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "$PROMPT"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "AI RESPONSE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "$AI_RESPONSE"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "FILE AFFECTED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "$FILE_PATH"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "CODE BEFORE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "$CODE_BEFORE"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "CODE AFTER"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "$CODE_AFTER"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
} > "$OUTPUT_FILE"

echo ""
echo "✅ Log saved to ${OUTPUT_FILE}"
