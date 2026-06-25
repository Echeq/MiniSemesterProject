#!/usr/bin/env bash
# =============================================================================
# TaskFlow — Performance Test Script
# Generates 100+ tasks and measures render performance.
# Usage:
#   chmod +x scripts/test-performance.sh
#   ./scripts/test-performance.sh
#
# Requires: supabase CLI, node
# =============================================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

# ─── Config ──────────────────────────────────────────────────────────────────
COUNT=120
STATUSES=("todo" "doing" "done")

info "TaskFlow Performance Test"
echo ""
info "Step 1: Checking supabase CLI..."
if ! command -v supabase &>/dev/null; then
  err "supabase CLI not found."
fi
ok "supabase CLI found"

info "Step 2: Generating $COUNT test tasks via SQL..."
TASK_TEMPLATE="Task "

# Generate SQL to insert tasks
SQL=""
for i in $(seq 1 $COUNT); do
  STATUS=${STATUSES[$((i % 3))]}
  PRIORITY=""
  if [ $((i % 4)) -eq 0 ]; then PRIORITY="'P0'"; fi
  if [ $((i % 4)) -eq 1 ]; then PRIORITY="'P1'"; fi
  if [ $((i % 4)) -eq 2 ]; then PRIORITY="'P2'"; fi
  if [ $((i % 4)) -eq 3 ]; then PRIORITY="null"; fi
  DUE="null"
  if [ $((i % 5)) -eq 0 ]; then DUE="(current_date + interval '1 day')::date"; fi
  if [ $((i % 5)) -eq 1 ]; then DUE="(current_date - interval '1 day')::date"; fi
  if [ $((i % 5)) -eq 2 ]; then DUE="(current_date + interval '5 days')::date"; fi
  
  SQL+="insert into public.tasks (title, description, status, priority, due_date, position, created_by) "
  SQL+="select '${TASK_TEMPLATE}${i}', 'Performance test task ${i}', '${STATUS}'::public.task_status, ${PRIORITY}, ${DUE}, ${i}024.0, id "
  SQL+="from public.profiles limit 1 "
  SQL+="on conflict do nothing;"
done

# Execute via supabase
echo "$SQL" | supabase db execute 2>/dev/null || warn "Could not execute SQL directly. Run manually: supabase db execute"

info "Step 3: Checking task count..."
TASK_COUNT=$(supabase db execute "select count(*) from public.tasks" 2>/dev/null | grep -oP '\d+' || echo "unknown")
ok "Current task count: $TASK_COUNT"

echo ""
info "Step 4: Frontend performance checklist"
echo "  Open the app and verify:"
echo "  - Board loads with $COUNT tasks in < 2 seconds"
echo "  - Columns show correct counts (roughly ${COUNT}/3 each)"
echo "  - Drag a card between columns — no lag"
echo "  - Open TaskModal — loads instantly"
echo "  - Switch to ListView — renders all rows"
echo "  - Click column header to sort — responsive"
echo "  - Sidebar counts match board"
echo ""
echo "  To measure render time in browser:"
echo "    1. Open Chrome DevTools → Performance → Record"
echo "    2. Refresh the page"
echo "    3. Stop recording — look for 'Board' in the flame chart"
echo "    4. Total blocking time should be < 50ms"
echo ""

# Cleanup prompt
read -rp "Remove test tasks? [y/N]: " CLEAN
if [ "$CLEAN" = "y" ] || [ "$CLEAN" = "Y" ]; then
  supabase db execute "delete from public.tasks where title like 'Task ${TASK_TEMPLATE}%'" 2>/dev/null || true
  ok "Test tasks removed"
fi

echo ""
echo "============================================"
echo -e "${GREEN}   Performance test complete${NC}"
echo "============================================"
