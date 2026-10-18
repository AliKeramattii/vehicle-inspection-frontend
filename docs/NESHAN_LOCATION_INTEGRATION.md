# Neshan inspection location picker

## Scope and package
The existing location route uses official @neshan-maps-platform/leaflet 1.0.8 (Leaflet 1.9.4)
and its matching dist/leaflet.css, installed from public npm. No registry override, second
Leaflet renderer or Mapbox CDN was added. The later authorized activation adds isolated local
development tooling (below); production still has no private key or Next reverse endpoint.
Official docs: https://platform.neshan.org/docs/sdk/web/leaflet/neshan-leaflet-sdk/.

createNeshan dynamically imports the SDK only in the browser after validated runtime
configuration supplies a key. InspectionLocationMap owns lifecycle, ResizeObserver and GPS
ownership; the adapter owns Leaflet events/layers/camera. It cleans up listeners and rejects
late initialization during Strict Mode. The initial camera viewport is configuration, never
a selected point. Initialization, resize and zoom alone do not select or save. Deliberate
drag, arrow-key pan or map tap select manual coordinates. The center pin stays above moving
tiles; attribution remains visible.

## State and persistence
LocationController owns only the editing draft and address request identity.
InspectionRepository.saveLocation remains canonical; existing inspection-facts IndexedDB and
TanStack Query are unchanged. No second location store or Zustand copy. Confirmation
continues to vehicle and summary reads the same saved facts. Unconfirmed edits are not saved.
Existing submission/retake permission guards still own editing authorization.

New confirmations contain latitude, longitude, nullable accuracyMeters, selectionSource
(gps/manual), formattedAddress, actual ISO recordedAt and existing buildingNumber/unitFloor/
parkingDescription. Legacy records lacking provenance/time remain readable; unknown-source
precision is not presented as GPS proof. Manual points have null accuracy. GPS retains its
actual supplied accuracy (or null when unavailable). Dragging to a different point clears GPS
precision. Programmatic GPS camera events cannot change its source into manual.

## Explicit My Location
Only موقعیت من requests geolocation. No initial permission prompt. The service validates
secure context, capability and coordinates and distinguishes denial/unavailable/timeout.
HTTPS is needed on deployed/mobile LAN origins; localhost is a browser development exception.
Unmount aborts ownership and ignores late callbacks (getCurrentPosition itself cannot be
canceled). Failure leaves manual selection/address available; no fake accuracy or GPS match.

## Address lifecycle
Textarea label: آدرس موقعیت خودرو. Coordinate changes debounce lookup 400ms, abort superseded
requests, ignore out-of-order replies and cache up to 30 points. Same-point recenter/zoom
does not reset text. Focused or edited addresses are never overwritten; a suggestion can
be applied explicitly. A changed point marks old text stale and blocks confirmation until
lookup succeeds or the user edits/reconfirms. Valid explicit point + current nonempty address
(maximum 300 characters) are required. Failure keeps coordinates and supports manual entry/retry.

Public reverseGeocoding modes:
- unavailable: default; manual address, honest unavailable lookup state.
- mock: visibly prefixed آدرس آزمایشی; not a provider result.
- api: GET to trusted deployment API base + /maps/reverse?lat=...&lng=....
  credentials include, no-store, redirect error, abort/revision protection and 10-second timeout.
  Expected JSON has formatted_address: nonempty string, maximum 300 characters.

The application reverse client never calls api.neshan.org or sends a private Api-Key.
The official SDK may make its own public-key map/licensing requests. Future ASP.NET validates
coordinates, authorizes tenant/user, rate-limits and calls Neshan /v5/reverse with its secret.
Cross-origin CORS/cookie policy belongs to deployment. That production endpoint is planned; a later isolated temporary local proxy implements the
same contract for authorized development only. Inspection business APIs remain mocks. The INSPECTION_{InspectionId} storage
contract is unchanged.

