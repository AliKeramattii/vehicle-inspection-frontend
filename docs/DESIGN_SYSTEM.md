# Vehicle Inspection Design System

## Product character

The visual language combines:
- premium automotive configurator
- precise inspection tool
- trustworthy fintech/insurance product
- clean professional SaaS for operations surfaces

Customer screens should feel calm and premium rather than governmental or like generic form software.

## Core colors

The approved default is **Emerald + Amber + Slate**. The exact 69 LAB primitives live in
`components/ui/color-palette.css`, copied without numerical changes from
`references/design/vehicle-inspection-color-system/vehicle-palette.css`.
The supplied HTML is a color preview only. Existing PNG composition, type, geometry and assets
remain authoritative; this approved palette supersedes their historical brand-blue paint.

| Existing semantic role | Light default | Scoped operations dark |
|---|---|---|
| background / surface / surface-soft | Slate 50 / white / Slate 100 | Slate 900 / Slate 800 / Slate 700 |
| ink / muted / border | Slate 900 / Slate 600 / Slate 200 | Slate 50 / Slate 300 / Slate 700 |
| primary / hover / on-primary | Emerald 700 / Emerald 800 / white | Emerald 400 / Emerald 300 / Slate 900 |
| primary-soft | Emerald 50 | Slate 700 |
| accent / accent-soft | Amber 500 / Amber 50 | Amber 400 / Slate 700 |
| success / success-ink | Emerald 600 / Emerald 800 | Emerald 400 / Emerald 300 |
| warning / warning-ink | Amber 700 / Amber 800 | Amber 400 / Amber 400 |
| destructive / destructive-ink | Red 600 / Rose 700 | Rose 400 / Rose 300 |
| selected / information | Sky 800 | Sky 300 |
| map / map-ink | Teal 600 / Teal 700 | Teal 500 / Teal 200 |
| focus / control-border | Teal 700 / Slate 500 | Teal 500 / Slate 400 |
| Admin sidebar | Slate 900 | Slate 900 |

Use soft/ink companions for small text rather than putting white text on every status fill.
Red 600 remains the error indicator; Rose 700 supplies readable small error text on Red 50.
Dark status fills use a dark foreground. Decorative dividers can stay subtle; meaningful form
boundaries use control-border. Camera/live-stage roles stay separately dark and readable.

White-Label primary/on-primary, canvas/ink and other existing settings remain configurable.
The HEX-only settings schema is unchanged: `config/theme-colors.ts` serializes defaults for
forms, resolves default paint back to LAB variables, and derives readable text/hover accents
for custom brands. Semantic evidence, error and selection colors do not follow tenant primary.
Existing light/dark/system preference is scoped to Admin/Reviewer and never inverts customer UI.
See [COLOR_SYSTEM.md](COLOR_SYSTEM.md) for implementation, contrast checks and preservation.

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
07 is the historical composition source; the approved Checkpoint-1 redesign supersedes its layout: compact circular/segmented progress, dominant studio vehicle,
image markers, physical-direction controls, compact categories, image shot cards and bottom CTA.
The vehicle uses canonical 2D photography in a contained artwork layer with matching percentage
marker coordinates. Direction controls sit below the image in normal flow at every breakpoint.
Guidance/review retain full-frame contain images for evidence inspection.
Gray = uncaptured, Emerald = locally accepted, Amber = attention/retake. Selection adds a Sky outline;
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
must preserve action geometry. Primary actions use the runtime brand role; semantic status colors remain independent.

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


## UI refinement: runtime identity and stage-specific success
CoBranding shares the established app mark and configured brokerage logo/name. Primary is tenant theme driven; successful checks use the independent Emerald success role. Gray pending, orange attention and an independent selected ring apply to both optional viewer markers and photography controls. Local capture, binary upload and reviewer approval are different labelled stages.
Controls stay below the vehicle. Guidance uses consistent Lucide topic icons and approved custom camera assets. The live 360 route is intentionally dark, without fabricated quality/coverage. See UI_REFINEMENT.md for mappings and OPTIONAL_3D_VIEWER.md for the restricted development gate.

## Unified customization scope
Admin/reviewer theme uses scoped semantic surface/ink/border/status variables and persistent light/dark/system preference independent of customer branding. Existing Lucide family retained. RecorderV2 follows supplied light-shell/dark-live-stage reference. AppViewport, Vazirmatn and physical direction semantics preserved.


## Premium refinement (2026-10-15)
PRESERVE retains RTL, Vazirmatn, configured primary and the existing Lucide/custom icon family. Additive app spacing roles in product-tokens.css are 4/8/12/16/20/24/32; controls 10, inputs 12, cards 16, sheets 24; target 44/action 48. Operations retain scoped light/dark surfaces and status colors.
ApplicationLogo renders the exact transparent `/branding/logo.webp` as a square, contained image without cropping or recoloring; unoptimized public loading is compatible with static export. RuntimeLogo remains brokerage identity. The sun/moon control uses a 0.22s CSS state transition, disabled by reduced-motion, with a separate system action. Customer remains light and camera remains intentionally dark.
Readiness has four quiet icon/title/explanation items and no repeated ready badge. Genuine failures, unsupported features and storage uncertainty retain text/recovery; no automatic camera/GPS permission. Reviewer uses current-revision counts, visible-only durable thumbnails and full contain evidence. Upload completion and reviewer approval remain separate. Admin navigation groups existing routes and settings exposes local draft/publication/history. No new framework, production server dependency, fake quality result or customer review checklist.


## Reference-driven redesign: Checkpoint 1 (awaiting visual approval)

Only landing, photography overview, Site Settings and the reviewer evidence workspace receive the new presentation. The user explicitly superseded legacy PNG composition for these representative screens. See REFERENCE_DRIVEN_REDESIGN_PLAN.md for inspected references, route matrix and approval boundary.

Reuse the existing customer typography roles and LAB palette: entry display about 29–32px, photo page heading 17px, selected task 15px, shot title 12px and status 11px. Operations headings are 24–27px, section headings 15–20px, field labels 13px and captions 11–12px. Smaller text is limited to the miniature noninteractive settings preview and compact numerals. Controls stay at least 44px; primary customer actions remain 50–52px. No global token or font changes.

Landing separates the welcome/contained sedan from the start task. Photography removes excess scene padding while retaining the image/marker aspect coordinate system, below-image view controls and one 120×142px native RTL filmstrip with 70px previews. Long content uses the existing internal scroller. Site Settings has one horizontal category bar, a form work surface, a validated live draft preview (also in the preview dialog) and a stable save/publish boundary. Reviewer facts live in its scrollable decision rail/full facts dialog; evidence owns the main region and decision buttons remain pinned. Existing light/dark/system, tenant colors, semantic evidence states and AppViewport remain.

No new animation, framework, model, business state, API or asset replacement. No approved baseline changes before visual approval.
