# Phase 04 — reference-led 2D photography

Reference `07-inspection-3d-home.png` defines the composition: compact branding/journey, circular
and segmented progress, dominant studio vehicle, image markers, restrained view controls,
categories, two rows of image cards and bottom action. Production uses canonical static 2D
photography, seven sections and twelve requirements. Experimental Three/R3F remains isolated.

## Configuration and state ownership

`inspection-template.ts` is the sole typed/Zod-validated business configuration. Requirements
contain stable IDs, exact sample paths, titles, instructions, guidance topics, distance/height,
required/status and optional reviewer reason. The existing mock repository returns cloned templates.
`templateCapturePlan` derives its compatibility slots/count; no transport DTO or real API enters UI.

Query owns template/inspection and IndexedDB evidence reads. Pure helpers derive progress,
satisfaction, visual state and next incomplete requirement/section. One local selected requirement
ID in `PhotographyOverview` derives the displayed image, active view/category, marker/card state
and CTA. No separate selected angle/category, duplicate backend state or new Zustand state exists.

`vehicle-photo-config.ts` owns category/view mapping and per-artwork percentage anchors. Different
physical source angles have their own coordinates; they are never mirrored. Markers share the
artwork's cover dimensions, so responsive cropping cannot detach them from the image. Side controls
select real configured front/right/rear/left/roof samples; reset selects the next incomplete photo.
Cabin/engine categories expose the remaining sections. All seven sections remain reopenable.

## Components and routes

Thin server pages and the existing capture route structure remain unchanged.

- Overview: `PhotographyOverview`, `PhotographyProgress`, `VehiclePhotoNavigator`,
  `PhotographyShotCarousel` and `PhotographyShotCard`.
- Section: `SectionDetail`, full-frame samples/accepted evidence in `PhotoRequirementCard`, view,
  replacement and reviewer-reason actions. Its deliberate vertical region scrolls; CTA stays visible.
- Guide: `PhotoGuidance`, a large full sample, requirement-specific instructions/icons and metadata.
- Camera: existing `PhotoCamera`/`useCamera`, isolated camera service and native photo selection.
- Review: `PhotoReview`, dominant actual captured Blob, compact expandable sample, retake and
  `تأیید و ادامه`. No user quality checkbox, self-certification or fabricated quality success.
- Final local review: `PhotographyCompletion`, derived progress and reopenable sections. This does
  not submit remotely; upload/submission are still planned.

`PhotographyWorkflow` verifies prerequisites, reads/validates mocks and delegates to small screens.
Route focus resets only the internal content region and focuses the new heading without document
scroll. Loading/missing/unauthorized/storage failure/retry states remain explicit.

## Artwork, status and reference decisions

The twelve canonical WebPs remain byte-identical under `public/assets/inspection/photo-guides/`,
with the original filenames documented in INDEX. Next Image optimizes static guidance/artwork;
local Blob URLs bypass HTTP optimization and are revoked on change/unmount.

The main vehicle artwork fills the scene using cover sizing rather than a tiny contained vehicle
or letterboxed hero. This creates some edge cropping at taller viewports and under the control rail;
full samples/evidence stay uncropped in guide/review and can be enlarged. Image controls/pins use
44px targets. Short scenes move the control rail into a horizontal row so every control remains visible.
The native RTL two-row carousel scrolls/snaps horizontally and keeps the selected card visible.

Presentation palette:
- Gray: no photo, numbered marker / `ثبت نشده`.
- Blue #2563EB: complete, checkmark / `ثبت شد`.
- Orange #D97706: draft/retake or partially completed section, retake symbol / explicit attention text.
- Selected: extra blue outline independent of completion state.

A replacement draft adds attention while preserving the accepted original and its progress credit.
A reviewer retake removes progress credit until replacement. Completed journey steps also use blue
on capture surfaces. The circular count and segments derive from real local evidence (fresh 0/12);
`تصویر ذخیره‌شده روی دستگاه` is truthful local status, not fake uploaded/synchronized progress.
No manual standing-position certification, arbitrary 2D toggle or remote upload implementation.

Reference differences are intentional: current template/counts, canonical photographed vehicle,
blue completion palette, no fake sync copy and compact sample beside a dominant actual review image.
No reference PNG is rendered as UI. Vazirmatn, RTL, safe areas and technical LTR identifiers remain.

## Guidance and continuation

Guidance topics map to existing custom icons (frame, distance, angle, ignition, glare, interior,
hood, text, roof, stability). Exterior framing uses actual physical angle; odometer requires ignition
and readable display, engine requires safely opened hood/full bay, spec/VIN requires close readable
text (30cm), roof requires safe elevated framing. Legacy checks[] only supplies a camera framing tip.

Atomic confirmation accepts a draft, then opens the next incomplete required photo in that section.
After the final photo, the completed section has a prominent CTA to the next incomplete section's
first requirement. The overview stays manually accessible. Twelve satisfied requirements expose
existing local final review. No 360 route exists yet, so no video flow is fabricated.

## Camera, durability and mock boundary

Camera opens only after explicit guide navigation, requests video only and prefers environment.
The real muted playsInline video is captured whole through canvas -> JPEG Blob. Tracks stop on exit,
hidden document, failure and late permission resolution. Native photo selection handles unsupported/
denied camera. File type/size/decode are checked; sample assets never become runtime evidence.

`photo-store.ts` keeps draft and accepted Blobs in `inspection-photos` IndexedDB v1 / photos store,
namespaced by inspection/template version/requirement ID. Draft transaction completes before review.
Atomic confirmation swaps the original/clears the draft. Failed/discarded replacement retains original
and supports retry. Durable evidence survives reload; mock login still resets, so resume uses the
unchanged referral A4K9P2 / OTP12345 and location/vehicle workflow. Origins have separate storage.
Reset development photography by clearing this IndexedDB database in the browser's site data.

Camera security requirements remain HTTPS/localhost; LAN HTTP falls back to native photo selection.
No origin/dev binding/PWA behavior changed. No CV, AR, quality scoring or backend request added.
Future manual odometer entry, required 360 video, durable upload queue, final summary and reviewer
retakes remain documented product requirements; none is implemented by this revision.

## Viewport and performance

See `VIEWPORT.md` for the shared 100dvh shell, keyboard bridge, internal scroll/focus and safe areas.
Only interaction/browser boundaries are clients; routes/shells stay server components. No dependency
added and no Three/R3F/GLB/HDR downloads in default photography. Only the current useful main/guide
asset is eager; thumbnails are lazy. No heavy carousel library, GPU effects or extra viewer state.

## Verification

Unit tests cover exact assets, template/domain/progress, state semantics, marker/card/category/view
selection, custom guidance, no quality checklist, simple confirmation, next section, camera cleanup
and keyboard/zoom viewport behavior. Browser tests cover complete mock entry, no 3D/API/console
errors, selection/colors, atomic replacement/discard/quota retry, native camera fallback, recovery,
next photo/section and all customer viewport bounds. Visual states cover overview/partial/attention/
complete, seven sections, completed section, exterior/odometer/VIN guidance, camera, draft/accepted
review, retake and local final review at 390×844, plus responsive behavior at 360×800 and 430×932.

Final validation results are recorded in the revision ExecPlan after execution. Existing unrelated
readiness CSS/GPS-icon edits are preserved and excluded from the task commit; their prior baseline
mismatch must be reported separately, not silently approved by baseline regeneration.
