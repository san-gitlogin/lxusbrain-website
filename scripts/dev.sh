#!/bin/bash
#
# LxusBrain Website - Development Helper Script
# Author: Santhosh T / LxusBrain
#
# Usage: ./scripts/dev.sh [command]
#
# Commands:
#   check   - Run all checks (lint, types, build)
#   lint    - Run ESLint only
#   types   - Run TypeScript type check only
#   build   - Build the project
#   push    - Run checks, then push to GitHub
#   status  - Show git status and CI status
#   deploy  - Full check, push, and monitor deployment
#   help    - Show this help message
#

set -e  # Exit on error

# =============================================================================
# COLORS AND FORMATTING
# =============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

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
    echo -e "${CYAN}${BOLD}=== $1 ===${NC}"
    echo ""
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ]; then
        log_error "Not in the lxusbrain-website directory!"
        log_info "Please run from the project root directory"
        exit 1
    fi
}

# Check if required tools are installed
check_tools() {
    local missing_tools=()

    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi

    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi

    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi

    if ! command -v gh &> /dev/null; then
        log_warning "GitHub CLI (gh) not installed. Some features will be limited."
    fi

    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi
}

# Show a spinner while a command runs
run_with_spinner() {
    local cmd="$1"
    local msg="$2"
    local logfile=$(mktemp)

    echo -n -e "${BLUE}[RUNNING]${NC} $msg "

    # Run command in background
    eval "$cmd" > "$logfile" 2>&1 &
    local pid=$!

    # Show spinner
    local spin='-\|/'
    local i=0
    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) % 4 ))
        printf "\r${BLUE}[RUNNING]${NC} $msg ${spin:$i:1}"
        sleep 0.1
    done

    # Wait for command to finish and get exit code
    wait $pid
    local exit_code=$?

    # Clear spinner
    printf "\r"

    if [ $exit_code -eq 0 ]; then
        log_success "$msg"
    else
        log_error "$msg"
        echo ""
        echo -e "${RED}Output:${NC}"
        cat "$logfile"
        rm -f "$logfile"
        return $exit_code
    fi

    rm -f "$logfile"
    return 0
}

# =============================================================================
# COMMAND IMPLEMENTATIONS
# =============================================================================

cmd_help() {
    echo -e "${BOLD}LxusBrain Website - Development Helper${NC}"
    echo ""
    echo "Usage: ./scripts/dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  check   - Run all checks (lint, types, build)"
    echo "  lint    - Run ESLint only"
    echo "  types   - Run TypeScript type check only"
    echo "  build   - Build the project"
    echo "  push    - Run checks, then push to GitHub"
    echo "  status  - Show git status and CI status"
    echo "  deploy  - Full check, push, and monitor deployment"
    echo "  help    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/dev.sh check    # Run all checks before committing"
    echo "  ./scripts/dev.sh push     # Check and push in one command"
    echo "  ./scripts/dev.sh deploy   # Full deployment workflow"
}

cmd_lint() {
    log_step "Running ESLint"

    if npm run lint; then
        log_success "ESLint passed"
        return 0
    else
        log_error "ESLint found issues"
        return 1
    fi
}

cmd_types() {
    log_step "Running TypeScript Type Check"

    if npx tsc --noEmit; then
        log_success "TypeScript check passed"
        return 0
    else
        log_error "TypeScript found type errors"
        return 1
    fi
}

cmd_build() {
    log_step "Building Project"

    if npm run build; then
        log_success "Build completed successfully"
        log_info "Output: ./dist/"
        return 0
    else
        log_error "Build failed"
        return 1
    fi
}

cmd_check() {
    log_step "Running All Checks"

    local failed=0

    echo ""
    log_info "Step 1/3: ESLint"
    if ! npm run lint 2>&1; then
        log_error "ESLint failed"
        failed=1
    else
        log_success "ESLint passed"
    fi

    echo ""
    log_info "Step 2/3: TypeScript"
    if ! npx tsc --noEmit 2>&1; then
        log_error "TypeScript check failed"
        failed=1
    else
        log_success "TypeScript passed"
    fi

    echo ""
    log_info "Step 3/3: Build"
    if ! npm run build 2>&1; then
        log_error "Build failed"
        failed=1
    else
        log_success "Build passed"
    fi

    echo ""
    if [ $failed -eq 0 ]; then
        log_success "All checks passed! Ready to push."
        return 0
    else
        log_error "Some checks failed. Please fix before pushing."
        return 1
    fi
}

cmd_status() {
    log_step "Project Status"

    echo -e "${BOLD}Git Status:${NC}"
    git status --short
    echo ""

    echo -e "${BOLD}Current Branch:${NC}"
    git branch --show-current
    echo ""

    echo -e "${BOLD}Last 3 Commits:${NC}"
    git log --oneline -3
    echo ""

    if command -v gh &> /dev/null; then
        echo -e "${BOLD}CI/CD Status:${NC}"
        gh run list --limit 3 2>/dev/null || log_warning "Could not fetch CI status"
    else
        log_warning "Install GitHub CLI (gh) to see CI status"
    fi
}

cmd_push() {
    log_step "Check and Push"

    # Check for uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        log_warning "No changes to commit"
        return 0
    fi

    # Run checks first
    log_info "Running pre-push checks..."
    if ! cmd_check; then
        log_error "Checks failed. Push cancelled."
        return 1
    fi

    echo ""
    log_info "All checks passed. Ready to commit."
    echo ""

    # Show what will be committed
    echo -e "${BOLD}Files to commit:${NC}"
    git status --short
    echo ""

    # Ask for commit message
    echo -n "Enter commit message: "
    read commit_message

    if [ -z "$commit_message" ]; then
        log_error "Commit message cannot be empty"
        return 1
    fi

    # Commit and push
    log_info "Committing..."
    git add .
    git commit -m "$commit_message"

    log_info "Pushing to GitHub..."
    git push origin main

    log_success "Pushed successfully!"

    # Show CI status
    if command -v gh &> /dev/null; then
        echo ""
        log_info "Waiting for CI to start..."
        sleep 3
        gh run list --limit 1
    fi
}

cmd_deploy() {
    log_step "Full Deployment"

    # Run push command (includes checks)
    cmd_push

    if [ $? -ne 0 ]; then
        log_error "Push failed. Deployment cancelled."
        return 1
    fi

    # Monitor CI
    if command -v gh &> /dev/null; then
        echo ""
        log_info "Monitoring CI/CD pipeline..."
        echo "(Press Ctrl+C to stop watching)"
        echo ""

        gh run watch

        echo ""
        log_success "Deployment complete!"
        log_info "Visit: https://lxusbrain.com"
    else
        log_warning "Install GitHub CLI (gh) to monitor deployment"
        log_info "Check status at: https://github.com/san-gitlogin/lxusbrain-website/actions"
    fi
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    # Get the script directory and change to project root
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
    cd "$PROJECT_DIR"

    check_directory
    check_tools

    local command="${1:-help}"

    case "$command" in
        help)
            cmd_help
            ;;
        lint)
            cmd_lint
            ;;
        types)
            cmd_types
            ;;
        build)
            cmd_build
            ;;
        check)
            cmd_check
            ;;
        status)
            cmd_status
            ;;
        push)
            cmd_push
            ;;
        deploy)
            cmd_deploy
            ;;
        *)
            log_error "Unknown command: $command"
            echo ""
            cmd_help
            exit 1
            ;;
    esac
}

main "$@"
