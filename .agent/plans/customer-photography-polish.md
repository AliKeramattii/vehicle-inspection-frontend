# Customer photography visual modernisation

## Goal
Implement the approved TasteSkill Step-2 PRESERVE plan. Customer photography remains a premium 2D image-guided workflow with controls below the vehicle, readable shot navigation, consistent evidence state, uncropped review and predictable recovery.

## User-visible behavior
The existing landing → OTP → readiness → consent → location → vehicle → photography journey remains. At 360×800, 390×844 and 430×932 the image is the largest photography region; direction controls never overlay it. Capture/review advances to the next requirement/section without a forced overview return. Accepted evidence survives replacement failures. No quality checkboxes, production 3D or future features are added.

## Current state
HEAD e70990e on main. The working tree contains unrelated AGENTS/auth/consent/readiness edits, removed old readiness SVGs, formatted Playwright tests/config, installed skills and an untracked ~/ directory. Initial copies/diff are preserved in ignored .agent/reference-review/polish-start. Existing overview uses a cropped artwork layer and overlaid controls. Requirement attention includes drafts but section aggregation omits them. Review stretches a landscape image frame vertically. Readiness presents optional WebGL as customer 3D. A previous capture run reported passing assertions but hung before process completion; readiness also has pre-existing hero/GPS visual drift.

## Constraints
- Preserve AppViewport, RTL and physical vehicle directions, routes/labels/fields/anchors, branding/legal copy, mock A4K9P2 / 12345 and LAN configuration.
- Seven sections/twelve photos are derived from typed configuration. No API/DTO/storage architecture change.
- Do not replace canonical automotive assets. Document continuity candidates only.
- Use existing primitives/custom icons; no dependencies or new viewport system.
- References 07 (primary), 08–11, 17 and 21 support current composition; reference 22 is future-only. Existing references 03/05/06 inform targeted readiness/blue changes.
- Refresh screenshots only after inspecting actual renders and comparing reference intent. Keep earlier baselines unchanged except intentional reviewed readiness/location/vehicle changes.

## Implementation
1. Recover source/reference state; reproduce runner lifecycle and readiness drift.
2. Add scoped semantic typography and frame intent; move controls to normal flow and rebalance overview inside existing shell.
3. Improve cards/marker icons and derive completion/attention consistently.
4. Implement aspect-aware full evidence and guide frames, image errors and composition-preserving loading/recovery.
5. Normalize unintended identity primary blue/CTA and remove visible readiness WebGL without changing required camera/GPS/storage semantics.
6. Add unit/browser cases, render deterministic states at all target widths, inspect and iterate; accept intended baselines after review.
7. Update DESIGN_SYSTEM/PHOTOGRAPHY/READINESS_CONSENT; run all repository checks and written TasteSkill/preservation audits.
8. Review/stage only task changes, commit/push normally and verify remote.

## API impact
None. Only derived frontend presentation helpers change; repositories, domain IDs, transport/API contract, capture persistence and backend mocks remain.

## Testing
Unit: completion/attention combinations, selected status, derived totals, image error/ratio, readiness optional WebGL. Browser: controls below image/no overlap/minimum targets, navigation synchronization, continuous flow, uncropped evidence, retry/durability, no checklist or 3D requests, no page/console/resource errors. Full lint/typecheck/Vitest/Playwright/build must exit successfully; runner hangs are not PASS. Review screenshots at 360×800, 390×844, 430×932 including 0/12, partial, draft/replacement, retake, complete section/12, exterior/odometer/VIN guidance and review. Protect canonical asset bytes and unrelated user edits.

## Acceptance criteria
- Controls follow image and never overlap at any breakpoint; ≥44px touch targets.
- Large useful vehicle framing, shared marker transform, improved ≥11px important labels and readable compact two-row cards.
- One bounded vertical content region when needed, stable CTA, no document overflow.
- Completion credit independent of draft attention; explicit retake retains existing progress rules.
- Evidence not cropped; recovery actions and stable loading geometry present.
- All checks exit zero, visual baselines reviewed, preservation/pre-flight pass.
- No canonical image replacement/future-phase implementation; intended commit excludes user changes.

## Progress
- [x] Read approved audit/plan, repository instructions/docs, inspect initial Git state and preserve local changes.
- [x] Inspect references/current visuals and reproduce validation debt.
- [x] Implement approved layout/state/frame/icon/recovery/readiness/brand changes.
- [x] Add tests and iterate actual visual states.
- [x] Complete documentation, technical validation and written audits.
- [x] Review intended diff, commit, push and verify.

## Discoveries / validation
Runner hang reproduced after seven passing capture assertions at Playwright web-server teardown.
Installed Playwright uses Windows taskkill /T /F; sandbox returns Access denied. A disposable child
process confirmed the failure and the identical allowed process-tree operation succeeds outside
the sandbox. Full Playwright now exits (first intentional-baseline review run exit 1, 57 passed,
9 skipped, 8 failures: changed snapshots and selectors adapted to custom SVG/alert markup).
No timeout/configuration workaround or camera/persistence behavior change is needed.

Lint initially scanned unrelated ~/ skill fixtures and failed their any type. Tooling directories
are now excluded without editing/installing/running the optional skill. All 87 unit tests pass.
Actual review at three target widths confirms 300px+ scene and full vehicle silhouette; at short
heights the second card row is reached by the existing internal region, not compressed type.
Canonical 07/08/09/10/11/17/21 and targeted 03/05/06 were compared. Assets are unchanged.
Current root readiness hero gradient/text width differs from HEAD before this task. Intended
staged code will be exported and validated separately so its reviewed baseline cannot absorb
unrelated user styling. Working-tree edits remain in place.

Final: root lint/typecheck/87 unit tests/build exit 0. Intended-change export lint/typecheck/unit
and full Playwright exit 0: 68 passed, 12 intentional desktop skips. Root full Playwright exits 1
only on the preserved local readiness hero styling: 67 passed, 12 skipped, one 4,010-pixel mismatch
confined to hero gradient/copy width. The reviewed readiness baseline reflects intended committed
hero CSS plus authorized diagnostic/GPS/CTA changes, and does not absorb local hero edits.
All Phase-04 and other earlier baselines pass. 23 reviewed existing baselines changed and five
new attention/framing baselines were accepted; landing/OTP/foundation/camera remain unchanged.
Full manifest and written em-dash/pre-flight/brand/preservation audits are in CUSTOMER_VISUAL_POLISH.

Recovery tests confirm failed images retry and portrait/landscape evidence remains contained.
All camera/persistence/atomic replacement/continuous navigation regressions pass. Early draft
candidate screenshot raced route navigation; added heading/action wait and inspected correct
review before accepting its baseline. Speculative Next RSC cancellations are excluded from resource
errors while actual failures remain checked. No canonical assets/dependencies/routes/APIs changed.

Implementation commit `3b152fe` (`feat: polish customer photography experience`) was pushed to
`origin/main`; `git ls-remote` confirmed the full commit hash on GitHub. The reviewed index matched
the passing intended-change export, and unrelated user modifications/deletions remained intact.
