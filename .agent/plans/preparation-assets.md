# Preparation visual asset replacement

## Goal
Replace only Phase-02 readiness/consent artwork with the supplied WebP assets. Preserve all
copy, workflow, routes, capability/consent logic, API contracts and origin configuration.

## User-visible behavior
Readiness uses a full cover banner behind its existing RTL text and four richer requirement
illustrations. Consent uses one banner without SVG/DOM-marker clutter. Page geometry and
sticky controls remain unchanged at 390x844.

## Current state
Read AGENTS/index/design/implementation documentation and inspected both canonical PNGs,
attached banners and the four existing public WebP illustrations. The existing readiness hero
uses an inner SUV image/check overlay; consent builds SVG/photo/marker layers. Its screenshot
test currently assumes a readiness inner img and must be adjusted only for the approved background
replacement. Pre-existing user edits include auth formatting, AGENTS, GPS icon, SVG deletions
and untracked readiness artwork. Preserve unrelated edits; include only required WebP assets.

## Constraints
No logic/architecture/routes/mock/API/configuration changes, no new dependencies or generated
imagery, no mirroring, no reference PNG rendering, no Phase-03 work. Retain Next optimization
for content images and the readiness background where feasible; change only asset-specific tests.

## Implementation
1. Copy the two supplied banners into public/images/preparation; reuse the four readiness WebPs
   in their existing stable public/illustrations/readiness folder.
2. Replace readiness inner image/check with an optimized CSS cover background and restrained
   white readability overlay. Update requirement image paths/dimensions, retaining row geometry.
3. Simplify PrivacyArtwork to one optimized banner. Remove obsolete illustration-layer CSS.
4. Update only the background-dependent screenshot wait, review rendered screens, update only
   the two Phase-02 baselines, and document the actual asset composition.
5. Validate lint/typecheck/unit/Playwright/build, review scope and secrets, focused commit/push.

## API impact
None. All capability, consent, authentication and backend boundaries remain untouched.

## Testing
Run existing unit tests and relevant Phase-01/Phase-02 browser scenarios. Check both exact
390x844 renders, banner/text readability, loaded assets, no console errors or overflow, and
sticky controls. Verify 320/480 widths through existing tests. No Phase-01 baseline updates.

## Acceptance criteria
- [x] No readiness inner img or old SUV reference; full supplied banner with readable RTL copy.
- [x] Four specified WebPs replace the corresponding readiness SVG illustrations.
- [x] Consent hero contains only its supplied banner, without SVG/span/marker composition.
- [x] Reviewed Phase-02 baselines and validations pass; preserved logic/config/baselines confirmed.

## Progress
- [x] Read instructions, inspect assets/references/current UI and existing Git changes.
- [x] Replace visual assets/composition, review mobile rendering, update two baselines.
- [x] Validate and review the focused diff; prepare task commit and report push result.

## Validation notes
Both exact 390x844 renders were visually reviewed before updating readiness/consent snapshots.
Their screen/action geometry remains unchanged, with readable readiness text and no extra consent
layers. Lint, typecheck and all 39 unit tests pass. The targeted snapshot update passed; the full
Playwright suite passed 26 tests with two intentional desktop skips, including Phase-01 snapshots,
no console/resource errors and 320/390/480px overflow checks. The unrelated local GPS-icon edit
was temporarily replaced by the committed icon for reproducible baselines/browser validation,
then restored byte-for-byte in a finally block. It is excluded from the task commit. Existing auth
formatting, AGENTS changes, SVG deletions and the extra untracked banner remain untouched.
Production build passed with the same existing static routes. Focused diff review confirmed no
logic, client boundary, dependency, route, API or configuration changes and only two preparation
snapshot updates. Asset checksums match the supplied banners. Git commit/push result is reported
in the completion message after the final staged review.
