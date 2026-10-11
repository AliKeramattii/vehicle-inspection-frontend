# White-Label architecture, Phase 1

## Deployment decision
One shared frontend codebase; one isolated domain/static installation, ASP.NET API, MSSQL database and private filesystem root per brokerage. This is not a new shared multi-tenant database. Prefer frontend / and API /api on the same HTTPS origin, routed by IIS/Nginx. Separate HTTPS API origins are explicit trusted bootstrap configuration, never query parameters. Client tenant identifiers are context, not credentials.

## Implemented foundation
site-bootstrap.json is public, versioned and validated before workflows or the upload coordinator mount. Site Settings are fetched with no-store/redirect rejection and validated against tenant/API context. The default source is explicitly mock; API source implements only the public settings fetch, not real inspection/auth/upload integration. Existing typed repositories and shared durable photo/video upload coordinator are retained.

Configuration truth is in TanStack Query keyed by origin, tenant and API/settings endpoint. Mock draft/history is in inspection-site-settings IndexedDB, separate from evidence. There is no stale configuration fallback to another tenant. An origin-to-installation binding blocks tenant/API changes on a used origin without deleting customer data. Brokerages must use independent origins/browser storage. Binding is a migration/data-safety control, not authentication.

Runtime identity/colors/decorative assets are supported in landing/referral, OTP, readiness, consent and shared customer headers. Canonical capture guidance and evidence state colors are independent. Default demo keeps approved layout/assets/baselines. Published template reference is configuration for future inspection creation only; existing pinned inspections are never rewritten.

## Admin
The feature branch starts from reviewed clean Admin c26568c, itself on stable Phase08 main 6228c67. No uncertain merge or optional Phase09 commit is used. Site Settings extends existing Admin at /admin/site-settings, reached through Branding. Existing Admin templates/roles/navigation remain intact. Draft save/preview/reset/publish is durable local mock only; it is not server publication for every customer.

## Current limitations and commercial gate
Runtime inspection/request/template IDs and default Next Image optimization block full static export. output: export is intentionally not enabled; no verified out release exists. See STATIC_EXPORT_AUDIT. This Phase 1 foundation is not yet a commercially deployable static product. Customer repositories, authentication, uploads, submission and health remain mocks. PWA/Serwist dependency exists, but no active SW or manifest on this stable base; offline cold-start/installability still require the later static/PWA migration. No restricted Sportage model belongs in a commercial package.

## Backend ownership
ASP.NET owns authenticated tenant/inspection authorization, sessions, OTP provider secrets, configuration publication, safe asset processing, streaming file transfer/retrieval, immutable evidence revisions, metadata registration and cleanup. MSSQL stores relative paths/metadata only, never media bytes. The private folder convention is INSPECTION_{InspectionId}, with no CustomerId path component. Browser IndexedDB remains a local recovery buffer, not remote media storage.

## Preservation
Twelve photos in seven configured sections, separate integer odometer and walk-around video, atomic replacement, queue idempotency/retry, submission, Additional Evidence and 2D markers are unchanged. AppViewport retains bounded 100dvh. No customer route migration, asset replacement, 3D import, private root disclosure or cleanup occurs in this phase.

## Phase 1 validation record (2026-10-11)
In the isolated feat/white-label-platform worktree, actual commands exited successfully: lint 0, typecheck 0, Vitest 0 (276 tests / 21 files), full Playwright 0 (170 passed / 114 project-specific skipped), regular production build 0. This build still contains dynamic routes and is not static-export proof.
Two brokerage fixtures verify runtime API selection, identity/theme/assets, invalid-context recovery, no query-selected API, same-origin tenant-switch rejection without evidence loss, and existing customer capture compatibility. Admin tests cover local draft/preview/save/publish/reset, validation, role restrictions and all three desktop sizes.
Manually reviewed 33 screenshots at customer 360x800 / 390x844 / 430x932 and Admin 1440x960 / 1280x800 / 1024x768. No document overflow or console/page/resource failures were observed in this review. Added only these new baselines under tests/e2e/screenshots/site-settings.spec.ts:
- broker-a-landing-customer.png
- broker-b-landing-customer.png
- admin-site-settings-desktop.png
All previous baselines remain unchanged. The original worktree and unrelated readiness mismatch were preserved.
During validation, fixed asynchronous bootstrap notifications under frozen clocks, skip-link focus transfer and late Next metadata overriding runtime identity. No previous tests were weakened. Full suite exits normally.
Remaining release blockers: dynamic route/image migration, actual static HTTP/deep-link/PWA proof and ASP.NET implementation. Seven high findings in the pre-existing dependency lock and deprecated ESLint remain; no unsafe automatic audit downgrade was applied. Deployment examples are parsed templates, not verified infrastructure.
