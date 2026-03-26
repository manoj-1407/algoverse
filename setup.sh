#!/usr/bin/env bash
set -e

# BUG FIX: was labelled "Algoverse v2.0" in the v3 zip
REPO="algoverse"
GH_USER="manoj-1407"
GH_EMAIL="manojkumar148700@gmail.com"

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'
log()  { echo -e "${GREEN}✓${NC}  $1"; }
info() { echo -e "${CYAN}→${NC}  $1"; }
warn() { echo -e "${YELLOW}!${NC}  $1"; }
fail() { echo -e "${RED}✗  $1${NC}"; exit 1; }
hr()   { echo -e "\n${CYAN}══════════════════════════════════════════${NC}"; }

hr; echo -e "${BOLD}  Algoverse v3.0 — Setup${NC}"; echo -e "  github.com/${GH_USER}/${REPO}"; hr

command -v docker >/dev/null || fail "Docker not found"
command -v git    >/dev/null || fail "git not found"

# ── Port conflict guard ────────────────────────────────────────────────────
if ss -tlnp 2>/dev/null | grep -q ':6379 ' || netstat -tlnp 2>/dev/null | grep -q ':6379 '; then
  warn "Port 6379 is already in use (Redis already running locally)."
  echo -e "  To fix: ${CYAN}sudo systemctl stop redis${NC}  OR  ${CYAN}sudo service redis-server stop${NC}"
  echo -e "  Or change the host port in docker-compose.yml: ports: [\"6380:6379\"]"
  echo -e "  Then update REDIS_URL in .env to: redis://:..@localhost:6380"
  echo ""
  read -r -p "  Continue anyway? [y/N] " ans
  [[ "$ans" =~ ^[Yy]$ ]] || exit 1
fi

# Install Docker Compose V2 if needed
if ! docker compose version >/dev/null 2>&1; then
  info "Installing Docker Compose V2..."
  DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
  mkdir -p "$DOCKER_CONFIG/cli-plugins"
  curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 \
    -o "$DOCKER_CONFIG/cli-plugins/docker-compose"
  chmod +x "$DOCKER_CONFIG/cli-plugins/docker-compose"
  log "Docker Compose V2 installed"
fi

# ── Git init ───────────────────────────────────────────────────────────────
if [ ! -d ".git" ]; then
  hr; echo -e "${BOLD}  GitHub Setup${NC}"; hr
  info "Initialising git..."
  git init -b main
  git config user.email "$GH_EMAIL"
  git config user.name "$GH_USER"
  git add .
  git commit -m "feat: Algoverse v3.0 — The Computational Universe"
  log "Git committed"

  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    info "Creating GitHub repository..."
    gh repo create "${GH_USER}/${REPO}" --public --source=. --remote=origin --push && log "Pushed to github.com/${GH_USER}/${REPO}" || warn "GitHub push failed — continuing"
  else
    warn "gh CLI not authenticated — skipping GitHub push"
  fi
fi

# ── Docker ─────────────────────────────────────────────────────────────────
hr; echo -e "${BOLD}  Docker Stack${NC}"; hr
info "Building images (first run ~3-4 min)..."
docker compose up -d --build
log "Stack started"

hr
echo -e "${GREEN}${BOLD}  Ready!${NC}"
echo -e "  Frontend  →  ${CYAN}http://localhost:5173${NC}"
echo -e "  API       →  ${CYAN}http://localhost:8000/docs${NC}"
echo -e "  Logs      →  ${CYAN}docker compose logs -f${NC}"
hr
