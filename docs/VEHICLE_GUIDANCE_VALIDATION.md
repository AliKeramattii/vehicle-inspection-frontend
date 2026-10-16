# Sedan guidance validation

## Delivery status
Implementation commit: 893af1e0aa0a2c99517bd814c357f3395a5984a4 (feat: add sedan VIN guidance and photo alignment), pushed and independently verified on origin/feat/unified-ui-admin-3d. Work performed only in C:/Projects/vehicle-inspection-integrated.

**Partially complete:** all asset/VIN/photo-alignment work is implemented; a matching cleared 4–5-second 3D orbit clip is still missing. The static sedan path illustration is explicitly not that deliverable. The only available restricted Sportage GLB was not modified or published. See VEHICLE_GUIDANCE_CONSOLIDATION.md.

## Actual command results
- npm run lint: PASS, exit 0.
- npm run typecheck: PASS, exit 0.
- npm run test -- --reporter=dot: PASS, exit 0; 400 tests / 33 files.
- npm run build: PASS, exit 0.
- npm run test:e2e -- --config playwright.vehicle-guidance.config.ts: PASS, exit 0; 21 passed / 15 project-specific skips. Includes all four new screenshots with actual baseline assertions enabled.
- npm run test:e2e -- --config playwright.completion.config.ts viewport.spec.ts frontend-completion.spec.ts upload.spec.ts submission.spec.ts additional-evidence.spec.ts: PASS, exit 0; 69 passed / 61 project-specific skips. REVIEW_ADDITIONAL=1, REVIEW_SUBMISSION=1, REVIEW_UPLOAD=1 capture current comparison images while preserving historical baseline assertions/files for their separate review.

The capture/navigation runner exited normally. No full historical visual-suite PASS is claimed. The known readiness comparison and older palette/image baselines remain intentionally untouched. Chromium uses deterministic live-media fixtures; physical mobile camera testing was not performed. No application console/page/resource errors were observed in the focused runs.

## Visual review
Canonical composition references: 03, 07–12, 17, 21–23; approved new sedan/reference images override historical vehicle paint/body only. Reviewed readiness, VIN choices, four chosen technical references, evidence comparison, photo overlay and movement help at 360×800, 390×844, 430×932; broader hero/identity/overview/admin/receipt asset coverage also includes 1440×960. No document overflow; existing internal scroll/CTA remains. Small vehicle markers stay interactive; directional controls remain below imagery.

Four NEW baselines only, under tests/e2e/screenshots/vehicle-guidance.spec.ts/:
- spec-plate-choices-390-customer.png
- spec-plate-guide-windshield-customer.png
- photo-camera-ghost-390-customer.png
- spec-plate-review-customer.png

Screenshots were captured and visually inspected first. The VIN review fixture was corrected to capture the selected windshield sample before its new baseline was accepted. No historical baseline was regenerated. Local artifacts: .agent/reference-review/vehicle-guidance/after/ and .agent/reference-review/new-vehicle/after/.

## Issues found and corrected
- A new help-preview class collided with an older absolute background class, causing illustration/text overlap. A unique instruction-preview class now reserves normal document space; browser geometry assertions prevent recurrence.
- The first browser run reported three skipped desktop cases as failures because teardown checked an uninitialized error collector. Teardown now respects project skips; actual customer assertions had passed. Final runs exit 0.
- Intermediate prop/test-fixture type errors were fixed before final lint/typecheck/build. A Windows npm regex-pipe invocation failed before tests launched; the explicit regression-file invocation above exited 0.
- Existing NO_COLOR/FORCE_COLOR tool warnings and Git LF/CRLF conversion notices remain non-fatal. No application warning was hidden.

## Preservation and boundaries
All 662 protected SHA-256 hashes still match the pre-task snapshot: original reference/public imagery, historical baselines, optional 3D code and local GLB, plus all eight pre-existing tracked edits. The two requested readiness row asset references changed; unrelated readiness styling and its old baseline did not. No backend/API, route, form field, legal copy, logo, map/proxy/origin setting, evidence count/identity or database schema changed.

12 photographs + integer odometer + video remain separate. Accepted Blob precedence, replacements, reviewer-request scopes, durable queue, offline retry, submission locks and media cleanup pass regression coverage. New technical-location preference is tab-scoped guidance only; it does not claim backend persistence. Photo ghosts use 22% opacity in a decorative DOM layer; video uses none. No dependencies or newly generated vehicle pixels. Four supplied public copies plus seven supplied source/guide inputs were added without altering their bytes.

## Exact implementation files
- .agent/plans/vehicle-guidance-consolidation.md
- docs/NEW_VEHICLE_ASSETS.json
- docs/PHOTOGRAPHY.md
- docs/VEHICLE_GUIDANCE_CONSOLIDATION.md
- playwright.vehicle-guidance.config.ts
- public/assets/inspection-vehicle/photo-guides/spec-plate-2.webp
- public/assets/inspection-vehicle/photo-guides/windshield-vin.webp
- public/assets/inspection-vehicle/readiness/readiness-clean-vehicle.webp
- public/assets/inspection-vehicle/readiness/readiness-open-space.webp
- references/INDEX.md
- references/assets/new-vehicle/guides/Pearl-white sedan windshield VIN inspection.webp
- references/assets/new-vehicle/guides/chassis-number.webp
- references/assets/new-vehicle/guides/readiness-clean-vehicle.webp
- references/assets/new-vehicle/guides/readiness-open-space.webp
- references/assets/new-vehicle/guides/spec-plate-2.webp
- references/assets/new-vehicle/guides/spec-plate.webp
- references/assets/new-vehicle/source/Pearl-white sedan windshield VIN inspection.webp
- src/config/vehicle-assets.ts
- src/features/additional-evidence/additional-capture.tsx
- src/features/capture-package/recorder-v2.css
- src/features/capture-package/recording-guides.ts
- src/features/capture-package/video-capture.tsx
- src/features/capture-package/walkaround-guidance.tsx
- src/features/capture-package/walkaround-preview.css
- src/features/capture-package/walkaround-preview.tsx
- src/features/photography/identification-guide-choice.tsx
- src/features/photography/photo-alignment-guide.tsx
- src/features/photography/photo-camera.tsx
- src/features/photography/photo-guidance.tsx
- src/features/photography/photo-review.tsx
- src/features/photography/use-identification-guide.ts
- src/features/photography/vehicle-guidance.css
- src/features/photography/vehicle-identification-guides.ts
- src/features/readiness/readiness-requirements.tsx
- tests/e2e/additional-evidence.spec.ts
- tests/e2e/capture-package.spec.ts
- tests/e2e/photography-helpers.ts
- tests/e2e/photography-polish.spec.ts
- tests/e2e/photography-visual.spec.ts
- tests/e2e/screenshots/vehicle-guidance.spec.ts/photo-camera-ghost-390-customer.png
- tests/e2e/screenshots/vehicle-guidance.spec.ts/spec-plate-choices-390-customer.png
- tests/e2e/screenshots/vehicle-guidance.spec.ts/spec-plate-guide-windshield-customer.png
- tests/e2e/screenshots/vehicle-guidance.spec.ts/spec-plate-review-customer.png
- tests/e2e/unified-recorder.spec.ts
- tests/e2e/vehicle-assets.spec.ts
- tests/e2e/vehicle-guidance.spec.ts
- tests/unit/recorder-v2.test.tsx
- tests/unit/vehicle-assets.test.tsx
- tests/unit/vehicle-guidance.test.tsx

This validation document and the final ExecPlan status update are included in the documentation follow-up commit.
