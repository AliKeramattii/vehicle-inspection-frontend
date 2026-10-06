# Customer visual modernisation review

## Brief and mode

PRESERVE: Persian mobile insurance self-inspection, established brand and workflow, targeted
2D photography composition/legibility/recovery. Approved Section 11.B audit and Step-2 plan
precede this work. TasteSkill supplies the quality checks; project references and explicit
product decisions override generic marketing rules. Dials: design variance 3–4/10 (trust),
motion 2/10 (state feedback only), photography density 6/10 (hierarchy, not hidden information).

## Implementation and preservation

Controls always follow the contained vehicle image with an 8px gap. Scene height is 300–360px;
58px controls use 52px targets and 20–22px icons. Cards are 108×110 with 52px thumbnails,
12px titles and 11px status. The existing AppViewport/header/sticky CTA remain; one internal
vertical region exposes the second row on shorter screens. RTL rail selection never scrolls
the vertical region. Markers and image share one source-ratio layer, without silhouette cropping.

Completion and attention are independently derived. Accepted evidence plus a replacement
draft retains progress credit and shows attention in markers/cards/categories/sections/segments.
Explicit retake retains its existing incomplete-credit policy. No duplicate persisted state.
Review adapts to evidence aspect, keeps the entire image, and offers sample enlargement, retake
and confirmation. No manual checklist. Automatic next-photo and next-section behavior is preserved.

Routes/URLs: none changed. Journey/section/navigation labels: none changed. Form field names:
none changed. Anchors: none changed. Logo/partner assets and legal copy: none changed.
The approved obsolete readiness 3D diagnostic/help removal is the only terminology removal.
Optional internal WebGL never blocks camera/GPS/storage readiness. No auth/mock, API contract,
development-origin, storage transaction, upload, 360, odometer, reviewer/admin or production 3D work.

## Em-dash and copy audit

Scanned edited photography/readiness customer source and read new visible recovery/status copy.
No stylistic em-dash was introduced. Established Persian titles, CTA wording, guidance and legal
text are preserved. Decorative check glyphs became SVGs without changing their text labels.
No fake upload success, quality certification or hardware permission claim was added.

## TasteSkill Section 14 pre-flight

| Check group | Result / evidence |
|---|---|
| Brief, dials, system, audit, PRESERVE mode | Pass: explicit above; project DESIGN_SYSTEM, approved audit/plan |
| Theme lock | Pass: light customer pages; camera is a separate intentionally dark route |
| Color/shape consistency | Pass: #2563EB brand, existing semantic gray/blue/orange; semantic radius roles |
| CTA contrast/wrapping/focus/state | Pass: white/primary about 5.17:1; screenshot and viewport checks; native disabled/busy; focus retained |
| Edited form/action contrast | Pass for changed blue/action treatment; unrelated legacy helper colors are preserved |
| Typography/serif/italic/palette | Pass: Vazirmatn, scoped role hierarchy, no serif/italic or generic luxury palette |
| Vehicle/hero composition and padding | Pass: image dominates, no navigation overlay, CTA visible; marketing word-count rules are not app requirements |
| Copy, eyebrows, decorative labels/dots | Pass: no new eyebrows/version/credit strips; dots/numbers are actual evidence state |
| Duplicate actions and navigation density | Pass for approved hierarchy: markers/cards primary, controls/categories secondary, section access contextual; existing card/CTA workflow destinations preserved |
| Layout rhythm/cards/images | Pass: compact reference-led cards, meaningful full imagery; no invented bento, zigzag or logo-wall sections |
| Motion/scroll/cleanup/reduced motion | Pass: no new animation/scroll listeners/GSAP; rail scroll local; existing reduced-motion rule and Blob/camera cleanup retained |
| Viewport/mobile/empty/loading/error | Pass: existing bounded shell, stable CTA, explicit loading geometry, image retry/template recovery, light/dark alerts |
| Icons | Pass under explicit project override: custom existing SVG family, no new library |
| Client boundaries/performance/system | Pass review: thin server routes unchanged, existing client leaves only, eager main image/lazy thumbs, no 3D/dependency/effect addition; production CWV metrics not claimed |
| Marketing-only checks | Not applicable: testimonials, bento, logo walls, marquees, numbered marketing sections, scrolling showcases, desktop marketing nav, premium-consumer palette variation |
| Auto dark mode | Not applicable: project intentionally locks light UI and its separate camera context |
| Semantic progress/image markers | Project-authoritative: actual template progress and small functional markers are required, overriding generic bans on decorative overlays/tracks |