## Configuration and local setup
application.locationMap is published public runtime Site Settings per brokerage. See the
JSON fragment in TENANT_CONFIGURATION_SPEC.md. Local mock Admin: /admin/site-settings →
API settings → enable map / public Web Map key / address mode → save and publish.
API settings mode consumes backend publication; local mock Admin cannot change a real server.

Restrict Web Map keys to intended frontend origins in the Neshan account, including local
development origins where needed. No hostname hardcoding or rebuild/env key required.
Private reverse credentials belong only to ASP.NET secret storage, never public JSON, Admin,
NEXT_PUBLIC variables, committed files, browser storage or URL parameters.
No live key is bundled. Missing key displays actionable configuration feedback. GPS still
works explicitly, and a manual coordinate disclosure is available without a map key. Neither
camera defaults nor disabled map settings certify a point.

## Layout / verification / limits
Existing AppViewport/100dvh remains the shell. One internal location content scroller contains
map/address/details. Sticky CTA stays outside. Map occupies a dominant 300–450px region;
locate and zoom controls are >=44px. Persian RTL and isolated LTR coordinates are preserved.
Coordinates retain numeric precision for persistence.

Tests use the real installed SDK with intercepted provider tiles, mocked explicit GPS and
first-party address fixtures. This is not live provider authorization or geocoding-quality
proof. Review screenshots are artifacts, not changes to historical baselines. Live validation
requires a real domain-authorized browser key and deployed private reverse endpoint.

No ASP.NET/MSSQL implementation, GPS tracking, address-match certification, offline tile cache,
deployment/static migration or 3D change. Existing summary map is labelled illustrative;
it is not a second location picker. Private lookup/live tile configuration remain prerequisites.


## Static export boundary
The selected approved base is not yet a node-free static export: see STATIC_EXPORT_AUDIT.md
for existing dynamic-route/image/optional-dev-handler blockers. This task does not migrate
routes or claim a static build. The new map imports only browser code and public runtime
configuration, with no Next server proxy; it can remain behind later static entrypoints
without relocating a private service credential into the frontend.

## Validation record
Final lint/typecheck/all unit tests and production build exit successfully.
Neshan browser suite uses the official SDK and fixtures; both production-owned server and
normal Turbopack development script exit successfully (five scenarios each).
Eight existing marker scenarios pass serially, including pending/completed/retake and
atomic replacement. No historical screenshot has been updated. One intentionally new
inspection-location-neshan-unconfigured-customer.png baseline covers the reviewed missing-key
state at 390x844. Mobile 360x800,390x844,430x932 and desktop 1440x960 review artifacts live in
.agent/reference-review/neshan.

A wider customer run reported 44 passes / 22 failures, exit 1: historical screenshot drift
plus four image-decode timeouts under parallel execution. The marker set passes serially.
Representative odometer/vehicle historical screenshot failures reproduce on untouched base
678fb8a; previous modernization explicitly did not refresh those baselines. This is not a
claim that the full historical suite passes. Original readiness changes remain untouched.

Early webpack development manifest/invalid-token errors were resolved by clearing only this
task worktree's verified generated .next/dev cache and running the normal npm dev script
(Turbopack). No origin/server configuration was changed. Existing Next image aspect-ratio
warnings in summary/receipt and test FORCE_COLOR notices remain, outside the map adapter.


Current approved UI-modernization behavioral suite also exits 0: four customer scenarios pass,
two optional-3D/desktop-only scenarios skip. Original preservation checksum: all 24 tracked
user-state entries match; the original dirty worktree and optional-3D branch were not changed.
npm audit reports seven high findings, the same package names/count as untouched base 678fb8a
(Next ESLint tooling / Serwist / browserslist chain). No automatic or breaking audit fix was
attempted. Review those dependency warnings separately before production deployment.

