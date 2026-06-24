#!/usr/bin/env bash
# =============================================================================
# TaskFlow — Supabase Deploy Script
# Usage:
#   chmod +x scripts/deploy-supabase.sh
#   ./scripts/deploy-supabase.sh
#
# Supports: local-dev | production
# Requires: supabase CLI (npm install -g supabase)
# =============================================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

# ─── Prerequisites ────────────────────────────────────────────────────────────

info "Checking prerequisites..."

if ! command -v supabase &>/dev/null; then
  err "supabase CLI not found. Install: npm install -g supabase"
fi

SUPABASE_VERSION=$(supabase --version 2>/dev/null || echo "unknown")
ok "supabase CLI $SUPABASE_VERSION"

# ─── Mode selection ────────────────────────────────────────────────────────────

echo ""
echo "============================================"
echo "   TaskFlow — Supabase Deploy"
echo "============================================"
echo ""
echo "1) Local development  (seed data, no email confirm)"
echo "2) Production         (no seed, email confirm recommended)"
echo ""
read -rp "Select deploy mode [1/2]: " MODE

case "$MODE" in
  1) MODE_NAME="local-dev" ;;
  2) MODE_NAME="production" ;;
  *) err "Invalid selection. Choose 1 or 2." ;;
esac

info "Selected: $MODE_NAME"

# ─── Get project ref ───────────────────────────────────────────────────────────

echo ""
read -rp "Supabase Project Reference ID (Settings → General → Reference ID): " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
  err "Project Reference ID is required."
fi

# ─── Link ──────────────────────────────────────────────────────────────────────

echo ""
info "Linking to project: $PROJECT_REF"
echo "You will be prompted for the database password (set when you created the project)."
echo ""

supabase link --project-ref "$PROJECT_REF" || err "Failed to link project"

ok "Project linked"

# ─── Apply migrations ──────────────────────────────────────────────────────────

echo ""
info "Applying database migrations..."

supabase db push || err "Migration failed"

ok "All migrations applied"

# ─── Post-deploy steps ─────────────────────────────────────────────────────────

echo ""
info "Running post-deploy steps for $MODE_NAME..."

if [ "$MODE" = "1" ]; then
  # Local dev: disable email confirmation for convenience
  warn "Local dev: disable email confirmation via Dashboard:"
  echo "  → Authentication → Settings → Confirm email = OFF"
  echo ""

  # Seed data
  read -rp "Run seed data? (requires at least one auth user) [y/N]: " SEED
  if [ "$SEED" = "y" ] || [ "$SEED" = "Y" ]; then
    echo "Make sure at least one user exists in Auth → Users, then press Enter."
    read -rp ""
    supabase db seed || warn "Seed skipped (may need an auth user first)"
  fi
else
  # Production: show security reminders
  echo ""
  warn "Production checklist:"
  echo "  1. Authentication → Settings → Confirm email = ON"
  echo "  2. Site URL = your production domain"
  echo "  3. Redirect URLs include your production domain"
  echo "  4. CORS → Allow origins = your production domain"
  echo "  5. Run 'supabase db push' again if any new migrations exist"
  echo ""
  read -rp "Ready to deploy frontend? [y/N]: " DEPLOY_FRONT
  if [ "$DEPLOY_FRONT" = "y" ] || [ "$DEPLOY_FRONT" = "Y" ]; then
    echo ""
    echo "Frontend build & deploy:"
    echo "  cd frontend"
    echo "  npm install"
    echo "  npm run build"
    echo "  # Upload dist/ to your host (Vercel / Netlify / Cloudflare)"
    echo ""
    echo "Environment variables to set on your host:"
    echo "  VITE_SUPABASE_URL=https://${PROJECT_REF}.supabase.co"
    echo "  VITE_SUPABASE_ANON_KEY=<get from Dashboard → Settings → API>"
  fi
fi

# ─── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo "============================================"
echo -e "${GREEN}   Deploy complete!${NC}"
echo "============================================"
echo ""
echo "Project:     https://$PROJECT_REF.supabase.co"
echo "Anon key:    (Dashboard → Settings → API)"
echo "DB password: (the one you entered above)"
echo ""
echo "Next steps:"
echo "  1. Copy the URL and anon key into frontend/.env"
echo "  2. cd frontend && npm install && npm run dev"
echo "  3. Open http://localhost:5173"
echo "  4. Sign up — the first user becomes admin"
echo ""
echo "Run tests:   cd frontend && npm test"
echo "Integration: npx vitest run tests/api.test.js"
