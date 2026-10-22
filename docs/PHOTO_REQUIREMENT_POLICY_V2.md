# Photo requirement policy v2

## Current rule and exact mapping

New inspections use **10 fixed mandatory photographs + exactly ONE photograph selected from FOUR existing VIN/specification locations = 11 required photographs**, across seven unchanged sections. Numeric odometer and required 360-degree walk-around video remain separate. This template therefore has twelve media files (eleven photographs plus one video), derived from configuration, never a platform-wide denominator.

The single logical requirement retains `spec-plate` as its stable requirementId. Its typed choice.groupId is `vehicle-identification`; it contains these mutually alternative IDs:

| alternativeId | Existing Persian suggestion (unchanged) | Active approved guide |
|---|---|---|
| pillar | پیشنهاد ۱: کد درج شده بر روی ستون کنار درب راننده (اکثر خودروهای خارجی) | /assets/inspection-vehicle/photo-guides/spec-plate.webp |
| engine | پیشنهاد ۲: کد درج شده بر روی دیواره موتور (اکثر خودروهای داخلی) | /assets/inspection-vehicle/photo-guides/chassis-number.webp |
| seat | پیشنهاد ۳: شماره شاسی درج شده در زیر صندلی راننده یا شاگرد (برخی خودروهای خارجی) | /assets/inspection-vehicle/photo-guides/spec-plate-2.webp |
| windshield | پیشنهاد ۴: شماره شاسی درج شده در حاشیه شیشه جلو خودرو (برخی خودروهای خارجی) | /assets/inspection-vehicle/photo-guides/windshield-vin.webp |

The ten fixed IDs are front-45-right, back-45-right, front-45-left, back-45-left, front-plate, rear-plate, odometer-on, driver-interior, engine-bay and car-roof. The legacy independent chassis-number requirement is absent only from NEW v2 templates. Its asset remains in use by the engine alternative; no image or historical ID is removed.

## State ownership and customer experience

inspection-template.ts exports immutable-by-consumer legacy v1 and current v2 definitions; templateCapturePlan adapts either without a second rule list. photoPolicyVersion:2 denotes business policy independently from Admin template publication version. A newly created Admin template may therefore have templateVersion:1 and photoPolicyVersion:2.

A nested choice occupies ONE PhotoRequirement, so progress, section counts, markers and carousel derive eleven logical slots directly. Other three alternatives are guidance, never pending media. Guidance shows all four original buttons and location-specific images/instructions; one chosen guide leads into the existing camera/review. Selection stays separate from evidence status. Cards, overview, review sample, upload title and Reviewer sample use the captured alternative identity.

Pre-capture preference selectedAlternativeId is persisted on the existing private photo record through existing normal/scoped edit guards. Session state is only a legacy presentation fallback. Durable selection is authoritative when available; null explicitly reopens the chooser without deleting accepted evidence. Rapid choice writes are serialized and outdated UI callbacks are ignored. A draft owns its captured alternativeId; confirmation copies that exact identity to accepted evidence. Changing the guide preference cannot relabel accepted or draft bytes. Review uses evidence identity, not a mutable preference.

validPhotoChoice and requirementStatus prevent a group record with no/unknown alternative from satisfying capture or generating an active upload. All ten fixed photographs, valid odometer, accepted video, confirmed location/vehicle and binary-upload readiness remain required for submission. Uploaded plus processing/verified policy is unchanged; queued/local/uploading/failed media blocks submission. No locally saved file is presented as delivered.

## Replacement, races and retention

Accepted A remains the only active valid evidence while a preference or draft B is unconfirmed. Draft B receives a fresh revision. Discard leaves A and its completion credit intact. Successful confirmation atomically promotes B and archives A (including original backup/optimization metadata) under photoRevisionKey in the SAME IndexedDB transaction. History uses a separate key/namespace prefix, so it does not appear in normal lists, counters or upload candidates. A quota failure rolls the whole transaction back. No database/store upgrade, automatic cleanup or historical rewrite is performed.

Existing revision-aware queue reconciliation cancels stale pending/in-flight A only after B confirmation; late callbacks cannot reactivate A. Job IDs remain namespace/kind/logical requirement/revision. Only one active group job is derived. Historical uploaded metadata remains available; Reviewer can resolve retained choice revisions lazily without loading their bytes in normal progress lists. Confirmation can require an expected draft revision; optimizer revision/attempt CAS and source-first variant selection are unchanged.

Submitted inspections remain locked. Existing additional-evidence request authorization opens only the exact requested logical requirement in its separate request namespace. All four locations remain eligible for a request targeting the logical identification requirement; requesting that group does not unlock fixed photographs, vehicle fields or original submission media. Reviewer decisions and resubmission history remain tied to exact revision/request; no additional workflow is introduced.

## Historical compatibility and pinning

The old twelve-photo template is exported as legacyPhotographyTemplate with its original templateId, templateVersion:1, IDs, section order and namespace. New default is version 2 with photoPolicyVersion:2. Existing frozen submission/request templates remain authoritative. Older untemplated summaries are resolved using their known namespace; demo request fixtures derive from the original submitted template/jobs.

The existing confirmed-facts IndexedDB record now holds an optional photographyTemplate snapshot. pinPhotographyTemplate is first-writer-wins in a read/write transaction. An existing pin is never replaced by a new default. For unpinned historical data, saved submission snapshot/namespace, pre-policy confirmed facts, legacy photo activity or legacy odometer/video data conservatively preserve v1. New inspections with no previous activity get v2, pinned before consent/location writes. No evidence is copied between namespaces. Ambiguous old facts remain legacy rather than being silently migrated.

Existing Admin persisted publications/drafts remain unchanged and are validated under their original policy. Fresh Admin workspaces default to v2 while retaining the immutable v1 published snapshot so existing White-Label references remain valid. Newly created templates use v2; creating a new template does not rewrite an existing published version. V2 Admin validation preserves all ten mandatory IDs plus exactly one four-choice slot; v1 editing/history still validates the twelve original IDs. Mock customer defaults/pins are built-in; real tenant template assignment/publication selection remains a future API contract, not a claim of backend integration.

## Proposed backend contract (not implemented)

Evidence registration carries tenant/inspection ownership from authentication, templateId, templateVersion, photoPolicyVersion, logical requirementId, alternativeId when applicable, evidence revision, kind, byte size, MIME and stable idempotency key. AlternativeId is not a new PhotoRequirement ID. Server validates it against the pinned template and allows only one active accepted revision per logical group. Unknown alternatives, conflicting active revisions and stale completion/processing/forwarding callbacks must not satisfy readiness. Historical policy snapshots, revisions, reviewer reasons and delivery acknowledgements remain auditable.

Media is private filesystem content; MSSQL stores metadata/variant/revision links, never Blob/Base64 payloads. Existing generic photo/video upload, protected retrieval/range, optional server thumbnails/transcoding and brokerage forwarding boundaries are reused. Numeric odometer remains PUT data, not a file. Global Neshan configuration remains independent of tenant inspection APIs.

## Performance scope

This task reuses the completed source-first worker/canvas optimizer, EXIF/no-upscale/pixel budget, CAS, original backup, bounded namespace reads, lazy Reviewer thumbnails/cache, video MIME/track metadata and shared concurrency-two queue. It adds no new compression/upload pipeline or dependency. Previous twelve-sample benchmark numbers remain historical lab measurements, not relabelled eleven-photo results. No general startup or insurer-quality improvement is claimed merely from removing a logical slot. See PERFORMANCE_BASELINE.md, PERFORMANCE_OPTIMIZATION_REPORT.md and MEDIA_OPTIMIZATION_POLICY.md.
