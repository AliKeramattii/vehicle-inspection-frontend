# Neshan raster tile diagnosis
## Goal
Classify real empty tile responses and fix only evidence-supported client causes of blank imagery.
## User-visible behavior
The existing location picker retains usable base imagery, attribution, center pin, GPS, address editing and persistence. Actual missing base coverage stays visible as a recoverable error.
## Current state
Clean feat/neshan-live-integration at 2a84930. Leaflet 1.0.8 already receives dreamy, poi:false and traffic:false, but its split layers have not yet been classified. Original dirty worktree/readiness work remains outside this task.
## Constraints
No provider/key/referrer bypass, automatic MapLibre migration, production Node endpoint, workflow rewrite, unrelated baseline or asset changes. Sanitized diagnostics only; local credentials remain ignored.
## Implementation
1. Inspect official SDK/docs and reproduce real layer requests with cache/SW isolation.
2. Compare supported styles, zoom 12/14/16 and multiple areas; inspect decoded base tiles and overlays.
3. Implement only confirmed client/layer error-handling fixes, with focused regression tests.
4. Verify real application interactions and screenshots before/after; document provider limitations accurately.
5. Run lint/typecheck/unit/focused browser/build; review scoped diff, commit and push normally.
## API impact
None. Existing local reverse proxy and future ASP.NET contract stay unchanged.
## Testing
Real authorized SDK traffic, layer/coordinate/status/content/timing/header diagnostics, decoded-tile coverage checks, isolated unit tests and existing picker browser regression. Historical screenshot baselines remain untouched.
## Acceptance criteria
204 classified by request layer, base coverage measured at tested areas/zooms, no false whole-map errors, fixed pin and existing navigation/persistence retained, no secrets recorded.
## Progress
- [x] Inspect clean task worktree, instructions, SDK and existing integration.
- [x] Classify: 70 base PNG/200, 70 empty label/204, 12 style/area/zoom combinations, cache/SW isolated.
- [x] Observe only base failures; both-style, late-layer and cleanup regressions.
- [x] Real live scenario exits 0: full coverage, GPS/reverse/edit/persistence/refresh; before/after, mobile and desktop screenshots reviewed.
- [x] Validation and scoped Git delivery: all required checks exited 0; b08fff7 pushed normally and remote HEAD verified.

## Discoveries
Previous host-only attribution of 204 to missing base tiles was incorrect. SDK labels return empty responses. Earlier partial screenshots did not wait for base decoding; no persistent base defect reproduced. No CSS/rendering fix supported, so layout untouched.
## Validation progress
Lint and typecheck exit 0. Focused unit: 34 pass, exit 0. All unit: 346 across 25 files, exit 0. Real-provider browser: 1 pass, exit 0. Production build exits 0 with both local services stopped; production rewrite manifest remains empty. Five deterministic Neshan browser scenarios exit 0. All checks returned actual successful process exits. Credential scan is clean; original 24 user-state entries match. Implementation b08fff7ae737f97a2830c946445aedbfb39a4cf4 is pushed to origin/feat/neshan-live-integration and remote HEAD matches. Local development preview/proxy are restored for user review.
