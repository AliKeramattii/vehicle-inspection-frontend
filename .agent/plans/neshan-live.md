# Authorized live Neshan activation
## Goal
Activate the approved picker with authorized local credentials and real provider requests, while keeping production free of development services.
## User-visible behavior
Runtime Site Settings supply a public map key. Real tiles and Persian address lookup use the existing picker; editing, GPS, confirmation and durable facts remain intact.
## Current state
Clean c8db703 in the Neshan worktree. Original optional-3D worktree has unrelated changes and is untouched. Missing public key and unavailable first-party lookup prevent live services. NewHelal Custom.js contains authorized web/service keys, including an exposed private key.
## Constraints
No private key in browser/public/commits. No production Next endpoint, static migration, business API integration, asset or 3D changes. Existing runtime provider and domain remain authoritative.
## Implementation
1. Branch feat/neshan-live-integration from approved clean worktree.
2. Add isolated reverse-only loopback server under tools/dev-neshan-proxy and separate public runtime settings host; local files ignored.
3. Opt-in development-phase rewrites for existing bootstrap/settings contracts and /api/maps/reverse. Production has no rewrites.
4. Extract authorized keys privately to local configuration, never log them.
5. Verify real tiles/reverse, editing/persistence, failure and GPS with deterministic permission fixtures.
6. Document security/release boundary, validate, review, commit and push scoped files.
## API impact
Existing GET /api/maps/reverse unchanged. Temporary server calls current Neshan v5 API; future ASP.NET replaces it. Business repositories remain mocks.
## Testing
Proxy security/timeout/rate/error tests; production isolation tests; existing Neshan browser suite; credential-gated live checks without provider interception; lint/typecheck/all unit/build. Review screenshots at mobile and desktop sizes; no historical snapshot update.
## Acceptance criteria
- Real authorization assessed honestly.
- Address and durable location behavior preserved.
- Service key absent from output and bundles.
- Temporary tools and localhost rewrites excluded from production.
- Original work preserved.
## Progress
- [x] Read request, inspect branch/worktrees and local reference.
- [x] Implement development services and opt-in configuration.
- [x] Live provider/browser verification (real PNG/address success; empty tiles/provider timeouts recorded as limitations).
- [ ] Validation and focused Git delivery.

## Discoveries
- Real v5 reverse returned HTTP 200 and Persian address.
- Real map images return HTTP 200 on several provider tile hosts; other tile hosts return 204/empty. A prior any-tile-error fatal overlay hid the pin despite usable tiles. Added nonblocking tile retry feedback; provider authorization is not bypassed.
- Initial test selectors and Node fetch Host override caused test failures; corrected selectors and HTTP rebinding test.

## Validation progress
343 unit tests pass; typecheck/lint pass. Production build succeeds with tools stopped and an empty rewrite manifest. Five fixture browser tests and one live scenario exit 0. No baseline changed. Final small security/error-layer review edits require final rerun before commit.
