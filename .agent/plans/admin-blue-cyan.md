# Scoped Admin blue/cyan branding

## Goal
Admin dashboard and Site Settings use the six approved logo-derived colors in both themes; the existing exact application logo stays active.

## User-visible behavior
Navy sidebar, blue primary/active controls and restrained cyan detail. White light surfaces and deep navy dark panels. Settings categories/forms/assets/publication actions form one coherent work surface; the editable tenant preview keeps its own actual colors and brokerage logo. All routes, roles, local persistence, theme switching and customer/reviewer behavior remain unchanged.

## Current state
Canonical feat/unified-ui-admin-3d at f7ac463. The logo is already exact /branding/logo.webp. Admin and Reviewer share AdminThemeScope; its existing tenant-driven Emerald defaults must remain for Reviewer. Admin CSS consumes inherited semantic variables, with legacy overrides. Site Settings already provides categories, an internal scroller, independent draft preview and fixed save/publication boundary. Existing unrelated edits are hashed under the ignored review directory.

## Constraints
Only canonical worktree/current branch; preserve all local settings/assets/readiness/map/3D edits. No new framework/provider or domain/API changes. Scope palette to .admin-root; never mutate tenant settings or global palette. Keep success green, warning amber, error red and pending neutral. Preserve the exact WebP, static-compatible loading, RTL/Vazirmatn and AppViewport. No unrelated baseline updates.

## Implementation
1. Read instructions/source and inspect reference20/current screenshots; capture BEFORE at 390x844,768x1024,1440x960.
2. Add src/features/admin/admin-brand.css for exact primitives and scoped light/dark roles; import through AdminShell only. Resolve sidebar, focus, buttons, tabs, inputs/tables/metric accents via these roles.
3. Refine Site Settings surface hierarchy and clearly label application vs editable brokerage identity without changing fields, draft/publication logic or preview tenant paint.
4. Add browser checks for actual computed paint, contrast/focus, responsiveness, theme behavior and unchanged tenant/customer/reviewer styling; preserve existing functional tests.
5. Run lint/typecheck/all units/build and focused browser suite; capture AFTER and inspect comparisons; verify preserved hashes and focused diff; commit/push normally and verify remote.

## API impact
None.

## Testing
All requested commands plus relevant Admin/settings/logo/color-browser coverage. Before/after screenshots at all three specified sizes, light/dark and mobile drawer. Contrast checks for primary, navigation, body/input text, borders and focus. Verify custom tenant logo/colors, draft/save/publish/reset and System preference. No readiness/Neshan/3D/photography changes.

## Acceptance criteria
All six exact primitives centralized; blue only Admin; existing configured customer preview unchanged. No overflow/header growth. Real decoded logo with no crop/filter/mask. Required checks exit0; screenshots actually reviewed, no secrets or unrelated changes committed.

## Progress
- [x] Inspect Git, request, instructions and relevant architecture.
- [x] Capture and inspect BEFORE: 29 screenshots, no browser errors or document overflow.
- [x] Implement scoped palette/settings treatment; preserve shared provider and exact logo.
- [x] Validate and inspect AFTER; preservation and scoped diff review complete. Focused Git delivery follows.

## Implementation discoveries

CSS aliases must be rebound at Admin root because inherited custom properties resolve in the shared theme scope. The existing custom-brand .bg-primary rule can override foregrounds, so the Admin-only action selector explicitly guarantees the matching white foreground. Drawer aliases are rebound for navy in light as well as dark. Tests use keyboard activation to exercise focus-visible. API-backed settings remain authoritative; local experimental publication does not rewrite that API. Reviewer mock identity persists its role, so the cross-interface test explicitly switches back through the existing Admin identity control. No business behavior changed to accommodate tests.

## Validation in progress

Build, lint and typecheck exit 0. Full unit suite: 454 passed / 37 files, exit 0. Initial before/after capture: 29 images each; no console/page errors or document overflow. Nine customer/Reviewer captures match BEFORE byte-for-byte. Remaining work: broad functional checks, final reviewed visual baselines and scoped Git delivery.

## Final validation and review

Lint, typecheck, full units (454 tests/37 files) and production build exit 0. Final functional browser run: 56 passed, 40 project-specific skipped, exit 0. Historical visual comparisons are excluded from that focused run, rather than overwritten. Dedicated new Admin visual comparison: 1 passed covering four new baselines, exit 0, without snapshot update mode on the comparison run. First creation returned the expected missing-baseline failure and wrote only those four new files; the subsequent normal comparison passed. Existing NO_COLOR/FORCE_COLOR runner warning remains non-blocking.

The broader first run found stale receipt wrapper, Reviewer decision-rail and mobile-drawer assumptions plus old Admin dark paint assertions. Only those test selectors/viewport/paint expectations were corrected; no receipt/reviewer/media/state behavior changed. The existing logo journey test now waits for the destination vehicle CTA before measuring the remounted header. CLI --project=desktop is required to avoid a variadic project argument consuming the file filter.

29 BEFORE and 29 AFTER screenshots cover all requested sizes, both themes, navigation drawer, settings identity/color forms, customer landing and Reviewer header. Inspected actual desktop dashboard/settings and mobile/tablet settings/drawer; no document overflow, header growth or console/page errors. Nine customer/Reviewer captures match BEFORE bytes. All 33 preservation hashes match, including exact logo bytes and protected readiness/map/3D/schema/config/vehicle/local settings.

New baselines under tests/e2e/screenshots/admin-brand-visual.spec.ts/: admin-brand-dashboard-light-desktop.png, admin-brand-dashboard-dark-desktop.png, admin-brand-site-settings-light-desktop.png, admin-brand-site-settings-dark-desktop.png. Only the unrelated vehicle artwork rectangle is masked in settings baselines; actual BEFORE/AFTER deliverables are unmasked. Earlier baselines are unchanged.

No URL, navigation label, field name, legal text, configured tenant defaults, API contract, provider, dependency or canonical automotive/logo bytes changed. AppViewport, RTL/Vazirmatn, static-compatible styling/loading and light/dark/system behavior remain. No new motion or stylistic em-dashes added to customer copy. Palette roles and measured visible/semantic contrast passed in default and custom tenant states.

## Delivery

Stage only this plan, scoped Admin stylesheet/import/identity copy, two design documents, related browser assertions and four new reviewed baselines. Commit and push the existing development branch normally, verify remote HEAD and record the actual Git result in the completion report. No new phase follows.
