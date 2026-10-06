# Phase 04 — inspection viewer

**Superseded before completion:** the 2026-10-06 product-direction change replaces this plan with
`image-guided-photography.md`. No Phase-04 commit was created or pushed. The reusable experimental
viewer remains isolated; its 14-shot fixture/UI/tests are replaced by the twelve-photo template.

## Goal
Implement only the reference-led customer capture home, connecting successful vehicle confirmation
to the capture route. Keep all earlier visuals, mock auth and development-origin configuration.
Stop before camera, media review, uploads or production API integration.

## User-visible behavior
Compact reference/partner header and journey, 7/14 progress and mock sync status, a bright automotive
viewer with selectable inspection pins, semantic highlights and standing guidance. View controls,
category navigation, a native scrolling shot carousel and a derived sticky CTA stay usable in 2D
when WebGL is unavailable. The CTA opens only an inspection-step preview, never a camera.

## Current state
Read AGENTS and INDEX first, prompt 04, design/domain/API docs and installed Next's server/client
and lazy-loading guides. Inspected 07/17/21/22 PNGs and 73 relevant SVG assets. No capture route or
GLB exists; add the canonical planned capture route once. Existing CapturePlan has a two-shot
bootstrap sample; retain that exported fixture for existing tests and provide a separate full mock
plan through the same repository method. Phase-02 CapabilityService/useCapabilities can be reused.
Known unrelated edits to AGENTS/auth/consent formatting/readiness CSS and assets remain excluded.

## Constraints
No dependencies, real API keys/requests, GPS/camera permission calls, live capture, review or durable
upload queue. Thin server route; narrow client interaction boundaries and lazy Canvas. Query owns
inspection/plan truth; one local reducer owns selected shot/view/mode. Vehicle +X is physical left,
+Y up, +Z front regardless of page RTL. No reference PNG rendering or fake GLB.

## Implementation
1. Add centralized semantic nodes/view config under src/lib/vehicle, a typed capture status model
   and separate deterministic 14-shot mock plan. Preserve repository/API abstraction.
2. Add progress, ShotCard/category carousel and local viewer reducer under features/capture.
3. Add components/vehicle/three subsystem: lazy viewer, development model adapter/geometry,
   camera/lighting, pins, highlights, standing marker, controls and functional 2D fallback.
4. Add inspection/[inspectionId]/capture thin server route and extend shared journey/header only
   for capture. VehicleWorkflow success navigates through centralized inspectionRoutes.capture.
5. Add unit/browser tests for own domain/control behavior and full transition; revise only prior
   assertions that previously expected the vehicle in-place receipt. Create one new 390x844 baseline.
6. Render/review against primary/supporting references and iterate 320/390/480 widths.
7. Document model contract/paths/limits, state/performance/camera boundary and planned API fields.
8. Validate lint/typecheck/all units/full browsers/build; review intended diff, commit and push.

## API impact
Keep GET /api/inspections/{inspectionId}/capture-plan. Clarify optional presentation geometry,
semantic node/view identifiers and progress/status mapping without conflating selected UI state
with backend truth. Mock sync counts are presentation fixtures, not an upload implementation.

## Testing
Unit: progress/status, selection/category/CTA reducer, pins, shot cards/carousel, controls and
WebGL fallback. Browser: vehicle → capture, controls/orbit/selection/category/mode, unavailable
WebGL, mock-only CTA/permission boundary, 320/390/480 overflow and new 390x844 screenshot.
Full previous baseline check will distinguish known unrelated local readiness edits from Phase 04.

## Acceptance criteria
- [ ] Route/workflow, plan/state ownership and all inspection controls work.
- [ ] Real interactive development WebGL model and usable semantic 2D fallback.
- [ ] Primary composition reviewed at 390x844; no horizontal overflow at 320/390/480.
- [ ] Existing baselines unchanged; only new Phase-04 baseline added.
- [ ] No Phase-05 camera/media/upload implementation or production API calls.
- [ ] Documentation/review and required validation completed; scoped Git result reported.

## Progress
- [x] Read instructions/docs, inspect reference PNGs and relevant production assets/repository.
- [ ] Implement domain/mock boundaries, viewer subsystem and capture screen.
- [ ] Add tests, inspect rendered visuals and create new baseline.
- [ ] Validate, review, document and complete focused Git workflow.
