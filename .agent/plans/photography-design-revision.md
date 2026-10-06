# Phase 04 — reference-led 2D photography and viewport revision

## Goal
Make capture home recognizable as reference 07 with static vehicle photography, meaningful
requirement markers, view controls, compact circular/segmented progress and image shot cards.
Remove customer quality checkboxes, continue through the configured next photo/section, and
keep all application documents inside a 100dvh shell with intentional internal scrolling.

## User-visible behavior
Select a requirement on the vehicle or a matching shot card, then open its individual guidance.
Gray means uncaptured, blue complete, orange attention/retake; selected adds an outline. Review
shows the customer's actual photo and compact sample comparison, retake and simple confirmation.
Confirmation continues within the section; completion suggests the next incomplete section.
Earlier customer screens retain content/workflows and use internal scrolling only when needed.

## Current state
main/origin main at 100d2be; image-guided flow already stores drafts/accepted blobs atomically in
IndexedDB. Camera lifecycle, mock auth, templates, routes and 17 photography baselines exist.
Overview is currently a generic section list; review requires quality checkboxes; long sections
scroll the document. No 360 route exists. Experimental 3D is isolated and must stay dormant.
Unrelated AGENTS/auth/consent/readiness edits and readiness baseline failure are present; preserve
them, stage only task changes. Canonical 07/08/09/10/17/21 and supplied photo assets inspected.

## Constraints
No 3D, upload/video implementation, dependency additions, API calls or fabricated quality analysis.
Use thin server routes, existing shared primitives, typed configuration and derived progress.
Keep physical direction images unmirrored; LTR reference IDs. No reference PNG as runtime UI.
Avoid altering earlier visual baselines except a documented necessary viewport change.
Preserve the Next-generated AGENTS block and unrelated local edits.

## Implementation
1. Add shared AppViewport layout/CSS with bounded document, min-height:0 content, safe areas and
   focus/keyboard support. Audit customer, foundation and operations shells.
2. Introduce pure photography presentation state and view/marker configuration separate from
   business metadata. Build isolated VehiclePhotoNavigator, controls, ShotCard/native carousel.
3. Rebuild overview/reference-like progress/selection/categories/CTA using one selected photo ID.
4. Remove review checklist/quality claims, keep explicit transactional confirmation; add derived
   section-completion continuation. Customize guidance icons/metadata by requirement.
5. Refine photograph composition and fixed-height content regions, then visually iterate at
   390x844 and check 360x800/430x932 and reduced-height forms.
6. Update tests/docs conflicting with this revision; review before replacing only approved
   photography baselines. Run lint/typecheck/unit/full browser/build and preserved origin parity.
7. Review intended diff, commit, push and verify; report any pre-existing failure separately.

## API impact
No endpoint or storage contract change. Keep template checks as non-interactive framing metadata;
do not claim user quality certification or automated validation. Existing future odometer, 360,
upload, summary and reviewer-retake requirements remain planned.

## Testing
Unit: state palette/markers/selection, template-specific guidance, no checkboxes, simple confirm,
next required photo/section. Browser: real mock workflow, storage/replacement safety, selected
marker/card consistency, controls, retakes, next suggestions, viewport/CTA/focus across all customer
pages, no 3D requests/console errors. Visual: reference comparison and distinct required states.

## Acceptance criteria
- [x] Reference-like home, full vehicle scene, data-driven selectable markers and image cards.
- [x] Gray/blue/orange states with accessible status and correct physical directions.
- [x] Review has no quality checklist; continuous next photo/section preserves durability.
- [x] Customized per-photo guidance and viewport-bound documents with usable internal content.
- [x] Reviewed baselines/responsive states and validation completed; unrelated edits preserved.
- [ ] Focused Git commit/push verified.

## Progress
- [x] Read request/instructions, recover Git state and inspect primary/supporting references.
- [x] Implement shell and photography redesign.
- [x] Update behavioral tests and visually iterate.
- [x] Run final validation and review.
- [ ] Commit, push and verify the focused change.

## Discoveries and resolutions
- Camera/review storage and route contracts already supported continuous next-photo confirmation;
  retained that atomic behavior and added a derived next-section action instead of new route logic.
- A UTF-8 BOM on the first CSS selector initially prevented the photography flex layout from
  matching. Removed it and verified the scene and document bounds in the browser.
- Grid shrinking clipped long section-card actions. Normal-flow cards now scroll in one bounded
  region, with the section header and CTA outside it.
- Absolutely positioned accessible input labels extended reduced-height document bounds. Relative
  containing blocks on the shell/main keep them inside the intended content region.
- Always enabling a scroll compositor changed fitting earlier screens' text rasterization. The
  resize/mutation bridge enables the main scroll region only when needed; original landing/OTP,
  location/vehicle and foundation-home baselines then passed unchanged.
- The mobile foundation gallery previously captured a 390x1440 document. Its sole earlier baseline
  was reviewed and changed to 390x844, with all remaining content reachable internally.
- Preserved unrelated readiness CSS/GPS-icon edits cause the existing 4,125-pixel screenshot
  mismatch. Its baseline was not regenerated and those edits are excluded from this task commit.

## Validation executed
- Root lint/typecheck and all unit tests passed; intended-change checkout repeated all three:
  8 unit files / 76 tests passed.
- Root full Playwright suite: 60 passed, 5 intentionally skipped, 1 pre-existing readiness visual
  failure. Final intended-change checkout full suite: 61 passed, 5 intentionally skipped.
- Twenty Phase-04 visual states at 390x844 reviewed before baseline approval; final photography
  visual tests passed. No Phase-01/02/03 product baseline changed.
- Viewport, marker hit targets, actions, forms and transitions passed at 360x800, 390x844, 430x932
  plus reduced-height 390x500 focus tests. No document overflow or meaningful console errors.
- Explicit root production build passed. Playwright also built the intended-change checkout.
- Development parity: 1 test passed on localhost and current Wi-Fi LAN 192.168.254.5. The earlier
  10.66.66.156 address is no longer assigned to this machine; no origin configuration changed.
- Benign FORCE_COLOR/NO_COLOR warning; nested validation checkout additionally warns about its
  two lockfiles. Neither warning required production configuration changes.

## Remaining limits
Cover imagery intentionally crops some outer vehicle edges at taller ratios/under the control rail;
guide/review preserve full imagery. Physical-device keyboard behavior still merits device QA.
The unrelated local readiness visual mismatch remains outside this task. No future phase started.
