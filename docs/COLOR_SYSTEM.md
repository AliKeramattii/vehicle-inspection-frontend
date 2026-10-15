# Emerald, Amber and Slate color system

## Scope and authority

This is a PRESERVE color refinement, not a layout or workflow redesign. Design variance stays
3/10, motion 2/10 and density 6/10. The approved palette supersedes historical PNG color paint;
PNG composition, Vazirmatn, geometry, RTL, brand assets and all vehicle/ghost imagery remain intact.

The three supplied inputs are under `references/design/vehicle-inspection-color-system/`:
`vehicle-palette.css`, `COLOR_SYSTEM_GUIDE_FA.md` and `palette-preview.html`. The runtime file
`src/components/ui/color-palette.css` copies all 69 LAB primitive definitions exactly. A unit test
compares every name/value string. Preview-only `--vi-*` and data-vi-theme are not application themes.

## Existing token architecture

Global Tailwind semantic roles in `src/app/globals.css` remain the source for customer paint.
Existing operations aliases in `admin-theme.css` map those roles inside AdminThemeScope; the
existing html data-admin-theme preference controls light/dark/system. No second theme provider,
UI framework, dependency, viewport shell or client boundary was added.

See DESIGN_SYSTEM.md for the complete role mapping. The new companions have narrow purposes:

- primary-hover, primary-soft and primary-ink distinguish button fill, low emphasis and readable text.
- status soft/ink pairs retain the semantic hue without small white text on bright fills.
- selected uses Sky independently from evidence state and brokerage primary.
- map tools use Teal; provider layers, attribution, exact pin artwork and SDK behavior are unchanged.
- control-border is stronger than a decorative divider; focus is independent from selection.
- media-canvas/surface/ink/muted/error retain readable dark camera/live-stage chrome.

Default primary is Emerald 700, hover Emerald 800, surface white and canvas Slate 50. Amber is
selective emphasis. Admin sidebar stays Slate 900 in both modes. Operations dark uses Slate
900/800/700 surfaces and Slate 50/300 text, with Emerald 400 actions and Slate 900 foreground.
The customer does not inherit the operations dark preference. Existing theme subscription,
server snapshot, storage recovery and reduced-motion transition behavior remain unchanged.

## White-Label compatibility

Site Settings keeps its existing HEX form/schema/transport contract. `theme-colors.ts` holds browser
sRGB serialization for those fields only. Selecting the factory defaults resolves actual paint
back to the exact LAB variables. Brokerage HEX primary/on-primary choices remain intact.

Custom action hover mixes toward the background opposite its foreground, retaining readable
text for both dark-brand/white-text and light-brand/dark-text pairs. Text accents are adapted
against operations surfaces without changing the saved brand fill. Semantic success, warning,
error, selection and upload roles are never assigned from brokerage primary.

Only an untouched, version-1, audit-free, identical published/draft demo workspace with the exact
old factory theme receives the new default in its read view. Stored history/revisions are untouched.
Edited drafts, tenant API publications and saved/published custom choices are never reinterpreted.
The named blue/green brokerage fixtures retain their explicit original tenant primary colors.
The legacy Admin branding payload remains compatible; its read-only color presentation now reads
runtime Site Settings instead of painting a hardcoded blue. No API contract changed.

## Evidence and operations status

| Meaning | Paint | Additional cue |
|---|---|---|
| Uncaptured/pending | Slate gray | number and pending text |
| Selected/current | Sky | independent ring/outline, pressed/current semantics |
| Locally accepted photo | Emerald | check and local-capture wording |
| Binary uploaded | Sky informational | cloud and upload wording |
| Processing | informational | processing text, not an approval claim |
| Verified / reviewer approval | Emerald | explicit verification/decision wording |
| Retake/replacement attention | Amber | retake symbol and reason |
| Actual failure/rejection | Red family | error icon/text and recovery |

The review domain's internal `rejected` decision means “درخواست ثبت مجدد”, so that retake
presentation remains Amber. Upload completion no longer borrows the approved reviewer badge.
No capture/upload/review state, revision credit, atomic replacement or permission rule changed.
Selection never changes completion credit. Keyboard focus overrides the selected marker's ring
color while focused, with its existing 3px geometry unchanged.

## Contrast decisions

Browser checks resolve LAB through canvas sRGB before applying relative-luminance contrast.
Important normal text targets 4.5:1; meaningful controls/focus/graphics target 3:1, following
[WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and
[non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
This is targeted testing, not a claim of complete accessibility certification.

Measured corrections preserve every primitive value:

- Red 600 on Red 50 measured 4.36:1 for small text. Error indicators keep Red 600; error text uses
  supplied Rose 700 (5.51:1). Operations dark error text uses Rose 300 rather than Rose 400.
- Light focus uses Teal 700; dark/live-stage focus uses Teal 500. Meaningful input boundaries use
  Slate 500 in light and Slate 400 in dark; subtle decorative Slate dividers remain.
- White success checkmarks on Emerald 600 meet graphic contrast, while small success text uses
  Emerald 800 on Emerald 50. Dark filled status symbols use Slate 900 foreground.
- Dark recorder captions use media-muted rather than the light-theme brand text color.
- Custom light brand colors use readable text accents, including keyboard skip links. Sidebar active
  foregrounds respect configured on-primary; non-active hover stays neutral, avoiding a legacy
  light-text override on yellow tenant branding.

The rendered-text scan composes ancestor surfaces and checks important visible text/form controls.
Disabled controls, hidden content and image/media pixels are explicitly excluded and require visual
review. White-label form contrast validation remains in place. Photograph, logo, Iranian flag/plate
and ghost colors are identity/media content and are not recolored by this task.

## Validation and screenshots

Before/after screenshots and contrast JSON are local review artifacts under
`.agent/reference-review/color-system/`. The color-specific Playwright configuration reuses the
canonical production build and writes separate artifacts. No historical baseline is regenerated.
Tests cover mobile customer and desktop operations sizes, light/dark/system persistence, custom
brands, independent status roles, console/page/resource errors and document overflow.

Historical reference/baseline tests include older palette and earlier asset/behavior expectations.
They are not declared green by running snapshot updates. Functional regression selection and its
exclusions/results are recorded in this task's validation record. The unrelated historical readiness
mismatch remains out of scope; only shared approved palette paint affects readiness here.

## Preservation and pre-flight

Routes, navigation labels, field names, anchors, logo/partner assets, legal copy, application layout,
Neshan provider behavior, camera/Recorder logic, IndexedDB, upload/submission/reviewer rules, optional
3D code/model and original reference baselines are preserved. Pre-existing test-config and model-route
formatting stays unstaged; existing globals formatting/import order remains outside the task commit.
New unrelated guide/source files are neither changed nor staged.

Applicable TasteSkill pre-flight: brief/mode/dials recorded; existing design system reused; readable
CTA/form/status/focus paint checked; scoped dark mode and customer isolation checked; no new motion,
fonts, copy em dashes, layout patterns, dependencies or decorative surfaces introduced. Generic
marketing layout/icon/image rules do not override this product's explicit UI and asset requirements.
