# Media optimization policy

## Status and ownership

Experimental, explicit opt-in, draft photos only. No insurer quality policy is implied. The twelve requirement IDs, numeric odometer, separate video, original capture quality and existing upload state machine remain unchanged. No library, production server or duplicate queue is introduced.

Existing photo database/store/version 1 and keys remain compatible. Optional fields extend PhotoDraft/LocalPhoto; no rewrite or deletion of old records occurs. `photo-store.ts` queries the encoded namespace key range, retaining a namespace check. Historical records remain readable. Source-first workflow:

1. Camera saves original Blob durably before review.
2. User requests candidate preparation. The source remains selected.
3. Each short write rechecks normal edit policy or exact scoped-request permission. CPU processing does not hold an IDB transaction/request lease.
4. Worker produces a candidate, or the bounded browser canvas/fallback retains the original.
5. A compare-and-swap checks both draft revision and attempt ID before candidate persistence.
6. User explicitly chooses source/candidate and inspects actual preview/zoom.
7. Existing confirmation atomically promotes the selected Blob. If candidate is selected, sourceBlob retains original bytes. Accepted revision changes only at confirmation.

Pending/cancelled/failed preparation is not capture completion, upload success or reviewer approval. Reload never resumes unsafe work automatically: source confirmation or explicit retry remain available. No manual quality checklist is added. Source confirmation while processing invalidates late results.

## Initial experimental profiles

| Policy | Size eligibility | Dimensions | Encoding |
|---|---|---|---|
| Exterior | Skip already suitable <=600KiB within long-edge limit | No upscaling; long edge <=2048 | JPEG .88 |
| Technical/detail | Skip already suitable <=2MiB | Preserve source resolution after EXIF orientation; 2560 is a future experiment hint, not forced resize | JPEG .90 |

Policy follows requirement guidance/check semantics (text, focus, ignition/readability); unknown guidance is conservative. No duplicated list of requirement IDs. Plate/VIN/odometer/spec need additional visual review on real cameras. JPEG/WebP .80/.88/.90 are lab comparisons; production UI currently offers JPEG only. Backend WebP acceptance remains an agreement, not assumed.

## Bounded processing and compatibility

Header inspection reads at most 256KiB and recognizes JPEG/EXIF, WebP and PNG dimensions without full decode. Processing only accepts supported JPEG/WebP semantics. Animated/metadata-ambiguous WebP and PNG sources remain original. This is not a security file validator. EXIF from-image decode applies orientation once, never mirrors vehicle/text by CSS. Candidates must decode, have expected MIME/dimensions and reduce size by at least 10%; otherwise source wins. Source hashes in browser regressions verify byte preservation.

One optimizer per tab. Decoded source budget: 8MP on <=4GiB or <=4-core hints; otherwise 16MP. Hints are advisory, not a RAM guarantee. Larger images remain original. Worker with OffscreenCanvas/createImageBitmap is preferred; timeout 12s terminates the worker. Unsupported/CSP/initialization failure falls back to bounded asynchronous canvas. Abort terminates worker/listeners/timer; browser canvas decode/encode is not forcibly cancellable, so results are ignored after cancellation and decoded bitmaps/canvases/URLs are released. A failed lazy chunk records kept-original rather than permanent processing. No Base64, FFmpeg/WASM or repeated lossy chain: every retry reads original draft.blob, not the previous candidate.

## Revision and storage safety

Preparing/selecting a draft never changes the active accepted revision. Queue media references derive only from the accepted `.blob`, byte size/MIME and revision. Only after confirmation can reconciliation invalidate the old job and queue the smaller selected payload. Existing coordinator leases/concurrency 2/idempotency/backoff/offline handling remain authoritative. Stale uploads are cancelled through existing revision checks. Original storage costs extra space when a candidate is accepted; there is no automatic cleanup/retention decision.

Quota/CAS failures retain accepted and source evidence and offer retry/source confirmation. Interrupted metadata is recoverable. Submitted/closed/scoped authorization is checked at persistence boundaries, not bypassed by the optimizer. A raw private record may contain both original and candidate; future server policy must specify which variants are transferred, retained and forwarded. Current queue transfers selected accepted bytes only, not a second original upload.

## Reviewer media

Selected evidence uses full accepted revision only. Visible filmstrip items generate <=280x168 JPEG .75 previews after bounded dimension-aware decode. Per-case in-memory cache holds compact Blobs only, max 16 entries / 2MiB, deduplicates pending work, keys exact namespace/revision and clears on case change/unmount. Status-only progress does not reload that revision. Each mounted preview owns/revokes its URL. Video filmstrip uses an icon without loading video bytes. No adjacent full-resolution prefetch, public persistent cache, or auth change.

## Video

Default remains ideal 1920x1080, 30fps when supported, requested 2.5Mbps. Runtime MIME detection plus constructor fallback tries supported VP8 WebM, MP4, WebM and VP9 alternatives. Actual track width/height/fps and recorder bitrate are saved separately from requests before tracks stop. Browser-negotiated values can differ. No camera device ID is persisted. Existing pause/timer/discard/re-record and accepted replacement cleanup remain.

Current approved production capture is live-only. Unsupported recording has existing retry/supported-browser recovery, not a native file-picker fallback; the legacy nativeCaptureFallback settings field does not re-enable galleries. This task preserves that current behavior. Do not claim a native fallback test that did not occur.

## Required acceptance beyond this lab

Compare real low-light, motion, tiny embossed VIN, Persian/Latin plates, glare/cluster and spec labels on iOS Safari/Android Chrome; visually compare original/candidate at 100% and zoom. Approve minimum detail, maximum file/pixel sizes and accepted MIME with backend/insurance stakeholders. PSNR and byte reduction are regression indicators only. Keep originals and explicit source selection until acceptance. No asset or eleven-photo migration is authorized by this policy.

Primary technical references: [createImageBitmap orientation/resize](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap), [actual recorder bitrate](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/videoBitsPerSecond), [track constraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints).
