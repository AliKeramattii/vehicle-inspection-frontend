# Static deployment decision and API review preparation

## Goal
Produce an evidence-backed Node-free deployment recommendation and backend contract review package, without migrating the working application.

## User-visible behavior
Existing screens, URLs, media, settings, Neshan and optional 3D remain unchanged. A disposable isolated routing proof is diagnostic only.

## Current state
Canonical integrated worktree on feat/unified-ui-admin-3d, initial HEAD 72a4e99. Next 16.3.8 App Router; runtime ID paths and default image optimization prevent current static release. Existing readiness docs classify READY WITH DOCUMENTED BLOCKERS. API catalog lists 63 semantic operations, not agreed endpoints. Twenty dirty user files and supplied untracked assets are protected by an ignored hash manifest.

## Constraints
No new worktree, routing migration, backend implementation, dependency installation, secret copying, asset replacement, Neshan/3D edits or previous-phase audit rerun. Keep existing configuration provider and durable state. Production Node-free; build-time Node allowed. Official docs and installed-version behavior must support recommendations.

## Implementation
1. Read existing deployment/readiness/API documentation and installed framework docs; verify official primary sources.
2. Compare finite exported query entry pages, a real client-router SPA, and lower-impact alternatives with explicit URL/security/hosting tradeoffs.
3. Build a small isolated Next export in ignored .agent/reference-review/static-decision, using installed dependencies and synthetic public configuration only. Serve the output without a Node runtime; test new runtime IDs, direct links, reload, client navigation, assets and configuration changes.
4. Create docs/STATIC_DEPLOYMENT_DECISION.md, docs/API_CONTRACT_REVIEW_CHECKLIST.md, docs/API_IMPLEMENTATION_PRIORITY.md. Review all 63 operations and map aliases/workers/local functions into coherent resources and dependency gates.
5. Validate proof and documentation, recheck protected hashes, review/stage only intended documentation and this plan, commit/push current branch. No migration begins without approval.

## API impact
No implemented API or DTO changes. All route/contract examples are proposals for ASP.NET review. Separate public configuration, customer/staff identity, business facts, evidence, decisions, settings and server delivery responsibilities.

## Testing
Actual isolated Next 16.3.8 static build and browser tests on a non-Node static host; no real authentication, backend, GPS, camera or 3D claims. Check links/catalog coverage, lint/typecheck if appropriate, protected-file hashes and scoped Git diff. Reuse prior full-app validation only as historical evidence; do not repeat its audit.

## Acceptance criteria
- Three required docs exist and distinguish verified facts, proposals and unresolved decisions.
- One recommended architecture covers all nine constraints and rejects arbitrary-ID fixture generation/fallback assumptions.
- Diagnostic proof records actual build/browser exits and limitations.
- All 63 operation IDs have a review disposition and dependency order; no claim of 63 required endpoints.
- Original dirty work and app/runtime configuration stay byte-identical; no secrets or proof output committed.

## Progress
- [x] Inspect canonical Git state, required docs and actual Next version.
- [x] Verify official documentation and compare deployment strategies.
- [x] Execute isolated static/runtime-ID/browser proof.
- [x] Complete API resource crosswalk and dependency plan.
- [x] Validate documents and preservation; prepare focused documentation delivery.

Git delivery follows the final staged review; the completion response records the resulting commit and verified remote HEAD without embedding a self-referential commit hash in this plan.

## Discoveries and decisions
- Recommend finite Next export pages with query context plus explicit legacy redirects; this changes address-bar shapes and requires architecture approval. No app migration implemented.
- Next 16.3.8 Windows default Link prefetch requested dotted segment files absent at those paths in the export. Documented prefetch=false in the isolated proof gave clean Link and imperative navigation; intended CI OS/host artifact verification remains a release gate. No framework patch or error suppression.
- A separate tiny History API shell verified the alternative router mechanism; it is not a port of the app or an ASP.NET integration test.
- Public runtime settings were synthetic; no real key, env or config store was copied. Existing sole settings loader/provider was reviewed, not replaced.
- All 63 catalog IDs are mapped exactly once. A02/F05, legacy branding and delivery projections are consolidation points; transfer/server workers/local UI actions are not one-endpoint-per-row requirements.

## Validation record
- Isolated Next 16.3.8 static export: exit 0.
- Isolated Chromium proof: 19 assertion groups, exit 0; synthetic runtime ID created after build; assets/config/deep links/refresh/Link/router.push/back-forward/two origins and alternative History dispatcher covered.
- npm run lint: exit 0.
- npm run typecheck: exit 0.
- npm run test: exit 0, 493 tests in 44 files.
- Documentation crosswalk/encoding/fences/local links: exit 0. Protected 28-file hash manifest unchanged after validation, including all 20 original tracked edits.
- No working-app build or full application browser suite was repeated: this task changes documentation only; the actual static build/browser proof is separate. Previous full-suite/baseline findings remain historical, not newly claimed passes.
- No application visual baselines changed. Diagnostic screenshots only; no real auth/API/camera/ASP.NET hosting assertion.

## Remaining approval and scope
Approve the proposed finite-page URL/hosting architecture before a separate routing migration. Backend contracts and K01-K14 decisions need team sign-off; no backend work begins automatically. Windows prefetch packaging and intended-host integration remain explicit verification gates. All unrelated user work and the readiness mismatch remain outside scope.
