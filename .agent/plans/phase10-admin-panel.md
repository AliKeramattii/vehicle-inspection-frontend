# Phase 10 Admin Panel

## Goal
Deliver a functional desktop Persian RTL Admin workspace on a branch based on stable 2D Phase 08, while keeping experimental Phase 09 and original user work independently intact.

## User-visible behavior
Admin sidebar routes open dashboard, templates, branding, policies, webhooks, users and permissions. Administrators create/open drafts, select/edit requirements, inspect contained canonical guides, validate/save, reorder, publish with confirmation, view immutable history and archive drafts. Mock role restrictions and clear persistence/recovery states apply. Existing customer routes and twelve-photo capture package do not change.

## Current state
Stable origin/main at 6228c674eb809d3cc3c0d6e23858a05d49c47177 contains Phase 08 implementation 1b1e25c and docs 6228c67. Phase 09 c5f59a1/c190012 are not ancestors; its feature/preview/optimization paths are absent from main. The existing clean Admin worktree at C:/Projects/vehicle-inspection-admin on feat/admin-panel was reused from that base. The original feat/optional-vehicle-3d worktree has unrelated local changes and restricted GLBs that are not copied, modified or staged.

## Constraints
No main merge, Phase09 cherry-pick, destructive Git operations, customer changes, old baseline updates, new dependencies, GLB publication or real backend calls. Preserve current requirement IDs, separate odometer/video, pinning/evidence namespaces, RTL/Vazirmatn/#2563EB and AppViewport. Marketing-specific TasteSkill preferences are inapplicable to this operations UI; apply its brand, readability, hierarchy, contrast, focus and recovery checks. Design variance 3, motion 2, density 6.

## Implementation
1. Reuse PhotographyTemplate with Admin-only metadata (stable version ID, CAS revision, lifecycle and actor/time). Reject unsupported fields recursively; whitelist existing canonical assets.
2. Use separate transactional inspection-admin IndexedDB workspace and serialized memory adapter. Permissions check every repository mutation. Published snapshots are immutable, idempotent publication uses stable version identity; archive drafts only.
3. Keep client mock truth in TanStack Query and unsaved edits in RHF/local state. Thin server routes; scoped Admin CSS and reused primitives. Sidebar/version/role navigation and refresh protect unsaved edits. Background read failures retain mounted forms.
4. Implement sidebar/header, searchable/filterable list, split table/editor, section/requirement ordering, guide preview, publication/history and bounded scrolling.
5. Secondary modules: persisted scoped display name, mocked webhook enable state and role assignments; read-only policies and permission definitions with explicit server gaps.
6. Expose clone-only pinPublishedTemplate boundary. Never auto-connect Admin publications to customer inspection creation.
7. Review reference 20 and screenshots at 1440x960 plus 1280x800, 1920x1080 and 1024x768; create new Admin baselines only.
8. Validate, preserve original worktree, commit/push only feat/admin-panel and verify remote branches.

## API impact
docs/API_CONTRACT.md clarifies planned /api/admin/capture-templates operations, draft revisions, immutable history, idempotent publishing, tenant/actor authorization, assets and separate supplemental capture settings. Secondary planned interfaces are explicit; no runtime HTTP or backend guarantees.

## Testing
25 domain/service tests plus 3 UI recovery tests. Fourteen desktop Playwright scenarios cover navigation, direct routes, draft save/refresh, publication/history, stale two-tab conflict, authorization/keyboard/preview, unsaved protection, new templates, secondary persistence, ordering/archive, storage/image recovery and four viewport sizes. Nine new Admin screenshot states.
First complete production browser run: 156 passed, 100 intentionally skipped by project targeting, exit 0. All existing customer baselines unchanged; clean-base readiness screenshots pass. Final rerun after the background-read preservation fix also exited successfully.

## Acceptance criteria
- Phase09 remains separately retrievable; original worktree and local GLBs untouched.
- No customer layout/domain/mock/baseline changes; stable IDs, odometer/video and evidence pinning preserved.
- Real mock draft/publish/archive/persistence and service permissions, not static UI.
- CAS rejects stale overwrite, published history immutable and old pins independent.
- Canonical guides contained; actions reachable and no document overflow at all desktop targets.
- Actual lint/typecheck/unit/full browser/build processes exit successfully.
- Focused Admin commit pushed normally; main/3D remote heads unchanged.

## Progress
- [x] Read instructions, skill applicability, reference 20, current schema and Next docs.
- [x] Verify Phase08/base and Phase09 isolation; reuse clean worktree.
- [x] Implement typed repository, CAS, immutable versions, audit, mock persistence and permissions.
- [x] Implement Admin routes/editor and secondary modules.
- [x] Add tests; inspect/reference-compare screenshots and create nine Admin-only baselines.
- [x] Final validation after last recovery review and original-worktree hash/scope audit.
- [x] Focused implementation commit 8cbf194, normal push and verified remote HEAD; main and optional-3D heads unchanged.

## Discoveries and corrections
Windows PowerShell native piping initially replaced Persian characters; corrected with ASCII-escaped JSON/UTF-8 file writes and verified source text. RHF watch produced compiler warnings; changed to useWatch. Repository synchronous rejection conflicted with promised interfaces; operations are now async. Browser selectors were scoped away from Next route announcer and a filter received an explicit accessible label. New archive test exposed implicit version fallback; active version identity now stays stable. Senior review found background read error could unmount an edited form; retain cached children and test unsaved value preservation. Initial snapshot creation writes missing files and exits 1 in this Playwright version; the subsequent ordinary comparison passed. Temporary screenshot helper waits were corrected for lazy images and guaranteed browser close; repository test processes exit normally.
Existing NO_COLOR/FORCE_COLOR environment warnings remain informational and are not hidden.

## Preservation and limitations
No automatic template rollout to future customer inspections; future server creation must explicitly pin a tested snapshot. Policies/matrix are read-only, user/auth and webhook delivery are mock-only. No logo upload or arbitrary new requirement type. Old user-worktree readiness drift remains out of scope; isolation validates committed intended source.

## Final validation outcomes
All five scripts exited 0: lint/typecheck clean, 244 unit tests in 19 files, full Playwright 156 passed and 100 viewport-project skips, explicit production build. All nine Admin baselines pass without updates; all previous baselines unchanged. Applicable TasteSkill pre-flight passed. 24 original user-change hashes are unchanged; original and optimized restricted GLBs remain local. Implementation commit 8cbf194 was pushed normally to origin/feat/admin-panel and verified remotely. origin/main remains 6228c67; origin/feat/optional-vehicle-3d remains c190012. This delivery record is a separate documentation-only follow-up.
