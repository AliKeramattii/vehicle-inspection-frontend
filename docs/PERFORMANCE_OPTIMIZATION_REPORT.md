# Performance optimization report

## Follow-up: approved eleven-photo policy

Starting from completed optimization HEAD 59abbce, a separate approved follow-up implements the eleven-photo policy: ten fixed plus one of four existing VIN/spec suggestions. It reuses the completed processing, video, cache and queue systems. The following before/after tables remain the original legacy-v1 twelve-photo experiment; their sample totals are not changed to eleven. No generalized speed or evidence-quality claim is added. New policy derivation, durable identity and compatibility are documented in PHOTO_REQUIREMENT_POLICY_V2.md; validation results are recorded at the end of this document.

## Original optimization scope and delivery

Continued the interrupted task in the canonical integrated worktree, branch feat/unified-ui-admin-3d. Starting HEAD: `3b62f68bd88dc631d902023562360fe6944bfe9d`. This report belongs to the focused optimization commit; use git log for its delivery identity. No new worktree, branch switch, backend, dependency, asset replacement or eleven-photo migration.

Before continuation, the production baseline, initial view split, scoped IDB reads, draft optimizer, Reviewer cache and video metadata implementation existed, with 507 checkpoint units and five browser tests. Continuation inspected those artifacts instead of restarting. It added lazy-load failure recovery, worker-postMessage cleanup, deferred focus preservation, source SHA-256 and payload/revision checks, EXIF/codec/Reviewer lifecycle regressions, responsive validation, comparable after measurements and the four requested documents.

## Final production measurements

Same methodology as PERFORMANCE_BASELINE.md: three repeats, fresh isolated Chromium contexts, 390x844 customer / 1440x960 operations, 4x CPU, 150ms RTT, 1.6Mbps download / 0.75Mbps upload, disabled cache, production build. Values below are medians; before -> after. Ready means named usable element, not a separate hydration measurement. End-to-end wait timings include Playwright readiness polling; they are coarse lab waits, not field responsiveness metrics.

| Route | Ready ms | LCP ms | Encoded JS bytes | Decoded JS bytes | CLS |
|---|---:|---:|---:|---:|---:|
| landing | 3034 -> 3206 | 3228 -> 3328 | 280,534 -> 281,955 | 983,887 -> 986,490 | 0.027 -> 0.027 |
| capture | 3180 -> 3761 | 3644 -> 3792 | 310,791 -> 305,616 | 1,078,710 -> 1,055,926 | 0.002 -> 0.002 |
| guide | 3152 -> 3250 | 3524 -> 3628 | 310,791 -> 305,616 | 1,078,710 -> 1,055,926 | 0.038 -> 0.037 |
| camera-fixture | 4681 -> 4864 | 700 -> 684 | 310,791 -> 308,323 | 1,078,710 -> 1,062,304 | 0.001 -> 0.002 |
| reviewer-case | 3644 -> 3616 | 3164 -> 3240 | 293,595 -> 296,354 | 1,035,110 -> 1,040,975 | 0.596 -> 0.596 |
| admin-settings | 3134 -> 3208 | 3120 -> 3200 | 286,540 -> 287,961 | 1,003,152 -> 1,005,755 | 0.000 -> 0.000 |

Overview decoded JS decreased by 2.11% (22,784 bytes); encoded response bodies decreased by 5,175 bytes. Camera/recorder/video review/completion stay deferred. Guidance, section and photo review stay eager: experiments deferring these small views introduced an approximately 0.6s extra cold-network/suspense delay. Module warming did not reliably remove it and was removed. There is no aggressive media/route prefetch.

Marker-to-guidance median 308 -> 328ms; shutter-to-durable-review 429 -> 906ms. Final shutter range 400-986ms, versus 411-897ms before. No general page-speed or camera-startup improvement is claimed: several final route medians and CPU counters are worse, and three lab repeats do not establish statistical significance. The repeatable gains are bytes, IDB read scope and selected upload payload; broader startup remains a future measured exercise.

All build chunks, including optional code: 3,113,952 -> 3,245,957 raw bytes; 925,877 -> 976,647 summed gzip bytes. Total emitted code increased with the optional worker/control/tests-independent implementation, while requested customer startup code decreased modestly. Do not present total build size as startup transfer.

