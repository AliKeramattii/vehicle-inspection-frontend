# Replace the default application identity logo

## Goal
Every existing application identity shows the exact supplied /branding/logo.webp with correct aspect ratio and no crop.

## User-visible behavior
Shared customer, Admin, Reviewer and draft-preview identity switches from SVG to the transparent square WebP. Brokerage-specific logos remain separate and configurable. Header geometry, colors, workflows, vehicle imagery, favicon and PWA icons remain unchanged.

## Current state
Canonical feat/unified-ui-admin-3d at 89c86b2. ApplicationLogo serves the old SVG with a wide crop wrapper and 125% shifted artwork. CoBranding and Admin/sidebar/preview reuse it. Functional platformCar registry is unused as app identity; old SVG is separately retained as the favicon preview fallback. Supplied logo is 1254x1254 WebP with alpha, SHA256 228339774be5f7d5cc97efef519373d0ec1c18ca83ffe117e1064013db3d0044. Existing unrelated files and ignored local settings are hashed under the ignored reference-review directory.

## Constraints
Canonical worktree/current branch only. No new worktree, redesign, theme/map/3D/API/workflow/assets changes. Preserve exact logo bytes, no masks/filters/recoloring or crop. Static-export-compatible direct public asset; no new optimizer runtime dependency. Preserve all unrelated edits; only the specifically approved untracked branding/logo.webp enters the commit.

## Implementation
1. Audit app logo versus brokerage/favicon/functional assets; capture original header geometry.
2. Change ApplicationLogo source/intrinsic dimensions and its two scoped CSS rules to contain the new square logo. Adjust only logo sizing if actual geometry requires it.
3. Update existing logo source assertions, add focused responsive/browser coverage for real decoded logo, light/dark, header fit and independent brokerage override.
4. Lint/typecheck/relevant unit/browser/build checks, inspect screenshots and preservation/diff, focused commit/push/remote verification.

## API impact
None.

## Testing
Customer360x800/390x844/430x932, Admin light/dark and Reviewer1440x960. Inspect decoded image dimensions, object-fit, no filters/masks/crop, stable header and no overflow/overlap. Keep favicon/PWA and brokerage customization unchanged. No historical baseline update.

## Acceptance criteria
Exact WebP served without optimization transformation, correct square aspect ratio, all shared identity placements updated, brokerage customization preserved, required commands exit0, screenshots reviewed and scoped Git delivery.

## Progress
- [x] Read instructions, inspect Git/source usages and supplied WebP.
- [x] Capture original geometry and implement shared replacement.
- [x] Validate responsive light/dark/brokerage behavior and screenshots.
- [x] Finish validation and preservation/diff review; prepare focused Git delivery.

## Validation outcome

Lint and typecheck exit 0. All 454 unit tests (37 files) exit 0. Production build exits 0. Focused browser run: 9 passed, exit 0, including exact public WebP bytes, custom brokerage override after refresh, three mobile sizes, Admin/Reviewer light and dark, shared customer journey, header bounds and photography regression. The logo scenarios report no console/page errors or failed logo requests. Playwright emits only the existing NO_COLOR/FORCE_COLOR environment warning. No screenshot baselines changed.

Reviewed customer landing and photography at 360x800, 390x844 and 430x932 plus Admin/Reviewer at 1440x960. Captures are in the ignored `.agent/reference-review/application-logo/` directory. Header heights remain landing 64, Admin sidebar 72/topbar 68, Reviewer 72 px. Logo frames are 46/40/36 px square; no caller sizing change was necessary. The exact supplied asset retains its alpha and SHA256. All 24 pre-task preservation hashes match, including unrelated readiness/hero/schema/config work and local secrets.

## Discoveries and decisions

Initial browser assertions raced settings/router rendering; wait for visibility and stable width. Existing RuntimeLogo normalizes brokerage URLs to absolute same-origin URLs, so the regression assertion follows that behavior without changing production configuration. Explicit image decode is awaited before screenshot capture. Functional platform-car icon and old SVG favicon-preview fallback remain untouched because they are outside application identity scope. Historical audit documents remain historical; only the two active branding descriptions are updated.

## Delivery

Stage only the shared logo component/CSS, exact supplied WebP, scoped unit/browser assertions, active branding documentation and this plan. Commit and push the existing branch normally; verify remote HEAD and record the actual commit/push result in the completion report. No additional product phase is included.
