# Phase-01 landing visual correction

## Goal
Resolve the remaining landing regression against the canonical reference, preserving all workflows and origin configuration. Do not begin Phase 02.

## User-visible behavior
The referral heading reads `کد معرفی / کد ارجاع`. Its ticket contains horizontal strokes; support uses the reference's compact boom microphone. The no-visit benefit uses a crossed location pin, matching the reference rather than the old crosshair symbol.

## Current state
Read AGENTS.md, references/INDEX.md, design system, and plan format. Inspected both phase references, landing baseline, current render, and diff. Exactly 615 significant diff pixels occur in label (330), ticket (97), location (115), support (73); zero occur outside these regions. Existing user formatting in CSS/TSX and AGENTS.md must remain unstaged. Existing three SVG/label edits are in scope for this request. Source PNGs stay unchanged.

## Constraints
No auth/mock/state/routing changes; A4K9P2 and 12345 remain unchanged. Keep LAN fix, typography, spacing, hero, CTA, benefits geometry, privacy/footer layout, accessibility, and architecture. Do not relax screenshot thresholds or update screenshots before reviewing the render.

## Implementation
1. Restore the full heading in referral-form.tsx without disturbing its formatting/logic.
2. Restore horizontal-stroke ticket and compact headset SVGs; retain crossed-location-pin SVG because it is closer to the source PNG.
3. Capture/review the corrected render, verify residual difference is only the justified pin change, then regenerate only the landing baseline.
4. Document the visual decision, validate all requested commands, review/stage only intended files, commit/push.

## API impact
None.

## Testing
Lint, typecheck, all 23 existing unit tests, Phase-01 Playwright, complete existing visual suite, production build, and actual localhost/LAN parity. Compare at 390 x 844; retain all other screenshot baselines.

## Acceptance criteria
- [x] Account for all 615 pixels using artifact regions and canonical reference comparison.
- [x] Correct label/ticket/headset; preserve reference-correct pin and remaining geometry.
- [x] Review corrected render before updating only the justified landing baseline.
- [x] All requested validation passes with user work and Phase 02 preserved.

## Progress
- [x] Inspect instructions, Git state, source references, implementation, baseline, and diff.
- [x] Apply narrow visual corrections.
- [x] Render and compare: the remaining 115 pixels are solely the reference-correct location pin. Regenerate the justified landing baseline after this review.
- [x] Validate, review diff/security, and prepare focused commit/push. Git result is reported in the completion report.

## Validation and review
- The deliberately unchanged baseline failed first with 115 pixels solely in the location icon after the 500 incorrect label/ticket/headset pixels were corrected. Reviewed the corrected full render and diff before regenerating.
- Only landing-referral-customer.png changed. All five other baseline files, source references, screenshot thresholds, mock/workflow logic, routes, and development origin configuration remain unchanged.
- Lint/typecheck, all 23 unit tests, full Playwright suite (19 pass, one intentional desktop screenshot skip), and explicit production build pass. The full suite includes all Phase-01 cases and complete existing visual coverage.
- Playwright emits the pre-existing NO_COLOR/FORCE_COLOR warning. No application console errors or overflow in the browser suite.
- Extra parity verification at the old 10.66.66.156 address was network-denied in sandbox and timed out with normal access. OS interface inspection confirms that address is no longer assigned; this is a changed network environment, not a UI/origin-config regression. Parity at the current LAN address 192.168.254.6 passes, without altering configuration.
- Restored label/ticket/headset now match their already-committed forms. Do not stage the remaining unrelated form/CSS/TSX formatting or AGENTS.md changes. Focused commit contains the approved crossed-pin asset, revised landing baseline, this plan, and visual-review notes only.
