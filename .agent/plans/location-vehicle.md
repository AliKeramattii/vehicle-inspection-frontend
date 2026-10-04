# Phase 03 — location and vehicle identity

## Goal
Implement only the two reference-led customer screens and connect consent → location → vehicle.
Preserve prior phase screens/baselines, origin configuration, mocks and architecture. Stop before
capture/3D; no existing capture scaffold exists, so confirmation ends on the vehicle route.

## User-visible behavior
Location has a half-height deterministic pannable map, a fixed selected pin, separate GPS accuracy
circle, locate control and compact editable address/building/unit/parking form. Vehicle shows a
premium SUV summary, semantic Iranian plate, correct/correction choices, segmented entry and
small discrepancy/alternate-format disclosures. Mock saves expose pending/error/success states.

## Current state
Read AGENTS, reference index, prompt, design/architecture/domain/routes/API docs and Next's local
server/client and routing guides. Inspected both canonical PNGs, supplied location/plate/status
SVGs and the existing unbranded SUV photo. Domain types already cover location, vehicle and plate;
repository initially has only reads/capture-plan/consent. JourneyStepper and shared form/CTA/dialog
primitives exist; VehicleCard/IranianPlate/PlateInput are not implemented. Consent currently ends
on the same route. User edits to AGENTS/auth formatting/GPS icon/SVG deletions are unrelated and
remain preserved. Later local preparation CSS edits also changed the readiness hero gradient and
paragraph width; neither those edits nor the GPS icon belong to this phase's commit.

## Constraints
No new packages, real API, keys, GPS prompts, vendor coupling, 3D/capture, persistent login or
reference PNG rendering. Thin server pages, narrow interaction islands, Query for repository truth,
local form drafts, no backend entities in Zustand. Plate segments and VIN stay logically LTR.

## Implementation
1. Extend typed repository methods, isolated mock state, validation and endpoint declarations for
   location/vehicle confirmations. Centralize mock coordinates and map adapter behavior.
2. Add shared journey header using existing stepper (scoped visual overrides preserve foundation).
3. Add InspectionLocationMap boundary/development adapter and vector development map artwork;
   render map movement underneath fixed pin, keyboard/pointer panning, locate and accuracy states.
4. Add location form/query workflow and /inspection/[inspectionId]/location server page.
5. Add reusable VehicleCard, IranianPlate, PlateInput and vehicle query/form workflow, with
   /inspection/[inspectionId]/vehicle server page. Finish in-place; no capture route is created.
6. Connect ConsentWorkflow success through an optional form completion callback, preserving
   standalone consent form behavior and existing initial visuals.
7. Add domain/repository/control and browser tests; update only behavior assertions required by
   the new transition. Review exact 390x844 screenshots, then create only two new baselines.
8. Document actual mock/API boundaries; validate full suite/build, self-review, commit and push.

## API impact
Document planned PUT location and GET/PUT vehicle/plate payloads, confirmation/discrepancy
semantics, validation, authorization and error behavior. These are requested contracts, not HTTP
integration. Existing semantic location/vehicle/plate types are reused and refined as needed.

## Testing
Unit: mock location/accuracy/form optional fields/confirm, map/locate semantics and states; vehicle
summary/VIN/plate choice/correction, normalized segments/letter/paste/focus/validation/confirmation;
repository isolation/validation/gates/errors. Browser: full consent transition, map drag/fixed pin,
location save, correct/manual plate flows, disclosures, console/resources, 320/390/480 overflow
and two 390x844 screenshots. Run lint, typecheck, all units, full Playwright and production build.

## Acceptance criteria
- [x] Both layouts reviewed directly against 05-location/06-vehicle-identity at 390x844.
- [x] Deterministic location/map service, typed saves and no permission/API/vendor leakage.
- [x] Accessible semantic plate/order/manual controls work at 320px without overflow.
- [x] Consent → location → vehicle works; vehicle ends without Phase-04 implementation.
- [x] Prior baselines unchanged; new baselines reviewed; intended changes pass validation.
- [x] Scoped diff/docs reviewed and only intended files selected for the task commit.

## Progress
- [x] Inspect repository, instructions, reference screens, asset inventory and local Next guides.
- [x] Implement typed mock/domain boundaries and reference-led components/routes.
- [x] Test behavior, render/compare/iterate, create two new baselines.
- [x] Complete validation, review and implementation documentation.

Commit and push follow these completed implementation checks. The final completion report records
the actual branch, hash and verified push status; unrelated working-tree changes stay unstaged.

## Discoveries and fixes
Initial layouts overflowed vertically due to inherited line heights and excess spacing. Scoped
spacing/type corrections preserve 44px targets and fit both initial screens in 844px. RHF watch
subscriptions were replaced with useWatch to remove compiler warnings. Dialog submit events
bubble through React portals despite valid DOM placement; stopPropagation prevents accidental
parent confirmation and explicit trigger focus restoration handles unmount. Browser and unit
regressions cover the fix. A disabled rule initially exposed the native ASCII plate value over
its decorative Persian cells; it now excludes the hidden native inputs.

The first reused SUV differed substantially in angle/shade from the reference. The built-in
imagegen skill successfully generated a separate unbranded silver front-right SUV with alpha;
the new asset improves fidelity while preserving every existing image. This is a reference-led
bitmap illustration only; no Phase-04 viewer or image-based page tracing is introduced.

## Validation results
Lint and typecheck pass. Vitest passes 54 tests in six files (15 new Phase-03 tests).
Full production-backed Playwright passes 35 tests with three intentional desktop screenshot
skips, including both new screenshots and all previous baselines. Production build passes.
The existing development-origin test passes against the running localhost/LAN server.
Its initial attempt to launch a second dev server failed on Next's existing-server lock; the
supported DEV_TEST_ORIGINS override reused the server without configuration changes.

The first full suite showed 4,034 changed readiness pixels from unrelated local hero gradient /
paragraph-width edits, after the local GPS icon had already been isolated. The successful full
suite used committed preparation.css and gps-ready.svg temporarily, restoring both local files
byte for byte in finally. The current working tree therefore still contains those user edits and
would fail the old readiness baseline; no prior baseline or unrelated implementation was changed.
Terminal NO_COLOR/FORCE_COLOR warnings are environmental and remain visible.
