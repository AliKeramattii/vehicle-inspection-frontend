# Premium UI/UX refinement

## Goal
Refine the existing customer, Admin and Reviewer application without changing domain behavior. Use the supplied multicolor app logo, quiet four-item readiness, accessible animated light/dark/system preference, organized settings and evidence-first review.

## User-visible behavior
Production customer remains 2D; optional licensed development GLB, Neshan, Recorder V2, twelve photographs, separate odometer/video, queues, submission and exact retakes remain intact. Admin has grouped responsive navigation and structured publication; Reviewer has clear evidence navigation and decisions.

## Current state
Base eb8a183 on feat/unified-ui-admin-3d. Six uncommitted Playwright config files remain in that source. New isolated branch feat/premium-ui-ux-refinement. Original frontend and all other worktrees preserved. Existing historical visual failures are documented in UNIFIED_VALIDATION.md.

## Constraints
No backend, static-export migration, production Node requirement, new dependencies, asset regeneration, restricted GLB publication or authorization changes. Runtime brokerage branding remains separate from app identity. Existing AppViewport owns bounded 100dvh. Never blanket-update baselines.

## Implementation
1. Inventory screens/references and capture representative before states in ignored .agent/reference-review/premium.
2. Shared app logo, quiet readiness and animated theme control.
3. Scoped operations tokens, grouped responsive Admin navigation and useful repository-derived dashboard data.
4. Site Settings navigation, eight existing image fields, publication feedback and sticky actions.
5. Reviewer queue and responsive evidence workstation with existing scoped services/decisions.
6. Targeted customer consistency, feedback and receipt affordances; preserve workflows.
7. Persian guide/backlog, browser/visual review, regression checks and focused commits/push.

## API impact
None. Existing mock/service boundaries, evidence revisions and planned ASP.NET contracts remain. INSPECTION_{InspectionId} storage convention unchanged.

## Testing
Run npm.cmd run lint, typecheck, test and build. Focused Playwright covers logo, four readiness items/no automatic permission, theme keyboard/persistence/system/scope, eight image slots, settings draft/publish, reviewer scope/decisions, marker layout, capture/recorder/upload/submission/retakes and actual authorized Neshan/development GLB when available. Inspect customer 360x800/390x844/430x932 and operations 1440x960/1280x800/1024x768/narrow. Record actual exits and historical failures separately.

## Acceptance criteria
- Approved SVG renders in color without replacing brokerage identity.
- Four readiness items retained; redundant ready labels removed while genuine failures remain.
- Animated accessible theme switch supports light/dark/system without customer/theme leakage.
- Organized usable Admin/settings/reviewer and coherent customer hierarchy.
- Existing business behavior preserved; no fake success/actions.
- Visual evidence inspected and only intended new baselines accepted.
- Validation, Persian guide and prioritized backlog complete; focused branch pushed normally.

## Progress
- [x] Attachment/rules/skill read; source worktree inspected and isolated branch created.
- [x] Inventory and before screenshots.
- [x] Logo/readiness/theme.
- [x] Admin shell/dashboard.
- [x] Site Settings.
- [x] Reviewer workstation.
- [x] Customer refinement/regressions.
- [x] Documentation, visual validation and technical checks.
- [x] Focused commits, normal push and remote verification.

## Validation discoveries
All372 unit tests, lint, typecheck/build pass. Existing65 browser regressions pass. Final eight production refinement scenarios and nine individually reviewed new snapshots pass, exit0. Real Neshan and actual local GLB each pass, exit0. Historical baselines remain unchanged; source-worktree local work and160 recorded file hashes are preserved. See docs/PREMIUM_UI_UX_VALIDATION.md for the full correction/limitation record.
