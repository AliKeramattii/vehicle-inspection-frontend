# Phase 04 — reference-led 2D photography

Checkpoint 1 of the user-approved reference-driven redesign uses Fleetr for vehicle-first hierarchy, Automotive Inspection for grouped progress, and EGO for spatial/task separation. The legacy reference 07 remains historical comparison material, rather than the new pixel target. Production still uses the canonical 2D sedan, seven sections and eleven logical requirements (ten fixed plus one four-location VIN/spec choice; historical v1 remains twelve). The optional licensed Three/R3F preview remains isolated.

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

Every image marker is an enabled 44px button around its unchanged 28px status symbol. Its
requirement ID resolves through the same template as cards, guidance and evidence. Activation
updates the single overview selection and opens the existing requirement route: guidance for
uncaptured/retake photos (including reviewer reasons), review for accepted photos or drafts.
`photoRequirementEntry` derives this destination and action label from existing records; no
marker-specific evidence state or route map exists. Review keeps replacement optional and accepted
evidence untouched. Enter/Space use native button behavior; focus and selection rings remain
independent of gray/Emerald/Amber status. Direction controls remain below the scene at every width.
Retake drafts reopen review with the same reviewer reason as guidance; the original remains stored.

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

The twelve supplied sedan WebPs remain byte-identical under `public/assets/inspection-vehicle/photo-guides/`,
with the original filenames documented in INDEX. Next Image optimizes static guidance/artwork;
local Blob URLs bypass HTTP optimization and are revoked on change/unmount.

The overview uses a 240–290px responsive studio region, removing unused surrounding canvas height while retaining full-width contained artwork without clipping the useful silhouette.
The source-ratio artwork layer contains both image and percentage markers, so crop coordinates
remain stable. Small markers alone overlay the image. The 58px direction-control row always
follows the scene with an 8px gap; no breakpoint restores an overlay. Controls are at least 44px
wide and 50px tall with 20–22px icons and 11px labels. Local horizontal scrolling is available.
The native RTL single-row filmstrip uses 120×142px cards, 70px contained thumbnails, 12px titles and 11px status. Selection scrolls only this rail, never the vertical content region. Primary
selection is markers/cards, progression is the sticky CTA; directions/categories are secondary
and section detail is contextual. At short heights the existing single internal content region
scrolls to the filmstrip while the header/actions stay visible.

Presentation palette:
- Gray: no photo, numbered marker / `ثبت نشده`.
- Emerald success role: locally accepted, checkmark / `ثبت شد`; not an upload or reviewer approval claim.
- Amber warning role: draft/retake or partially completed section, retake symbol / explicit attention text.
- Selected: extra Sky outline independent of completion state and tenant brand.

A replacement draft adds attention while preserving the accepted original and its progress credit.
`requirementProgress` derives section/category totals and attention from the same records;
`photographyProgress` aggregates it. No duplicate section state is persisted. Completed sections
with replacement drafts keep their count and expose attention, rather than a misleading completion-only
state. Progress segments also show attention independently from the circular accepted count.
A reviewer retake removes progress credit until replacement. Completed journey steps use the independent Emerald success role
on capture surfaces. The circular count and segments derive from real local evidence (fresh v2 0/11; historical v1 0/12);
`تصویر ذخیره‌شده روی دستگاه` is truthful local status, not fake uploaded/synchronized progress.
No manual standing-position certification, arbitrary 2D toggle or remote upload implementation.

Reference differences are intentional: current template/counts, canonical photographed vehicle,
semantic Emerald completion/Sky selection palette, no fake sync copy and compact sample beside a dominant actual review image.
No reference PNG is rendered as UI. Vazirmatn, RTL, safe areas and technical LTR identifiers remain.

## Guidance and continuation

Guidance topics map to existing custom icons (frame, distance, angle, ignition, glare, interior,
hood, text, roof, stability). Exterior framing uses actual physical angle; odometer requires ignition
and readable display, engine requires safely opened hood/full bay, spec/VIN requires close readable
text (30cm), roof requires safe elevated framing. Legacy checks[] only supplies a camera framing tip.
VIN guidance differentiates readable text, focus and glare; roof differentiates roof, framing and
stability. Copy remains requirement-owned. Reset uses the existing retry/direction symbol rather
than a cube; evidence status uses a custom SVG check/retake symbol; enlargement uses zoom-in.

