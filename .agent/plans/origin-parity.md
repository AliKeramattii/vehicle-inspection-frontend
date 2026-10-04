# Phase-01 development origin parity

## Goal
Both localhost and the machine's LAN address serve the same Phase-01 landing and mock workflow from clean browser contexts, without visual changes or phase 02.

## User-visible behavior
Fresh navigation to `/` shows an empty referral input. Referral A4K9P2 and OTP 12345 work on either origin. Reloads do not retain mock login.

## Current state
Existing uncommitted user changes affect AGENTS.md, three icons, entry.css, landing-benefits.tsx, and referral-form.tsx; preserve and exclude them from this task commit. Both origins return identical landing HTML with no-cache. No hostname routing, persistent auth storage, middleware, or service-worker registration exists. Serwist is installed for future PWA work. Next 16.3.8 restricts development asset origins; investigate in fresh browsers before changing configuration.

## Constraints
Preserve completed UI, mocks, repository boundaries, and future PWA architecture. No hardcoded LAN address, global storage clearing, extra dependencies, or phase 02. Git changes must be narrowly staged.

## Implementation
1. Reproduce both origins with Playwright and inspect assets, errors, service workers, storage, and initial state.
2. Fix only proven development configuration issues; explicitly bind dev to 0.0.0.0 if useful.
3. Add repeatable origin-parity regression tests and document development reset instructions.
4. Run lint, typecheck, unit/browser tests, build, inspect diff, commit and push task files only.

## API impact
None. Existing mock referral and OTP repository behavior remains unchanged.

## Testing
Fresh contexts at 390 x 844, both actual port-3000 origins, exact landing screenshot comparison, static/image/font loading, mock success, reload recovery, console/network errors, and no persisted auth. Existing production browser regressions remain intact.

## Acceptance criteria
- [x] Reproduced LAN HMR rejection and documented browser-history limits.
- [x] Both development origins render identical initial landing and mock workflow.
- [x] Static assets work without browser errors; no development worker registration.
- [x] Relevant validation passes; pre-existing reference mismatch reported; user changes preserved and focused Git changes reviewed.

## Progress
- [x] Read project instructions/index/plan format and inspect Git state/config/source.
- [x] Reproduce LAN HMR origin failure and allow discovered local addresses only in development.
- [x] Add parity coverage/reset documentation and validate.
- [x] Review intended diff and prepare focused commit; Git result is reported in the completion report.

## Findings and validation
- Both initial HTML responses and fresh landing geometry were already identical. No persisted auth or service worker exists. The historical user's open tab/profile was unavailable; do not claim inspection of its storage.
- Next's installed block-cross-site-dev implementation rejects LAN HMR Origin by default. After allowlisting local interface addresses, both origins receive HMR frames and complete referral/OTP with no browser errors.
- Direct port-3000 parity and managed port-3102 parity pass, including visual comparison at 390 x 844, same-origin assets/font, no overflow or auth storage, and reload reset.
- Lint/typecheck, 23 unit tests, and production build pass. Production Playwright: 18 pass, one intentional desktop skip, one pre-existing landing baseline mismatch (615 pixels at the user-edited label and three icons). Preserve both user edits and baseline.
- New tests initially used byte-exact PNG comparison; 64 edge-antialias pixels differed without structural change. Standard Playwright visual comparison with zero differing pixels and its usual color threshold passes.
- Separate development artifact paths prevent concurrent suite trace cleanup collisions. Exclude ignored QA/traces from ESLint. A temporary probe script that failed lint was deleted; final lint passes.
- Windows npm.ps1 is execution-policy blocked; npm.cmd works without policy changes. In this managed environment Playwright server teardown stalled; only the two known test-server listener PIDs were stopped, and both runs then returned their final status.
- Existing image components were reformatted by user work during the investigation; preserve/exclude these too. No UI, mock, API, reference, or dependency changes belong to this fix.
