# Durable evidence uploads — Phase 06

## Boundary and package

The configurable customer package remains **12 photographs + one manual odometer reading + one
walk-around video**. It currently has 13 required media files, derived by `requiredMediaCount`, never
a platform constant. Odometer is package information, not a Blob/job; its planned PUT stays separate.
Production photography is 2D. No final submission/receipt is implemented.

`/inspection/[inspectionId]/upload` is the Upload Center. Completed local capture review continues
here. Sending is the current journey stage. The next-phase button requires local capture completion
and all current required media binary-uploaded-or-beyond, without a retake request. It exposes a
future-summary boundary, not insurance submission. Mock sending is explicitly labelled experimental.

## Ownership

- `upload-model`: typed references/jobs, stable identity, derived counts and labels.
- `queue-repository`: metadata-only `inspection-upload-queue` IndexedDB, jobs + mock settings.
- `media-source`: reads existing photo/capture repositories by durable key, validating revision,
  MIME and bytes. Queue records never contain Blobs or base64.
- `upload-coordinator`: transient AbortControllers/timers; durable claim/progress/outcome.
- `upload-transport`: shared photo/video upload/check contract. Mock performs no HTTP. A future
  authenticated adapter owns registration, signed URL, transfer, completion and status polling.
- `UploadRuntime`: app-start/online/page lifecycle and Query invalidation. Query reads durable
  metadata, not a duplicate Zustand queue. Local repository reads/writes use `networkMode: always`.

Capture credit is independent of upload and verification. Upload failure cannot remove accepted
photos/video or odometer. Job `upload` is local/queued/uploading/uploaded/failed/cancelled;
`verification` is not-started/processing/verified/retake-requested. Processing has no percentage.

## Scheduling, restart and retry

Two concurrent claims across tabs limit mobile/video pressure. A readwrite transaction claims
atomically; owner/20-second lease prevents duplicates. Heartbeats renew slow work. Route changes
retain the root coordinator. App exit aborts requests, clears timers and releases claims best-effort.
Expired claims recover after interrupted browser processes (up to 20 seconds). Job IDs, attempts,
progress and successful remote identity survive refresh/restart where origin IndexedDB is available.

Resume triggers: **app start, browser online event, Upload Center open, manual retry**. Browser
network state is advisory; transport errors still use retry policy. Offline aborts current work,
resets its byte counter and retains the queued job/Blob. No claims resume until online. Individual
files restart from byte zero; byte-range resume is not claimed. Background Sync is an optional
future enhancement, not correctness. Serwist/dev-origin configuration remains unchanged.

Retryable transfers use 1s/2s exponential delays (30s policy cap), at most three automatic attempts.
Exhaustion offers individual/all retry; manual retry resets errors/scheduling but retains identity.
Non-retryable errors offer evidence review/recapture, not endless retries. Processing-status failures
retain binary completion and poll after 30s. Storage errors are actionable; missing/unreadable Blobs
cannot be marked uploaded. Other jobs survive.

## Revisions and replacement

Job ID is namespace + kind + requirement ID (video has its own kind) + accepted revision. New photo
confirmation receives a random revision token; older records use capturedAt/MIME/size as a stable
fallback. Video uses its existing accepted Blob key. Drafts are not enqueued: old accepted evidence
stays current until atomic local confirmation. Reconciliation cancels obsolete pending/in-flight
jobs, retaining successful server history. Owner guards reject late callbacks; the coordinator also
checks the accepted revision at each progress checkpoint and before publishing success. No local
media is deleted after upload. A future adapter must preserve old server-good evidence until replacement
completion; planned idempotency/replacement behavior still needs backend agreement.

## Progress and presentation

“فایل ارسال شده” counts **binary uploaded**, including processing/verified. It does not mean verified
or insurance-submitted. Ring denominator is derived media count, never combined photo/data/video
requirements. Row upload percentages derive from mock callback byte counts. Verified uses explicit
text/icon, processing an indeterminate label, failure a reason/specific retry. Default mock fractions
are 15/45/75/100%; settings deterministically simulate slow/once/always/terminal failure and processing.
Browser fixtures seed queued/mixed/offline/uploading/failed/processing/uploaded/verified/video states.

Reference 13 informs compact progress/image rows/restrained status treatment. Existing AppViewport
owns 100dvh. Header/progress/actions are stable; the list is the only vertical scroll region. Targets
are >=44px. Progressbars have labels; status has text/icons. No decorative animation. Visible photo
rows downscale a thumbnail and release bitmap/object URL; video uses an icon, never autoplay or eager
decoding. Only metadata reaches Upload Center Query; source Blobs are read on demand one record at a time.

## Limitations and reset

No production API/auth-refresh integration, background worker, byte-range resume, cleanup policy or
final submission. IndexedDB eviction/private-mode limits remain. Mock transfers do not guarantee
delivery to a real server. GPS/media permissions are unaffected.

Reset per origin by clearing `inspection-upload-queue` to remove mock jobs/settings while preserving
`inspection-photos` and `inspection-capture-data`. Clear all three only to intentionally discard
capture evidence. Localhost/LAN storage remains separate; fresh visitors still start on the same
landing/mock workflow. Clearing storage is not an upload recovery action.
