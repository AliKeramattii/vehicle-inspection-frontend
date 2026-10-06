# Phase 04 — production image-guided photography

The previous uncommitted customer 3D/14-shot direction is superseded. Production uses a 2D image
overview → section → requirement → sample/guidance → camera → comparison → confirmation.
The current template has seven sections and twelve required photos; the architecture is configurable.

## Configuration and ownership

`features/photography/inspection-template.ts` is the sole metadata configuration. Sections contain
typed/Zod-validated requirements, exact sample paths, descriptions/instructions, framing metadata,
quality confirmation labels and stable IDs. `templateCapturePlan` derives flat slots for existing
foundation/future viewer consumers. The mock repository returns clones through its existing
`getCapturePlan` boundary. No API DTO or ASP.NET request is used in presentation.

Query owns template/inspection and local accepted/draft evidence reads. Domain helpers derive
total/completed/remaining, section status and next incomplete requirement. Local React state owns
camera lifecycle and unchecked review confirmations only. No new Zustand state or framework exists.
Fresh templates start at 0/12; captured/uploading/uploaded/verified satisfy a requirement, pending
and retake-requested do not. Local capture is not a remote upload acknowledgement.

## Components and routes

Thin server capture layout/pages retain the shared journey header, current photography step and
LTR demo inspection reference `BDI-8F31K2`. The mock reference is presentation context; production
reference acquisition remains part of the agreed inspection response contract.

- `/capture`: `PhotographyOverview`, compact `PhotographyProgress`, clean vehicle photography,
  simple view links and explicit `SectionRow` navigation. Completed sections remain clickable.
- `/capture/section/[sectionId]`: `SectionDetail`, large reusable `PhotoRequirementCard` samples,
  captured image, view/replacement and reviewer reason actions.
- `/capture/photo/[requirementId]/guide`: `PhotoGuidance`, full sample, three instructions and metadata.
- `/capture/photo/[requirementId]/camera`: `PhotoCamera`/`useCamera` and isolated browser camera service.
- `/capture/photo/[requirementId]/review`: `PhotoReview`, side-by-side sample/user images, fullscreen
  enlargement in the existing focus-managed dialog, customer quality checks and shared sticky actions.
- `/capture/review`: `PhotographyCompletion`, derived full/partial progress and reopenable sections.
  This is local review, not remote submission. No upload/submission routes existed before this task.

`PhotographyWorkflow` reads mocks, verifies earlier workflow prerequisites, validates the template
and delegates to small screens. Route focus resets scroll and announces the new section/photo heading.
Loading, empty/missing-template/requirement, unauthorized and retry states are explicit.

## Assets and visual decisions

Canonical source: `references/assets/vehicle-inspection-ui-assets/photo-guides/`. One byte-identical
runtime copy under `public/assets/inspection/photo-guides/` preserves all twelve filenames:

`front-45-right.webp`, `back-45-right.webp`, `front-45-left.webp`, `back-45-left.webp`,
`front-plate.webp`, `rear-plate.webp`, `odometer-on.webp`, `driver-interior.webp`, `engine-bay.webp`,
`spec-plate.webp`, `chassis-number.webp`, `car-roof.webp`.

URLs are `/assets/inspection/photo-guides/<filename>`. Next Image optimizes static samples; local
blob URLs bypass HTTP optimization and are revoked on change/unmount. Sample cards use 4:3 contain
frames so full photography stays visible. The overview uses the configured first right-side photo.
No sample/physical direction is mirrored. Native RTL, Vazirmatn, quiet borders and current design
tokens are preserved. Canonical 08–11 support camera/review ergonomics; historical 07/21/22 are
proportion/studio inspiration, not mandatory 3D/count instructions. Comparison differs intentionally
from the old single-image review PNG. It offers enlargement to inspect small lettering.

## Camera and durability

Camera opens only on the dedicated screen after explicit guidance navigation, requests video only,
prefers the environment camera and displays a real muted playsInline video. Capture draws the full
video frame to canvas and produces a JPEG Blob. Streams stop on unmount, hidden document, failure
and late permission resolution after exit. Native capture/file selection handles unavailable/denied
camera. File type/size/decode are checked; no source image is silently used as a runtime capture.
There is no AR, CV, 3D matching, fabricated light/level measurement or automatic quality judgement.
Quality success means the customer checked all configured review requirements.

`lib/media/photo-store.ts` stores draft and accepted blobs in `inspection-photos` IndexedDB v1,
`photos` store. Keys namespace inspection ID, template ID/version and requirement ID. Draft capture
finishes a transaction before review navigation. Atomic confirmation swaps the accepted blob and
clears the draft/reviewer reason. Failed or discarded replacement retains the original accepted
photo. Cancelled drafts remain recoverable until replaced/discarded. No remote upload starts.
Local accepted photos survive reload; mock authentication still resets, so resuming requires the
existing referral/OTP/location/vehicle workflow. Origin storage is separate as expected; landing
and mock auth initial state remain consistent. Clear this IndexedDB database in browser site data
to reset photography; do not confuse it with persisted mock login.

Live browser camera requires a secure context (HTTPS or localhost). LAN HTTP uses native photo
selection when unavailable; origin/dev binding configuration is unchanged. See the
[browser camera security requirements](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).
Storage can fail or be cleared/evicted; failures block confirmation and offer retry. Durable uploads,
server authorization/evidence IDs and final submission remain the existing planned API boundary.

## Retakes and continuation

Retakes identify requirement IDs and show reviewerReason in cards/guidance. In current deterministic
tests, local fixture records simulate reviewer responses; runtime performs no reviewer API call.
A confirmed replacement restores captured status. Future evidence adapters must resolve server
retake versions/timestamps against local replacements rather than treating local capture as server
verification. After confirmation, continue to another incomplete required photo in the same section;
after the last one, show completed section context. All required satisfied enables final local review.

## Future optional 3D and performance

Reusable experimental code remains in `components/vehicle/three` and `lib/vehicle`, without any
production photography import. Neither WebGL probing nor Three/R3F/GLB/HDR is needed/downloaded.
Future hotspot → section → requirement uses these same downstream screens/storage. The procedural
model/approximate anchors are not improved or claimed final; optional GLB paths remain documented
in `INSPECTION_3D.md`. Existing dependencies stay installed for that isolated future capability.

## Verification

Unit tests validate source/runtime byte equality, template counts/IDs, configurable totals, clone
isolation, derived statuses/progress/continuation, navigation/actions, quality gates and camera cleanup.
Browser scenarios exercise draft-before-confirm, atomic replacement/discard, permissions/native files,
durability, retakes/full review, no production 3D/API requests and 360/390/430 overflow. Visual fixtures
use canonical imagery as explicitly test-only evidence and a deterministic canvas camera stream.
Production never makes that substitution. Baselines cover overview, all sections, guidance, camera,
comparison/accepted checks, partial/completed/retake/full and final local review at 390x844.

Final validation: lint/typecheck/build pass, 70 unit tests pass, and the localhost/LAN development
test passes. Full Playwright against HEAD plus intended task changes passes 51 tests (5 intentional
desktop visual skips). The user working tree has a separate readiness baseline mismatch from its
existing CSS/GPS-icon edits: 50 pass, 5 skip, 1 fails. Neither those edits nor earlier baselines were
changed for this task. All 17 new photography baselines pass; 360/390/430 checks show no overflow.
