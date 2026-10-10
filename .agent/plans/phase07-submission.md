# Phase 07 — Final review, durable submission and receipt

## Goal
Complete the mock customer flow from Upload Center through final review to a durable submission receipt, without implementing additional evidence, reviewer/admin or real HTTP integration.

## User-visible behavior
The final review shows confirmed location/vehicle, twelve-photo progress, separate manual kilometers/video and binary-upload readiness. Missing data links to existing recovery flows. An online, ready customer submits once; loading/failure/retry retain all evidence. Success opens a persistent receipt with the existing reference, mock review estimate and honest timeline. Submitted inspection routes cannot edit evidence or facts.

## Current state
Main is at 94c0f34 after Phase 06. Upload Center currently ends at a placeholder. Existing planned routes are /inspection/[inspectionId]/review and /submitted. Capture readiness and upload completion already have authoritative helpers. Mock auth and location/vehicle repositories are memory-only; receipt recovery must not persist authentication. IndexedDB owns media and queue metadata. Twenty-two pre-existing tracked changes, including readiness visual drift, are recorded under ignored .agent/reference-review/phase07-start and must remain untouched.

## Constraints
Preserve AppViewport, 2D photography, markers, continuous capture, seven sections/twelve photos, separate odometer/video, atomic replacement, origins, all prior baselines and automotive assets. Use thin server pages and small client components, existing buttons/plate/vehicle/preview primitives. IDs remain LTR. No dependencies, background submission, real endpoints or 3D. The receipt illustration is the supplied SVG, not a generated replacement.

## Implementation
1. Add submission types, one summary/readiness derivation and metadata-only summary loader reusing capture/upload helpers.
2. Add IndexedDB submission repository with stable idempotency key, transactional claims, durable mock acknowledgement and immutable receipt facts. Retry interrupted/uncertain requests with the same identity; prevent cross-tab duplicate claims. Store confirmed facts in the draft summary snapshot for refresh recovery without preserving login.
3. Add mock service/transport, online-only submission and durable status recovery. Protect editable inspection routes before their children mount; retain future needs-more-evidence boundary without implementing unlock UI.
4. Add /review and /submitted server pages, final review sections, safe edit/review links, consistent submitting/error states and receipt timeline. Replace Upload Center placeholder navigation.
5. Add unit/domain/repository and deterministic browser fixtures/scenarios, six reviewed visual baselines and responsive/console/overflow checks.
6. Document readiness/upload threshold, durability/idempotency/locks, mock boundary and planned APIs. Review diff, run all scripts with real exits, isolate known readiness failure, commit intended changes, push normally and verify remote.

## API impact
Planned authenticated GET summary, POST submit with stable Idempotency-Key and GET status. Binary-complete processing/uploaded/verified may submit; queued/uploading/failed cannot. Current transport is mock-only. Odometer stays numeric and outside media denominator.

## Testing
Unit tests: readiness missing data/status policies, summary derivation, durable key/claim/acknowledgement, failure/retry and lock. Browser tests: summary ready/incomplete/blocked, loading/error/retry, duplicate activation, receipt persistence/direct navigation and post-submit guards; existing full suites and 360x800/390x844/430x932. Review generated screenshots against references 14/15 before copying only six intended new baselines. Run npm run lint/typecheck/test/test:e2e/build. Report root readiness failure honestly and verify exact intended source independently without including user changes.

## Acceptance criteria
- One derived readiness helper; no photo/file counter drift.
- Durable, idempotent submission and refresh-safe receipt; no duplicate or data loss.
- Submitted routes locked before editable children mount.
- Final review/receipt inside existing 100dvh, accessible and RTL.
- Relevant and full intended validation exit successfully; known readiness mismatch untouched.
- Focused commits pushed and remote verified.

## Progress
- [x] Read instructions, inspect refs 14/15, repository and existing boundaries; snapshot unrelated changes.
- [x] Implement domain, persistence, service and guards, including mutation checks and cross-tab invalidation.
- [x] Implement final review and receipt using existing planned routes and primitives.
- [x] Add tests, manually review six visual states against references 14/15 and all widths; create only six intended baselines.
- [x] Run lint/typecheck/unit/full browser/build scripts with successful intended-source exits and review preservation/visual results.
- [x] Complete focused implementation commit/publication and verify remote; record validation in docs/SUBMISSION_VALIDATION.md.

## Discoveries / decisions
- Offline policy: block formal submission until online. Uploaded files are not a submitted inspection.
- Processing is binary-complete; verification is not required. Retake-requested remains blocking under existing upload policy.
- Receipt metadata is durable and independent of ephemeral mock login; a fresh root visitor still starts on landing.
- Initial receipt notice was partially outside the content region; reduced only hero whitespace/height so full content fits at 360x800/390x844/430x932. No text or touch-target shrinking.
- Added 21 submission unit cases and 17 customer browser scenarios, including interruption and same-frame double activation. All 180 unit tests exit 0.
- Async durable edit checks exposed pre-existing capture-test races: immediate IndexedDB reads could precede mutation completion, and a generic alert locator also matched Next.js's route announcer. Assertions now await the existing destination and identify the specific save error; capture semantics are unchanged.
- The final working-tree full browser run exits 1: 117 passed, 62 intentional desktop skips and only the known 4,010-pixel readiness mismatch. All Phase-07 cases pass. No readiness file or old baseline changed. Full intended-source validation runs from an index export, including the original readiness test/baseline, without skipping the known test.
- Working-tree production build and intended-source lint/typecheck/unit scripts exit 0. Full intended-source Playwright exits 0: 118 passed and 62 intentional desktop skips, including the original readiness screenshot, all new baselines and prior capture/upload regressions. Both full runners exited normally; no lifecycle stall remains.
- Standalone intended-source production build also exits 0. Only environment warnings remain: nested validation lockfile workspace inference and existing NO_COLOR/FORCE_COLOR conflict. No dependencies/configuration or browser-origin behavior changed.
- Implementation cf6aec2 is pushed and verified on origin/main. The following documentation commit records validation and closes this plan; no later phase is started.
