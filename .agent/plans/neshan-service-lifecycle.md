# Neshan development service lifecycle

## Goal
Make local startup/reuse/failure/shutdown predictable for the canonical project's paired Neshan development services.

## User-visible behavior
A healthy matching pair can be reused. Failures identify the service, host, port and safe underlying code. A failed partial startup leaves neither owned listener running. Alternate frontend ports require explicit allowed loopback origins. Existing map UI remains unchanged.

## Current state
HEAD 2d1e69b on feat/unified-ui-admin-3d. Ports 8787 and 8788 are both owned by PID 27568, C:/Program Files/nodejs/node.exe, command node tools/dev-neshan-proxy/run.mjs. This is the previous managed canonical development run (session 56888); both endpoints are healthy and real reverse responses returned 200. A fresh socket bind confirmed EADDRINUSE on both ports. Next development on 3114 is PID 13980 in the canonical worktree. Launcher currently discards the startup exception and prints a generic port error. Existing unrelated modified and untracked files are hashed in an ignored preservation manifest.

## Constraints
Canonical worktree only; no reset/stash/new worktree, unrelated process killing, UI changes, asset/baseline/3D/backend changes or credential output. Proxy remains loopback and development only. Preserve the existing public settings provider and private-key boundary.

## Implementation
1. Add paired listener lifecycle with specific sanitized startup errors, rollback, idempotent shutdown and signal cleanup.
2. Add bounded local health checks that identify a matching pair without exposing settings/credentials; recognize healthy reuse and refuse mismatched/partial/unknown listeners without killing them.
3. Print allowed frontend origins and support an explicit additional loopback frontend port. Validate Next's forwarded frontend host as well as Origin so alternative-port mistakes are actionable.
4. Add real-socket and signal regression tests for first/second bind failures, non-port errors, partial rollback, reuse, unknown services, pending requests and cleanup.
5. Restart only the verified managed proxy to activate the fix. Verify actual Neshan tiles, Persian reverse geocoding and customer/Admin effective settings in real browsers. Test actual Next on an alternative port, then restore the usual 3114 server.
6. Run lint, typecheck, all unit tests, focused browser regressions and production build; security/preservation checks; focused commit and normal push.

## API impact
No production API change. Loopback-only development health responses are diagnostic metadata, not brokerage settings or authentication. ASP.NET/static hosting boundaries remain unchanged.

## Testing
Real socket conflicts on isolated ephemeral ports, injected non-port bind failure, abort/signals, active-request shutdown and healthy/mismatched pair probes. Real authorized Neshan browser test with traces/HAR off, 390x844 plus existing mobile/desktop checks. Alternative frontend-port negative/positive checks. All repository validation scripts required by the task.

## Acceptance criteria
- Specific service/port/error code is visible without secrets.
- Healthy matching pair reuse is explicit; unknown or partial pairs are not killed or falsely reused.
- Failed startup and normal stop release all owned ports/listeners.
- Public map configuration reaches the active tenant in the actual browser and Persian reverse works.
- Alternate frontend-port configuration is explicit, tested and documented.
- Production has no proxy rewrites or private browser credentials; unrelated work remains unchanged.

## Progress
- [x] Inspected instructions, Git, scripts, authorized local configuration and port/process ownership.
- [x] Reproduced EADDRINUSE and verified existing healthy previous development session.
- [x] Implemented paired lifecycle with specific safe errors, rollback, signal/runtime-failure cleanup, bounded health/reuse checks, printed origins and explicit alternate frontend port.
- [x] Added 27 startup/shutdown/health/origin tests; all 436 unit tests pass. A regression exposed upstream-request abort happening after listener shutdown; active controllers are now aborted on server close.
- [x] Two real-provider browser scenarios passed on 3114 and again on 3115 (four executions); actual visible tile coverage, Persian reverse addresses, fixed pin, GPS fixture, refresh and customer/Admin map agreement verified. Unlisted 3115 initially returned actionable 403; explicit --frontend-port 3115 enabled it. Restored normal 3114/default proxy afterward.
- [x] Lint/typecheck, 436 unit tests and production build exited successfully. Inspected real-map screenshots at 390x844, with browser coverage at 360x800, 430x932 and 1440x960.
- [x] Verified duplicate startup exits 0 with a reuse message and unchanged owner PID. Verified replaced managed PIDs exited and a single restored PID owns both ports.
- [x] All 21 pre-existing modified/untracked files retain their starting hashes. No UI/asset/baseline/environment/schema edits. Production public artifacts contain no private key or baked-in authorized local web key; no production loopback rewrites.

## Discoveries and delivery
Actual original failure: EADDRINUSE on both configured ports, owned by the healthy previous canonical development session. The old generic catch hid the code and service. Native Node startup itself was already fixed by 2d1e69b. Only verified managed terminal sessions were stopped through Ctrl+C; no unrelated process was killed. Current normal server was restored after alternative-port checks.

The new active-request shutdown regression initially failed and led to a real cleanup fix. A parameterized test tuple type was corrected; the subsequent typecheck and build succeeded. Playwright emits the existing cosmetic NO_COLOR/FORCE_COLOR warning. No provider or application console/page errors occurred in either live run.

Implementation and validation are complete. Focused commit, normal push and remote-HEAD verification are the final delivery steps; exact Git results are recorded in the completion report.
