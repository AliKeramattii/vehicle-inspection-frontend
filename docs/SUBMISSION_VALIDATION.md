# Phase 07 validation

Implementation: `cf6aec2` — `feat: add inspection submission and receipt`.
Validated on 2026-10-10. The implementation was pushed normally to `origin/main`.

## Commands and actual process exits

The intended source was exported from the staged index into the ignored
`.agent/reference-review/phase07-validation/` directory. This preserves all unrelated local
changes while running the complete suite, including readiness, against the exact intended
application/test source. Existing dependencies were shared through a junction; no dependency or
application configuration changed.

| Command | Intended-source result | Exit |
| --- | --- | --- |
| `npm run lint` | PASS | 0 |
| `npm run typecheck` | PASS | 0 |
| `npm run test` | PASS: 180 tests, 16 files | 0 |
| `npm run test:e2e` | PASS: 118 passed, 62 intentional desktop skips | 0 |
| `npm run build` | PASS: standalone production build | 0 |

The working-tree production build also exits 0. Its complete Playwright run exits **1**:
117 passed, 62 skipped, one known readiness screenshot failure with **4,010 differing pixels**.
That local mismatch is not fixed or hidden. The intended-source run includes the unchanged
original readiness test and baseline and passes them. Both full runners terminate normally;
there is no lingering runner stall.

## Coverage

Added 21 submission unit cases and 17 customer Playwright scenarios covering derived readiness,
missing photo/odometer/video, current media revisions, queued/uploading/failed/uploaded/processing/
verified policy, transactional claim/idempotency, metadata durability, already-submitted recovery,
uncertain acknowledgement, failure/retry, offline blocking/interruption, double activation,
timer cleanup, expired leases, persistence failure and post-submit mutation/route locks.

The full suite also validates prior referral/OTP, consent, location/plate/vehicle, interactive
pending/completed/retake markers, controls below the vehicle, automatic photo continuation,
atomic replacement, odometer editing, browser/native video capture/review/cleanup, durable upload
queue, offline resume/retry and viewport behavior. New browser scenarios reject console errors,
page errors, HTTP resource failures and unexpected default 3D downloads.

## Problems resolved

- Durable mutation checks exposed timing races in old capture tests. Immediate IndexedDB reads
  could run before asynchronous save/discard finished. The tests now await the existing destination
  before asserting persisted data, without changing capture behavior or weakening data assertions.
- An existing generic alert locator also matched Next.js's route announcer. It now identifies the
  actual save-failure alert by its message.
- Receipt content initially exceeded its internal area by 21 pixels. Targeted spacing/hero
  adjustments keep its notice and bottom action visible at all three sizes without shrinking
  important text or touch targets.

## Visual review and baselines

Compared against `references/screens/14-final-inspection-summary.png` and
`references/screens/15-submission-receipt.png`. Historical reference counts do not override the
current separate twelve-photo/odometer/video package. The final summary retains evidence-first
hierarchy with one intentional internal scroll region; the receipt fits without internal scrolling.
Reviewed summary and receipt at **360×800, 390×844 and 430×932**. No document vertical or horizontal
overflow; primary actions remain visible. Existing AppViewport/100dvh, safe areas, focus treatment,
Vazirmatn, RTL and LTR reference/VIN/plate semantics remain intact.

Only these six new, manually reviewed baselines were added under
`tests/e2e/screenshots/submission.spec.ts/`:

- `final-summary-ready-customer.png`
- `final-summary-upload-blocked-customer.png`
- `final-summary-incomplete-customer.png`
- `submission-loading-customer.png`
- `submission-error-customer.png`
- `submission-receipt-customer.png`

No earlier baseline was updated. The supplied success line-art SVG is simpler than reference 15's
detailed vehicle illustration. No canonical automotive imagery was generated or replaced.

## Preservation and limitations

All 22 pre-existing tracked changes match their start-of-task byte hashes/existence states and
were excluded from these commits. Readiness styling/icons/assets/baseline remain untouched.
Unrelated untracked user tools/assets were also left alone. No secrets, environment files,
temporary render/export artifacts or dependencies were staged.

Existing URLs, journey/section labels, field names, anchors, legal copy, logo/partner identity,
mock referral `A4K9P2`, OTP `12345` and development-origin configuration remain unchanged.
The already planned `/review` and `/submitted` customer routes are now implemented. Production
photography remains 2D; no reviewer/additional-evidence/real-backend/3D work was started.

Submission/status are local IndexedDB mocks. The review time is an explicit mock estimate; the
partner return is a documented local action because no external destination is configured.
An abrupt crash without an acknowledgement can require waiting for the thirty-second claim
lease to expire before retry. Local media is retained. Future server adapters must enforce
ownership, atomic package validation and idempotency; browser locks do not replace server security.

Non-blocking environment warnings: NO_COLOR/FORCE_COLOR conflict and Next.js workspace-root
inference from the nested validation lockfile. Git also reports the repository's normal LF/CRLF
conversion notices. None produced browser console errors or unsuccessful intended-source exits.
