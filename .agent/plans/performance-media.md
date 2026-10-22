# Performance and revision-safe media optimization

## Goal
Measure production behavior before and after, implement justified low-risk performance improvements and a recoverable opt-in draft image optimization pipeline, and document future backend media requirements.

## User-visible behavior
Preserve all workflows and permissions. Customer/reviewer pages retain their layouts. Accepted photos/video are never recompressed in place. Experimental smaller photo variants may only be selected explicitly before confirmation; originals remain durable and recoverable. No production API, routing migration, media cleanup or asset replacement.

## Current state
Canonical integrated worktree, feat/unified-ui-admin-3d, starting HEAD 3b62f68. Twenty original modified files and supplied untracked assets remain protected. Next 16.3.8; normal production build is not static export. Camera captures JPEG .92; recorder requests 2.5Mbps through the photo camera constraints. Shared photography imports camera/video views eagerly. PhotoStore.list gets all inspections then filters. Reviewer thumbnails already use IntersectionObserver and release object URLs, but decode full images per remount. Upload concurrency/leases/revisions remain authoritative.

## Constraints
No worktree/branch switch, GLB/Neshan/credential changes, evidence deletion, duplicate providers/stores/queues, new dependency or backend. Preserve twelve requirement IDs, source/accepted revisions and active uploads. Compression cannot automatically lower accepted quality. Keep worker/browser fallbacks static-host compatible. Existing dirty files are hash-protected; avoid edits there. All measurements clearly distinguish synthetic fixtures from real-device field metrics.

## Implementation
1. Capture preservation hashes; read relevant installed Next docs and current media/tests.
2. Production build baseline and reproducible Chromium mobile/desktop runs with network/CPU throttling: route JS, LCP/CLS/interactions/navigation, camera fixtures, IDB and Reviewer behavior. Inventory images/recorder/upload/PWA and document unavailable real metrics.
3. Apply measured low-risk split/read/preview improvements in a small checkpoint; preserve reference UI.
4. Add reusable bounded/device-aware image optimization with EXIF-aware decode, no upscaling, fallback, source durability and revision CAS in existing photo record storage. Source remains default; explicit draft variant choice controls promotion. Keep technical closeups conservative. Reuse same pipeline for scoped corrections without bypassing edit policy.
5. Evaluate real-browser 720/1080 recording profile matrix and supported codec/actual settings. Improve supported constraints/metadata only with evidence; do not silently reduce video quality or require transcoding.
6. Add unit/browser regressions for source/variant atomicity, stale work/reload/quota/failure, upload races, resource cleanup, video formats and Reviewer media. Repeat comparable production benchmark.
7. Create the four requested performance/media documents and backend contract clarification; run lint/typecheck/units/build/focused browser, Neshan and optional-viewer preservation checks. Review hashes/diff and commit/push only scoped validated work.

## API impact
No implemented API or upload protocol changes. Document source/accepted/review/thumbnail metadata, actual capture settings, server validation/private storage/ranges/transcoding/forwarding requirements and decisions requiring approval.

## Testing
Use disposable isolated browser contexts and test-only namespaces, never real user media. Production benchmarks use fixed throttling/fixtures/repeats; lab interaction timing is not field INP. Compare bytes and distributions, not invented gains. Test actual image decode and recorder outputs where available; no physical readability/insurance guarantee. Preserve historical baselines and user readiness mismatch.

## Acceptance criteria
- Before/after metrics from actual builds and reproducible conditions, with limitations.
- Measured low-risk improvements; no workflow or permission changes.
- Source-first durable photo variants, explicit opt-in, revision CAS, failure/reload recovery and active-upload isolation.
- Video compatibility matrix/actual settings and no mandatory client transcoder.
- Reviewer/media resources bounded and released; queue semantics unchanged.
- Four requested docs, tests, source review, preserved local work and verified Git push.

## Progress
- [x] Inspect current Git, instructions, media and queue boundaries.
- [x] Measure production baseline and record bottlenecks.
- [x] Implement and validate low-risk performance checkpoint.
- [x] Implement revision-safe image variants and recording evaluation.
- [x] Run regressions and comparable production after measurements.
- [x] Complete documentation and preservation/security review; prepare focused Git delivery.


## Resume checkpoint and discoveries

Continuation recovered the original 3b62f68 HEAD, twenty protected dirty paths and saved baseline/after lab outputs. All 59 protected hashes still match. The declined large command had not executed; its necessary fixes were applied individually through normal approval. One permission-review timeout was retried once successfully, without bypassing review.

Source/candidate SHA-256 browser assertions, real EXIF bitmap/HTML fallback, actual IDB CAS/quota/reload and confirmed-payload upload tests are present. Worker module-load failure preserves source; postMessage failure now terminates worker/timer before canvas fallback. Deferred heading focus observes loading replacement and respects focused controls. Six real Chromium recorder profiles remain playable with stopped tracks. Default profile unchanged.

Initial aggressive small-view splitting reduced decoded overview JS but delayed marker navigation from ~308ms to ~929ms under throttling. Guidance/section views are now eager; observed marker latency returned to ~296ms. Cold PhotoReview also delayed shutter-to-review. Targeted module warming did not reliably remove that delay, so PhotoReview is eager again in normal and scoped capture. Camera, video capture/review and completion remain deferred. Final comparable measurement is pending this measured correction. No heavy-media or unrelated route prefetch.

Focused first browser run: 48 passed, two project skips, one known obsolete test failure expecting a reference in a deliberately private customer header. The newer frontend-completion test verifies that intended absence; do not restore the reference or weaken old baseline to hide the debt. A clean current-contract follow-up includes deterministic Neshan preservation. Full suite is not claimed green. Existing upload pixel comparisons can be intentionally skipped through its existing REVIEW_UPLOAD review mode, without updating snapshots; all functional checks still execute.

Disposable static export of the actual worker succeeded and ran/reloaded over Python static HTTP: source 471527 -> JPEG 162953 bytes, worker method, zero page errors. This proves only new worker compatibility; existing production dynamic-ID routing/export blocker remains.

Three required documents are written; final report, protected browser checks, validation and focused Git delivery remain in progress. No twelve-to-eleven-photo migration, GLB/Neshan refactor, asset replacement, retention cleanup or backend implementation.


## Final validation before delivery

Retained eager guidance/section/photo review after experiments identified cold view-loading delays. Final overview decoded JS 1,078,710 -> 1,055,926 (2.11% reduction); route timing/CPU medians are mixed or worse and are reported honestly, not marketed as universal speedups. Scoped IDB reads 480 ->12, median8.7 ->0.5ms; original source SHA remains unchanged while explicitly selected accepted payload is smaller. Source-first/default profile unchanged.

519 unit tests/50 files pass. Final current-contract customer suite54 pass/two desktop skips; desktop Reviewer/settings two pass/two customer skips. Six production lab scenarios pass. Real Neshan three pass; real restricted local GLB one pass. All commands exited0. The earlier one obsolete header assertion failure is recorded separately; no full historical-suite PASS or baseline update is claimed. All four required docs exist. Services started by this task were stopped after checks. No unrelated user work, credentials or GLB is to be staged. Focused commit/push/remote verification follow this prepared checkpoint and are recorded in the final delivery response.

Final staged review corrected session.mimeType after codec-constructor fallback; units assert the negotiated MP4 label. Typecheck,519 units, lint,build and all six production lab scenarios were rerun successfully.
