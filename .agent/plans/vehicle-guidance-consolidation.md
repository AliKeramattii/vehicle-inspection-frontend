# Sedan guidance consolidation

## Goal
Finish the approved supplied-asset audit in the canonical integrated worktree only.

## User-visible behavior
Use supplied readiness art, four VIN/spec location choices before live capture, faint photo-only ghosts, and distinct walk-around guidance.

## Current state
Main 2D defaults already use sedan; six supplied guide files are not wired. Camera has no ghost; recorder incorrectly uses photo ghosts. Sportage GLB is restricted to loopback development. Eight unrelated tracked edits must remain intact.

## Constraints
No changes to optional 3D code/model/licensing, historical PNGs/baselines, routes, evidence identity/counts, queues, admin/reviewer or Neshan. No gallery fallback. Existing palette, RTL and AppViewport.

## Implementation
1. Preserve hashes and inventory; inspect code/references.
2. Copy missing supplied readiness/technical images to stable paths and extend registry.
3. Add shared, scoped transient VIN choice presentation reused by guide/camera/review; retain requirement IDs.
4. Add separate DOM photo alignment layer with view mapping; never composite it into media.
5. Remove recorder ghosts; resolve matching cleared 4–5 second orbit-preview asset availability without changing 3D.
6. Add tests, inspect screenshots at 360/390/430, document limitations.
7. Validate, review intended diff, commit and push normally.

## API impact
None. Choice is transient guidance context; captured evidence and repository contracts remain unchanged.

## Testing
Lint, typecheck, unit suite, focused browser navigation/media/viewport tests, production build; review affected images manually. Hash checks protect unrelated files, optional 3D and historical baselines.

## Acceptance criteria
- [x] Readiness uses exact supplied assets.
- [x] Four accessible VIN choices preserve identity and live-only capture.
- [x] Still-camera ghosts match views and remain outside saved evidence.
- [x] Recorder uses no photo ghosts; preview limitation resolved or explicitly documented.
- [x] Tests/process exits and mobile visual review recorded.
- [x] Protected hashes unchanged; focused implementation commit/push independently verified.

## Progress
- [x] Audit, canonical Git recovery and reference inspection.
- [x] Asset wiring, four VIN choices and photo overlays implemented.
- [x] Video ghost removal and safe static guidance implemented.
- [ ] Matching cleared 4–5-second 3D orbit clip: blocked by missing asset/clearance.
- [x] Validation and visual review: lint/typecheck/build exit 0, 400 unit tests, 21 focused and 69 regression browser passes. Four new baselines only.
- [x] Documentation and Git: implementation 893af1e0aa0a2c99517bd814c357f3395a5984a4 pushed; validation follow-up records actual results.

## Discovery
Only available GLB is the unchanged, noncommercial Sportage model; no matching sedan orbit clip/model supplied. User clarification requested while unrelated approved work proceeds.

## Final review
All 662 protected hashes match. Unrelated eight tracked edits remain unstaged. No model, historical automotive image or old baseline was changed. The task remains partially complete because the requested animated sedan orbit clip is unavailable; do not label the static path as that deliverable.

Implementation remote verification: origin/feat/unified-ui-admin-3d returned 893af1e0aa0a2c99517bd814c357f3395a5984a4. Final overall status remains PARTIAL solely for the missing cleared animated orbit preview.
