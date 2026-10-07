# Interactive vehicle photo markers

## Goal
Make every displayed vehicle marker a shortcut to its exact existing photo requirement, without changing the approved Phase-04 composition.

## User-visible behavior
Pending markers open guidance. Accepted photos and unconfirmed drafts open review. Retake markers without drafts open guidance with the reviewer reason. Navigation never mutates evidence; accepted images and completion credit survive replacement attempts. Marker activation updates the existing selection before navigation; shot cards and CTA still derive from that selection.

## Current state
HEAD 4993c61 on main. Markers already use semantic buttons, 44px hit areas, 28px visible indicators, focus outlines and percentage coordinates, but only select the requirement. Controls are below the image. The working tree contains unrelated user edits, including the known readiness hero mismatch and formatted navigation tests. Preserve those edits exactly.

## Constraints
- No layout/CSS/artwork changes or unrelated baseline updates.
- Keep seven sections/twelve photos, RTL physical directions, routes, mocks, durable storage, atomic replacement and continuous progression unchanged.
- Reuse requirement IDs and derived evidence state; no marker-specific business state or manual navigation map.
- No backend, upload, odometer, video or 3D work.

## Implementation
1. Preserve initial user changes; inspect marker, overview, review and guidance boundaries.
2. Add a shared derived entry helper in photography-model.ts; activate the same requirement route from PhotographyOverview and expose action-aware labels in VehiclePhotoNavigator.
3. Update selection-only expectations, add unit/browser coverage for pending/completed/draft/retake navigation and keyboard/touch/layout behavior.
4. Review actual unchanged marker composition at 360x800, 390x844, 430x932; run all repository scripts and distinguish pre-existing readiness drift.
5. Document the shortcut, review/stage only intended changes, commit and push normally.

## API impact
None. No routes, repository contracts, schemas, evidence transactions or production endpoints change.

## Testing
Unit tests cover entry derivation, semantic/action labels, selection/card/CTA synchronization and keyboard activation. Playwright covers pending to guidance, completed to review/replacement, retake reason, draft credit preservation, visible focus, touch hit areas and controls below the image at all three widths. Existing screenshots should remain byte-identical. Run lint, typecheck, test, test:e2e and build, reporting real exit statuses.

## Acceptance criteria
- All marker states remain enabled buttons and open the represented requirement.
- Accepted/draft evidence is preserved until existing confirmation succeeds.
- Selection and evidence state remain independent and synchronized.
- Existing 44px targets, 28px visual markers, coordinates, focus and controls layout are retained.
- No unrelated readiness edits or baselines enter the commit.

## Progress
- [x] Read instructions/references and inspect repository/interaction state.
- [x] Implement focused marker navigation and labels.
- [x] Add tests and review screenshots/responsive interactions.
- [x] Complete actual validation and document existing failures.
- [ ] Review intended diff, commit and verify push.

## Validation notes
Initial focused unit run: 37 passed; initial full unit run: 95 passed in 11 files, both exit 0.
Initial typecheck and lint exit 0. Focused browser run: 8 passed, exit 0. Reviewed pending/completed/
retake and keyboard focus at all three target viewports. Existing 44px hit targets and 28px
symbols/percentage coordinates remain unchanged; no neighboring hit-area overlap or document
overflow. Enter/Space and transparent-edge touch activation work. Opening accepted/draft/retake
contexts leaves stored evidence intact; replacement still uses the existing atomic path.
No CSS, canonical asset, route, persistence or screenshot baseline changed.

Review found a combined retake/draft edge case: opening review could hide the reviewer reason.
Reused the same derived reason and existing styled paragraph in review and guidance, without
altering normal review geometry. Added unit/browser coverage for that combination. An initial
unit assertion matched both the reason and image-loading status; narrowed it to the actual reason
element. The first staged-export server startup timed out during concurrent validation builds;
standalone export production build exited 0. Final suites will run sequentially without changing
the timeout or application/development configuration.

Final source: lint/typecheck/explicit production build exit 0, 97 unit tests in 11 files exit 0. Exact staged-source full
Playwright exits 0 with 76 passed/20 intentional desktop skips; working-tree full Playwright
exits 1 with 75 passed/20 skips and only the same pre-existing 4,010-pixel readiness mismatch.
All photography screenshots pass unchanged. Browser assertions cover eight new scenarios;
ten new unit cases cover all marker evidence combinations, native keyboard activation, all-complete
interaction and reviewer-reason retention. Reviewed retake-draft review in addition to pending,
completed, retake and focus at the three viewports; no layout redesign or baseline update.
The export's standalone build and full Playwright build pass; sequential retry resolved its initial
startup timeout. No timeout/configuration change was made and the precise transient cause was not
established. Nonblocking color-environment warnings and nested-export lockfile warnings remain.
Staged source/test hashes match the passing export. Initial unrelated user edits/deletions are
byte-preserved, and the navigation test index contains only the intended activation expectation.
