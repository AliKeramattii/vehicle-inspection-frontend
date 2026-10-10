# Customer submission — Phase 07

## Flow and package

Upload Center → `/inspection/[inspectionId]/review` → submit → `/submitted`.
The configurable current package remains **12 required photographs, one manual odometer reading,
one walk-around video**. Video is not a photo and odometer is not a file. Media totals derive from
the template; the current template has thirteen media files. Production photography stays 2D.

## Summary and readiness

`summary-source.ts` reads current confirmed inspection facts, the photography template, durable
capture metadata and queue jobs. It reads photos one at a time; no full-resolution Blobs enter the
summary Query cache or submission record. Existing `UploadPreview` decodes only visible photos,
shrinks them and releases object URLs/bitmaps. Video has an icon/duration, with no autoplay or
duplicate player. Edit/review links reuse location, vehicle, photo, odometer and video flows.

`deriveInspectionSummary` is the authoritative submission view model/readiness derivation. It
reuses `capturePackageProgress` and `uploadProgress`, matches current accepted media revision IDs,
and also requires confirmed location/vehicle. All accepted required photos, valid numeric odometer
and accepted required video must exist. Only `upload === uploaded` counts as binary complete:
verification may be not-started, processing or verified. Processing is explicitly not verification.
Local/queued/uploading/failed, missing/current-revision mismatch or retake-requested media block.
An accepted photo with a replacement draft retains accepted credit; an unconfirmed draft is not
submitted as accepted media. Upload Center owns retries. No manual completion checkboxes exist.

## Service, durability and idempotency

`submission-model`, `submission-repository`, `submission-service` separate formal inspection
submission from capture/upload/verification. IndexedDB `inspection-submissions` v1 has metadata-only
records by inspection ID, mock acknowledgements by stable idempotency key and deterministic test
settings. No media bytes, auth tokens or localStorage queue are added.

The service re-reads readiness before submission and transactionally claims one attempt with a
stable random idempotency key. A thirty-second lease prevents parallel claims across tabs and
recovers abrupt interrupted attempts. Normal pagehide/unmount/offline abort clears transport timers
and releases the claim as retryable failure. An expired lease becomes failed; retry uses the same
key. Keys use getRandomValues, which works on the existing LAN development origin too.

The mock transport replays its durable acknowledgement for that key. An uncertain response can
recover the acknowledgement without resubmitting. A receipt persistence failure leaves the
acknowledgement recoverable. Successful metadata includes confirmed facts, the existing inspection
reference and submitted timestamp. Receipt recovery is independent of ephemeral mock login:
refreshing a submitted inspection opens its receipt, while a fresh visit to `/` still starts at
landing. Pre-submit edits still require the normal mock authentication/journey. No auth persistence
or origin configuration changed.

The explicit final CTA and adjacent explanation provide concise confirmation: submission sends
the inspection for review and locks ordinary editing. There is no additional confirmation checkbox.
Submitting disables duplicate activation and is announced; failure preserves all evidence and
offers retry. **Offline policy A:** block formal submit until online; never claim background success.

## Receipt/status and edit lock

Receipt uses reference BDI-8F31K2, the supplied success SVG, mock estimate «کمتر از ۲ ساعت» (labeled
as an estimate), and sent-completed → review-queue-current → result-upcoming timeline. No completed
review is fabricated. `useSubmissionRecord` is a local mock status provider; it polls only during an
active submitting claim, not after receipt. Planned API status replaces this boundary later.

An inspection layout guard checks durable status before editable children mount. Photo/video camera,
replacement, odometer, location, vehicle and upload routes redirect to receipt after submission;
submitting redirects to final review. Mutation policy also checks durable status for location/vehicle
and capture hooks. Same-tab events and BroadcastChannel invalidate metadata across tabs. Receipt
before submission redirects to final review, which gives legitimate incomplete/auth recovery.
Submitted summary reopens its receipt. Local media is never deleted by submit.

The domain includes needs-more-evidence/review-complete, but additional-evidence editing requires
future explicit scope/authorization. This phase does not implement that workflow or permanently
remove the ability to add it. There is no reviewer/admin integration.

There is no configured external partner return URL. «بازگشت به بیمه‌گر» performs a documented local
mock return to `/`; no insurer URL is invented. Future real receipt retrieval must authenticate
inspection ownership; the unauthenticated local mock receipt is not a production authorization design.

## Visual/viewport decisions

References 14/15 define evidence-first final review and calm receipt hierarchy. Current counts and
separate data/video take precedence over their historical fourteen-photo text. Summary uses one
internal scroll region and a stable BottomStickyCTA. Receipt fits the three acceptance viewports.
AppViewport retains 100dvh, safe areas and keyboard handling. Persian Vazirmatn/#2563EB, semantic
status text, existing logo/partner identity, plate ordering and LTR reference/VIN are preserved.
The supplied line-art success SVG is simpler than reference 15's detailed illustration; no automotive
asset was generated or replaced. Six new baselines are reviewed; earlier baselines stay unchanged.

## Mock limitations and future backend

No ASP.NET request, SLA, external partner return or live review progression is implemented. Mock
acknowledgements are same-origin IndexedDB, not a real remote service. Clearing browser storage
removes local receipts/media; storage is never cleared automatically. Abrupt crash without a known
acknowledgement may require waiting for the lease expiry before retry. Pre-submit auth remains fresh
on reload as established by origin-parity work. Real status/submit adapters must enforce ownership,
validate the package revision atomically and honor idempotency on the server; a browser guard alone
is not server authorization. See API_CONTRACT.md for planned operations.
