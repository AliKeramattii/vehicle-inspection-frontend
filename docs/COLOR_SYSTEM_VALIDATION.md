# Color-system validation (2026-10-16)

Implementation: `0dab29330332a1609df3bd0c47e07a35e0c26a97`, pushed normally and remote-verified
on `origin/feat/unified-ui-admin-3d`. Starting HEAD was `feceff0c3bb649d8b40daa0b4d61e8f2a97ff9ad`.
Canonical worktree: `C:/Projects/vehicle-inspection-integrated`. No new worktree or main merge.

## Actual command results

| Command | Result | Process exit |
|---|---|---|
| npm run lint | PASS | 0 |
| npm run typecheck | PASS | 0 |
| npm run test | PASS: 392 tests, 32 files | 0 |
| npm run build | PASS: production Next build | 0 |
| npm run test:e2e -- --config playwright.colors.config.ts | PASS: 7 passed, 7 project skips | 0 |
| selected production regression command below | PASS: 181 passed, 101 skipped | 0 |
| git diff --cached --check | PASS after removing an extra runtime-palette EOF blank line | 0 |

The final browser processes exited normally; no runner stall, application console/page error or
unexpected HTTP resource failure occurred in the reviewed scenarios. Browser skips include
project-specific duplicate cases and gated live-provider/optional-model/reviewer integration
fixtures. This is a selected functional regression run, not a claim that every historical visual
comparison passes. No historical snapshot update command was run.

Exact functional selection (PowerShell):

~~~powershell
$env:COMPLETION_REPORT='.agent/reference-review/color-system/functional.json'
$env:REVIEW_ADDITIONAL='1'
$env:REVIEW_SUBMISSION='1'
$env:REVIEW_UPLOAD='1'
npm.cmd run test:e2e -- --config playwright.completion.config.ts --grep-invert 'reference-led|screenshot|visual|vehicle confirmation opens|accepted replacement attention|portrait evidence|new draft has orange|odometer review validates|video ready, deterministic|re-record keeps accepted|partial package|two brokerage deployments|Site Settings validation, role checks|Site Settings desktop viewport 1440|eight local image slots'
~~~

Historical references, image snapshots and earlier asset/behavior assertions are excluded by that
selection rather than rewritten to hide unrelated drift. New color tests cover those visual roles
through separately captured artifacts, actual text contrast, default/custom paint and light/dark
scoping. Existing photography-navigation selection/status tests remain included and now resolve
approved semantic colors rather than obsolete RGB spellings.

## Screenshots and viewport review

- Before: 56 screenshots of the starting UI using the same canonical sedan assets.
- After: 63 screenshots, including seven added odometer/retake recovery states.
- Customer: 360×800, 390×844, 430×932. Operations: 1440×960, 1280×800, 1024×768.
- Reviewed welcome/OTP/readiness/consent/location/vehicle; photography, guidance, recorder ready/active,
  video review, odometer/error, upload/summary/receipt and additional-evidence/review.
- Reviewed Admin dashboard/settings/image controls and Reviewer queue/workstation, light/dark/system.
- No document overflow in captured screens. Existing AppViewport/internal scrolling and control sizes
  remain unchanged. Vehicle controls remain below the image; marker keyboard/touch behavior passes.

Local artifacts (intentionally outside versioned historical baselines):

