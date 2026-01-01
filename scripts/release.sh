#!/bin/bash
#
# LxusBrain Website - Release Script
# Author: Santhosh T / LxusBrain
#
# Usage: ./scripts/release.sh [major|minor|patch]
#
# This script handles the complete release process:
# 1. Pre-flight checks (clean working directory, all tests pass)
# 2. Version bump
# 3. Changelog update
# 4. Git tag and push
# 5. Monitor deployment
#

set -e

# =============================================================================
# COLORS AND FORMATTING
# =============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================
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
    echo -e "${MAGENTA}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}${BOLD}  $1${NC}"
    echo -e "${MAGENTA}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Get current version from package.json
get_current_version() {
    node -p "require('./package.json').version"
}

# Calculate new version
calculate_new_version() {
    local current_version="$1"
    local bump_type="$2"

    local major minor patch
    IFS='.' read -r major minor patch <<< "$current_version"

    case "$bump_type" in
        major)
            echo "$((major + 1)).0.0"
            ;;
        minor)
            echo "${major}.$((minor + 1)).0"
            ;;
        patch)
            echo "${major}.${minor}.$((patch + 1))"
            ;;
        *)
            echo "$current_version"
            ;;
    esac
}

# Update version in package.json
update_package_version() {
    local new_version="$1"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"version\": \".*\"/\"version\": \"$new_version\"/" package.json
    else
        # Linux
        sed -i "s/\"version\": \".*\"/\"version\": \"$new_version\"/" package.json
    fi
}

# Create or update CHANGELOG
update_changelog() {
    local version="$1"
    local date=$(date +%Y-%m-%d)

    if [ ! -f "CHANGELOG.md" ]; then
        cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

EOF
    fi

    # Get recent commits since last tag
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    local commits=""

    if [ -n "$last_tag" ]; then
        commits=$(git log --oneline "$last_tag"..HEAD 2>/dev/null | head -20)
    else
        commits=$(git log --oneline -20)
    fi

    # Create new changelog entry
    local temp_file=$(mktemp)
    local entry_file=$(mktemp)

    cat > "$entry_file" << EOF
## [${version}] - ${date}

### Changes
EOF

    echo "$commits" | while read -r line; do
        if [ -n "$line" ]; then
            # Extract commit message (remove hash)
            local msg=$(echo "$line" | sed 's/^[a-f0-9]* //')
            echo "- $msg" >> "$entry_file"
        fi
    done

    echo "" >> "$entry_file"

    # Insert new entry after the header
    head -8 CHANGELOG.md > "$temp_file"
    cat "$entry_file" >> "$temp_file"
    tail -n +9 CHANGELOG.md >> "$temp_file"

    mv "$temp_file" CHANGELOG.md
    rm -f "$entry_file"
}

# =============================================================================
# PRE-FLIGHT CHECKS
# =============================================================================

preflight_checks() {
    log_step "Pre-Flight Checks"

    local failed=0

    # Check 1: Clean working directory
    log_info "Checking for uncommitted changes..."
    if [ -n "$(git status --porcelain)" ]; then
        log_error "Working directory is not clean. Please commit or stash changes."
        git status --short
        failed=1
    else
        log_success "Working directory is clean"
    fi

    # Check 2: On main branch
    log_info "Checking branch..."
    local current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        log_warning "Not on main branch (current: $current_branch)"
        echo -n "Continue anyway? (y/N): "
        read confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            failed=1
        fi
    else
        log_success "On main branch"
    fi

    # Check 3: Up to date with remote
    log_info "Checking remote sync..."
    git fetch origin main
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/main)
    if [ "$local_commit" != "$remote_commit" ]; then
        log_warning "Local branch differs from origin/main"
        log_info "Local:  $local_commit"
        log_info "Remote: $remote_commit"
        echo -n "Continue anyway? (y/N): "
        read confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            failed=1
        fi
    else
        log_success "Synced with remote"
    fi

    # Check 4: ESLint passes
    log_info "Running ESLint..."
    if npm run lint > /dev/null 2>&1; then
        log_success "ESLint passed"
    else
        log_error "ESLint failed"
        failed=1
    fi

    # Check 5: TypeScript compiles
    log_info "Running TypeScript check..."
    if npx tsc --noEmit > /dev/null 2>&1; then
        log_success "TypeScript check passed"
    else
        log_error "TypeScript check failed"
        failed=1
    fi

    # Check 6: Build succeeds
    log_info "Running build..."
    if npm run build > /dev/null 2>&1; then
        log_success "Build succeeded"
    else
        log_error "Build failed"
        failed=1
    fi

    # Check 7: GitHub CLI available
    log_info "Checking GitHub CLI..."
    if command -v gh &> /dev/null; then
        if gh auth status > /dev/null 2>&1; then
            log_success "GitHub CLI authenticated"
        else
            log_warning "GitHub CLI not authenticated"
            log_info "Run: gh auth login"
        fi
    else
        log_warning "GitHub CLI not installed"
    fi

    echo ""
    if [ $failed -ne 0 ]; then
        log_error "Pre-flight checks failed. Please fix issues before releasing."
        exit 1
    fi

    log_success "All pre-flight checks passed!"
}