| Route | CDP TaskDuration ms | JS heap snapshot MiB |
|---|---:|---:|
| landing | 723 -> 835 | 8.50 -> 8.47 |
| capture | 567 -> 993 | 21.63 -> 21.75 |
| guide | 513 -> 730 | 11.35 -> 11.35 |
| camera-fixture | 567 -> 986 | 20.68 -> 20.88 |
| reviewer-case | 695 -> 1032 | 15.95 -> 14.30 |
| admin-settings | 545 -> 802 | 30.68 -> 15.02 |

No universal CPU/RAM saving is established. JS snapshots exclude decoded/native/GPU buffers, peak RAM and battery. Observer interaction samples are not field INP. Existing Reviewer CLS ~0.596 remains a separate layout issue. Landing/admin performance is largely unchanged in payload, with timing variation; no UI redesign was undertaken.

## IndexedDB and Reviewer

Real IDB fixture: 40 namespaces, 480 valid photo records, twelve returned. Read work fell 480 -> 12 records on every one of seven repetitions (97.5% fewer); median 8.7 -> 0.5ms. Prefix query uses existing encoded keys and IDBKeyRange, plus namespace verification. No database version upgrade, record rewrite or deletion. It still materializes that inspection's records/Blobs, not a new metadata-only store.

Reviewer filmstrip lazily reads visible revisions and decodes bounded thumbnail dimensions. A 16-entry/2MiB per-case memory cache deduplicates compact Blobs, clears on case change/unmount and does not reload on upload-status-only updates. Full accepted bytes load only for selected evidence; video filmstrip loads no video Blob. URLs and bitmaps are released; no public persistent cache or speculative adjacent full-resolution fetch.

## Photo optimization and evidence safety

Opt-in draft-only processing, original durably saved first and selected by default. Worker preferred; pixel-bounded canvas fallback, low-memory/unsupported/decode/error/source fallback. Source and candidate metadata carry revision/attempt/bytes/dimensions/MIME; CAS rejects stale completion. EXIF is applied exactly once, without CSS mirroring or upscaling. Confirmed originals are never recompressed. Retry starts from original draft bytes, not a lossy candidate chain.

Real UI stress fixture (canonical exterior enlarged only to synthesize a large input, not a production upscale): 4096x2237 JPEG, 1,734,398 bytes -> 2048x1119 JPEG, 194,624 bytes (88.78% smaller), ~82ms worker processing in the latest UI run. Source SHA-256 remained identical across preparation, refresh and selected-candidate confirmation. Source remains durable after acceptance. Quota failure, refresh interruption, worker/decode/lazy-chunk failure, timeout/cancellation, stale attempt and confirmation races retain good evidence. Native source capture is still JPEG .92.

The accepted `.blob`/revision alone drives the shared upload queue. Unit and browser tests verify: preparation/selection cannot change an active accepted upload, confirmation exposes candidate byte size, old revision becomes stale, and replacement/retry preserves original until success. No duplicate original-upload pipeline or fabricated upload-success status. Concurrency 2, leases, idempotency, offline/backoff and mock processing/verification semantics remain unchanged.

### Actual sample quality experiment

Twelve canonical images converted to native-size JPEG 1.0 capture equivalents: total 6,335,164 bytes. These are controlled samples, not real-user averages or insurer evidence. Suitability skip was explicitly disabled in the lab to compare encoders; normal policy skips already suitable images. Six combinations each = 72 encodes, no upscaling.

| Output | Quality | Total bytes, twelve samples | Median encode ms |
|---|---:|---:|---:|
| image/jpeg | 0.80 | 1,600,888 | 20.5 |
| image/jpeg | 0.88 | 2,079,121 | 19.8 |
| image/jpeg | 0.90 | 2,272,043 | 22.4 |
| image/webp | 0.80 | 854,308 | 94.2 |
| image/webp | 0.88 | 1,137,434 | 104.0 |
| image/webp | 0.90 | 1,269,392 | 102.6 |

Selected experimental policy is JPEG .88 exterior / .90 technical; source resolution retained for plate, odometer, chassis and spec. Sampled PSNR 42.09-48.47dB is only a regression indicator. Manually inspected source/candidate chassis, odometer and spec text crops show readable details in these particular samples. This does not approve insurance quality. WebP produced smaller results but took longer; backend and Safari/iOS/device acceptance are not established, so it is not the UI default. Real low-light/motion/tiny text/glare samples still require product/backend approval.

## Video evaluation

Six real Chromium MediaRecorder canvas-stream experiments, approximately two seconds each plus playback, opaque vehicle sample with restrained movement. All recorded VP8 WebM at actual requested dimensions and 30fps; all played and all tracks stopped. This is not physical walk-around quality testing. isTypeSupported reported MP4/WebM/VP8/VP9 support, but actual six-profile recording used VP8; MP4 constructor fallback is covered by unit fixtures, not an assertion of Safari compatibility.

