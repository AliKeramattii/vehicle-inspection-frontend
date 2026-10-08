# Phase 06 — durable evidence uploads

## Goal
Upload locally accepted photos and the walk-around video through one durable, recoverable mock queue and a mobile Upload Center. Odometer remains separate numeric data. No final submission or receipt is implemented.

## User-visible behavior
Completed capture continues to `/inspection/[inspectionId]/upload`. Sending-stage progress, per-media status, offline retention and individual/all retry appear inside the existing 100dvh shell. Binary upload completion, processing and verification have distinct labels. A future-summary boundary is enabled only when the local package and current media uploads are complete.

## Current state
HEAD 2be8955 on main. Photo and capture-package IndexedDB stores already own durable Blobs and atomic accepted/draft replacement. Query reads local repositories. Upload is not implemented. Twenty-two unrelated tracked changes and user assets were snapshotted under ignored `.agent/reference-review/phase06-start`; readiness has a known unrelated visual mismatch. Reference 13 defines upload composition; reference 16 informs recovery. References 14/15 remain future-phase context.

## Constraints
Preserve 12-photo template, 7 sections, separate odometer/video, marker interactions, continuous capture and controls below artwork. No automotive asset replacement, production 3D, real API, new dependency, queue in Zustand/localStorage, or evidence deletion. Preserve all initial user edits byte-for-byte. Thin server routes; typed services outside presentation.

## Implementation
1. Add `features/upload/upload-model.ts`, retry policy and metadata-only IndexedDB queue repository. Stable IDs reference accepted media revisions; atomically claim with owner/lease and cancel superseded jobs. Read current Blob only for active transfer/visible thumbnail; verify its revision before use.
2. Add shared transport and deterministic mock, coordinator (two concurrent transfers, capped backoff, interrupted-work recovery, online/offline abort/requeue, processing poll). App provider initializes/resumes existing durable jobs; Upload Center reconciles accepted media and starts new jobs. Never mutate capture credit from upload errors.
3. Add thin upload route, sending header state, reusable progress/row/preview components and single internal list scroll. Replace capture-review placeholder notice with navigation. Future-summary boundary remains a notice, not final submission.
4. Add service/domain/unit tests and deterministic browser fixtures/scenarios, including persistence, revision invalidation, retries, offline, photo/video, processing and responsive bounds.
5. Review six upload screenshots against reference 13 at 390×844 and 360×800/430×932. Add only deliberately reviewed Phase-06 baselines. Update upload/API/route docs.
6. Run actual lint/typecheck/unit/full Playwright/build. Distinguish root pre-existing readiness failure from intended-source validation. Review/stage only task files, commit/push normally and verify remote HEAD.

## API impact
Planned generic evidence POST/register, binary signed URL transport, POST complete and GET evidence status. Stable local job ID is idempotency key for register/complete; protocol remains backend-unconfirmed. Odometer PUT remains separate. Upload counts mean binary uploaded-or-beyond; processing is not verification. File restart after interruption, not byte-range resume.

## Testing
Injected transport/store/clock for deterministic coordinator tests; real IndexedDB browser fixtures for durable jobs and media references. Existing capture/marker/odometer/video tests remain. Six reviewed screenshot baselines, all three target widths, accessible progress/retry/focus and object-URL cleanup. Full runner must exit, not merely finish assertions.

## Acceptance criteria
- [x] Queue metadata durable, stable identity, no Blob duplication or stale-job transfer.
- [x] Photo/video share transport, bounded concurrency, safe offline/retry/restart.
- [x] Capture state independent from upload and verification.
- [x] Upload Center usable/accessible, odometer excluded from derived denominator.
- [x] Existing phase behavior and unrelated user work preserved.
- [ ] Reviewed new visuals, validation exit results documented, intended changes committed/pushed.

## Progress
- [x] Inspect state, source/reference/design guidance and snapshot unrelated edits.
- [x] Implement queue and coordinator.
- [x] Implement Upload Center and capture navigation.
- [x] Tests and visual review: 26 new unit cases (159 total), 16 new browser scenarios, six inspected upload baselines; all three viewports, video preview and offline odometer/video replacement.
- [ ] Documentation, validation, Git review/commit/push.

## Discoveries
- Local Query operations needed `networkMode: always`; otherwise offline IndexedDB reads/saves paused. Browser regressions now cover offline entry and media/data saves.
- A deferred photography route focus frame could reset an already user-focused input under concurrent test load. Guard preserves input focus; unit and keyboard viewport regression cover it.
- Root full Playwright first run exited 1: 98 pass/45 intentional desktop skips, two obsolete service-unavailable text assertions plus the unchanged readiness 4010-pixel mismatch. Updated only the now-obsolete upload-boundary assertion; readiness files/baseline remain untouched. Final intended-source validation will exclude all 22 snapshotted unrelated local edits.
- Normal Playwright lifecycle exits successfully; no runner timeout increases or stalled-process workarounds.
