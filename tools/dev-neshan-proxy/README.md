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
    cd C:\Projects\vehicle-inspection-neshan
    npm run dev:neshan-proxy

    cd C:\Projects\vehicle-inspection-neshan
    npm run dev -- --port 3114

Open http://localhost:3114/ and complete the existing mock referral A4K9P2 / OTP 12345 / readiness / consent journey.
Location route: http://localhost:3114/inspection/insp_demo/location
Direct entry still observes existing workflow guards; it does not bypass consent.

The launcher starts two separate loopback HTTP listeners:
- Reverse-only proxy on 8787: GET /api/maps/reverse?lat=...&lng=...
- Public configuration host on 8788: /site-bootstrap.json and /api/public/site-settings.
The second host is only a local runtime settings fixture, not a brokerage API/auth server. It never reads the private environment file or receives the service key. This keeps the proxy's one responsibility isolated.

Opt-in Next development-phase rewrites route the existing contracts to these listeners. Browser stays same-origin /api; runtime configuration uses the normal SiteSettingsProvider and its validation. It does not modify stored Admin publication/history. Admin publication must be used for actual brokerage installations; an enabled local fixture supersedes the mock publication only during this development session.

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