| Profile | Requested Mbps | Output bytes | Observed Mbps | Actual fps | Playable / tracks stopped |
|---|---:|---:|---:|---:|---|
| 720p | 2.5 | 473,599 | 1.89 | 30 | yes / yes |
| 720p | 4 | 738,825 | 2.95 | 30 | yes / yes |
| 720p | 6 | 1,078,723 | 4.31 | 30 | yes / yes |
| 1080p | 2.5 | 474,005 | 1.89 | 30 | yes / yes |
| 1080p | 4 | 749,192 | 2.97 | 30 | yes / yes |
| 1080p | 6 | 1,095,333 | 4.37 | 30 | yes / yes |

Whole six-profile lab CDP TaskDuration delta 301ms; JS heap snapshot 4.79 -> 7.47MiB. These are not per-codec native encoder CPU/peak RAM/battery estimates. Requested and actual capture/recorder metadata are separate and whitelisted; no device IDs persist. Default stays ideal 1080p/30fps/2.5Mbps, no automatic downgrade, no mandatory client FFmpeg/transcode.

Current product is live-only capture; unsupported recording retains existing retry/browser recovery, not gallery/native selection. Pause/timer/re-record/cleanup remain tested. Existing saved videos are unchanged.

## Upload and backend limits

Queue tests exercise real IndexedDB and deterministic transport states: concurrency, refresh, offline/reconnect, retry-all/individual, interrupted/stale replacement jobs and photo/video payloads. They do not measure real HTTP upload throughput: no real evidence backend exists, and CDP throttling cannot turn an in-process uploader into a network upload. Lower selected byte count is measured; uplink time savings remain dependent on future transport and conditions. No Base64 or eager video copies. Odometer remains data outside media denominator.

Planned ASP.NET Core processing/storage requirements are in BACKEND_MEDIA_PROCESSING_REQUIREMENTS.md and the additive API_CONTRACT.md clarification: brokerage-owned MSSQL metadata, private filesystem, immutable variants, authorized retrieval/ranges, server signature/size/hash checks, thumbnail/review derivatives, optional controlled video worker, idempotency and forwarding acknowledgement. Original transfer/retention, accepted insurance quality and actual transport remain approvals, not implemented guarantees.

## Validation

- npm run lint: exit 0.
- npm run typecheck: exit 0.
- npm run test: 519 passed / 50 files, exit 0.
- npm run build: exit 0; normal production build, not full static export.
- Final current-contract customer browser run: 54 passed, two intentional desktop skips, exit 0. Includes eight new media tests, capture/markers/navigation/recorder/upload/responsive and five deterministic Neshan tests.
- Desktop frontend-completion: two passed / two intentional customer skips, exit 0; assigned Reviewer and two exact correction rounds preserve durable history.
- Final production performance/image/video lab: six passed, exit 0.
- Static diagnostic: actual optimizer exported in a disposable finite-route Next app, worker loaded over Python-only static HTTP and after refresh, source 471527 -> 162953 bytes, no page errors. Does not migrate/fix the working application's runtime-ID/static export blocker.
- Live Neshan: three passed, exit 0, actual provider tiles and Persian reverse lookup, public runtime settings inheritance, no key/config changes.
- Optional local 3D: one passed, exit 0; actual licensed local model loads once, rotate/zoom/views and twelve markers remain functional, controls stay below image. No model/licensing changes or publication.

An earlier unfiltered focused browser run exited 1: 48 passed / two skipped / one obsolete capture-reference assertion. Existing approved customer headers intentionally hide that identifier; newer frontend-completion explicitly checks its absence. It remains untouched and is explicitly excluded from the final focused selection. Existing REVIEW_UPLOAD=1 review mode bypasses only historical pixel comparisons; functional assertions run. No historical baseline is updated. The previous complete-suite report documents 45 historical failures; a fresh whole-suite PASS is not claimed here. Early continuation build failed on two new test-only typing/encoding errors; corrected before final passing builds. Initial lint warnings were fixed. Final review also corrected session MIME reporting after constructor fallback; the actual chosen codec is now asserted. NO_COLOR/FORCE_COLOR environment warnings and Vitest isolation-speed advice remain informational. The existing R3F THREE.Clock deprecation warning was observed in the optional local viewer; no model/dependency change was made.

## Visual and preservation review

