# White-Label Platform Phase 1

## Goal
Provide validated runtime public configuration and brokerage branding without source edits, extend the existing Admin with durable mock Site Settings, and define static-hosting/private-storage/backend contracts while preserving customer evidence and optional 3D isolation.

## User-visible behavior
Default branding preserves existing screens. Independently configured deployments load identity/theme/assets from site-bootstrap.json and a validated public source. Invalid configuration fails closed with retry, never another tenant fallback. Admin settings support draft, preview, save, publication and reset, explicitly local/mock. No backend connection or storage-health success is fabricated.

## Current state
Original worktree on optional 3D has unrelated changes. Clean Admin branch c26568c contains Phase08 main 6228c67 plus two isolated Admin commits. White-Label worktree is based directly on that verified compatible Admin branch, not an automatic merge. Customer runtime ID routes and default Next Image optimization block complete export. Serwist is installed but no service worker registration/build or manifest exists on this base. All evidence/upload/submission services are mocked.

## Constraints
Preserve original work/readiness/GLBs, twelve photos plus odometer/video, pinned versions, existing AppViewport and routes. No ASP.NET implementation, real integration, 3D imports, canonical asset replacement, secrets or media deletion. Public configuration cannot contain SQL credentials or physical storage roots. API origins come only from validated deployment bootstrap, never URL query. Storage pattern INSPECTION_{InspectionId}; MSSQL paths/metadata only.

## Implementation
1. Audit routes/Next16 documentation, APIs, persistence and branch ancestry; record static blockers by exact file.
2. Add strict versioned bootstrap/settings schemas, deterministic fixtures, URL/contrast checks, same-origin loader, no-store settings requests, tenant-context binding and request cancellation. Keep nonsecret config caching scoped and never use cross-tenant fallback.
3. Add runtime provider inside root query composition before workflow/queue mount, CSS variable roles and centralized asset/default framing. Preserve default screenshots; integrate entry/shared/preparation identity and decorative branding only.
4. Reuse Admin provider/primitives and a separate tenant-scoped transactional settings repository with role checks, CAS revision, immutable publications, preview, reset, audit and storage/error states. Do not auto-select new capture templates for existing inspections.
5. Add pure backend-contract path specification/tests, public deployment examples and eight requested architecture/handoff docs. No filesystem write API.
6. Validate two brokerage contexts, failures, publication, customer/Admin regression and visual viewport targets. Keep export disabled if runtime-ID migration remains unsafe; document exact next-stage proof.
7. Review scope/security, commit and push feature branch normally; verify remote heads.

## API impact
Planned public/admin settings, branding-assets/health and existing evidence APIs only. Frontend uses mock sources by default. Backend owns identity/tenant authority, private storage, streaming/revisions, MSSQL metadata, retention and filesystem/database reconciliation.

## Testing
Schema/URL/contrast/config-cache/binding, transactional settings lifecycle/permissions/conflicts, safe storage path/revision/metadata contract units. Two brokerage browser fixtures, loading/error/retry, correct assets/API, tenant switch rejection, settings preview/save/publish/reset, viewport tests and previous regression suite. Actual lint/typecheck/test/test:e2e/build scripts. Static HTTP proof only if full export becomes safe.

## Acceptance criteria
Typed runtime configuration, no secret exposure, no tenant fallback, configure without React changes, functional compatible Admin settings, exact storage convention tested, detailed backend handoff, existing flows and unrelated work intact; validated focused Git delivery. No false static-export/backend claims.

## Progress
- [x] Inspect brief, instructions, branch/worktrees and compatible Admin base.
- [x] Complete static/API/persistence audit and architecture docs; static export deliberately deferred with exact blockers.
- [x] Runtime configuration and branding foundation, safety checks and recovery.
- [x] Admin Site Settings draft/preview/save/publish/reset, CAS and mock role checks.
- [x] Unit/browser/visual review and regression validation.
- [x] Commit validated implementation and verify its normal feature-branch push (531469c).

## Discoveries
Static export must not fabricate runtime IDs. Existing backend endpoints are contracts, not verified ASP.NET implementations. No current SW cache to invalidate; deployment config must be NetworkOnly/no-store in future PWA work. Same-origin tenant changes require fail-closed binding to preserve legacy durable evidence rather than silently reusing it.

## Validation outcome
Completed on 2026-10-11 in the isolated feat/white-label-platform worktree:
- npm run lint: exit 0, no lint warnings.
- npm run typecheck: exit 0.
- npm run test: exit 0, 276 tests in 21 files.
- npm run test:e2e: exit 0, 170 passed / 114 project-specific skipped, 2.2 minutes; runner exited normally.
- npm run build: exit 0, regular Next production build. Dynamic routes remain, so this is NOT a verified static export.
- 33 implementation screenshots reviewed across default/Broker A/Broker B customer views and six Admin tabs. Customer 360x800, 390x844, 430x932; Admin 1440x960, 1280x800, 1024x768. No document overflow or console/page/resource errors in that review.
- Added only three manually reviewed baselines: site-settings.spec.ts/broker-a-landing-customer.png, broker-b-landing-customer.png, admin-site-settings-desktop.png. Earlier baselines are unchanged.
- Original worktree's 24 previously recorded user-file hashes/removals match; no unrelated readiness work, canonical automotive asset, restricted GLB, dependency or origin configuration change.
- XML deployment example parses; public/private example JSON parses and public schemas are validated. Hosting templates remain untested against IIS/Nginx infrastructure.

## Problems and resolutions
Initial focused browser assertions assumed raw relative image src and an unqualified photography-image selector. Corrected the new test assertions, without changing earlier tests or approved UI.
The first full suite exposed configuration loading tied to timers under a frozen test clock and skip-link focus lost when loading content was replaced. Query notifications now use microtasks and pending focus transfers to ready main content. All original test expectations remain intact.
The next full suite exposed late App Router metadata overriding brokerage app titles. Runtime title/favicon synchronization now observes head metadata, avoids redundant writes and disconnects/restores metadata on cleanup. A new regression simulates late metadata and navigation.
Full reruns then exited successfully; no test-runner stall remains.
Pre-existing locked dependencies report seven high npm audit findings and deprecated ESLint. No breaking audit fix/downgrade or dependency change was made.

## Delivery boundary
Static route/image/PWA migration and real ASP.NET authentication/settings/storage/publication are deliberately not claimed complete. Runtime-ID inventory, future static-hosting proof and detailed backend storage/security responsibilities are documented. Original optional-3D branch/assets and main/Admin histories remain isolated.

## Git delivery
Implementation commit 531469c (feat: add white-label runtime configuration) was pushed normally to origin/feat/white-label-platform and its full remote hash verified. Architecture/backend/deployment documentation is delivered in the focused follow-up docs commit; remote verification is part of the final delivery report. Main, Admin and optional-3D branches are not merged or rewritten.
