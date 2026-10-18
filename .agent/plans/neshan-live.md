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
- [x] Validation and focused Git delivery (implementation pushed; provider coverage limitation remains explicit).

## Discoveries
- Real v5 reverse returned HTTP 200 and Persian address.
- Real map images return HTTP 200 on several provider tile hosts; other tile hosts return 204/empty. A prior any-tile-error fatal overlay hid the pin despite usable tiles. Added nonblocking tile retry feedback; provider authorization is not bypassed.
- Initial test selectors and Node fetch Host override caused test failures; corrected selectors and HTTP rebinding test.

## Validation progress
Final lint/typecheck exit 0; all 343 unit tests across 25 files exit 0. Production build exits 0 with both local tools stopped and an empty production rewrite manifest. Five deterministic Neshan browser scenarios and one non-intercepted live scenario exit 0. Final security/error-layer edits, decoded-PNG assertion and plain-node startup were reverified before delivery. No baseline changed.

Implementation commit de45f4a (feat: activate Neshan services for local development) is pushed to origin/feat/neshan-live-integration; remote HEAD verified as de45f4a46a263028161d47546b980969e712789b. Original 24 recorded user-state files remain unchanged. Loopback proxy/settings listeners and the frontend are running for local review at http://localhost:3114/inspection/insp_demo/location.

The integration is delivered, but uniformly complete map coverage is not claimed: some real provider tile hosts still return HTTP 204 empty images, especially at zoomed GPS views. Provider/network investigation is a separate follow-up, with no origin or shard-routing bypass.
