# Customer additional evidence (Phase 08)

Production remains Persian RTL and 2D image-guided photography. The original configurable package remains seven sections / twelve required photographs, one separate numeric odometer value, and one continuous walk-around video. A supplemental request does not change those totals.

## Request boundary and authorization

`features/additional-evidence/request-model.ts` defines versioned inspection-owned requests and discriminated photo/video items. Photo items reference existing `PhotoRequirement.id`, never a second navigation/title/sample mapping. Reviewer reasons and original evidence references belong to the request. The request retains its domain template snapshot so guidance stays stable if later templates change.

The initial submission record, reference, summary, facts, numeric odometer and original media namespace are unchanged. The global submitted edit lock remains active. Only `/inspection/{id}/additional-evidence/{requestId}` and its exact requested photo guide/camera/review or video record/review descendants enter a scoped guard. Direct access with another inspection, stale request, unrequested item, inactive request or resubmitted request fails closed before media UI mounts.

`scoped-media.ts` enforces the same permission at the service boundary for every save/confirm/discard. It exposes no odometer/location/vehicle mutation. The IndexedDB request transaction claims a short mutation lease; supplemental submission cannot claim while a media mutation is active, and new mutations cannot begin during submission. Normal submitted hooks/repositories continue rejecting edits. This is a mock authorization boundary, not a substitute for authenticated backend ownership checks.

## Durable candidates and originals

The request/version has a unique namespace containing inspection, template/version, request ID and request version. Existing photo and capture-data stores persist candidates there. Original submitted records and Blobs remain in the original namespace. Confirming a candidate replaces only the candidate; an accepted candidate survives a newer draft, discard, quota failure and upload failure. Original evidence is never deleted, overwritten or reset. Historical rounds retain independent namespaces, request records, candidate IDs and supplemental receipts.

Capture, upload and review/submission are separate. Local acceptance is not binary upload or reviewer verification. A replacement draft retains accepted credit but blocks supplemental submission until it is confirmed/discarded. There is no manual quality checklist and no numeric odometer editor in this workflow, even if an odometer photograph is requested.

## Reused capture and queue

The request controller supplies navigation overrides and reviewer reasons to the existing `PhotoGuidance`, `PhotoCamera`, `PhotoReview`, `VideoCapture` and `VideoReview`. Native selection, MIME detection, timers, stream cleanup, object-URL cleanup and evidence framing remain owned by those existing abstractions. Reasons remain visible in guidance, capture and review. Confirmation goes to the next unfinished requested item, then the request list; ordinary automatic photo continuation is unchanged.

Accepted candidates feed the existing `acceptedMedia` / queue reconciliation / upload coordinator / media-source / transport pipeline. Optional metadata links request ID/version/item and the evidence being replaced. Jobs reference durable Blob keys rather than copying or base64-encoding media. Confirming a newer candidate invalidates its obsolete queued/in-flight job; successful upload history is retained and late callbacks fail revision/claim checks. Original submission jobs use a different namespace and are unaffected.

Offline capture is allowed. Existing app-start, online, page-open and manual-retry triggers resume candidate jobs. Background Sync is optional. Resubmission is blocked offline. Byte upload completion (`uploaded`, possibly still `processing` or `verified`) satisfies the binary threshold; processing is never called reviewer approval. Missing/stale/queued/uploading/failed/retake jobs and unconfirmed drafts block submission. Individual and retry-all actions reuse the shared queue.

## Supplemental submission and recovery

One derived request-readiness helper matches each request item to its current accepted candidate revision and current job. The service re-reads durable state, transactionally claims the request, freezes the candidate IDs, then rechecks the revisions before transport. A stable idempotency key is reused for an unchanged payload; a deliberately changed candidate package gets a new identity. Double clicks/tabs return the in-flight attempt, never a second transport call. The key, attempts, lease, candidate IDs and receipt persist in `inspection-evidence-requests`.

The deterministic mock supports success, slow response, failure, retry success and uncertain acknowledgement. Its acknowledgement store makes replay recoverable after navigation/restart. An expired abandoned lease becomes retryable; recovery transactionally rechecks the current owner/expiry so it cannot release a newer claim. No capture/upload evidence is reset. Successful resubmission locks that request and shows the existing inspection reference, replacement count and truthful rereview timeline. It does not overwrite the initial submission or invent an approved result. No polling after success; short status refresh runs only while a submission or capture mutation lease is active, and subscriptions close on unmount.

The mock freezes stable local queue revision IDs as candidate references. A future backend transport must map these to remote evidence IDs and enforce request/version ownership and idempotency server-side; the presentation does not depend on transport DTOs.

Future `needs-more-evidence` status is derived from an active request; the initial submitted record remains historical truth. One active request is supported, with multiple historical rounds. A later round can be created after the prior round is resubmitted/resolved; the server must own that decision and target the correct prior evidence revision.

## UI and references

Reference `16-additional-evidence-retake.png` governs the request list: compact sending-stage journey, orange request notice, substantial canonical sample images, explicit reviewer reason, per-item action/status and a stable bottom action. Existing guide/camera/review references govern reused screens. The historical reference's CAP-14 and alternate journey label are not imported into the current template or labels. Existing custom icons, blue #2563EB and Vazirmatn are preserved. No automotive asset replacement or customer 3D.

Existing AppViewport bounds the outer application to 100dvh. The request list has one internal vertical scroll region and a fixed bottom action. Review/camera retain their existing light/dark contexts. Targets: 360×800, 390×844, 430×932. Status includes text/icons, controls have specific names and at least 44px targets, progress has semantics, and there are no added decorative animations.

## Mock activation and planned API

There is no customer-facing request-creation control. In development only, after submitting and opening the receipt, `await window.requestAdditionalEvidence("two-photo")` activates a deterministic mock request. Other fixtures: `one-photo`, `video`, `mixed`. Production removes that bridge. Tests seed equivalent typed records directly into real browser IndexedDB. Default example targets are `front-plate` and `chassis-number`, mapped to current canonical guidance.

See API_CONTRACT.md for planned request retrieval, replacement evidence linkage, idempotent resubmit and status. All runtime operations remain mocked. Cross-database media/request operations use scoped leases and revision checks; true server-side ownership/version transactions remain a backend integration responsibility. The current mock supports one active request, full-file retry and no real reviewer notifications.

## Validation

Validation results and manually reviewed new visual baselines are recorded in the Phase-08 ExecPlan at completion. The unrelated readiness working-tree mismatch remains excluded and untouched.
