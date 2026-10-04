# Phase-01 development origins

`npm run dev` binds Next.js to `0.0.0.0:3000`. Visit either `http://localhost:3000`
or `http://<this-machine-address>:3000/`. Application links, image URLs, fonts, and
icons are relative to the current origin. No LAN address is hardcoded.

## Cause and fix

The investigation reproduced a rejected `/_next/hmr` WebSocket on the LAN origin,
while localhost connected. Next 16.3.8 checks the WebSocket's `Origin` against
`allowedDevOrigins`; binding to all interfaces alone does not allow the LAN hostname.
An open LAN tab without hot reload can retain older UI after source changes.
Fresh browser contexts already received identical HTML and landing geometry.

`next.config.ts` now allows only this machine's IPv4 interface addresses during
development. Restart the server after an address/network change. Production config
does not add these development origins. This is not a wildcard origin exemption.

No hostname routing, host-dependent mock behavior, absolute localhost application
URLs, redirect/middleware conditions, persisted Zustand auth, or auth cookies were
found. Phase-01 workflow is per-provider memory: refresh drops a challenge or verified
state. A fresh visit to `/` always shows the empty landing referral form. Use referral
`A4K9P2` and OTP `12345`; no real auth endpoint is called.

## Storage and PWA

The current phase does not register a service worker or use Cache Storage, localStorage,
sessionStorage, cookies, or IndexedDB for authentication. Serwist remains installed;
production PWA/offline implementation remains possible without changing this boundary.
Next's own localhost debug-channel IndexedDB is development tooling, not mock login.
HTTP LAN origins are not secure contexts and do not expose service-worker APIs; this
does not affect Phase-01 referral/OTP. Future production PWA use requires HTTPS.

No existing user browser profile was available to inspect, so historical tab storage
or extensions cannot be conclusively ruled out. No storage was automatically deleted.

## Reset development state

1. Restart with `npm run dev`, then reload both open tabs after this configuration fix.
2. Navigate to `/` (not a saved `/verify` URL). A full reload resets mock auth memory.
3. To test without origin history, use a fresh browser/private window for each origin.
4. If an old build registered a worker, use DevTools > Application > Service Workers
   to unregister that origin's worker, and Storage > Clear site data for that origin.
   Repeat separately for each origin. This deletes that origin's local data; it should
   be a deliberate development reset, never a production startup routine.

Future service-worker integration should disable registration/app-shell caching in
development and use versioned production caches. Do not add storage-clearing code
to auth components to conceal an unrelated cache problem.

## Repeatable validation

`npm run test:e2e:dev` starts an isolated LAN-bound development server on port 3102
and discovers a local IPv4 address. The test uses separate clean contexts and checks
HMR frames, identical initial screenshots at 390 x 844, same-origin loaded images,
font loading, no saved auth/worker, referral/OTP success, reload reset, overflow, and
browser errors. Production E2E coverage remains under `npm run test:e2e`.
Stop any other `next dev` instance for this checkout first (Next uses one development
build lock per checkout), or use the already-running-server option below.

To test an already-running server on port 3000 from PowerShell:

```powershell
$env:DEV_TEST_ORIGINS = 'http://localhost:3000,http://<machine-address>:3000'
npm.cmd run test:e2e:dev
Remove-Item Env:DEV_TEST_ORIGINS
```

Windows shells that disallow `npm.ps1` can use `npm.cmd` without changing execution
policy. No new runtime dependency or Phase-02 work is required for this fix.

Validation for this fix: both actual port-3000 origins and the managed port-3102 test
passed; lint, typecheck, 23 unit tests, and production build passed. The existing
production E2E suite had 18 passes, one intentional desktop skip, and one landing
baseline failure (615 pixels). Its difference image is confined to the pre-existing
user-edited referral label and three icons; neither those edits nor the baseline was
changed by this fix. Playwright emitted the existing NO_COLOR/FORCE_COLOR warning.
