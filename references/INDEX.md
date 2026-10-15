# Complete Visual Reference Set

All files in this directory come from the user-supplied `Refrence.zip` and are canonical visual references for implementation.

**Codex rule:** do not skip references because a prompt names only one primary screen. Inspect the primary reference plus every supporting reference listed for the phase.

| File | Role | Phase |
|---|---|---|
| `01-landing-referral.png` | Customer landing / referral code | `01-landing-otp` |
| `02-otp-verification.png` | OTP verification | `01-landing-otp` |
| `03-readiness.png` | Inspection readiness | `02-readiness-consent` |
| `04-consent-privacy.png` | Consent and privacy | `02-readiness-consent` |
| `05-location.png` | Location verification | `03-location-vehicle` |
| `06-vehicle-identity.png` | Vehicle identity and Iranian plate | `03-location-vehicle` |
| `07-inspection-3d-home.png` | Primary Phase-04 composition: studio vehicle, markers, controls, progress and image cards; use 2D/current template | `04 image-guided photography` |
| `08-photo-guide-bottom-sheet.png` | Photo-guide bottom sheet | `05-camera-review` |
| `09-live-camera-ghost-alignment.png` | Live camera + ghost alignment | `05-camera-review` |
| `10-photo-review.png` | Captured photo review | `05-camera-review` |
| `11-odometer-review.png` | Odometer review | `05-camera-review` |
| `12-video-360-capture.png` | 360-degree vehicle video capture | `06-offline-upload-submit` |
| `13-upload-centre.png` | Media upload/sync centre | `06-offline-upload-submit` |
| `14-final-inspection-summary.png` | Final inspection summary | `06-offline-upload-submit` |
| `15-submission-receipt.png` | Successful submission receipt | `06-offline-upload-submit` |
| `16-additional-evidence-retake.png` | Additional evidence / reviewer retake request | `06-offline-upload-submit` |
| `17-inspection-photo-guide-reference.png` | Additional inspection guidance / automotive visual-language reference | `04/05 supporting reference` |
| `18-reviewer-queue.png` | Reviewer queue | `07-reviewer` |
| `19-reviewer-workstation.png` | Reviewer visual workstation | `07-reviewer` |
| `20-admin-template-editor.png` | Admin capture-template editor | `08-admin` |
| `21-vehicle-2d-fallback.png` | Supporting 2D proportions and vehicle-image navigation | `04 supporting` |
| `22-vehicle-webgl-reference.png` | Future optional WebGL/modeling reference | `future optional 3D` |
| `23-ghost-alignment-asset.png` | Camera ghost overlay visual reference | `05-camera-review` |

## Acceptance viewports

- Customer/mobile references: implement and verify at `390 × 844` first, then make responsive.
- Reviewer/admin references: implement and verify at `1440 × 960` first, then make responsive.

The source PNG dimensions may be larger than the acceptance viewport. Match composition/proportions, not the raw pixel dimensions of the generated reference.

Do not display these PNG files as production UI backgrounds. Reconstruct them using React, CSS/Tailwind, SVG assets, real media/3D, and semantic components.

## Phase 04 — canonical image-guided photography

Production flow: 2D overview → section → required photo → sample/guidance → camera → comparison
→ confirmation. Seven sections contain twelve photos in the current configurable template.
Reference 07 defines the primary composition, using static 2D photography instead of WebGL.
Its historical fourteen-photo counts do not override the template. Markers on the vehicle, compact
side controls, circular/segmented progress, categories and two rows of shot images are required.
Gray = uncaptured, Emerald = locally accepted, Amber = attention/retake; selection adds a Sky outline.
PNGs 08–11 support guidance/camera/review ergonomics. Review prioritizes the actual captured image
with a compact expandable sample, simple confirmation and retake; no customer quality checklist.

These are canonical photography guidance/reference assets, not decorative images:

| Canonical path | Section |
|---|---|
| `references/assets/new-vehicle/source/front-45-right.webp` | نمای راست |
| `references/assets/new-vehicle/source/back-45-right.webp` | نمای راست |
| `references/assets/new-vehicle/source/front-45-left.webp` | نمای چپ |
| `references/assets/new-vehicle/source/back-45-left.webp` | نمای چپ |
| `references/assets/new-vehicle/source/front-plate.webp` | جلو |
| `references/assets/new-vehicle/source/rear-plate.webp` | عقب |
| `references/assets/new-vehicle/source/odometer-on.webp` | کابین |
| `references/assets/new-vehicle/source/driver-interior.webp` | کابین |
| `references/assets/new-vehicle/source/engine-bay.webp` | موتور و مشخصات |
| `references/assets/new-vehicle/source/spec-plate.webp` | موتور و مشخصات |
| `references/assets/new-vehicle/source/chassis-number.webp` | موتور و مشخصات |
| `references/assets/new-vehicle/source/car-roof.webp` | سقف |

The single documented runtime copy is `public/assets/inspection-vehicle/photo-guides/`, served as
`/assets/inspection-vehicle/photo-guides/<exact-filename>`. Preserve bytes/names and full framing. Never
mirror physical vehicle directions. Configuration, rather than old PNG counts, defines totals.

## Approved white sedan asset migration

The latest supplied `references/assets/new-vehicle/` photographs supersede the older SUV imagery for active 2D defaults and guidance, while PNGs still define layout. The old guide source folder and screenshot baselines remain historical evidence. Twelve guide IDs/seven sections are unchanged. See `docs/NEW_VEHICLE_ASSET_AUDIT.md` for all 40 supplied assets, eight navigation roles and genuine-alpha Recorder V2 ghosts. Optional Sportage 3D remains intentionally unchanged.

## Approved Emerald, Amber and Slate palette (2026-10-16)

`design/vehicle-inspection-color-system/vehicle-palette.css` contains the 69 exact approved LAB
primitives. Its Persian guide and offline palette-preview.html explain color combinations, not
replacement layouts. The approved color refinement supersedes historical PNG brand blue while
preserving PNG composition, current sedan/guide/ghost assets and optional 3D implementation.
Existing semantic runtime tokens and scoped Admin/Reviewer light/dark/system themes consume it.
Tenant brand customization remains supported; evidence statuses are independent. See
`docs/COLOR_SYSTEM.md` for mapping and measured contrast. Historical screenshot baselines are
not overwritten by this refinement.
