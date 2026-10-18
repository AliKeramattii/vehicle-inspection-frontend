# Customer hero composition

## Goal
Correct default sedan and tenant hero framing/spacing across customer screens without redesign or business changes.

## User-visible behavior
Branding, headings and description precede a contained, centered hero in normal flow. Page-specific image budgets keep forms/actions reachable within AppViewport, with internal scrolling when needed.

## Current state
Canonical branch feat/unified-ui-admin-3d at 37c7ee6. Nineteen pre-existing modified files include ten hero images and Site Settings schema; preserve/exclude them. Landing/OTP/consent use fixed cover frames; readiness overlays absolutely positioned copy over a shifted background; vehicle card uses overlapping absolute illustration/details; receipt uses fixed dimensions.

## Constraints
Exact supplied sedan/source images, brand colors/copy, tenant overrides, AppViewport/safe areas, routes and all capture/media/3D/admin/reviewer/map logic preserved. No old baseline refresh. Pre-existing local schema import .ts broke typecheck; user approved only suffix removal, applied locally and excluded from the commit.

## Implementation
1. Hash protected files and capture BEFORE images at six viewports plus landscape/text enlargement.
2. Add a small shared contained artwork frame with page-specific variants; preserve runtime branding resolution.
3. Correct surrounding page flow and remove readiness/identity overlap rules.
4. Capture AFTER, inspect/refine actual car proportions and form reachability, test nonstandard tenant images.
5. Add scoped visual/layout regression tests and documentation. Validate repository scripts, review exact staged diff, commit/push canonical branch.

## API impact
None.

## Testing
320×568, 360×800, 390×844, 430×932, 768×1024, 1440×960, mobile landscape and enlarged text. Assert document bounds, separate copy/media boxes, contain/no distortion, image stability, reachable actions and custom-image fallback. Run lint/typecheck/unit/build and focused Playwright.

## Acceptance criteria
- [x] BEFORE screenshots captured and inspected.
- [x] Page-specific layouts fixed with no text/vehicle overlap.
- [x] All target viewports/custom images verified with AFTER screenshots.
- [x] No source/3D/history/unrelated changes included.
- [x] Actual validation exits recorded, including historical visual/Admin-copy failures.
- [x] Focused implementation commit 3553dd1 pushed and remote HEAD verified.

## Progress
- [x] Read request, AGENTS, INDEX, design system, viewport architecture and Next image docs; inspect current Git state and primary references.
- [x] Identify structural causes and pre-existing typecheck blocker.
- [x] BEFORE browser capture: 53 images.
- [x] Implementation/refinement, including keyboard action and receipt-fit regressions.
- [x] Validation/Git implementation delivery verified; documentation records remaining unrelated failures.

## Findings and validation
See docs/CUSTOMER_HERO_COMPOSITION.md for root causes, reviewed screenshots, actual command exits and historical baseline/Admin-copy limitations. Protected-file hash audit: 740 unchanged, one approved import-only correction. Six hero scenarios and five new stable-fixture baselines pass; affected functional run: 72 passed, 38 skipped, exit 0. Full historical visual comparisons remain intentionally unchanged and fail. Implementation delivery: 3553dd1e1d9d733bc09a6b163194e308357e254e, normal push and remote HEAD verified.
