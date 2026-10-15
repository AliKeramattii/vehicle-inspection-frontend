# Frontend functional completion and canonical integration

## Goal
Integrate approved premium refinement into the existing canonical feat/unified-ui-admin-3d worktree, audit customer/Admin/Reviewer interactions, fix reproducible P0/P1 frontend defects and document remaining boundaries.

## User-visible behavior
Preserve approved appearance, routes, 12 photos + separate odometer/video, durable evidence/uploads, exact retakes, local-only optional GLB, authorized Neshan and Recorder V2. No backend or static export migration.

## Current state
Canonical eb8a183 is ancestor of refinement 7e71205. Eight local edits preserved in ignored byte-for-byte backup with hashes. Only globals.css intersects refinement; it is formatting-only locally, while refinement adds one import. No existing staged changes.

## Constraints
One active canonical worktree, no new worktree/stash/reset, no unrelated changes committed. Preserve historical worktrees, secrets, licenses and canonical imagery. Mock roles/publication are not production security. Existing AppViewport retained.

## Implementation
1. Preserve local byte snapshots, fast-forward approved refinement, retain local globals formatting plus approved import.
2. Read feature docs/routes/repositories/tests and build evidence-backed inventory.
3. Execute broad unit/browser functional checks, authorized live map/model checks, investigate historical visual debt without snapshot laundering.
4. Reproduce and fix safely scoped P0/P1 defects with regression coverage.
5. Write completion audit, fixes and categorized remaining-work documents; update canonical workflow guidance.
6. Validate commands with actual exits, inspect diff/secrets/preservation and push focused canonical commits normally.

## API impact
No implemented backend. Existing planned ASP.NET contracts and private INSPECTION_{InspectionId} convention preserved.

## Testing
Actual lint/typecheck/test/build scripts, relevant existing Playwright plus targeted regressions, real authorized Neshan and local GLB if configured; 360x800/390x844/430x932 and desktop 1440x960. Historical obsolete visual failures recorded separately.

## Acceptance criteria
- Approved refinement on canonical branch with all local work retained.
- Every implemented route/feature classified by evidence, not component presence.
- Safely resolvable discovered P0/P1 fixed and tested.
- Backend/device/PWA/static limitations explicit.
- Intended changes committed/pushed, remote verified, unrelated edits unstaged.

## Progress
- [x] Request, initial Git state, ancestry and local diffs inspected.
- [x] Approved refinement integrated by fast-forward to 7e71205; local CSS formatting retained plus approved import.
- [x] Full feature inventory/source review; matrix in FRONTEND_COMPLETION_AUDIT.md.
- [x] Three P1 corrections, two unit regressions and four browser scenarios; broad functional173 and premium8 pass, historical suite failures explicitly classified.
- [x] Three required documents; lint/typecheck/374 units/build exit 0; real Neshan and GLB checks each exit 0.
- [ ] Focused commit/push and preservation verification.
