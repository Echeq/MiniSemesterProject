# =============================================================================
# TaskFlow — Supabase Deploy Script (Windows PowerShell)
# Usage:
#   .\scripts\deploy-supabase.ps1
#
# Supports: local-dev | production
# Requires: supabase CLI (npm install -g supabase)
# =============================================================================

$ErrorActionPreference = "Stop"

function Info  { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Ok    { Write-Host "[OK]   $args" -ForegroundColor Green }
function Warn  { Write-Host "[WARN] $args" -ForegroundColor Yellow }
function Err   { Write-Host "[ERR]  $args" -ForegroundColor Red; exit 1 }

# ─── Prerequisites ────────────────────────────────────────────────────────────

Info "Checking prerequisites..."

try {
  $ver = supabase --version 2>$null
  Ok "supabase CLI $ver"
} catch {
  Err "supabase CLI not found. Install: npm install -g supabase"
}

# ─── Mode selection ────────────────────────────────────────────────────────────

Write-Host "`n============================================"
Write-Host "   TaskFlow — Supabase Deploy"
Write-Host "============================================`n"
Write-Host "1) Local development  (seed data, no email confirm)"
Write-Host "2) Production         (no seed, email confirm recommended)`n"

$mode = Read-Host "Select deploy mode [1/2]"
$modeName = if ($mode -eq "1") { "local-dev" } else { "production" }
Info "Selected: $modeName"

# ─── Get project ref ───────────────────────────────────────────────────────────

$projectRef = Read-Host "`nSupabase Project Reference ID (Settings → General → Reference ID)"

if (-not $projectRef) {
  Err "Project Reference ID is required."
}

# ─── Link ──────────────────────────────────────────────────────────────────────

Write-Host ""
Info "Linking to project: $projectRef"
Write-Host "You will be prompted for the database password."
Write-Host ""

supabase link --project-ref $projectRef
if ($LASTEXITCODE -ne 0) { Err "Failed to link project" }
Ok "Project linked"

# ─── Apply migrations ──────────────────────────────────────────────────────────

Write-Host ""
Info "Applying database migrations..."

supabase db push
if ($LASTEXITCODE -ne 0) { Err "Migration failed" }

Ok "All migrations applied"

# ─── Post-deploy steps ─────────────────────────────────────────────────────────

Write-Host ""
Info "Running post-deploy steps for $modeName..."

if ($mode -eq "1") {
  Warn "Local dev: disable email confirmation via Dashboard:"
  Write-Host "  → Authentication → Settings → Confirm email = OFF`n"

  $seed = Read-Host "Run seed data? (requires at least one auth user) [y/N]"
  if ($seed -eq "y" -or $seed -eq "Y") {
    Write-Host "Make sure at least one user exists in Auth → Users, then press Enter."
    Read-Host
    supabase db seed
    if ($LASTEXITCODE -ne 0) { Warn "Seed skipped (may need an auth user first)" }
  }
} else {
  Write-Host ""
  Warn "Production checklist:"
  Write-Host "  1. Authentication → Settings → Confirm email = ON"
  Write-Host "  2. Site URL = your production domain"
  Write-Host "  3. Redirect URLs include your production domain"
  Write-Host "  4. CORS → Allow origins = your production domain`n"

  $deployFront = Read-Host "Ready to deploy frontend? [y/N]"
  if ($deployFront -eq "y" -or $deployFront -eq "Y") {
    Write-Host "`nFrontend build & deploy:"
    Write-Host "  cd frontend"
    Write-Host "  npm install"
    Write-Host "  npm run build"
    Write-Host "  # Upload dist/ to your host (Vercel / Netlify / Cloudflare)`n"
    Write-Host "Environment variables to set on your host:"
    Write-Host "  VITE_SUPABASE_URL=https://${projectRef}.supabase.co"
    Write-Host "  VITE_SUPABASE_ANON_KEY=<get from Dashboard → Settings → API>"
  }
}

# ─── Summary ───────────────────────────────────────────────────────────────────

Write-Host "`n============================================"
Write-Host -ForegroundColor Green "   Deploy complete!"
Write-Host "============================================`n"
Write-Host "Project:     https://$projectRef.supabase.co"
Write-Host "Anon key:    (Dashboard → Settings → API)"
Write-Host "DB password: (the one you entered above)`n"
Write-Host "Next steps:"
Write-Host "  1. Copy the URL and anon key into frontend/.env"
Write-Host "  2. cd frontend && npm install && npm run dev"
Write-Host "  3. Open http://localhost:5173"
Write-Host "  4. Sign up — the first user becomes admin`n"
Write-Host "Run tests:   cd frontend && npm test"
Write-Host "Integration: npx vitest run tests/api.test.js"
