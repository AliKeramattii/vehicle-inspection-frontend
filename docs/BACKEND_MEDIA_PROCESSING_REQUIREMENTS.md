# Planned ASP.NET Core media processing requirements

Proposal for backend/insurance review; no production API, worker, storage service or authentication has been implemented by this task. Existing endpoint catalog and idempotency/tenant contracts remain authoritative. Each brokerage hosts an independent ASP.NET Core API and MSSQL metadata database; private filesystem holds binaries.

## Existing resource boundaries

Reuse evidence registration -> binary transfer -> evidence complete -> processing/status/private retrieval. Do not add a separate photo/video upload pipeline. Planned POST /api/inspections/{inspectionId}/evidence, POST /api/evidence/{evidenceId}/complete, GET /api/inspections/{inspectionId}/evidence and authorized GET /api/inspections/{inspectionId}/evidence/{evidenceId}/file remain proposed. Transfer may be authenticated streaming/multipart or negotiated signed upload; no signed URL protocol is confirmed. PUT /api/inspections/{inspectionId}/odometer remains integer data, outside media counts.

Metadata needs kind photo/video-360, inspection/attempt/template/version, requirement linkage where applicable, exact evidence revision, stable job/idempotency key, correction-request linkage, expected bytes/MIME and checksum algorithm/value when agreed. Server computes and verifies its own hash. Optional image optimization descriptor records source/accepted dimensions, orientation normalization, sizes, MIME, chosen variant and policy version; client claims are untrusted. Optional video metadata distinguishes requested profile from actual width/height/fps/codec/bitrate/duration. Never accept camera device identifiers or private local Blob URLs as backend file paths.

## Authorized ingest and validation

Resolve tenant, customer ownership or assigned staff rights from authenticated server context. Inspection IDs/reference codes are identifiers, not authorization. Restrict CORS/CSRF/credentials/rate limits to the agreed deployment. Validate real signatures/container/decoding, extension-independent type, bytes, dimensions, pixel/decompression limits, duration and configured quality rules. Reject 413/415/422 with structured safe errors; 409 identifies stale revision/idempotency conflicts. Do not trust browser MIME/header sniffing. Quarantine/temp-write until validated, then publish using immutable revision names. Retries with the same registration/completion key must not create duplicate evidence.

## Private filesystem and MSSQL

Private configured storage root -> INSPECTION_{InspectionId} (no CustomerId folder). Canonicalize safe IDs and verify path containment; never accept relative paths from clients. Binaries stay outside web root and are not SQL VARBINARY/FILESTREAM/Base64 JSON. MSSQL stores relative paths, ownership, kind, revision, sizes/hashes/MIME/dimensions/duration, variant links, capture/processing times, processing state and audit linkage. Use immutable per-revision files. Filesystem publish plus SQL is not one atomic transaction: define compensating cleanup, reconciliation and a transactional processing outbox before release.

## Variants and processing

Keep source/original, accepted, review and thumbnail as explicit linked variants. Whether source must also be uploaded, and which variant is legally authoritative, requires approval: current browser uploads selected accepted bytes and retains source locally when optimization was used. Server must not pretend to possess that original. Never overwrite the accepted audit source in place.

Generate orientation-correct lightweight filmstrip thumbnails and review-quality derivatives asynchronously. Preserve exact accepted source; do not repeatedly chain lossy encodes. Track queued/processing/failed/ready independently from uploaded/verified and reviewer decisions. Idempotent worker jobs operate on immutable revision/hash, with retry caps, dead-letter/recovery and stale-revision checks. A processing failure must not erase uploaded evidence.

Optional video transcoding belongs to a controlled server worker with CPU/memory/time budgets, safe codec/container validation and configurable output profiles. Preserve original accepted container; derive mobile/review playback + poster where approved. Do not require client FFmpeg/WASM. Browser 720p/1080p synthetic results do not approve field quality or select insurer limits.

## Private retrieval and cache

Authorize each variant/range access against tenant/inspection/assignment and current scoped requests. Return Content-Type, Content-Length, approved dimensions/duration, immutable revision/hash and safe disposition. Video needs validated byte-range/206 support and consistent range errors. Prefer authenticated same-origin endpoints; short-lived signed access only if explicitly agreed, non-guessable and scoped, never permanent public paths. Thumbnails still require authorization. Use private/no-store or specifically approved private caching; never service-worker/public CDN-cache private evidence by default. Error responses/logs exclude tokens, filesystem paths and customer data.

## Forwarding and lifecycle

Brokerage-specific destination adapter selects the approved immutable variant, with audit, idempotency, destination acknowledgement, bounded retries and a transactional outbox. Reviewer approval is not destination delivery. Retake replacements retain original submission/evidence history until new revision validation/confirmation; stale upload/worker jobs cannot reactivate obsolete files. Do not delete local/server-good evidence immediately after upload/submission. Retention, legal hold, derivative cleanup, abandoned upload expiry, resumable/chunked transfer, malware scanning and disaster recovery require explicit backend/product policy.

## Decisions/gates

- Insurer-approved quality/detail and MIME/pixel/duration/size limits, including real VIN/plate/cluster samples.
- Required original vs optimized transfer, evidentiary authority and metadata privacy.
- Actual upload transport, retry/resume protocol (current mock restarts a file), idempotency response/recovery and checksum agreement.
- Thumbnail/review sizes, protected caching and signed access/range semantics.
- Worker capacity/quotas, database/filesystem consistency, retention and forwarding contracts.
- Real customer authentication, staff SSO/assignment authorization and per-brokerage isolation.

No endpoint in this document is represented as implemented. See API_CONTRACT.md, API_CONTRACT_REVIEW_CHECKLIST.md and API_IMPLEMENTATION_PRIORITY.md before backend development.


## Current photo policy v2 — planned contract clarification

New inspections require **10 fixed photographs + one selected from four existing VIN/spec alternatives = 11 photographs**, plus separate numeric odometer and one walk-around video. Historical twelve-photo snapshots remain pinned. See PHOTO_REQUIREMENT_POLICY_V2.md for exact IDs/labels/assets and compatibility.

PROPOSED: use the existing generic evidence registration/completion resources with templateId, templateVersion, photoPolicyVersion, stable logical requirementId (`spec-plate` for the v2 group), selected alternativeId (`pillar`, `engine`, `seat`, `windshield`), evidence revision, kind, expected bytes/MIME and stable idempotency metadata. A chosen alternative is not an additional requirement or file. Server must validate pinned policy, require ten fixed photos and one valid chosen photo, prevent two active group revisions, and reject stale uploads/processing/forwarding responses. Odometer is numeric data, video is separate generic media. No endpoint is implemented here.

Keep private filesystem media and MSSQL metadata separate, with original/accepted/thumbnail variants, authorized retrieval and immutable revision history. Reviewer and final brokerage delivery use the approved revision and its actual selected alternative, with audit, retries, idempotency and destination acknowledgement. Tenant inspection API/auth/SSO configuration remains independent of shared global Neshan settings. No new public media URLs or browser credentials are introduced.
