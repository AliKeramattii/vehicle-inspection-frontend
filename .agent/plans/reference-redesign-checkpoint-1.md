# Reference-driven redesign, Checkpoint 1

## Goal
Redesign four representative screens in the canonical integrated worktree, then stop for visual approval.

## User-visible behavior
Vehicle-led landing and photography; coherent settings navigation and preview; evidence-first reviewer workspace. Existing routes and domain behavior remain.

## Current state
Branch feat/unified-ui-admin-3d starts at 8eed67bf93d764f6984bbe12db78f2f4324fefd4. Nineteen existing dirty files are protected by the local preservation.json manifest. Four of five actual reference images inspected; Wreckbook 404, user explicitly authorized continuing. Existing AppViewport, RHF forms, IDB, mock repositories, optional gated 3D and white-label tokens already work.

## Constraints
Only this worktree; no baseline updates before approval. Latest user brief supersedes older exact-PNG layout preservation for these four screens. Preserve sedan assets, dirty globals/schema/config/assets, business data, URLs, form names, labels, legal copy, camera/queue/reviewer permissions and 3D licensing. No dependency, backend, static-export or model changes.

## Implementation
1. Audit and record reference matrix in docs/REFERENCE_DRIVEN_REDESIGN_PLAN.md.
2. Capture all four BEFORE screens at the target viewports using existing real mock workflows.
3. Scope original presentation changes to landing, photography overview, site settings and reviewer evidence.
4. Capture AFTER; inspect and iterate at customer 360/390/430 and desktop 1024/1280/1440.
5. Run focused functional regression, lint/typecheck/unit/build, preserve hashes and inspect diff.
6. Commit/push focused changes, report screenshots, stop for visual approval.

## API impact
None. Existing services/repositories, typed photo IDs and evidence are unchanged.

## Testing
New candidate-capture/interaction coverage without snapshot approval; existing marker/navigation/viewport/settings/reviewer tests; relevant camera/queue/retake regressions. Check errors, focus, overflow and safe areas.

## Acceptance criteria
Four visibly restructured screens, controls below vehicle, accessible honest state/preview, actual before/after evidence, validations reported accurately, protected files unchanged, no later checkpoint work.

## Progress
- [x] Repository, architecture and reference audit
- [x] Four actual reference visuals inspected; fifth failure documented
- [x] BEFORE captures and inspection
- [x] Four representative screen implementations
- [x] AFTER captures, inspection and corrections
- [x] Validation and preservation audit
- [ ] Focused commit/push; stop for visual approval

## Validation discoveries
Final lint/typecheck/400 unit tests/build each exit 0. Functional browser run:66 pass; final production photo regression:13 pass; final operations regression:3 pass; candidate review:4 pass per development/production mode; optional licensed local viewer:1 pass; deep settings workflow:1 pass. Legacy snapshot debt and obsolete receipt-wrapper test documented, not concealed or overwritten. No baseline updates. All799 protected paths match except the earlier-authorized schema import suffix; schema remains unstaged.

## Visual corrections
Removed extra photo-heading height and unused scene padding, preserving actual artwork scale/marker coordinates. Reviewer facts moved into the scrollable decision rail so evidence gains both width and height; decisions remain pinned. Settings preview is shared with its existing dialog and handles failed draft assets. User visual approval is still pending; later checkpoints stay deferred.
