#!/bin/bash
#
# LxusBrain Website - GitHub Secrets Setup Script
# Author: Santhosh T / LxusBrain
#
# This script helps you set up the required GitHub secrets for CI/CD deployment.
# It reads from your local .env.local file and sets the secrets in GitHub.
#
# Usage: ./scripts/setup-secrets.sh
#
# Prerequisites:
#   - GitHub CLI (gh) installed and authenticated
#   - .env.local file with your Firebase configuration
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo ""
    echo -e "${CYAN}${BOLD}=== $1 ===${NC}"
    echo ""
}

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

log_step "GitHub Secrets Setup"

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI (gh) is not installed."
    echo "  Install it from: https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    log_error "GitHub CLI is not authenticated."
    echo "  Run: gh auth login"
    exit 1
fi

log_success "GitHub CLI is ready"

# Check for .env.local
if [ ! -f ".env.local" ]; then
    log_error ".env.local file not found!"
    echo ""
    echo "Create .env.local from .env.example and fill in your values:"
    echo "  cp .env.example .env.local"
    echo "  # Edit .env.local with your Firebase configuration"
    exit 1
fi

log_success "Found .env.local"

# Required secrets
REQUIRED_SECRETS=(
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_AUTH_DOMAIN"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_FIREBASE_STORAGE_BUCKET"
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
    "VITE_FIREBASE_APP_ID"
)

OPTIONAL_SECRETS=(
    "VITE_RAZORPAY_KEY_ID"
    "VITE_FIREBASE_FUNCTIONS_URL"
)

echo ""
echo -e "${BOLD}Required secrets to set:${NC}"
for secret in "${REQUIRED_SECRETS[@]}"; do
    echo "  - $secret"
done
echo ""
echo -e "${BOLD}Optional secrets:${NC}"
for secret in "${OPTIONAL_SECRETS[@]}"; do
    echo "  - $secret"
done
echo ""

# Confirm before proceeding
echo -n "This will set GitHub secrets from .env.local. Continue? (y/N): "
read confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    log_info "Cancelled"
    exit 0
fi

log_step "Setting Secrets"

# Function to set a secret
set_secret() {
    local name="$1"
    local value=$(grep "^$name=" .env.local | cut -d'=' -f2-)

    if [ -z "$value" ] || [ "$value" = "your_api_key" ] || [[ "$value" == your_* ]]; then
        log_warning "Skipping $name (not configured in .env.local)"
        return 1
    fi

    echo -n "Setting $name... "
    if echo "$value" | gh secret set "$name" 2>/dev/null; then
        echo -e "${GREEN}Done${NC}"
        return 0
    else
        echo -e "${RED}Failed${NC}"
        return 1
    fi
}

# Set required secrets
success_count=0
fail_count=0

for secret in "${REQUIRED_SECRETS[@]}"; do
    if set_secret "$secret"; then
        ((success_count++))
    else
        ((fail_count++))
    fi
done

# Set optional secrets
for secret in "${OPTIONAL_SECRETS[@]}"; do
    set_secret "$secret" || true
done

echo ""
log_step "Summary"

echo "Secrets set successfully: $success_count"
echo "Secrets skipped/failed:   $fail_count"
echo ""

if [ $fail_count -gt 0 ]; then
    log_warning "Some required secrets were not set."
    echo "Please set them manually:"
    echo "  gh secret set SECRET_NAME"
    echo ""
    echo "Or via GitHub UI:"
    echo "  1. Go to: https://github.com/san-gitlogin/lxusbrain-website/settings/secrets/actions"
    echo "  2. Click 'New repository secret'"
    echo "  3. Add each missing secret"
else
    log_success "All required secrets are configured!"
    echo ""
    echo "To trigger a new deployment:"
    echo "  git commit --allow-empty -m 'chore: trigger rebuild' && git push"
fi
