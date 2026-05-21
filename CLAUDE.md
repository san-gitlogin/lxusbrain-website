# CLAUDE.md — lxusbrain-website

Repo-local instructions for the website. The full project context (app +
website monorepo) lives in the parent workspace `D:\lxusbrain\CLAUDE.md`;
this file repeats only what is essential for safe work *within this repo*.

## Critical operational rules — read EVERY session

### Deploy mechanics (cost-safe — DO NOT deviate)

- **Live host:** GitHub Pages from the `gh-pages` branch + `CNAME lxusbrain.com`. Vite `base: '/'`, so `public/<file>` → `dist/<file>` → `https://lxusbrain.com/<file>`.
- **`firebase.json` is misleading.** Firebase Hosting is NOT used for the live site (the `deploy-firebase` CI job is an echo-only stub). Firebase = Firestore + Storage + Functions only.
- **Deploy method = `npm run deploy` (local, $0 CI).** Runs `predeploy` (`npm run build` locally) then `gh-pages -d dist --dotfiles`, which pushes built `dist/` to the `gh-pages` branch. `gh-pages` is NOT in `ci.yml`'s trigger list → no CI run.
- **Confirmed by git history (2026-05-20):** every recent commit on `origin/gh-pages` is `san-gitlogin | deploy: <hash>` — the local `gh-pages` npm tool's signature. The CI `deploy-gh-pages` job exists but the maintainer has always deployed locally.

### What costs money (and why we don't do it for content)

`.github/workflows/ci.yml` triggers on `push` to `main`/`develop`/`feature/**` and PRs to `main`. `paths-ignore` excludes ONLY `**.md` and `.gitignore` — every other file type (`.ts/.tsx/.json/.css/...`) triggers a full ~$0.60 run (lint + Firebase rules tests + build + deploy + audit).

- **Content / static-asset updates (homepage copy, images, `public/tts-status.json`, `FALLBACK_RELEASE` data, etc.):** edit → `npm ci && npm run build && npm run preview` → curl-verify → `npm run deploy`. **NEVER** commit just to publish — that spins CI for nothing.
- **Real code changes (components, deps, bug fixes):** push to `main` is fine — CI gates Firebase security rules + build, which is worth the ~$0.60. Batch related changes into one push; never iterate to fix small things.

### Pre-deploy sanity (never skip)

1. `git rev-list --left-right --count origin/main...HEAD` must be `0 0`. `gh-pages -d dist` REPLACES the live site with your local build — a stale tree regresses production. Pull/rebase first if behind.
2. `npm ci` (clean install, not `npm install`).
3. `npm run lint` and `npx tsc --noEmit` — both must be green.
4. `npm run build` then `npm run preview` and `curl http://localhost:4173/<changed-file>` to verify the served bytes.
5. Only then `npm run deploy`. Allow ~1–2 min for GitHub Pages CDN.

### Things NEVER to do

- Push directly to `gh-pages` by hand. Use `npm run deploy`.
- Disable `ci.yml`. The Firebase security-rules tests are a real gate.
- Add a `hosting:` block to `firebase.json` thinking it'll start serving the site — it won't; gh-pages owns the domain via CNAME.
- Build with the npm cache in a corrupt state — see `build_lessons` memory for the corruption pattern + fix.

## Pointers (deeper context lives elsewhere)

- Parent workspace rules: `D:\lxusbrain\CLAUDE.md`
- App repo (sibling): `D:\lxusbrain\lxb-termivoxed\CLAUDE.md` — Critical Invariants section covers cross-repo concerns (versioning, signed manifest, etc.)
- Skill `ci-cd-pipeline` — "Website CI/CD" section has the full triggers + jobs breakdown
- Skill `website-compliance` — feature-parity checklist (what the app must deliver based on website promises) + which 6 files must be edited together when pricing/feature flags change
- `docs/TTS_UPDATE_SIGNING.md` (in the app repo) — full runbook for publishing `tts-status.json`
- Auto-memory `feedback_push_costs`, `tts-dependency-update-architecture`, `signing-key-custody`

## Conventions specific to this repo

- React 19 + TypeScript + Vite + TailwindCSS + Radix UI + Framer Motion + Three.js.
- Firebase SDK (web) for auth + Firestore; configured via `VITE_FIREBASE_*` env vars at build time.
- Razorpay (NOT Stripe — Indian company, INR).
- Download page (`TrialPage`) fetches releases from `https://api.github.com/repos/LxusBrain/termivoxed/releases/latest`; falls back to hardcoded `FALLBACK_RELEASE` in `src/lib/github-release.ts` when the API is unavailable. The release script `lxb-termivoxed/build_tools/release_local.py` updates that fallback automatically.
- File-name patterns the download page expects (don't change without updating the matching app-side release script):
  - Windows: ends with `-setup.exe` (case-insensitive matches `-Setup.exe`)
  - macOS: ends with `-macos.dmg`
  - Linux: contains `-linux-` and ends with `.tar.gz`