~~~text
.agent/reference-review/color-system/index.html
.agent/reference-review/color-system/before/*.png
.agent/reference-review/color-system/after/*.png
.agent/reference-review/color-system/*-comparison.png
.agent/reference-review/color-system/after/*-contrast.json
.agent/reference-review/color-system/after/contrast.json
.agent/reference-review/color-system/functional.json
~~~

Before/after comparison images pair landing, photography, recorder, Admin settings and Reviewer
workspace. Source PNG composition was preserved; color differences are deliberate. Important
vehicle/logo/plate/ghost/provider-image content remains unchanged. No historical baseline added,
removed or regenerated.

## Contrast results

69 LAB definitions match supplied numerical strings exactly. 1,472 important visible text samples
across 63 screenshots pass their applicable text threshold. 104 semantic pair checks pass across
customer, operations light/dark and customer-after-dark. Actual custom brown/white and yellow/dark
brand pairs pass customer, skip-link and Admin light/dark checks without semantic status recoloring.

| Pair | Measured ratio |
|---|---|
| Light white / Emerald 700 action | 5.36:1 |
| Dark Slate 900 / Emerald 400 action | 9.20:1 |
| Light Teal 700 focus / white surface | 5.36:1 |
| Dark Teal 500 focus / Slate 800 surface | 6.03:1 |
| Light Rose 700 error text / Red 50 | 5.51:1 |
| Dark Rose 300 error text / Slate 700 | 5.40:1 |

Small text targets 4.5:1 and meaningful non-text controls/graphics 3:1. Disabled, hidden and media-pixel
content are excluded from automated text composition checks and separately reviewed. This targeted
check is not a complete WCAG certification. See COLOR_SYSTEM.md for the W3C criteria and companion
ink decisions; no primitive numerical value was modified to obtain these ratios.

## Problems found and corrected

- Old error foregrounds missed small-text AA; approved Rose ink companions corrected them.
- Dark recorder caption and white-on-bright-dark-status combinations needed scoped media/status ink.
- A selected-marker rule overrode Teal keyboard focus; focused-selected paint now takes precedence.
- A legacy sidebar rule overrode configured dark foreground on a yellow tenant primary; scoped active
  paint and neutral non-active hover now respect tenant contrast.
- Old dark RGB assertions were updated to the approved LAB Slate primitives. No route, selection,
  evidence, timing or permission assertion was removed from those tests.
- The asset test rejected an unrelated extra source file. It now verifies all nineteen approved source
  names from the existing manifest, while preserving twelve exact guide hashes and allowing unrelated
  supplied extras. No source/runtime image was replaced.

PowerShell records npm stderr notices as NativeCommandError text even when npm exits 0; actual exit
codes above are authoritative. Playwright reports the existing NO_COLOR/FORCE_COLOR warning and
Git reports Windows line-ending notices. These warnings were not hidden; neither is an app error.

## Preservation and TasteSkill pre-flight

188 protected original files retain SHA-256 hashes, including model/viewer code, vehicle/ghost
assets, historical screenshot baselines and the unrelated windshield source. Seven unrelated
pre-existing dirty files retain exact hashes. Existing globals formatting/import order remains in
the working tree but outside the task commit; only intended token/import/focus changes were staged.
Additional untracked guide assets and the windshield source remain unmodified and unstaged.

A declaration audit of all 17 edited existing CSS files found no non-paint declaration changes.
Routes, nav labels, form field names, anchors, logo/partner artwork, legal copy, font, spacing,
100dvh shell, physical-direction semantics, media logic, persistence, queue, submission, permissions,
API contracts, optional model architecture and licensing gates are unchanged. The only copy
clarification is the existing read-only Admin brand-color hint, now accurately describing Site Settings.

Applicable pre-flight PASS: PRESERVE brief/dials recorded; existing semantic/theme architecture
reused; CTA/form/status/focus contrast checked; light/dark/system preference and customer isolation
checked; no new em dash in application copy; no added motion/dependencies/decorative layout.
Generic marketing rules do not override product-specific UI, imagery or semantic state requirements.

## Remaining limitations

- Historical screenshot debt remains, including the unrelated readiness mismatch. Its layout/assets
  and stored baseline were not corrected or overwritten; readiness receives the approved shared color
  change only.
- Older full visual-suite expectations still reference earlier paint/assets/behavior. Palette review
  artifacts are separate; approve/update those historical baselines deliberately in a separate task.
- Actual provider coverage, real backend integration and optional GLB rendering were not changed or
  claimed as new validation by this color task. Their gated tests retain existing skip requirements.
- Branding image colors, real vehicle colors, Iranian plate/flag colors and existing geographic GPS
  layer colors are intentionally preserved; not every remaining blue pixel is a UI primary token.