# =============================================================================
# RELEASE PROCESS
# =============================================================================

do_release() {
    local bump_type="$1"

    log_step "Starting Release Process"

    # Get versions
    local current_version=$(get_current_version)
    local new_version=$(calculate_new_version "$current_version" "$bump_type")

    echo -e "${BOLD}Release Summary:${NC}"
    echo "  Current version: $current_version"
    echo "  New version:     $new_version"
    echo "  Bump type:       $bump_type"
    echo ""
    echo -n "Proceed with release? (y/N): "
    read confirm

    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "Release cancelled"
        exit 0
    fi

    # Step 1: Update version
    log_step "Step 1: Updating Version"
    log_info "Updating package.json..."
    update_package_version "$new_version"
    log_success "Version updated to $new_version"

    # Step 2: Update changelog
    log_step "Step 2: Updating Changelog"
    log_info "Generating changelog entry..."
    update_changelog "$new_version"
    log_success "Changelog updated"

    # Step 3: Commit version bump
    log_step "Step 3: Committing Changes"
    git add package.json CHANGELOG.md
    git commit -m "chore: release v${new_version}"
    log_success "Changes committed"

    # Step 4: Create tag
    log_step "Step 4: Creating Git Tag"
    git tag -a "v${new_version}" -m "Release v${new_version}"
    log_success "Tag v${new_version} created"

    # Step 5: Push to remote
    log_step "Step 5: Pushing to GitHub"
    log_info "Pushing commits..."
    git push origin main
    log_info "Pushing tags..."
    git push origin "v${new_version}"
    log_success "Pushed to GitHub"

    # Step 6: Monitor deployment
    log_step "Step 6: Monitoring Deployment"

    if command -v gh &> /dev/null; then
        log_info "Waiting for CI to start..."
        sleep 5

        log_info "Monitoring CI/CD pipeline..."
        gh run watch || true

        echo ""
        log_success "Release v${new_version} complete!"
        echo ""
        echo -e "${BOLD}Next steps:${NC}"
        echo "  1. Verify website at: https://lxusbrain.com"
        echo "  2. Create GitHub release (optional): gh release create v${new_version}"
    else
        log_info "Check deployment at: https://github.com/san-gitlogin/lxusbrain-website/actions"
    fi
}

# =============================================================================
# MAIN
# =============================================================================

show_help() {
    echo -e "${BOLD}LxusBrain Website - Release Script${NC}"
    echo ""
    echo "Usage: ./scripts/release.sh [major|minor|patch]"
    echo ""
    echo "Version bump types:"
    echo "  major  - Breaking changes (1.0.0 -> 2.0.0)"
    echo "  minor  - New features (1.0.0 -> 1.1.0)"
    echo "  patch  - Bug fixes (1.0.0 -> 1.0.1)"
    echo ""
    echo "Examples:"
    echo "  ./scripts/release.sh patch   # Bug fix release"
    echo "  ./scripts/release.sh minor   # Feature release"
    echo "  ./scripts/release.sh major   # Breaking change release"
}

main() {
    # Get the script directory and change to project root
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
    cd "$PROJECT_DIR"

    local bump_type="${1:-}"

    if [ -z "$bump_type" ]; then
        show_help
        echo ""
        echo -n "Select version bump type (major/minor/patch): "
        read bump_type
    fi

    case "$bump_type" in
        major|minor|patch)
            preflight_checks
            do_release "$bump_type"
            ;;
        help|-h|--help)
            show_help
            ;;
        *)
            log_error "Invalid bump type: $bump_type"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