## Authorized live activation (2026-10-13)
Original non-rendering cause: application.locationMap.webMapKey was null. Reverse lookup was
unavailable without a first-party service. Authorized keys were found in the original local
NewHelal Custom.js reference, extracted without printing them and kept in ignored files.
The old reference embeds the private service key in browser code: rotate that exposed key
before production and keep its replacement exclusively in brokerage secret configuration.
The old obfuscated Leaflet library and unrelated NewHelal features were not copied.

tools/dev-neshan-proxy/server.mjs is a reverse-only loopback development server.
runtime-settings.mjs is a separate strict public configuration host, not a business backend.
Root DEV_NESHAN_ENABLED=1 enables phase-gated development rewrites for existing bootstrap/
settings and reverse contracts. Current repositories remain mock. Public settings flow through
the unchanged runtime provider; local fixture does not mutate Admin history or tenant binding.
See the development guide for commands, configuration and real-provider verification.

**The development reverse-geocoding proxy is NOT part of the production deployment.**
No Next API Route Handler/Server Action or production rewrite was added. Tools/local files are
outside public and excluded from tracing. A future static deployment ships only approved out/
artifacts; ASP.NET implements the same endpoint. Static export itself remains a separate migration.

Real tile checks revealed HTTP 204 empty-image responses from some Neshan tile hosts.
Previously any tileerror replaced the map with a fatal overlay and removed its fixed pin.
Recoverable tile errors now show concise retry feedback while preserving the initialized map,
center pin, GPS and manual point selection. Provider domains/referrers are not spoofed or rerouted.
This does not manufacture missing map imagery; any continuing empty tiles remain a provider/
network limitation to report.

### Activation validation record
Lint and typecheck exit 0; all 343 unit tests / 25 files exit 0 (including 29 reverse-proxy,
4 public-settings security cases and a recoverable tile-failure regression).
Five deterministic Neshan browser scenarios exit 0 against production with both local services
stopped: manual/GPS, late response, failure/manual recovery, summary and submitted lock.
The opt-in live browser scenario exits 0 with no provider interception: real PNG map responses
and v5 Persian addresses, mouse/keyboard pan, zoom, fixed pin, GPS permission fixture, address
editing, numeric/source/accuracy/timestamp facts and refresh persistence.
GPS fixture is not a physical device-location measurement.

Screenshots reviewed at 360x800,390x844,430x932,1440x960 against the existing location composition.
No historical baseline changes. Empty HTTP 204 provider tiles can leave partial/blank map regions,
especially after zoom; some real address attempts reached the bounded timeout and exposed the
existing retry/manual fallback. The final live pass returned real addresses successfully.
These are outstanding provider/network coverage limitations, not proof of uniformly successful
map coverage. No domain/referrer spoofing or shard-routing bypass was implemented.

Production build exits 0 without either local service. Production rewrite manifest is empty;
the exact private credential is absent from tracked source and browser bundles. Existing static
export blockers remain. Earlier unrelated readiness drift and historical baseline/dependency
warnings documented above are untouched. Development Node warns about ambiguous TypeScript module format when loading the canonical
settings schema; it correctly reparses it as ESM. No global package/module setting was changed
just to suppress this notice. An attempted default-module CLI flag was unsupported on the
installed Node and was removed; the actual plain-node startup was reverified.
Playwright still emits the existing FORCE_COLOR/NO_COLOR notice.

## Layer-level correction to the activation report
The later diagnosis found that the observed tile5–8 HTTP 204 responses belong to empty
label overlays, not base imagery. Both supported styles rendered every visible base tile
at zoom 12/14/16 in Tehran and Mashhad. The adapter now observes base failures only;
overlays stay intact and permanent empty overlays are not retried. The live test waits
for full decoded base coverage instead of one successful image. See
docs/NESHAN_TILE_DIAGNOSTICS.md and its sanitized JSON. Earlier host-only and premature
screenshot conclusions are superseded by that layer-level evidence.
