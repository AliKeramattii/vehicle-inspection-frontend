# Local-only Neshan tools

**The development reverse-geocoding proxy is NOT part of the production deployment.**

Requires Node 24 during local development (native TypeScript loading for the existing strict public settings schema). Node is not needed on the future static hosting server.

## Local configuration
Copy .env.example to .env.local in this directory and configure NESHAN_SERVICE_KEY privately.
Copy site-settings.example.json to site-settings.local.json and put the authorized public Web Map key in application.locationMap.webMapKey. Keep reverseGeocoding api. Preserve the remaining brokerage settings.
Both local files are ignored. Never put the private service key into Site Settings, browser storage, public files, NEXT_PUBLIC variables or a tracked environment file. The public configuration host rejects a service-prefixed map key and validates the existing strict schema.

At the project root, create the ignored .env.local containing only:
    DEV_NESHAN_ENABLED=1
Optional DEV_NESHAN_PROXY_PORT / DEV_NESHAN_SETTINGS_PORT defaults are 8787 / 8788. If changed, set matching values in root and tool .env.local. DEV_NESHAN_ALLOWED_ORIGIN in the tool environment defaults to http://localhost:3114,http://127.0.0.1:3114. Only explicit loopback origins are accepted. Do not use this tool as a deployed service.

## Start (two PowerShell terminals)
    cd C:\Projects\vehicle-inspection-integrated
    npm run dev:neshan-proxy

    cd C:\Projects\vehicle-inspection-integrated
    # Remove a previous fixture-test process override; root .env.local enables live mode.
    Remove-Item Env:DEV_NESHAN_ENABLED -ErrorAction SilentlyContinue
    npm run dev -- --port 3114

Open http://localhost:3114/ and complete the existing mock referral A4K9P2 / OTP 12345 / readiness / consent journey.
Location route: http://localhost:3114/inspection/insp_demo/location
Direct entry still observes existing workflow guards; it does not bypass consent.

The launcher starts two separate loopback HTTP listeners:
- Reverse-only proxy on 8787: GET /api/maps/reverse?lat=...&lng=...
- Public configuration host on 8788: /site-bootstrap.json and /api/public/site-settings.
The second host is only a local runtime settings fixture, not a brokerage API/auth server. It never reads the private environment file or receives the service key. This keeps the proxy's one responsibility isolated.

Opt-in Next development-phase rewrites route the existing contracts to these listeners. Browser stays same-origin /api; runtime configuration uses the normal SiteSettingsProvider and its validation. It does not modify stored Admin publication/history. With the existing opt-in NEXT_PUBLIC_LOCAL_SETTINGS_PREVIEW=1, a persisted workspace whose published AND draft map are still exactly the unconfigured factory map inherits the runtime map in its read view. The same repository serves Admin and customer: no second store, no database deletion, and unrelated branding/drafts/history are preserved. An explicit Admin map key, disabled map, changed viewport or saved map draft takes precedence; configure/publish those through Admin. Actual brokerage installations use API settings, never this development-only fallback.

## Security / behavior
Proxy binds 127.0.0.1 only, validates Host/origin and strict finite WGS84 query parameters, accepts GET/OPTIONS only, uses an 8-second upstream timeout, caps two active requests and 30 requests/minute, rejects redirects, limits response bytes and returns only formatted_address. Upstream is fixed https://api.neshan.org/v5/reverse with private Api-Key. No open forwarding.
Provider 480/483/484/485 authorization errors are safe 502 responses; provider 481/482/429 become 429 with Retry-After; timeouts become 504. Logs include upstream HTTP status only, never credentials, coordinates or response bodies.
SIGINT/SIGTERM close listeners/connections. Superseded/disconnected reverse requests cancel their upstream ownership.

## Production boundary
Do not deploy tools/, root .env.local, local credential/settings files, references/ or .agent/ artifacts. A future verified static deployment packages only approved out/ files. No tool code lives under public/ and it is excluded from Next output tracing.
Production build/server phases ignore DEV_NESHAN_ENABLED, including when root .env.local exists. Build has no rewrite to localhost and needs neither listener. No Next Route Handler or Server Action was added.
Current approved base still has previously documented static-export blockers; this phase does not fix or claim static export.
Future ASP.NET implements the same GET /api/maps/reverse response, keeping credentials on its server. Publish the authorized web key and api lookup mode through brokerage runtime settings. Missing/rejected reverse endpoint keeps manual address editing available.