Customer views inspected at 320x568, 360x800, 390x844, 430x932 and 768x1024; regression also checks 1440x960. Internal scrolling and CTA remain reachable, RTL and controls-below-image remain. New option panel only appears for eligible draft photos. Deferred heading focus and user-focused inputs/buttons remain accessible. Reviewed optimization UI plus actual technical source/candidate crops. No image, logo, theme/layout redesign or screenshot baseline changes.

Private service-key scan of browser static assets and staged-key scan were clear. Owned preview/proxy/static servers were stopped; their ports no longer respond.

59 protected hashes cover original dirty files, core config, local environment and Neshan/3D/tool code; verify unchanged before staging. Twenty pre-existing modified paths, supplied untracked assets, nested checkout and unrelated readiness mismatch remain excluded. No GLB/public restricted asset, credential, dependency or production Node addition. Current seven sections/twelve IDs, odometer/video, revisions/permissions and queue semantics stay intact. Eleven-photo migration has not started.

## Remaining work outside this implementation

- Broader startup/CPU gains are not proven; final timing medians are reported without cherry-picking. Further splitting needs its own measured UX budget.
- Real device/browser evidence readability, peak/native memory, field INP, hardware camera performance and uplink throughput need validation.
- Source-vs-accepted transfer/quality/retention and protected server derivatives/transcoding/auth require backend/product agreement.
- Existing static runtime-ID/default image optimizer blockers and inactive offline app-shell registration remain separate architecture gates.
- Historical visual/test debt and the unrelated readiness mismatch remain untouched; Reviewer CLS requires a separately approved layout task.

Delivery only stages intended performance code, tests, documentation and plan; no reset/stash, protected file staging or main merge. Final commit/push and remote HEAD are reported in the completion response.


## Eleven-photo follow-up: measured comparison and delivery

Implementation: `11f5d880ead1130cb0390caef236841d50a191ea` (`feat: implement versioned eleven-photo inspection policy`). It reuses completed optimization commit 59abbce; no new compressor, codec package, queue, backend or model was introduced.

Repeated the existing production benchmark harness with PERF_PHASE=photo-policy-v2, three repeats, same documented CPU/network/cache/viewports. This comparison uses explicit legacy-v1 capture/submission fixtures on both builds for comparability; new-v2 functionality is separately covered by nine browser scenarios. Before = completed optimization build 59abbce; after = this policy build. Raw diagnostic JSON remains ignored under .agent/reference-review/performance/photo-policy-v2-*. The rows are lab observations at different times, not a randomized experiment or field percentile.

| Route | Ready ms, before → after | LCP ms | Encoded JS bytes | Decoded JS bytes |
|---|---:|---:|---:|---:|
| landing | 3,206 → 3,026 | 3,328 → 3,196 | 281,955 → 283,216 | 986,490 → 992,897 |
| capture | 3,761 → 3,124 | 3,792 → 3,592 | 305,616 → 306,564 | 1,055,926 → 1,061,788 |
| guide | 3,250 → 3,083 | 3,628 → 3,476 | 305,616 → 306,564 | 1,055,926 → 1,061,788 |
| camera-fixture | 4,864 → 4,663 | 684 → 696 | 308,323 → 309,301 | 1,062,304 → 1,068,296 |
| reviewer-case | 3,616 → 3,601 | 3,240 → 3,144 | 296,354 → 297,431 | 1,040,975 → 1,046,390 |
| admin-settings | 3,208 → 3,102 | 3,200 → 3,088 | 287,961 → 289,058 | 1,005,755 → 1,011,342 |

| Route | CDP task ms, before → after | JS heap snapshot MiB |
|---|---:|---:|
| landing | 835 → 711 | 8.47 → 8.59 |
| capture | 993 → 638 | 21.75 → 24.39 |
| guide | 730 → 514 | 11.35 → 20.97 |
| camera-fixture | 986 → 710 | 20.88 → 12.64 |
| reviewer-case | 1032 → 740 | 14.30 → 15.60 |
| admin-settings | 802 → 630 | 15.02 → 16.85 |

Marker navigation median 328 → 327ms; shutter-to-durable-review 906 → 417ms in this follow-up. Capture JS adds 948 encoded / 5,862 decoded bytes for policy/pinning/selection/history logic. Total emitted chunks 3,245,957 → 3,268,815 raw bytes and 976,647 → 981,776 summed gzip bytes. These totals include optional code, not just startup. Although ready/task timings improved in this run, guide/overview heap snapshots increased and existing Reviewer CLS remains ~0.596. No universal speed/memory improvement is established or promised. Previous repeatable IDB/worker/payload improvements remain the completed phase's measurements; no work was repeated simply to re-claim them.

