# Phase 06 validation

Implementation: `08b486a` (`feat: add durable evidence upload queue`), main, pushed and remote HEAD
verified. Scope: shared durable photo/video queue, mock transport, offline/retry and Upload Center;
no final submission/receipt, real backend, reviewer/admin, 3D or automotive asset replacement.

## Actual command exits

| Command | Working tree | Exact intended staged source |
|---|---|---|
| npm run lint | exit 0, no warnings | exit 0 |
| npm run typecheck | exit 0 | exit 0 |
| npm run test | exit 0, 159 tests / 15 files | exit 0, 159 tests / 15 files |
| npm run test:e2e | exit 1: 100 pass / 45 intentional skips / 1 known readiness failure | exit 0: 101 pass / 45 intentional skips |
| npm run build | exit 0 | exit 0 |

The exact tree was exported from the reviewed Git index to ignored
`.agent/reference-review/phase06-validation`, with shared installed dependencies. This validates what
is committed without resetting the user's unrelated local work. Normal scripts ran; no tests were
weakened/skipped to hide readiness, and no old baseline was updated. Desktop skips are existing
mobile-only scenarios, including the 16 new customer upload cases. All runners actually exited.

Known unrelated root failure is exactly **4,010 pixels** in readiness. All 22 initial tracked user
edits/deletions match their saved SHA-256 hashes. Their styling, assets, test formatting and baseline
are untouched and excluded from this commit. New upload screenshots passed both root and intended
source. Root production build has no workspace-root warning; the nested validation export reports
an expected extra-lockfile warning. Playwright emits pre-existing NO_COLOR/FORCE_COLOR warnings.

## Coverage

26 new unit cases cover durable metadata, stable identity/deduplication, cross-tab atomic claim limit,
expired lease recovery, backoff/budget/manual retry, offline interruption/online resume, superseded
revision cancellation, missing Blob/MIME/size validation, photo/video source lookup, storage rollback,
processing poll failure, cleanup/remount races, thumbnail bitmap/object-URL lifetime, independent
accepted-video credit, retake semantics and media-only progress. A deferred route-focus guard prevents
an entry frame overriding an already user-focused odometer input.

16 new browser scenarios cover completed capture → upload, six visual states, real IndexedDB queue
refresh, app-start/online resume, two-claim concurrency, photo/video transfer, verified distinction,
individual/all retry, offline odometer edit and native video replacement, stale photo revision
invalidation, per-media progress, focus/touch targets and responsive bounds. Console/page/resource
errors are checked, with no unexpected 3D downloads. Existing markers, capture/review, continuous
next-photo/section, atomic replacement, odometer normalization/edit, video cleanup/fallback and
earlier screenshots passed in the intended source.

## Visual review

Reference 13 supplies composition; reference 16 informs restrained recovery/status language. References
14/15 were inspected only as future context. Upload Center uses the existing compact journey header,
count ring/segments, photo rows, separate odometer and a stable bottom action. Minimum touch targets
are 44px. One internal evidence scroll region works at **360×800, 390×844 and 430×932**, with no document
vertical or horizontal overflow. Video does not autoplay. Processing has no invented percentage.

New 390×844 baselines were copied only after screenshots were visually inspected against reference 13:

- `tests/e2e/screenshots/upload.spec.ts/upload-center-mixed-customer.png`
- `tests/e2e/screenshots/upload.spec.ts/upload-center-offline-customer.png`
- `tests/e2e/screenshots/upload.spec.ts/upload-center-uploading-customer.png`
- `tests/e2e/screenshots/upload.spec.ts/upload-center-failed-customer.png`
- `tests/e2e/screenshots/upload.spec.ts/upload-center-processing-customer.png`
- `tests/e2e/screenshots/upload.spec.ts/upload-center-complete-customer.png`

No earlier baseline changed. Additional ignored renders cover all target widths and video uploading.
The mobile reference is adapted to the current 12-photo/one-video package rather than its old count;
progress does not claim processing means verified. No vehicle/reference PNG was rendered as UI.

## Problems corrected

- Local TanStack Query default network policy paused IndexedDB reads/saves while offline. Local photo,
  capture-data and queue queries/mutations now explicitly use networkMode always; transport alone waits
  for advisory online state. Browser tests verify offline entry, numeric editing and video persistence.
- Deferred photography route focus could race with a user focusing a field after navigation/resizing.
  The guard respects that focus and ensures it remains visible; keyboard viewport tests now pass.
- Two legacy browser assertions expected the pre-upload service-unavailable notice. Updated to the
  implemented Upload Center continuation; no photography workflow assertions were removed.
- Initial fixture-only strict types/browser API mocks were corrected (optional template capability,
  failure setting type, URL constructor and missing jsdom scrollIntoView). Final lint/type/unit pass.

## Preservation and limits

Existing routes/labels/fields/anchors/logo/legal/auth behavior are unchanged; only the already planned
upload route is activated. Vehicle controls remain below photography-image, markers remain interactive
and production remains 2D. No dependency, development-origin, service-worker or automotive asset change.

Mock transfers do not send to a real server. Individual interrupted files restart, not byte-range resume.
An abrupt browser crash can wait up to the 20-second claim lease. IndexedDB eviction/private-mode limits
remain. Background Sync is not required. Future summary/receipt, transport integration and lifecycle
cleanup policy are intentionally outside this phase. The unrelated readiness failure remains user work.