## Verify
    $env:NESHAN_LIVE_CHECK='1'
    npm run test:e2e -- --config playwright.neshan-live.config.ts
    Remove-Item Env:NESHAN_LIVE_CHECK

This opt-in check uses real provider traffic, no tile/reverse interception. GPS is a deterministic browser permission fixture, not evidence of a physical device position. Network artifacts omit credential-bearing URLs; no traces/HAR/videos are produced. Screenshots live in ignored .agent/reference-review/neshan-live.
The ordinary Neshan suite still tests rejection, timeout, late responses, denied GPS and manual recovery deterministically.

Inspect browser Network for successful image/png tile responses and /api/maps/reverse JSON. Never share credential-bearing network URLs/HAR. If domain authorization rejects localhost, add the intended origin in the provider account; never spoof Referer/origin or bypass restrictions.

For deterministic development-origin suites, explicitly set DEV_NESHAN_ENABLED=0 in the test process before npm run test:e2e:dev. The production-based Neshan suite ignores the local flag automatically. Never run fixture tests against a live provider unintentionally.

## Module resolution and configuration diagnostics
Native Node's TypeScript stripping does not implement Next's extensionless bundler resolution. Keep the shared schema import `./vehicle-assets` extensionless for the existing frontend compiler. `load-settings-schema.mjs` temporarily registers a narrowly scoped Node 24 hook for that exact dependency and marks only the two known TS modules as ESM; it deregisters immediately after loading. Do not add .ts suffixes to frontend imports, change tsconfig, or change the whole package to ESM. A native subprocess regression tests the actual Node loader rather than Vitest's transform.

On startup the proxy reports only tenant ID, whether the public key is configured, map enabled and reverse mode. No key or address is logged. Both listeners must be up BEFORE Next starts; restart the proxy after local settings edits and restart Next after root environment/port changes.

Troubleshooting the missing-key message:
1. The root ignored .env.local must have DEV_NESHAN_ENABLED=1. An inherited process variable set to 0 wins over that file; remove that override before starting Next. Do not change fixture-test overrides.
2. GET http://localhost:3114/site-bootstrap.json must show settingsSource api and tenantId matching site-settings.local.json (currently demo). Mock means the live development rewrites were not enabled at server startup.
3. GET /api/public/site-settings must contain application.locationMap.webMapKey (authorized public web-prefixed key), enabled true and reverseGeocoding api. Never share the full response or key-bearing tile URLs.
4. The configured runtime seed is read only once at proxy startup. With local Admin preview enabled, explicit saved map edits remain authoritative; publish the correct public settings through the existing Admin Site Settings page. An untouched unconfigured map is safely filled from the live seed without resetting other local data.
5. Use localhost:3114 or 127.0.0.1:3114 consistently; IndexedDB is origin-specific. The default tool origin whitelist is loopback only. Do not spoof provider domain restrictions.

Local files already present in the canonical worktree are sufficient: root .env.local (development flags/ports), tools/dev-neshan-proxy/.env.local (private NESHAN_SERVICE_KEY and allowed origins), and tools/dev-neshan-proxy/site-settings.local.json (public application.locationMap). Keep all ignored; no key needs to be copied into source, NEXT_PUBLIC variables or committed public assets.

## Canonical fix validation (2026-10-17)
Verified on Node 24.18.0 in the canonical integrated worktree: native Node startup without a package-module warning; 409 unit tests; two opt-in live-provider browser tests; five deterministic Neshan location browser tests; lint/typecheck/build successful. Live visible base imagery covered the tested map before/after pan/zoom/refresh, and real reverse lookup returned Persian addresses. Screenshots reviewed at 360x800, 390x844, 430x932 and 1440x960. A simulated old IndexedDB map with a null key recovered through the same customer/Admin repository, while its stored draft/history stayed unchanged. Production public/browser artifact scan found no private service key, no baked-in authorized local web key and no development loopback rewrites. No visual baseline, canonical automotive asset or unrelated readiness edit was included.