No blocking pre-flight issue remains in the changed surface. Earlier screens/brand references
are preserved; no whole-product typography or contrast rewrite was performed.

## Visual review and baseline manifest

Compared reference 07 composition and supporting 08–11/17/21 with actual 2D renders at
360×800, 390×844, 430×932. Inspected empty, partial, selected/completed, draft, replacement,
retake, completed section, 12/12, exterior/odometer/VIN/spec guidance, accepted/draft landscape
review and portrait evidence. The vehicle family discrepancy is intentionally not repaired with
unapproved assets. The second shot row requires internal scroll at shorter heights.

Baseline acceptance followed render → inspect → canonical comparison → correct → inspect.
No blanket snapshot-update command was used. Each file below is a customer PNG in
`tests/e2e/screenshots/<test file>/`:

- `photography-visual.spec.ts`: photography-overview, photography-partial,
  photography-attention, photography-complete, photography-final-review; section-right,
  section-left, section-front, section-rear, section-cabin, section-engine-details,
  section-roof, section-completed; photo-guidance, guide-odometer-on,
  guide-chassis-number, photo-comparison, photo-comparison-accepted, photo-retake.
  Changed for controls/framing/legibility/status/CTA/SVG treatment.
- `photography-polish.spec.ts` (new): overview-new-draft, overview-replacement,
  review-replacement, review-portrait, guide-spec-plate. Protect independent attention/credit
  and evidence framing. Portrait is synthetic test-only evidence, not a production asset.
- `preparation.spec.ts`: readiness, consent-privacy. Only the intentional diagnostic/GPS/CTA
  treatment is implemented; baseline uses the committed readiness hero CSS, not the unrelated
  local gradient/text-width edits. Their pre-existing working-tree drift remains separate.
- `location-vehicle.spec.ts`: inspection-location, vehicle-identity. Approved blue/CTA/safe-area
  normalisation. Field labels, plates, imagery and behavior unchanged.

Landing/OTP/foundation and photo-camera baselines are unchanged. The new replacement candidate
initially captured the previous section before route settling; the test now waits for the review
heading/action and the reviewed correct review screenshot replaces that candidate.

## Validation and environment findings

Root lint/typecheck, all 87 unit tests (10 files) and explicit production build passed with exit 0.
The intended-change export repeated lint/typecheck/unit successfully. Its full Playwright suite
passed 68 tests, 12 intentional skips, exit 0, including all reviewed baselines. Root full suite
exited 1: 67 passed, 12 skips, one pre-existing readiness hero mismatch (4,010 pixels). Manual
diff review confines it to the preserved local hero gradient/text-width edits; no CTA/diagnostic
drift remains. Those user edits are not overwritten/staged, and the baseline is not rewritten to
approve them. The intended commit is the reproducible passing source.

No passing assertion list is treated as a successful suite exit. Windows Playwright server teardown calls taskkill /T /F;
the sandbox denied it and hung after assertions. A disposable process reproduced that denial;
running authorized Playwright with process-tree cleanup permission returns real exit statuses.
No timeout increase, media-store change or dev-origin change was used.

Lint was scanning unrelated untracked ~/ skill test fixtures. ESLint excludes local tooling
directories without altering/installing/running img2threejs. Resource validation rejects failed
assets and unexpected errors while excluding only canceled Next RSC fetch prefetches.

Known external limits: automotive generation continuity awaits separate asset approval; physical
device keyboard/safe-area QA and production CWV measurement remain worthwhile. Unrelated local
readiness hero edits remain uncommitted and can still differ from the intended baseline. Existing
FORCE_COLOR/NO_COLOR warning and the isolated nested-checkout lockfile warning are benign.
