# Unified application customization

## Goal
Deliver one unified branch with approved inherited features and requested Admin/branding/readiness/optional3D/recorderV2 changes.
## User-visible behavior
Admin can publish local mock image choices and use a scoped dark theme. Four readiness checks, receipt-only reference, guidance-first synchronized 3D pins, eight ghost guides and pause-aware video recording. Existing customer workflow and queues remain canonical.
## Current state
Verified inventory and feature matrix: docs/WORKTREE_INTEGRATION_PLAN.md. Base84539b7 already contains approved Admin/WhiteLabel/UI/Neshan. Source worktrees preserved and checksum inventory saved in ignored artifacts.
## Constraints
No destructive Git, production Node APIs, backend implementation, competing media store, gallery fallback, unlicensed GLB publication or unrelated baseline refresh. Existing AppViewport, RTL, roles, accepted revisions and INSPECTION_{InspectionId} storage contract retained.
## Implementation
Checkpoints A–F in integration document. Add reusable AdminImageAssetField and scoped theme primitives; add backward-compatible receipt image; derive shared marker capture/upload states; extend recorder service with active-duration pause/resume and UI-only ghost overlays.
## API impact
Planned Admin branding-asset upload contract only, no live backend. Existing evidence/odometer/submit/Neshan contracts retained.
## Testing
Existing unit suites and focused checkpoint/browser tests; real authorized Neshan traffic; GLB gating; deterministic MediaRecorder; mobile360/390/430 and desktop1440 screenshots with preflight review.
## Acceptance criteria
All request criteria and feature rows verified; original files remain unchanged, uploaded assets recover after refresh, roles respected, 12pins and single model, live-only video and pause duration correct, no false upload success.
## Progress
- [x] Inventory, integration base and safe worktree.
- [x] A: inherited integration smoke/documentation. Typecheck, 346 baseline unit tests and production build exit 0. Approved reference kit copied selectively; single restricted mobile GLB remains ignored local-only.
- [x] B: Admin/theme/readiness/header foundations.
- [x] C: eight local branding image slots.
- [x] D: 3D canonical status and guidance-first interaction.
- [x] E: V2 live recorder and eight ghosts.
- [x] F: guide, visual review and focused final validation; see docs/UNIFIED_VALIDATION.md for explicit historical snapshot debt.
- [x] Git delivery: implementation/docs pushed normally; remote9e2f436 verified before this final delivery-record commit.

B/C validated by unit/build/Admin browser; D by real mobileGLB browser; E by pause-aware unit and real browser fixture tests. Real Neshan, broad behavioral regressions, licensed real-model checks and final review passed. Historical baselines intentionally remain unchanged; Git delivery verified; all original worktrees and160recorded file checks remain unchanged.
