# Final reference-driven customer refinement
## Goal
Implement the supplied eleven-screen customer design package in the canonical worktree without changing working business flows.
## User-visible behavior
Mint atmosphere and white surfaces, spacious contained sedan images, new OTP/receipt art, legible preparation and evidence context, a final summary vehicle card that is not squeezed, and estimated receipt review time ۳ تا ۵ روز کاری.
## Current state
Branch feat/unified-ui-admin-3d, HEAD 54dd9f3. Twenty tracked user modifications include globals, hero images, customer-hero.css, schema, six browser configs and development model route. Untracked reference package, nested checkout and old logo remain user work. Existing historical full suite has 45 failures (42 visual/missing snapshots and three outdated selectors/geometry). Current dev services restarted on 3114/8787/8788 using actual scripts.
## Constraints
No map/location, tenant pipeline/schema, private settings, global theme, marker logic, GLB/viewer/gating, Admin/Reviewer design or backend changes. Do not edit dirty customer-hero.css; isolate new containment styles under the customer shell. Preserve logos, AppViewport, seven sections/twelve photos, odometer/video separation, durable media/queue, atomic replacement and submit/retake locks. No snapshot blanket update, data clearing, reset/stash/worktree or main merge.
## Implementation
0. Inspect README, eleven images, all available supporting art/SVG/CSS; record source mapping and protected hashes; capture BEFORE.
1. Customer-only shell CSS and halo, Landing/OTP; copy only runtime SVG/WebP and change default art while keeping tenant overrides.
2. Preparation cards/icons/capabilities and consent/vehicle presentation; no permission or form changes.
3. Photography panel/guide/review grouping; preserve image coordinate frame and complete viewer subsystem.
4. Summary: move existing vehicle section to lead, separate facts from spacious contained image/plate; receipt art and estimated time.
5. Match remaining video/upload/retake shells; responsive/keyboard/theme/map/operations regression, documentation and reviewed AFTER evidence.
## API impact
None; presentation only.
## Testing
Existing final-ui-review captures (320x568,360x800,390x844,430x932,768x1024 plus operations), full customer camera flow, actual live Neshan authorized live-provider regression, Admin/Reviewer quick checks, lint/type/unit/build. Add reference-specific framing/art/tenant/receipt assertions. Do not claim physical-device or optional restricted GLB runtime tests without hardware/authorized environment.
## Acceptance criteria
No document overflow, images contained and natural ratio, sticky CTA reachable, clear states, runtime logos/themes preserved, map/protected files unchanged, actual commands exit recorded, reference comparison and before/after evidence, focused commits pushed.
## Progress
- [x] Inspected supplied designs/assets and current architecture.
- [x] BEFORE captures and baseline validation (107 captures; lint/typecheck and 457 units pass).
- [x] Checkpoint 1 shell/Landing/OTP; captures, Admin isolation and live-provider regressions passed.
- [x] Checkpoint 2 readiness/consent/vehicle; journey capture, live map regressions, 38 focused units and typecheck pass.
- [x] Checkpoint 3 overview/guide/review; eight browser checks pass, visual captures reviewed, viewer/marker implementation untouched.
- [x] Checkpoint 4 summary/receipt; four new reference tests plus strict existing receipt-fit test pass, 30 asset/submission units and typecheck pass, actual map still verified.
- [x] Checkpoint 5 remaining pages/QA/report delivered; implementation checkpoints pushed. Final docs/QA push follows, with historical failures explicitly retained.
## Missing package entries
Secure Messaging Shield.png (original), assets/optional-not-default-logo/Glossy-Verified-Car-Shield-Logo.svg and CODEX_FINAL_UI_IMPLEMENTATION_PROMPT.md are not present. Required WebP and all eleven screenshots exist. green-halo-desktop.webp is also intentionally missing; reuse the supplied lightweight SVG on desktop. No source contents will be invented.


Checkpoint 1 findings: new static illustrations bypass Next image optimization to preserve the protected localPatterns configuration; tenant override resolution is unchanged. Removed a UTF-8 BOM in the new CSS that Turbopack interpreted as part of its first selector. No map/global configuration changes.

Checkpoint 4: retained the exact supplied receipt bitmap; default-only CSS clips its thin black canvas edges. Eight pixels of short-screen overflow were fixed through gap spacing. A clipboard-only browser permission fixture initially denied camera at readiness; permission is now deferred until receipt, with no production capability change. Tenant artwork/logo assertions respect the existing absolute-URL resolver.

Checkpoint 5: coordinated video/upload/retake surfaces. The historical run found genuine consent CTA and short-height landing regressions; moved consent presentation into one internal scroller with stable sibling action, preserving its form/terms/state. Strict customer workflow, keyboard/landscape start, 125% text and full hero-composition follow-up: eight browser tests pass. Asset contract assertions updated to the intentionally supplied icon/receipt art; lazy summary thumbnails explicitly brought into view. Final full-suite reconciliation and documentation pending.
Design reading: PRESERVE; established Persian insurance/customer UI, variance 3-4/10, motion 2/10, photography density about 6/10. Explicit reference cards/custom icons, dark camera stage and existing tenant themes override generic marketing-page preferences.

## Final validation and preserved debt
Final lint/typecheck/unit/build exit 0; 457 unit tests / 40 files. Final full browser suite: 231 passed, 174 skipped, 45 failed, exit 1. The same 45 case identities failed before this task: 42 screenshot/missing-baseline cases and three old header/capture-reference assertions. No new failing cases. All five added reference tests pass; strict viewport/keyboard/enlarged-text and actual capture/queue/submission/retake regressions pass. Live Neshan rerun: three passed, exit 0 (earlier upstream 504 reported); actual authorized optional GLB test: one passed, exit 0. Reviewed 107 AFTER captures with no document overflow; ten portable review images and exact nine-asset mapping documented. No old baseline changes; all 82 protected file hashes and original twenty dirty files preserved. Final completion report documents missing original PNG/optional files and untested real-device/PWA/Web-Vitals checks. Implementation checkpoint c4dec69 pushed normally; final docs/QA commit is reported in delivery.
