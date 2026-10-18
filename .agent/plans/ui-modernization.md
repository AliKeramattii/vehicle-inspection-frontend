# UI modernization, optional licensed viewer and reviewer operations

## Goal
Deliver the attached 2026-10-12 brief on an isolated White-Label/Admin base: unified identity and truthful green completion, live-only capture, configured real Neshan map, optional development-only mobile GLB and durable local reviewer assignment/decisions.

## User-visible behavior
Default customer photography remains 2D, seven sections and twelve photographs plus separate odometer/video. Controls stay below the vehicle. Optional 3D shares the same requirements and downstream workflow, with twelve fixed accessible overlay markers. Live media never offers gallery selection. Site Admin assigns cases; reviewers see and decide only their own cases, requesting only rejected evidence.

## Current state
Base 9c75417 includes Admin and White-Label; Phase09 c190012 is isolated. Dedicated branch feat/ui-modernization-2d-3d in C:/Projects/vehicle-inspection-ui-modernization. Original dirty worktree and the separate clean static-export worktree are untouched. Existing source/assets/SDK boundaries are reviewed; no backend mode is enabled. Supplied refinement bundle has no new app logo or Neshan credential. Existing platform-car mark is the established application mark.

## Constraints
Preserve RTL, Vazirmatn, AppViewport/100dvh, routes and durable evidence/replacement/upload/submission/request architecture. No static migration, backend/deployment, canonical vehicle replacement, restricted model publication, main merge or force push. Success #059669 is independent of theme. Upload completion is not reviewer approval. Optional GLB accessible only under development + explicit flag + loopback; production remains denied.

## Implementation
1. Shared co-branding, tel support, OTP five attempts, completion colors and supplied UI assets.
2. Neshan client adapter with honest unconfigured state, user-triggered geolocation; persisted ten-color vehicle control.
3. Photography nav artwork, guide Lucide icons and readable progress; selectively reuse c190012 loader/scene, one mobile model and fixed requirement markers.
4. Remove native file-selection paths; improve live video kit composition without fabricated coverage/quality.
5. Extend mock operations with serialized durable assignments, capacity-aware injectable randomness, exact revision decisions and existing Additional Evidence request linkage; new bounded reviewer queue/workspace and Admin assignment settings.
6. Focused tests, screenshots at customer and operations viewports, docs, lint/typecheck/unit/build, safe focused commit/push.

## API impact
Existing contracts remain planned/mock. Public Neshan web-map credential is configuration only; private reverse geocoding stays behind adapter. Reviewer/assignment future authorization and concurrency belong to ASP.NET; no real requests beyond configured map tiles.

## Testing
Run actual scripts, focused Playwright coverage for changed interactions and regression paths. Manually inspect screenshots; do not blanket update snapshots. Verify live capture cleanup, twelve-marker upload semantics, exact revision retakes, assignment permissions/capacity, no document overflow and no default GLB downloads.

## Acceptance criteria
- [x] Co-branding/runtime phone, five OTP attempts and truthful green success.
- [x] Configurable Neshan and ten persisted vehicle colors.
- [x] Supplied photography navigation/guide icons and fixed twelve-marker dev-only optional viewer.
- [x] Live-only photo/video capture with durable replacement and clean media lifecycle.
- [x] Durable bounded reviewer assignment, own-case authorization and exact evidence decisions.
- [x] Customer/operations screenshots reviewed, focused tests and technical validation exit successfully.
- [x] Docs, preservation/security review and focused Git delivery.

## Progress
- [x] Inspect branches/worktrees; isolate approved White-Label base without modifying unrelated work.
- [x] Locate supplied assets and inspect primary photography, reviewer and 360 design references.
- [x] Implementation checkpoints above.
- [x] Validation and delivery.

## Design review
PRESERVE brand, targeted modernization. Reference 07 controls are intentionally relocated below the image per current product decision. Vehicle/evidence imagery remains primary. Design variance 3–4, motion 2, customer density 6. Use role-based typography, restrained borders and explicit stage-specific success. No logo/vehicle generation. The kit's static scene, 65% and quality checks are not real measurements and will not be used as such.

## Discoveries / deviations
Existing readiness local drift stays in the original worktree, never copied or fixed. Optional WebGL is not a customer readiness blocker. Missing Neshan credential requires honest unavailable UI. Existing application mark is reused because no distinct approved replacement logo was supplied.

## Final validation and discoveries
2026-10-13: lint, typecheck, all 284 unit tests in 23 files and production build exit 0.
Focused owned-server development browser run exits 0: six applicable scenarios passed / six skipped. Production focused run exits 0: five passed / seven skipped, including denied GLB. Twelve existing behavioral regressions exit 0; historical snapshot comparisons are not claimed as passing or rewritten.
Actual mobile GLB rendered, fixed twelve 44px markers survived rotate/zoom, view switching and 2D/3D toggle issued one model download. Production endpoint 404 and production has no 3D toggle. Customer and operations screenshots reviewed; no document overflow at target viewports. Existing 24-file original-worktree preservation snapshot matches, including its four pre-existing deleted SVGs.
Early fixture/navigation races, reviewer plate wrapping, assignment-table shrink, Windows teardown PATH and stale development cache were resolved; final process exits were observed. See UI_REFINEMENT.md for exact warnings and missing-key/mock/licensing limitations.
Docs, source/runtime mappings and preservation/security review are complete. No canonical vehicle assets or screenshot baselines changed. Implementation commit 93d9266c7aec2311492f88293ccc4cf1ab689c93 was pushed normally to origin/feat/ui-modernization-2d-3d and remote HEAD was verified equal. No merge into main occurred. Final documentation records this delivery separately.