`PhotoImage` declares frame intent for overview, exterior/interior guidance, technical closeups,
captured evidence and comparison. Full evidence frames adopt decoded intrinsic aspect ratio and
contain the whole image; portrait evidence has a viewport height bound. Landscape review no longer
stretches a short image into a tall empty frame. A compact 86×64 sample remains expandable.
Failed images reserve geometry and offer retry outside nested selection/enlargement buttons.
`PhotographyLoading` reserves progress/image/control/card geometry without animated decoration.
Invalid templates offer retry plus the existing vehicle return. Camera/review/save failures reuse
InlineAlert with the correct dark/light context. No interactive quality checklist is introduced.

Atomic confirmation accepts a draft, then opens the next incomplete required photo in that section.
After the final photo, the completed section has a prominent CTA to the next incomplete section's
first requirement. The overview stays manually accessible. Twelve satisfied requirements expose
the next required local task: missing odometer data, then walk-around video, then local review.
The current photo count is eleven (ten fixed plus one four-choice logical group); historical v1 retains twelve. A quiet review link below the cards keeps partial packages manually
accessible without changing the image/control composition.

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
Manual odometer entry and required walk-around video are implemented in Phase 05; see
`ODOMETER_VIDEO.md`. Phase 06 adds the durable shared upload queue and mock Upload Center; see
`UPLOAD.md`. Final summary and durable mock submission/receipt now use `SUBMISSION.md`.
Real transport/backend and reviewer integration remain future work.

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

## Automotive continuity inventory (replacement requires separate approval)

No canonical automotive asset was replaced by this modernisation. Suggested priorities:

1. Prominent landing `public/images/auth/landing-suv.png`, `public/images/vehicle/identity-suv.png`
   and `public/images/preparation/consent-hero.webp`:
   these show the earlier rounded Sportage family, while readiness/overview front-45 guidance
   shows the newer angular family. Choose one approved body generation before replacing any.
2. Canonical front/rear guide pairs (`front-45-*`, `back-45-*`, `front-plate`, `rear-plate`):
   rear styling, wheels, paint temperature and studio background need one family across views.
   Preserve exact canonical filenames and requirement ownership when replacements are approved.
3. Interior/engine/odometer/spec/VIN/roof: check cabin generation and technical realism after
   exterior continuity. Readable characters and complete evidence framing take priority over
   matching decorative studio temperature. No image generation or replacement occurred here.


## Approved UI refinement
Production remains 2D and template-driven. Optional explicit loopback development may load one mobile Sportage model with template-derived screen-space requirement markers, sharing selection and downstream guarded routes. It never ships the restricted GLB or duplicates capture state. Successful checks are green; optional 3D upload checks require the current accepted revision's binary acknowledgement.
Capture and retakes are live-only: no arbitrary gallery or File Manager import. Unsupported devices show recovery. Existing durable evidence, accepted replacement safety and automatic continuation remain. See UI_REFINEMENT.md.

## Unified optional-viewer interaction
Production remains2D. Optional3D pins derive accepted local capture separately from matching-current-revision upload status. Parent selection synchronizes cards/CTA. Pin shows reference/guidance before shared capture/review action. Completed evidence remains replaceable atomically. Controls stay below image. See UNIFIED_APPLICATION.md.

## Supplied sedan reference consolidation

Active reference artwork now comes from `src/config/vehicle-assets.ts`: the twelve original exact guide files plus two existing VIN/spec location samples (eleven logical requirements in v2), eight explicit physical/category view roles and eight transparent recording ghosts. Known old built-in guide URLs resolve at presentation time for pinned template history; actual captured Blobs and tenant custom images do not pass through a replacement migration. Marker/image layers share the source aspect ratio. See `NEW_VEHICLE_ASSET_AUDIT.md` and `NEW_VEHICLE_ASSET_MIGRATION.md`; the earlier asset-continuity candidate list is historical and has been superseded for active 2D defaults. The optional Sportage 3D subsystem is unchanged.

## Sedan location choices and photo-only alignment

See VEHICLE_GUIDANCE_CONSOLIDATION.md. Four VIN/spec location variants retain the same configured requirement identity. Faint supplied ghosts now belong to still-photo camera alignment only, outside the saved Blob. Walk-around recording uses separate instructional guidance; no photo ghosts or gallery import. The matching cleared 4–5s orbit clip remains an explicit asset blocker.

## Final presentation refinement
The overview retains image → physical-direction controls → category/context → shot cards → sticky action. Its selected context uses existing evidence helpers plus requirement-owned distance/height; the next-required shortcut changes the same selection used by cards, markers and CTA. The studio has a 300px minimum and short screens use the existing internal scroll region. Authorized development preview wrappers reserve the same height as their contained image; no geometry/GLB change. Review labels distinguish an unaccepted draft from durable accepted evidence. Refresh can require mock reauthentication; the recovery action preserves saved media rather than asking users to discard/reconfirm it.
