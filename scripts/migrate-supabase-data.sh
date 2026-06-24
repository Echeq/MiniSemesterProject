#!/usr/bin/env bash
# =============================================================================
# TaskFlow — Migrate Data Between Supabase Projects
#
# Dumps data from the CURRENT linked Supabase project and restores
# into a TARGET project.
#
# Usage:
#   1. Link to the SOURCE project:
#        supabase link --project-ref <source-ref>
#   2. Run this script:
#        ./scripts/migrate-supabase-data.sh
#   3. It will prompt for the target DB connection string.
#
# Requires: supabase CLI, psql
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

# ─── Prerequisites ────────────────────────────────────────────────────────────

info "Checking prerequisites..."

if ! command -v supabase &>/dev/null; then
  err "supabase CLI not found."
fi

if ! command -v psql &>/dev/null; then
  err "psql not found. Install PostgreSQL client."
fi

# ─── Collect info ──────────────────────────────────────────────────────────────

echo ""
echo "============================================"
echo "   TaskFlow — Data Migration"
echo "============================================"
echo ""
echo "Make sure you are currently linked to the SOURCE project."
echo ""

supabase status 2>/dev/null | grep "Project URL" || warn "No project linked. Run: supabase link --project-ref <source-ref>"
echo ""

# ─── Dump source data ──────────────────────────────────────────────────────────

DUMP_FILE="/tmp/taskflow-data-dump-$(date +%Y%m%d%H%M%S).sql"

info "Dumping data from SOURCE project..."
info "This will include: profiles, tasks, projects, labels, task_labels,"
info "                  notifications, task_dependencies, system_logs, invitations"
echo ""

supabase db dump --data-only -f "$DUMP_FILE" || err "Data dump failed"

ok "Data dumped to: $DUMP_FILE"

# ─── Show tables with data ─────────────────────────────────────────────────────

echo ""
info "Tables with data:"
grep -E "^COPY public\." "$DUMP_FILE" 2>/dev/null | sed 's/COPY public\.//' | sed 's/ .*//' | sort -u || echo "(none)"
echo ""

# ─── Target project ────────────────────────────────────────────────────────────

echo ""
info "Now connect to the TARGET project."
echo "Get the connection string from:"
echo "  Dashboard → Project Settings → Database → Connection string (URI)"
echo "  It looks like: postgresql://postgres:<password>@<host>:<port>/postgres"
echo ""
read -rp "Target DB connection string: " TARGET_DB

if [ -z "$TARGET_DB" ]; then
  err "Connection string is required."
fi

# ─── Apply migrations to target first (optional) ───────────────────────────────

echo ""
read -rp "Apply schema migrations to target first? (required if target is new) [Y/n]: " APPLY_MIGRATIONS

if [ "$APPLY_MIGRATIONS" != "n" ] && [ "$APPLY_MIGRATIONS" != "N" ]; then
  CURRENT_REF=$(supabase status 2>/dev/null | grep "Project URL" | sed 's/.*\/\/api\.//' | sed 's/\..*//' || echo "")

  if [ -n "$CURRENT_REF" ]; then
    info "Migrating schema from: $CURRENT_REF"
    supabase db dump -f /tmp/taskflow-schema.sql
    info "Applying schema to target..."
    psql "$TARGET_DB" -f /tmp/taskflow-schema.sql || warn "Schema apply had errors (some objects may already exist)"
    ok "Schema applied"
  else
    warn "Could not detect source ref. Ensure target has migrations applied already."
  fi
fi

# ─── Restore data to target ────────────────────────────────────────────────────

echo ""
warn "About to insert data into the TARGET project."
warn "This may cause conflicts if data already exists."
read -rp "Proceed with data restore? [y/N]: " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  info "Data restore skipped. Dump file preserved at: $DUMP_FILE"
  exit 0
fi

# Remove lines that would conflict with existing auto-generated data
TEMP_DUMP=$(mktemp)
grep -v "COPY public._prisma_migrations" "$DUMP_FILE" 2>/dev/null > "$TEMP_DUMP" || true
grep -v "COPY public.schema_migrations" "$TEMP_DUMP" 2>/dev/null > "$TEMP_DUMP" || true

info "Restoring data to target..."
psql "$TARGET_DB" -f "$TEMP_DUMP" || warn "Restore had some errors (check above)"

ok "Data restore complete"

# ─── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo "============================================"
echo -e "${GREEN}   Migration complete!${NC}"
echo "============================================"
echo ""
echo "Data migrated from:  (source linked project)"
echo "Data migrated to:    $TARGET_DB"
echo "Dump file:           $DUMP_FILE"
echo ""
warn "Next steps:"
echo "  1. Verify data: sign in to the new app"
echo "  2. Re-link the CLI to the target for future migrations:"
echo "       supabase link --project-ref <target-ref>"
echo ""
info "To clean up: rm $DUMP_FILE"
