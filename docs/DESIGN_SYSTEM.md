# Vehicle Inspection Design System

## Product character

The visual language combines:
- premium automotive configurator
- precise inspection tool
- trustworthy fintech/insurance product
- clean professional SaaS for operations surfaces

Customer screens should feel calm and premium rather than governmental or like generic form software.

## Core colors

| Token | Value | Use |
|---|---|---|
| background | `#F8FAFC` | app background |
| surface | `#FFFFFF` | cards/sheets |
| primary | `#2563EB` | primary actions/selected state |
| ink | `#111827` | primary text |
| muted | `#6B7280` | secondary text |
| border | `#E2E8F0` | separators/borders |
| success | `#059669` | completed/verified |
| warning | `#D97706` | retake/SLA attention |
| destructive | `#DC2626` | true failure/destructive |
| information | `#0284C7` | informational state |

Status colors communicate state, not decoration.

## Typography

Use a Persian-first family:
- Vazirmatn during development
- IRANSansX if the project has the appropriate production license

Recommended weights:
- 400 regular
- 500 medium
- 600 semibold
- 700 bold

Technical codes, VIN fragments, and references remain LTR.

## Geometry

- Small controls: 8–10px radius
- Inputs: 12px
- Cards: 16px
- Bottom sheets/major surfaces: 20–24px
- Mobile CTA height: 48–52px
- Minimum tap target: 44×44px

## Shadows

Use soft cool shadows. Avoid dramatic floating-card effects.

Example:
`0 2px 6px rgb(15 23 42 / .03), 0 12px 30px rgb(15 23 42 / .06)`

## Customer layout

Primary acceptance viewport: 390×844.

Principles:
- one primary action per screen
- large meaningful photography before paragraphs; current customer Phase 04 is image-guided 2D
- sticky primary CTA near the bottom
- generous whitespace
- safe-area-aware bottom spacing
- native RTL alignment
- bounded `100dvh` document, stable header/actions and one deliberate internal content scroll region
- keyboard visual-viewport resizing without restricting browser zoom; see `docs/VIEWPORT.md`

## Desktop operations layout

Primary acceptance viewport: 1440×960.

Reviewer/admin:
- dense but highly legible
- strong hierarchy
- smaller radii than marketing/customer hero surfaces
- table/data density similar to high-quality developer/operations software
- no giant KPI cards

## Camera

Camera is the only intentionally dark customer surface.

Use:
- real live `<video>`
- translucent top controls
- separate ghost SVG layer
- restrained green/amber quality indicators
- professional camera ergonomics

## Phase 04 photography

Seven reopenable sections and twelve requirements in the current configurable template. Reference
07 remains the composition source: compact circular/segmented progress, dominant studio vehicle,
image markers, physical-direction controls, compact categories, two-row shot cards and bottom CTA.
The vehicle uses canonical 2D photography in a contained artwork layer with matching percentage
marker coordinates. Direction controls sit below the image in normal flow at every breakpoint.
Guidance/review retain full-frame contain images for evidence inspection.
Gray = uncaptured, blue = complete, orange = attention/retake. Selection adds a blue outline;
text and check/retake symbols accompany color. No production WebGL, 3D toggle or mesh selection.
Camera is dark; section/review screens are light. Review shows the captured photo prominently and
a small expandable sample, retake and simple confirmation. No customer quality checkbox or
fabricated automatic quality success. Guidance copy/icons/distance are specific to each requirement.

## Scoped customer roles (PRESERVE modernisation)

`components/ui/customer-roles.css` provides opt-in Vazirmatn roles; established landing/OTP
typography is unchanged. Roles are font shorthands, rather than a global heading reset.

| Role | Size / weight / line height |
|---|---|
| display | 30 / 800 / 1.3 |
| page-title | 26 / 800 / 1.4 |
| section-title | 20 / 700 / 1.5 |
| card-title | 13 / 650 / 1.4 |
| body | 14 / 400 / 1.7 |
| body-secondary | 13 / 400 / 1.7 |
| metadata | 12 / 400 / 1.5 |
| technical-id | 12 / 600 / 1.5, LTR |
| button-primary | 16 / 750 / 1.5 |
| button-secondary | 14 / 600 / 1.5 |
| caption | 11 / 400 / 1.5 |

Use the established control radius (10), input (12), card/image (16), sheet (20–24).
Compact photography cards intentionally retain 10px corners. Customer gutters are 16px,
reading gutters 20px, compact gaps 4/8px, section gaps 12/16/24px. Image → controls gap is
8px. Relevant primary CTAs are at least 48px tall, 16px/750, with native disabled/busy
semantics, visible focus, and bottom spacing `max(16px, safe-area-inset-bottom)`. Loading
must preserve action geometry. Identity primary overrides use #2563EB; semantic colors remain.

Image intent is explicit: automotive-hero (cover where appropriate), vehicle-overview
(contained shared image/marker layer), exterior-guide, interior-guide, technical-closeup
(full sample), captured-evidence (intrinsic ratio/contain with portrait height bound),
comparison (compact contain thumbnail, expandable full evidence). Do not apply global cover
to customer evidence. Automotive assets require separate approval before replacement.

Photography completion credit derives from accepted status. Draft/replacement attention
derives separately; accepted + draft retains credit while marker/card/category/section/segment
shows orange attention. Selected outline is independent. Explicit reviewer retake still removes
credit. Existing AppViewport owns 100dvh; short screens use one internal vertical content region,
not smaller controls. Motion target is 2/10; no new perpetual/decorative animation.

## Future optional 3D (isolated from customer Phase 04)

Studio:
- white/cool-grey cyclorama
- realistic PBR vehicle
- soft automotive studio lighting
- contact shadow
- custom numbered inspection pins
- selected pin: blue + pulse
- completed: green
- retake: amber
- pending: neutral grey
