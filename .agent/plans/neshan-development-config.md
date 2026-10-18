# Neshan development startup and runtime configuration

## Goal
Start the canonical integrated project's local-only Neshan services with the existing Next/TypeScript toolchain, and deliver the authorized public map configuration to the active customer/Admin provider.

## User-visible behavior
The existing location picker renders real Neshan imagery and resolves Persian addresses, without UI/workflow changes. Public map configuration and private reverse credentials remain separate.

## Current state
Branch feat/unified-ui-admin-3d, starting HEAD 4640fd5. Nineteen unrelated dirty files are preserved in an ignored hash manifest. The user added a .ts suffix in the shared schema to work around native Node resolution. Both local credential files and the authorized public key already exist; canonical and earlier public keys match. No service currently listens on 3114/8787/8788. Existing development local-publication overlay can mask the runtime seed with a persisted mock workspace.

## Constraints
Canonical worktree only. No reset/stash/worktree/asset/baseline/UI changes. No private credentials in frontend/logs/Git. Do not modify TypeScript module settings or turn the project into ESM. Node services remain loopback/development-only; production uses static public settings and ASP.NET. Preserve all local Admin drafts/history and tenant isolation.

## Implementation
1. Reproduce native Node resolution and active runtime/provider behavior with sanitized diagnostics.
2. Add the smallest development-only module loading boundary; restore only the schema import suffix, preserving all other manual schema edits.
3. Correct the proven runtime-publication precedence issue using the existing settings repository/provider, without another config store or losing Admin edits.
4. Improve safe startup diagnostics and canonical startup documentation.
5. Test strict schema, native subprocess startup, runtime settings precedence, tenant safety and production boundaries.
6. Run actual proxy and Next scripts; verify real tiles/reverse and Admin/customer agreement.
7. Validate, review/stage only intended hunks, commit/push and verify remote.

## API impact
No new endpoint or backend integration. Existing development bootstrap/settings/reverse contracts remain unchanged.

## Testing
Focused Vitest and native Node subprocess regressions; real-provider Playwright with traces/HAR disabled; lint, typecheck, all unit tests and production build. Sanitize diagnostics; inspect private-key absence from public responses/browser chunks and production rewrites.

## Acceptance criteria
- Native proxy startup succeeds with extensionless shared frontend imports.
- Active demo tenant receives a valid authorized public map key.
- Same provider/repository used by Admin and customer; drafts/history survive.
- Actual tile/reverse results reported truthfully.
- No local credentials, assets, unrelated work or baselines committed.
- Required validation exits and Git push verified.

## Progress
- [x] Inspected Git, instructions, local files and runtime/provider architecture.
- [x] Reproduced configuration masking in an isolated browser with a persisted factory map. Native Node/Next import-resolution mismatch confirmed.
- [x] Added a temporary exact-edge Node hook and development-only, view-only factory-map adoption in the existing repository; explicit map choices/drafts/history preserved.
- [x] Real-provider browser checks passed: full visible base coverage, Persian reverse lookup, GPS fixture, edits/refresh and customer/Admin settings agreement.
- [x] Lint, typecheck, 409 unit tests, two live browser checks, five deterministic browser regressions and production build exited 0.
- [x] Inspected before/after screenshots at 390x844 plus live 360x800, 430x932 and 1440x960. No design or baseline changes.
- [x] Preservation scan confirms 18 unrelated dirty files unchanged; schema differs from the user snapshot only by the approved import suffix correction.
- [x] Production browser/public artifact scan found zero private-key occurrences, no baked-in authorized local public key and no development loopback rewrites.

## Discoveries and delivery
The ignored local credentials/settings were already present and correct; no key copy or local-file edit was required. The shared configuration key deliberately spans mock/live development sessions, so the opt-in Admin publication overlay could mask the API seed. Read-time adoption is limited to published AND draft maps that still exactly match unconfigured factory values; it never rewrites stored records. Explicit Admin map edits still require normal publication. Inherited DEV_NESHAN_ENABLED=0 also masks root .env.local, so canonical startup documentation now clears that test override before Next starts.

Validation encountered two test-only mistakes (an IndexedDB completion callback type and a select label locator); both were corrected and rerun successfully. A diagnostic scan initially raced the browser suite rebuild; rerun after build confirmed the production boundary. Existing NO_COLOR/FORCE_COLOR runner warnings remain cosmetic. Native proxy startup no longer emits MODULE_TYPELESS_PACKAGE_JSON.

All implementation/validation is complete. Focused Git commit, normal push and remote-HEAD verification are the final delivery steps; their exact results belong in the completion report.
