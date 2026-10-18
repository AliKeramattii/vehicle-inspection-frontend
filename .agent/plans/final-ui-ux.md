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
- [x] Checkpoint 2: shared design/accessibility presentation.
- [x] Checkpoint 3: customer UI and evidence experience.
- [x] Checkpoint 4: Admin UI.
- [x] Checkpoint 5: Reviewer UI.
- [x] Checkpoint 6: cross-application quality.
- [x] Checkpoint 7: final QA executed and report written; historical visual approval and physical-device/export gates remain open. Final Git delivery is recorded in the completion response.

## Discoveries
Live functional verification passed five tests (exit 0) with actual decoded Neshan base tiles and Persian addresses; no speculative recovery patch needed. Baseline units 454/37 passed. BEFORE capture helper now eagerly decodes otherwise-lazy images and isolates submitted/retake scenarios. Production code remains unchanged at this checkpoint.

Shared checkpoint: semantic size roles added without color/font replacement. Native dialog skips hidden form controls, uses existing SVG close icon and restores connected trigger focus without scrolling. Focus regression passed; lint/typecheck passed. jsdom lacks native dialog methods, so its test supplies explicit methods; browser checks retain real native dialogs.

Customer checkpoint: vehicle scene keeps a 300px minimum and all controls below; selected requirement has derived status/distance/height and next-required selection. Cards use 13px titles. Upload status breakdown separates processing/verification/failure/scheduled retries. Review preserves original evidence and labels pending acceptance. Setup type and receipt/recording explanations refined. Production screenshots inspected at 390px; short viewports use the existing internal scroll to reach shot cards. Four capture groups passed (exit 0); 455 units passed, new presentation group 29/29, build/lint/typecheck passed.

Admin checkpoint: six native color pickers pair with original registered HEX fields and per-role hints, unchanged draft/publish/contrast rules. Sticky table headings and keyboard row context. Color field regression and 31 related unit tests passed; Admin keyboard/preview/focus browser test passed; light/dark and four operations sizes captured and inspected.

Reviewer checkpoint: selected evidence shows media kind and actual upload/processing/verification label, separately from human decision. Larger filmstrip type, queue review progress derived from exact current revisions, stable evidence/workspace loading. Keyboard details/next-item check passed; evidence-first screenshots inspected. No assignment/revision/decision service changes.

Cross-app checkpoint: bounded controls/markers verified at 320/360/390/430/768 and landscape. Corrected the development-only optional wrapper height without touching model/GLB. Full twelve camera captures → odometer → actual mock recorder → durable video → upload → submit → receipt refresh/edit lock passed. Reauthentication recovery now explains expired mock workflow without blaming persisted facts, with evidence-preservation test. Unit suite 457/40, lint/typecheck exit 0; full historical browser suite in progress. No document overflow in 107 BEFORE and 107 reviewed intermediate captures.

## Urgent scope override: protected Neshan
User correction freezes Location/Neshan, including surrounding layout. Pre-task restore point e36054d; no task-introduced SDK/map/proxy/provider/rewrite changes exist. Restored missing locked dependencies after frontend 500; current live browser five cases passed. Shared textarea focus rule is scoped away from Location. See docs/NESHAN_PRESERVATION.md. Future work on this task is other UI plus Neshan regression verification only. Preserve external ded3696 documentation commit, existing manual schema edits and unrelated nested checkout.

## Final QA outcome
Post-recovery lint/typecheck/build exited 0; 457 units in 40 files passed. Built-app review/quality: 10 passed, 10 role-project skips, exit 0. Real authorized Neshan/recovery: 5 passed, exit 0. Existing Admin contrast/focus: 1 passed, 1 skip, exit 0. Final complete historical suite: 226 passed, 169 skipped, 45 failed, exit 1; 42 visual/missing-baseline cases and three outdated header/reference expectations. No approved baseline was updated. Five auto-emitted missing snapshot candidates were moved into ignored QA evidence. Full report and eight portable QA images are in docs. Receipt fit and landing geometry are corrected; physical devices/static export and visual-baseline reconciliation remain explicitly unverified. Preserved all unrelated user work and independent README commit.
