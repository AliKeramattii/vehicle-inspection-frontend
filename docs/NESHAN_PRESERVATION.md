# Protected Neshan implementation

## Restore point and scope
The actual pre-final-UI/UX commit is e36054dcb2f6decc6088f671bfe24e1f8770f2f2. Current map components, SDK initialization, tiles, marker coordinates, reverse adapter, proxy, rewrites, runtime settings provider/repository have no task-introduced changes relative to that point. Existing local globals/schema/environment/tenant settings were present before the task and were not overwritten. A later change in the manually edited schema is preserved rather than attributed to this task or blindly replaced. README/screenshot commit ded3696 appeared independently during the task and is preserved, as is an unrelated nested checkout.

No Neshan algorithm/configuration rollback was required. The only new shared presentation rule capable of reaching the Location address was the generic textarea focus rule. It is now positively scoped to entry/preparation/photo/Admin/Reviewer surfaces, excluding the Location screen. No map styling or layout was changed.

## Actual rendering failure and recovery
After successful live tests, the running frontend began returning HTTP 500 and Turbopack reported missing next/package.json. Next, React and Playwright package manifests were absent. Runtime settings on 8788 still returned tenant demo, enabled map, configured public key and reverse mode api. The existing 8787 proxy returned HTTP 200 and a Persian address. This was a dependency/environment failure, not evidence of an SDK/tile/configuration regression. Why those installed package files disappeared is not established; the user confirmed no other process was running. No claim is made that another agent or terminal caused it.

Restored dependencies with npm.cmd ci --no-audit --no-fund using the existing lockfile. The first attempt hit Windows EPERM on a loaded Lightning CSS native module. Stopped only this task's broken frontend process, then repeated successfully (600 packages, exit 0). Package manifests and lockfile were not changed. The healthy loopback proxy/settings pair was reused. Restarted the canonical frontend with npm.cmd run dev -- --port 3114. No unrelated Node process was terminated.

## Verification and protected baseline
Existing live browser tests passed five cases after restoration (exit 0): actual decoded Neshan base tiles, pan/zoom, fixed pin, explicit GPS, coordinates, Persian reverse geocoding, editable address, persisted location, tenant settings inheritance and readiness recovery. These tests do not intercept the real tile or reverse responses. Working screenshot: .agent/reference-review/neshan-live/location-real-390.png. A copy before shared focus isolation and hashes of protected tracked map/config files are stored under .agent/reference-review/final-ui-ux/map-protected. Runtime environment and private credentials are ignored and never printed or committed.

## Freeze for remaining UI work
Location/Neshan is excluded from redesign. Original final-prompt repair/configuration instructions are superseded by regression verification only. Before each remaining checkpoint compare protected hashes, inspect shared CSS for Location reach and rerun existing Neshan regressions; use real authorized development rendering when available. Do not reset browser data, change providers, rewrite the settings pipeline, modify module-resolution policy or migrate SDKs. Development reverse proxy remains loopback-only; no new production Node dependency.

Existing warnings from dependency restoration: deprecated ESLint notice and blocked unrs-resolver postinstall. No breaking dependency update or install-script approval was performed.

## Unrelated nested checkout and validation boundary
A separate untracked vehicle-inspection-frontend/ checkout appeared inside the canonical root, including recursively copied reference kits. Canonical typecheck reported TS2307 for @vitejs/plugin-react in those foreign reference-kit vite.config.ts files. The checkout and its contents were left untouched. ESLint and TypeScript discovery now exclude that exact foreign directory. No canonical application/test directories are excluded, no module-resolution/compiler option was changed and no dependency was added. This is a validation-only exception to the whole-file tsconfig hash; Neshan runtime/settings code remains frozen.

The final post-recovery live run passed five cases again (exit 0, 17.9 seconds). Full canonical lint, typecheck, 457 units and production build also exited 0. Real-provider screenshots are committed under docs/qa/final-ui-ux; the live map is not expected to be pixel-identical between captures at different zoom/transition moments. No same-position pre-task live screenshot was available for an exact pixel comparison. The frozen source and layout plus successful actual provider interactions establish regression evidence; historical reference artwork is not presented as a live-map BEFORE.

## Local verification commands
Use the canonical folder in separate terminals:

```powershell
cd C:\Projects\vehicle-inspection-integrated
npm run dev:neshan-proxy
```

```powershell
cd C:\Projects\vehicle-inspection-integrated
npm run dev -- --port 3114
```

Reuse the existing healthy loopback services on 8787/8788 rather than starting duplicate copies. Open http://localhost:3114/ and follow the existing demo referral A4K9P2 / OTP 12345. With the authenticated inspection session, the location URL is http://localhost:3114/inspection/insp_demo/location. A direct URL in a fresh unauthenticated browser is subject to the existing guard. Authorized local env/tenant configuration is required and remains ignored. No credentials are included here.
