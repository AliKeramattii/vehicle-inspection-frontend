# Final frontend UI/UX polish and functional verification

## Goal
Deliver noticeable, tested presentation/usability improvements across the existing customer, Admin and Reviewer interfaces, with a written audit, BEFORE/AFTER evidence and truthful final verification. Preserve the implemented product and production boundary.

## User-visible behavior
A clearer guided mobile inspection; legible selected/photo/evidence/upload/review states; usable short-screen forms and actions; coherent Admin settings; evidence-first Reviewer decisions. The exact WebP/default Admin palette and per-brokerage customer identity remain. No new business workflow or production backend is introduced.

## Current state
Canonical C:/Projects/vehicle-inspection-integrated, branch feat/unified-ui-admin-3d, starting e36054d. There are nineteen unrelated tracked modifications and an old untracked logo copy. Existing logo/Admin palette tasks are validated and pushed. Development Neshan/public runtime config and private reverse credentials exist locally; no credential values are recorded. Recent joint recovery tests passed, but this phase must verify the live browser again. Historical visual baselines represent multiple older designs and the pre-existing readiness mismatch is not a reason to overwrite them.

## Constraints
Only this worktree/branch; no stash/reset/force push or main merge. Preserve unrelated user file hashes and local settings. Preserve seven sections/twelve photos, odometer as data, video as separate media, revisions/atomic replacements, camera-only evidence, uploads/offline/retake/submission locks and optional 3D. No GLB/vehicle-art changes, real API implementation, new production Node routes/server actions, framework/provider/repository duplication or secrets. Native Persian RTL/Vazirmatn, physical orientation and AppViewport remain. Physical-device checks are NOT DONE unless actual hardware is available. No claim of static export success without a real export test.

## Implementation
0. Inspect all source/roles/assets/references, inventory routes/components/risks in docs/FINAL_UI_UX_AUDIT.md, capture at least twenty BEFORE states and baseline validation.
1. Verify actual Neshan SDK/base tiles/reverse/config/services and readiness denial/recheck/continuation; fix only demonstrated causes. Check end-to-end customer navigation before major visuals.
2. Refine shared typography/controls/focus/dialog/state presentation with existing primitives and scoped tokens; preserve exact logo and Admin colors.
3. Polish customer setup, vehicle/photography selection/guidance/review, recorder, uploads/summary/receipt/retakes in related tested groups; preserve domain helpers.
4. Refine Admin configuration workspace, forms/tables/drafts/actions and responsive navigation using the existing palette and state.
5. Refine Reviewer queue/evidence/decision status hierarchy and responsive controls; preserve authorization and exact-item revisions.
6. Audit/refine cross-interface loading/error/offline feedback, mixed-direction inputs, reduced motion, focus/touch/short viewport behavior and media efficiency.
7. Capture AFTER at matching viewports, execute repository lint/typecheck/unit/build and relevant functional/visual suites, record physical-device checklist and limitations in docs/FINAL_UI_UX_COMPLETION_REPORT.md.
After each checkpoint review/test/inspect, commit intended changes and push normally; verify remote. Do not start another phase.

## API impact
None. Record existing mock/backend handoff limitations without designing new contracts.

## Testing
Real authorized Neshan at localhost:3114 with no intercepted tiles/reverse; isolated browser storage only. Readiness no automatic permission requests, denied/supported/recheck paths. Deterministic mock customer capture/odometer/video/upload/submit/retake, Admin draft/publish/roles and Reviewer assignment/decisions. Customer 320x568,360x800,390x844,430x932,768x1024 and relevant landscape; operations 1024x768,1280x800,1440x960,1920x1080. Inspect actual screenshots, console/resource errors, bounds, focus, touch, contrast and cleanup. Keep historical screenshots separate; no blind updates.

## Acceptance criteria
Working live map where configured and truthful readiness recovery; actual meaningful UI changes; no domain/route/API/asset regressions; all twelve requirements remain usable; responsive and keyboard checks; verified command exits; organized BEFORE/AFTER and audit/completion documents; no secret/unrelated staged files; checkpoint commits/push verified. Report any blocked/untested criterion explicitly.

## Progress
- [x] Checkpoint 0: audit, references, baseline captures/tests.
- [x] Checkpoint 1: live functional recovery and customer progression.
- [ ] Checkpoint 2: shared design/accessibility presentation.
- [ ] Checkpoint 3: customer UI and evidence experience.
- [ ] Checkpoint 4: Admin UI.
- [ ] Checkpoint 5: Reviewer UI.
- [ ] Checkpoint 6: cross-application quality.
- [ ] Checkpoint 7: final QA/report/Git delivery.

## Discoveries
Live functional verification passed five tests (exit 0) with actual decoded Neshan base tiles and Persian addresses; no speculative recovery patch needed. Baseline units 454/37 passed. BEFORE capture helper now eagerly decodes otherwise-lazy images and isolates submitted/retake scenarios. Production code remains unchanged at this checkpoint.
