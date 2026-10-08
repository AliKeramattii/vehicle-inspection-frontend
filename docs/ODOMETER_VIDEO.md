# Phase 05: manual odometer and walk-around video

Phase 06 now connects completed capture review to the mocked Upload Center. Photo/video share
metadata-only durable upload jobs referencing these stores; odometer remains separate numeric data.
See `UPLOAD.md` for transfer/verification state, offline retry and replacement boundaries.

The current configurable capture package is **12 required photographs + 1 manual odometer reading
+ 1 required 360 walk-around video**. The odometer photograph (`odometer-on.webp`) remains one of
the twelve. Numeric data and video are not PhotoRequirements. Production photography remains 2D;
there is no default WebGL/Three/R3F/GLB, panorama, tracking or analysis.

## Domain and ownership

The template's optional captureRequirements links the odometer photo and declares required video.
`capture-package-model.ts` owns OdometerReading, LocalMediaMetadata, VideoDraft, LocalVideo360,
derived package completeness and next task. Photo progress still derives only from required photos.
The generic Evidence schema discriminates image/video360 media with matching photo/video-360 kind;
only photographs require a shot code. Shared evidence states, reviewer reason and MIME/byte/blob-key
metadata keep future queue preparation compatible without implementing an upload pipeline.
The next task is photos, missing reading, video, local review. An accepted video replacement draft
keeps completion credit; explicit retakeRequired blocks readiness and retains original/reviewer reason.

`CaptureDataStore` is the durable local repository boundary. `inspection-capture-data` IndexedDB v1
/ packages is namespaced exactly like existing photos, without migrating their database. Odometer
and video writes are atomic transactions; each connection closes on completion/abort/error.
Accepted video and draft coexist until confirmation. Failed/discarded replacement keeps the original.
Query owns repository results/mutations. Temporary recorder/session/timer refs belong to the hook;
blobs are never persisted in Zustand or localStorage. Reset development media by clearing both
inspection-photos and inspection-capture-data site databases (origins have independent storage).

## Odometer review

`OdometerField` uses RHF/Zod, a real label, numeric inputMode, helper/error association and Persian
formatted initial value. Digits normalize from Persian, Arabic-Indic and Latin. Ungrouped integers or
consistent three-digit comma/Arabic-thousands/space grouping are accepted. Zero is valid; negatives,
decimal/alphabetic/malformed separators and values beyond MAX_SAFE_INTEGER are rejected.
The value is stored as integer kilometers, not formatted text. Accepted cluster evidence stays visible
and editable. Replacement preserves the reading. Photo acceptance and data save remain separate:
a data-save failure does not undo photo credit, and missing numeric data blocks package readiness.

## Recording and review

Thin server routes add /capture/video/record and /capture/video/review under the existing scaffold.
`VideoCapture`, `VideoOrbit`, `VideoReview` and `useVideoRecording` remain isolated from ordinary
photo UI. Dark capture/light review reuse existing primitives and AppViewport. The supplied top-view
car and 2D circle instruct the user to walk slowly around the vehicle. Progress is elapsed-time
guidance (43 seconds to the illustrative full ring), not measured physical position/completion;
recording never automatically stops when this ring fills. Guidance uses no fake quality checks.

`video-recorder.ts` detects MediaRecorder and MIME support (VP8 WebM, MP4, generic WebM, VP9).
It requests video only through CameraService on explicit start. Start resolves on actual recorder
start; stop waits for final dataavailable/stop, records actual MIME and elapsed duration, then releases
tracks/listeners. Route exit, hidden page, error and late permission responses release the session;
the hook clears its timer and cancels pending metadata reads/navigation. Native video selection/
device capture stays available on unsupported browsers, denied camera and insecure LAN HTTP.
File MIME/size/duration are validated (250MB limit). Native duration probes revoke URLs and clear
their timeout/abort listener. Recorder chunks are transient until the final Blob is durably written.

Review plays the durable video with native controls, duration and local status. Confirmation atomically
promotes the draft. Re-record discards only a draft, never good accepted evidence. Playback failure
has explicit feedback; save failure retains retryable evidence. No manual quality checklist or real
backend upload exists. Phase 06 uses these unique media keys and shared metadata in one durable
mock photo/video queue, not a separate video pipeline.

## Local review and viewport

PhotographyCompletion shows separate photos / kilometers / video statuses and editable/reopenable
links. Its send continuation is disabled unless locally complete; Phase 06 activation opens the mocked
Upload Center. It does not submit the inspection. The existing single internal scroll region, stable bottom actions,
safe-area padding, keyboard resizing and physical/RTL semantics remain intact.

## Validation and limitations

Deterministic unit/browser fixtures replace camera, MediaRecorder and time. The small playable WebM
fixture is test-only, generated from an unchanged canonical image with finite 28-second metadata.
Runtime never fabricates video from a sample. Screens are inspected at 360x800, 390x844, 430x932;
odometer also at keyboard height. Browser/real-device codec, native capture and keyboard differences
still warrant phone testing. Browser storage may be evicted or denied; UI reports/retries failures and
does not claim durable remote backup. Camera secure-context requirements still apply.

Planned API details are in API_CONTRACT.md; no runtime ASP.NET requests, secrets, automotive asset
replacement, upload implementation or optional 3D work were added. Known readiness user edits and
their unrelated screenshot mismatch remain outside this task.