Current capture fixture still emits 193,380-byte image/jpeg, preserving native capture settings. Current static guide inventory is recorded in PERFORMANCE_BASELINE.md; one fewer required photograph does not guarantee a proportional payload reduction (the under-seat guide is larger). Upload-byte reduction/processing-quality/video-profile results above remain explicitly the previous controlled experiments. No new real-camera insurer-quality, physical video, server throughput or upload-duration claim is made. Deterministic shared-queue/retry/offline checks remain correctness tests, not internet benchmarks.

### Actual validation

- npm run lint: exit 0.
- npm run typecheck: exit 0.
- npm run test: exit 0, 553 tests / 51 files. Includes all four choices independently, missing choice, ten fixed slots, history/pins, stale callbacks, atomic replacement, rapid selection and retained White-Label publication.
- npm run build: exit 0, Next 16.3.8. Existing dynamic-route/static-export blockers remain unchanged; no routing migration or new production Node dependency.
- npm run test:e2e -- --config playwright.photo-policy.config.ts: exit 0, 9 passed, including new screenshots and actual canvas/mock-recorder capture, chosen evidence in upload/submission/Reviewer, exact scoped correction and original preservation.
- Focused customer regression config (temporary diagnostic copy of the existing config, production port 3222): exit 0, 86 passed / 3 project skips. Existing REVIEW_UPLOAD/REVIEW_SUBMISSION/REVIEW_ADDITIONAL flags omit historical pixel assertions only; all domain/navigation/error/retry assertions still execute. Files: photography-markers, photography-navigation, viewport, media-optimization, upload, submission, additional-evidence and final-product.
- Staff/White-Label final-product scenarios: exit 0, 3 passed / 8 customer-only skips. Covers assignment, per-evidence/whole-case decisions, rejection and Site Settings draft/publish/central map ownership.
- Real authorized live Neshan: exit 0, 3 passed (provider tiles, Persian reverse HTTP 200, persisted settings/customer/Admin), unchanged local config.
- Restricted loopback optional GLB regression: exit 0, 1 passed, explicit historical-v1 twelve-marker fixture. No geometry, GLB, licensing or production gating changes; only its accessible count label now derives from the active template.
- Existing production benchmark harness: exit 0, 2 passed.

Focused commands are not a claim that the entire historical screenshot suite is green. Initial unit failures exposed old implicit twelve-photo fixtures; these now explicitly select v1, while current defaults have dedicated v2 tests. Diagnostic browser failures came from premature navigation, a stale category selector and an overbroad image selector; those tests were corrected. The initial diagnostic config also lacked the canonical snapshot path/mobile options; its newly generated misplaced artifacts were removed, without modifying any existing baseline. A real introduced compatibility issue (fresh Admin v2 seed made the White-Label v1 reference unavailable) was fixed by retaining the immutable v1 publication and regression-tested.

### Visual review and preservation

Inspected canonical 07/08/10/19/20 for preserved composition and actual 320x568, 360x800, 390x844, 430x932, 768x1024 customer and 1440x960 staff screenshots. Current layout, internal scrolling and controls below vehicle imagery remain. No CSS redesign, canonical image, ghost, model or legal-copy change. Two manually reviewed NEW baselines only:

- tests/photo-policy/screenshots/photo-policy.spec.ts/eleven-photo-overview-390.png
- tests/photo-policy/screenshots/photo-policy.spec.ts/four-location-choices-390.png

All twenty pre-existing modified files remain byte-identical to the task-start preservation manifest and excluded from commits, including readiness imagery/styles/schema/config changes. User untracked logo/reference/nested checkout paths remain untouched. The unrelated readiness screenshot discrepancy and historical pixel debt are not fixed or rebaselined. Earlier visual baselines remain unchanged. Known warnings: Playwright FORCE_COLOR/NO_COLOR and existing Three.Clock deprecation; no new dependency/quality claim.

### Remaining boundaries

Backend/auth/SSO/private filesystem/MSSQL/forwarding contracts are proposals, not implemented services. Real low-end/iOS camera quality and insurer acceptance still need field approval. Local archived choice revisions require storage; no automatic cleanup is introduced. Existing pinned v1 drafts intentionally continue showing twelve, and new inspections receive eleven. Real tenant template assignment remains an API responsibility; mock pins/defaults do not claim a backend publication-assignment implementation.
