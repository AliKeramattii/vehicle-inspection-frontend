# Neshan inspection location picker

## Goal
Replace the existing Mapbox adapter with official Neshan Leaflet, explicit coordinate selection and race-safe editable address lookup within the existing location step.

## User-visible behavior
Map-first RTL screen, fixed center pin, deliberate pan/tap or My Location selection, honest GPS source/accuracy, editable suggested address, disabled confirmation until a valid current point/address exists. Confirm continues to vehicle and survives refresh. Existing summary reads the same saved object.

## Current state
Isolated feat/neshan-location-picker worktree at C:/Projects/vehicle-inspection-neshan, base 678fb8a (approved UI modernization/White-Label/Admin). Original optional-3D worktree has unrelated dirty readiness/auth/test changes and untracked supplied map references; preserve all. Current adapter is Mapbox CDN and incorrectly starts with selectable default coordinates, no address lookup. Existing inspection-facts IndexedDB is canonical persistence. No real inspection API mode or private reverse service is configured.

## Constraints
No unrelated phase, backend/MSSQL/deployment/static route migration, optional viewer changes, keys or canonical assets/baselines. Preserve AppViewport, 4-stage journey, existing repository edit guards, tenant validation and storage contract. Use public runtime settings for domain-restricted browser key; private service key belongs only to future ASP.NET.

## Implementation
1. Verify official SDK/version and add one Leaflet dependency with matching CSS/browser-only loading.
2. Extend public Site Settings minimally with typed location-map configuration; no query overrides.
3. Extend existing location schema with selection source, nullable accuracy and actual recordedAt; distinguish viewport from selection.
4. Isolate Leaflet lifecycle/events and explicit GPS in lib/map; build selection/address controller with debounce, cancellation, edit/request identity and stale address gating.
5. Integrate existing LocationForm and workflow/persistence; preserve submitted guards and summary.
6. Focused model/component/browser tests and screenshots; run lint/typecheck/all units/focused e2e/build, inspect diff/security, commit/push/verify.

## API impact
Planned GET /api/maps/reverse via trusted first-party API configuration, server calls Neshan v5/reverse with private Api-Key. Existing PUT inspection location contract remains authoritative; no duplicate POST or Next API route. Runtime remains mocked unless the explicitly configured first-party reverse adapter is enabled. One canonical persisted frontend location object.

## Testing
No actual provider claim without credentials. Deterministic SDK/geolocation/reverse fixtures cover initialization, zoom, GPS animation, manual selection, out-of-order/edit protection, failure recovery, payload/persistence/lock and cleanup. Review 360x800,390x844,430x932 and desktop. No unrelated baseline updates.

## Acceptance criteria
- [x] Official SDK integrated client-only, attribution retained.
- [x] Initial viewport/zoom/resize do not auto-select; explicit GPS/manual selection correct.
- [x] Race-safe current address, manual editing and confirmation gating.
- [x] Confirmed typed location persists; unconfirmed drafts and submitted edits do not overwrite.
- [x] Runtime public configuration and private-service separation documented.
- [x] Required focused validation exits successfully; historical wider failures are documented, screenshots reviewed and task-only Git delivery verified.

## Progress
- [x] Read task/integration document/reference code and inspect original/current branches.
- [x] Create isolated feature worktree from approved base.
- [x] Implementation.
- [x] Tests, screenshots, validation and docs.
- [x] Focused commit, normal push and remote HEAD verification.


## Discoveries and validation
- Official npm SDK 1.0.8 uses Leaflet 1.9.4; one exact dependency and matching CSS, no registry override.
- No live credentials exist; provider tile traffic is intercepted in browser tests. Live authorization is unverified.
- Source/time metadata are optional for legacy reads, mandatory on new confirmed draft payloads.
- Existing schema-1 settings remain compatible via optional extension; Admin read defaults do not rewrite history.
- Consent/access gates explicit GPS/manual activation; no initial permission or selected-coordinate defaults.
- Initial webpack development manifest failures were generated-cache/tool-mode instability. Clean task .next/dev plus actual default Turbopack dev passes five scenarios; original dev-origin config untouched.
- Lint/typecheck, all 309 units (23 files), production build exit 0. Production and normal-dev Neshan browser suites: five passes each. Existing markers: eight passes, serial.
- Wider regression: 44 pass /22 fail, exit 1. Historical screenshots remain stale; representative odometer/vehicle failures also reproduce on untouched base 678fb8a. Four parallel image-decode timeouts pass serially. No blanket baseline updates.
- One reviewed missing-key location baseline added; historical location and other phase images preserved. UI-modernization navigation test updated only to choose an explicit point, preserving its assertion intent.
- Canonical reference 05 and supplied behavioral reference reviewed; bounded layout at360x800,390x844,430x932,1440x960; manual/address failure states reviewed. No live tile-quality claim.
- No backend, optional3D, asset pass, route migration or readiness edits. Original user-worktree changes left untouched.

- Approved current UI behavioral regression: four pass / two scope skips, exit0; unchanged control layout, live capture/video and vehicle color persist.
- All24 original tracked user-state checksums still match. Base and original branches/source remain unchanged.
- npm audit: seven high findings, same packages/count on untouched base. No forced dependency changes.


## Delivery
Implementation 6d17226cc580252b3cdbbe5d53248a9bee666022 committed and normally pushed to
origin/feat/neshan-location-picker. Remote HEAD verified identical. No main merge or optional
branch change. Final production build after nullable legacy compatibility review also exits0;
affected strict typecheck and 62 targeted unit tests exit0. Separate documentation record
marks completed delivery; original worktree and all unrelated readiness work remain untouched.
