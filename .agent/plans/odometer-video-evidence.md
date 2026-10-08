# Phase 05: odometer data and walk-around video

## Goal
Extend the local inspection package with a manual integer odometer reading and a required continuous walk-around video, without changing the seven-section/twelve-photo template or production 2D photography.

## User-visible behavior
Odometer review keeps the cluster image visible and permits entering/editing kilometers. Once photos are complete, the next action derives from missing odometer/video data. Video capture uses the established dark camera treatment, an instructional 2D orbit, real recorder timer, native capture fallback, durable draft review and atomic replacement. Final local review shows three separate groups and never claims submission/upload success.

## Current state
HEAD is 107eb25 on main, following interactive marker commit f375761. PhotoStore owns durable photo drafts/accepted blobs in IndexedDB; TanStack Query owns repository results. Thin App Router pages delegate to PhotographyWorkflow. AppViewport already bounds the application. Twenty-two unrelated tracked working-tree changes (including the readiness mismatch) were snapshotted under ignored .agent/reference-review/phase05-start and must remain outside this commit.

## Constraints
Preserve all photo counters, markers, crop/control composition, continuation and replacement rules. No real backend, upload center, asset replacements, new dependencies or production 3D. Persian RTL, technical LTR, 44px targets, reduced motion, one internal vertical scroll region. MediaRecorder MIME capability is detected at runtime; permissions are requested only on user action. All media handles/timers/object URLs must be released.

## Implementation
1. Add typed supplemental template requirements, odometer parsing/formatting and derived package completion/next action.
2. Add a local capture-data repository using IndexedDB, isolated from the existing photo database; keep accepted video and draft separate in atomic transactions. Use Query/mutations, not global duplicated business state.
3. Integrate odometer entry into PhotoReview; preserve photo credit/value across replacement and allow accepted-value editing.
4. Add isolated recording service/hook and thin video capture/review routes under the existing capture scaffold. Reuse camera service, buttons, alerts, viewport and supplied orbit assets.
5. Update final local review and completed-photo actions, keeping photo count derived solely from PhotoRequirements.
6. Add unit/browser lifecycle, persistence, completion, fallback and responsive tests. Inspect actual screenshots against references 11/12 before adding intended baselines.
7. Update photography/API documentation; validate actual scripts and review focused staging before normal commit/push and remote verification.

## API impact
Planned PUT /api/inspections/{inspectionId}/odometer accepts integer kilometers and optional evidenceId. Generic planned evidence registration supports kind photo/video-360, MIME, bytes and duration; no video-specific endpoint or runtime HTTP calls. Local IndexedDB repository is the current durable boundary, not a production backend.

## Testing
Digits/separators/zero/invalid/overflow, persisted editing, separate completeness; recorder capability/MIME/events/failure/cleanup; video atomic replacement and retake; deterministic browser capture/native fallback. All existing photo/marker/origin regressions. Review 360x800, 390x844, 430x932 plus keyboard resize. Run lint/typecheck/unit/full Playwright/build with real successful exits. Preserve/report the known root readiness mismatch and verify focused committed source separately if needed.

## Acceptance criteria
- [x] Twelve-photo totals unchanged; numeric odometer and video are separate typed requirements.
- [x] Odometer entry/edit survives workflow restart and photo replacement.
- [x] Video recording/fallback/review is durable and atomic, with strict cleanup.
- [x] Package completeness and missing-task action have one derived source.
- [x] Three mobile viewports fit AppViewport; approved Phase04 layout/markers remain intact.
- [x] Tests, reviewed baselines and planned API documentation reflect the implementation.
- [ ] Intended changes validated, committed and pushed; unrelated user work unchanged.

## Progress
- [x] Repository state, boundaries and canonical references inspected; user files snapshotted.
- [x] Domain/local repository implemented.
- [x] Odometer/video UI integrated.
- [x] Unit/browser/visual validation completed.
- [x] Documentation and preservation review.
- [ ] Focused commit/push and remote verification.

## Discoveries and verification
- Local persistence uses a separate IndexedDB database, avoiding changes to accepted photo records or existing database fixtures.
- Initial new browser failures were test fixture issues: photo-only camera asset lookup on a video route, whitespace in accessible category names, and a generated single-frame clip with invalid duration. The route-aware mock and a decodable finite-duration test clip resolved these. Focused browser suite: 9 passed, exit 0.
- Unit suite: 124 passed, exit 0. Earlier all-photo CTA assertions were updated to the explicitly approved missing-odometer continuation; marker interaction assertions stay intact.
- Native metadata probing is abortable; media timers, sessions and object URLs are cleaned up. Browser test waits for route completion before checking passive cleanup, rather than sampling before unmount.
- No upload route exists. The gated send control explicitly explains that sending is unavailable; no future upload route is fabricated.
- Working-tree full Playwright exits 1: 84 passed, 29 intentional desktop skips, only the pre-existing 4,010-pixel readiness screenshot mismatch. All Phase05/photography screenshots and behavior pass; the runner exits without a stall.
- Nine new baselines were accepted after manual review of odometer/error, video ready/recording/review/fallback/replacement and partial/complete package. Only two prior photography baselines change: completed-photo CTA and local review summary. No earlier-phase baseline changes.
- Review caught photo-specific permission text inherited from CameraService; video recovery now names native video capture. Additional cleanup guards cover late blocked database opens, recorder cancellation errors and duplicate starts while permission is pending.
- New template-link validation exposed a pre-existing reduced-template unit fixture retaining an odometer link after removing the photo. The fixture now explicitly omits supplemental requirements; configurable photo count and duplicate-ID assertions remain intact.
- Final exact staged-source validation: lint/typecheck exit 0, 133 unit tests in 12 files exit 0, full Playwright 85 passed/29 intentional desktop skips exit 0, explicit production build exit 0. Root lint/typecheck/133-unit/build also exit 0; root full Playwright retains only the known unrelated readiness failure above.
- Reviewed all new visual states against references 11/12 and at 360x800, 390x844 and 430x932. The reduced-height 390x500 keyboard test confirms the input remains above the CTA; no document overflow, console/page/resource errors or leaked recorder/stream/timer were found by browser assertions.
- Generic Evidence now discriminates photo/video media, sharing states and metadata without forcing video to use a PhotoRequirement/shot code. No upload queue, real API or customer 3D is introduced.
- Unrelated files/deletions match their initial hashes. The previously dirty visual test is staged as only five new continuation lines in place of one old action; user formatting stays in the working tree. No public asset, dependency, origin configuration, legal text or existing route is staged.
- Nonblocking color-environment warnings appear in Playwright. The isolated staged export also warns about nested lockfiles; root build is clean. No timeout increase or configuration change was used. Both full browser processes finish normally.
