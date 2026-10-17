# Native TypeScript and effective Neshan configuration

## Goal
Remove the need for manual import edits and ensure the actual customer map consumes a configured runtime map in the canonical integrated project.

## User-visible behavior
Node 24 tools and Next/typecheck/build agree on the shared schema imports. Previously persisted incomplete map settings do not mask an authorized development runtime key. Existing Admin configuration choices, local data/history and production behavior remain intact. The actual location screen shows real Neshan tiles and resolves Persian addresses.

## Current state
HEAD be4e222 on feat/unified-ui-admin-3d. Both services (PID 26304) and Next 3114 (PID 27076) are healthy. Local config, runtime host and Next endpoints all return tenant demo, API settings, configured public key and API geocoding. Current schema import is extensionless; proxy startup succeeds through a scoped hook. Direct native Node imports still need extensions; current noEmit/bundler tsconfig lacks allowImportingTsExtensions. The development settings repository only adopts a runtime map if both published/draft maps exactly match factory values; partial missing-key maps can still mask the runtime key. User's existing Chrome session is not available to automation; testing is explicitly authorized in isolated Playwright contexts. All existing dirty and untracked files are hashed in an ignored manifest.

## Constraints
Canonical project only; preserve unrelated changes, no worktree/reset/stash/asset/baseline/UI redesign. No private key in browser/log/Git. No whole-project ESM conversion, new backend or production Node proxy. Maintain the existing single settings provider/repository and tile-overlay semantics.

## Implementation
1. Trace before-change endpoints/provider/map initialization with sanitized diagnostics and real-provider browser tests.
2. Reproduce a persisted partial null-key publication hiding valid runtime configuration, including the published-versus-draft case.
3. Use documented explicit native TS imports with allowImportingTsExtensions under existing noEmit/bundler settings; replace the custom resolution hook with a standard Node 24 loading boundary. Preserve all other manual schema edits and stage only the intended import hunk.
4. Correct missing-key development fallback without replacing configured Admin keys, disabled maps, draft intent or immutable history. Keep provider and Admin read views aligned.
5. Expand safe end-to-end diagnostics/tests: endpoint/tenant/key-presence, SDK/container dimensions, base tiles vs optional overlays, fixed pin, controls, GPS fixture, geocoding, editing/confirmation/refresh. No credential-bearing URLs/artifacts.
6. Verify cold service/server restarts, focused deterministic and real-provider browser tests, lint/typecheck/all unit tests/build, privacy/preservation review; focused commit, push and remote verification.

## API impact
No production API changes. Existing public settings and reverse contracts remain unchanged.

## Testing
Native Node subprocess schema/runtime imports without a custom resolver; TypeScript and Next build. Repository cases for partial/null key, independent published/draft views, explicit keys/disabled maps and production guards. Actual real-provider visible base coverage, SDK readiness/dimensions, Persian reverse, GPS fixture, persistence and same effective customer/Admin settings. Focused Neshan deterministic suite and all repository unit tests.

## Acceptance criteria
- No manual source edits required before startup.
- Standard Node 24 shared schema loading and noEmit Next typecheck/build succeed.
- Missing runtime key path is reproduced and fixed without another config store or history loss.
- Actual map and real reverse work; evidence distinguishes fresh-browser success from the unavailable original Chrome state.
- Existing unrelated work and credentials stay out of the commit; production remains unchanged.

## Progress
- [x] Read request/instructions and inspected Git, local files, running owners, endpoints, provider/repository and map adapter.
- [x] Reproduce partial publication failure and finalize permanent import boundary.
- [x] Implement and test targeted corrections.
- [x] Verify cold startup and actual map functionality with sanitized browser evidence.
- [x] Complete lint, typecheck, all 441 unit tests, five deterministic browser tests, three real-provider browser tests and production build (all exit 0).
- [ ] Complete focused commit, push and remote verification.

## Discoveries and decisions
- The original personal Chrome session was unavailable. A fresh isolated browser already worked, but a persisted partial null-key Admin publication reproduced the same unconfigured message with zero Leaflet containers despite valid runtime settings. The factory-only fallback was too narrow and incorrectly coupled published/draft maps. Resolve missing profiles independently in development read views, preserving original durable records/history and explicit keys/disabled maps.
- An already-open development page could also retain the mock bootstrap, and the settings query cache did not distinguish mock/API sources. A failing provider regression confirmed the stale-source behavior. Revalidate bootstrap on development focus and distinguish only the query cache source; keep the durable workspace and Admin invalidation prefix unchanged. Production bootstrap behavior is unchanged.
- Native Node 24 requires explicit TypeScript extensions. The compiler initially reported TS5097; allowImportingTsExtensions with existing noEmit/bundler resolution is the documented solution. A scoped src/config/package.json marks only that existing ESM folder, eliminating the module-type warning without converting the root package. Both native schema/runtime subprocesses are warning-free without resolution hooks.
- Cold paired service startup, matching-pair reuse and Next 3114 initialization succeeded. Both listeners remain owned by PID 38284. No unrelated process was stopped.

## Validation and preservation
- npm run lint: exit 0. npm run typecheck: exit 0. npm run test: 36 files, 441 tests, exit 0. npm run build: exit 0.
- Focused production-based Neshan browser suite: five tests, exit 0. Used an ignored wrapper config to reuse the successful production build while preserving pre-existing user Playwright configuration edits; corrected the wrapper to use CommonJS-compatible __dirname after its first invocation failed on import.meta.
- Opt-in live suite: three tests, exit 0. No tile/reverse interception. Real decoded base tiles covered the visible canvas; Persian reverse HTTP 200, fixed pin, pan/zoom, deterministic GPS permission fixture, manual edit/confirmation and refresh verified. Customer/Admin effective settings agree; stored draft/history remain unchanged. Screenshots reviewed at 360x800, 390x844, 430x932 and 1440x960. No console/page errors recorded.
- Before/after screenshots and sanitized diagnostics are ignored under .agent/reference-review/neshan-root-cause; no visual regression baselines updated.
- Protected manifest: 20 unrelated files byte-identical; schema differs only in the intended import suffix, with all other existing manual edits preserved. Stage only that import hunk. No asset/CSS/3D/readiness changes.
- Production browser/public text scan: zero private service-key matches and zero authorized local Web Map key matches; no development listener rewrites in production routes manifest. Existing static-export blockers remain outside this task; no production Node proxy dependency introduced.
