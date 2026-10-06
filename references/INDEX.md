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
| `07-inspection-3d-home.png` | Historical studio/header inspiration; 3D/14-shot composition superseded | `04 image-guided photography` |
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
| `21-vehicle-2d-fallback.png` | Supporting vehicle proportions; not mandatory hotspots | `04 supporting` |
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
Historical 3D/14-photo compositions do not override this direction. PNGs 08–11 support camera/review
ergonomics; the approved flow uses full sample photography and side-by-side comparison.

These are canonical photography guidance/reference assets, not decorative images:

| Canonical path | Section |
|---|---|
| `references/assets/vehicle-inspection-ui-assets/photo-guides/front-45-right.webp` | نمای راست |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/back-45-right.webp` | نمای راست |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/front-45-left.webp` | نمای چپ |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/back-45-left.webp` | نمای چپ |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/front-plate.webp` | جلو |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/rear-plate.webp` | عقب |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/odometer-on.webp` | کابین |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/driver-interior.webp` | کابین |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/engine-bay.webp` | موتور و مشخصات |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/spec-plate.webp` | موتور و مشخصات |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/chassis-number.webp` | موتور و مشخصات |
| `references/assets/vehicle-inspection-ui-assets/photo-guides/car-roof.webp` | سقف |

The single documented runtime copy is `public/assets/inspection/photo-guides/`, served as
`/assets/inspection/photo-guides/<exact-filename>`. Preserve bytes/names and full framing. Never
mirror physical vehicle directions. Configuration, rather than old PNG counts, defines totals.
