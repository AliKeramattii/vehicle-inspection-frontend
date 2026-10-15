# White sedan 2D asset migration

## Delivery and scope

Work only in C:/Projects/vehicle-inspection-integrated on feat/unified-ui-admin-3d. Approved refinement 7e71205 was fast-forwarded before the separate functional audit checkpoint e41df97. No new worktree or main merge.

The supplied white four-door sedan now provides all built-in active 2D vehicle reference/default imagery. The user approved a generic “خودروی سدان نمونه” label for new demo data. No exact marque/model was inferred; persisted inspection facts and body-color selections are not migrated.

## Implementation

- src/config/vehicle-assets.ts owns explicit guide, hero, view and ghost mappings. There are 27 runtime WebPs: fourteen source photographs (twelve required guides plus two side views), five heroes and eight ghosts. Navigation reuses the same public image files.
- Public root: /assets/inspection-vehicle/. All copies retain supplied bytes; no AI generation, raster editing, mirroring or recompression occurred. Existing Next Image conventions remain; Recorder ghosts remain unoptimized transparent images.
- Landing/referral, VehicleCard, readiness, consent, receipt and Admin fallback previews use the new heroes. Two readiness requirement visuals now show the same sedan; non-vehicle power/phone icons remain. All four requirements, their copy and device logic remain.
- Only the resolved default readiness background gets a horizontal framing offset. The existing gradient/text region, hero dimensions and tenant override framing remain. Photography's image/marker layer derives its aspect ratio from source dimensions rather than the retired SUV ratios. Marker positions, IDs and interactions are unchanged.
- The template retains seven sections and twelve photo requirements, with unchanged IDs, status logic, odometer and walk-around-video semantics. Eight navigation roles and eight UI-only ghost angles use explicit mappings. Recording APIs, stored videos and ghost-free recording behavior are unchanged.
- Exact legacy built-in guide URLs are display aliases for the new supplied guides in PhotoImage and Admin GuideImage. Pinned templates, submitted snapshots and their hashes are not rewritten. Admin validation/selects accept legacy aliases and approved new guides without silently changing saved history.
- PhotoImage prioritizes an actual supplied Blob over a guide URL. Accepted/draft evidence, local media databases, upload jobs and replacements are untouched.
- Site Settings accepts the exact new public URLs through a narrow allowlist. Existing tenant-owned URLs, uploaded assets, drafts and publications are retained. No arbitrary asset root, traversal or query-string relaxation was introduced.

## White-label preservation and safe replacement

Default or failed custom images fall back to the new sedan. A valid, intentional brokerage override continues to win, even if it depicts an older vehicle. The local development map settings contain no image overrides. No attempt is made to rewrite unknown browser-origin/tenant databases.

To replace a tenant's old illustration, open Admin → تنظیمات سایت → تصاویر, select the one slot and choose a supplied image, or use its existing “پیش‌فرض” button to clear only that override. Save the draft and explicitly publish. Other tenant settings remain unchanged. The existing upload/publication/authorization architecture is retained.

## Optional 3D preservation

Thirty-three pre-migration SHA-256 checks cover the optional viewer, model adapters, physical-view/semantic configuration, fallback assets, existing development route bytes and ignored mobile GLB. All remain unchanged. The original eight unrelated canonical local edits are preserved, accounting only for the already-approved product-token import during the fast-forward.

The optional Sportage GLB deliberately differs from the new 2D sedan. It was not replaced or recolored by this task. Existing body-color facts/selection were not changed. Licensing restrictions, development gates, loaders, materials, cameras and interaction code remain as-is. No GLB is added to Git or downloaded by the default 2D migration browser sequence.

## Supplied package discrepancies

All nineteen source photos, five heroes and eight genuine-alpha ghosts exist and were visually reviewed. The expected source manifest/README/generation instructions/contact sheet are absent. The actual navigation files are source-named, full-size duplicates, not 512-square view-* files. These are documented limitations of the supplied package, not missing runtime roles: eight explicit roles are fully served using exact supplied photographs. No required ghost is missing.

NEW_VEHICLE_ASSETS.json records all forty source-package files, origin, dimensions, SHA-256, runtime copies and transparent/translucent pixel counts. NEW_VEHICLE_ASSET_AUDIT.md contains the complete old-to-new mapping and historical exceptions.

## Validation

- npm run lint: exit 0.
- npm run typecheck: exit 0 (one initial literal-union includes typing error was corrected before build).
- npm run test: 383 tests in 31 files; exit 0.
- npm run build: exit 0. Existing regular Next build only; no static-export or backend migration.
- Focused comparison browser run: four passed, four project-specific skips; exit 0. Final production functional regression: 177 passed, 99 project-specific skips, exit 0. The initial run had 174 passed/3 source-ratio assertion failures; after correcting those asset-specific expectations, the same complete selection passed.
- New comparison tests cover full referral/OTP-to-photography flow, every hero, twelve guides, eight view roles, eight recorder ghosts, live mock recording/review/track cleanup, summary/receipt and Admin light/dark previews, tenant overrides and failed-image fallback.
- Nine new unit tests cover exact source identity, alpha pixels, seven/twelve template invariants, view mappings, source/marker proportions, legacy pinned-template compatibility, actual Blob precedence/URL cleanup, default branding and narrow tenant-safe URL acceptance.
- Three existing evidence-framing checks initially assumed the retired source's 3:2 ratio. They now verify both the exact supplied fixture's intrinsic ratio and a matching uncropped evidence frame, retaining the contain/no-checklist/continuation checks. No screenshot assertion was replaced with a snapshot update.

## Visual review evidence

Local comparison artifacts (not historical baselines): .agent/reference-review/new-vehicle/after/. There are 67 comparison screenshots, plus source/hero/ghost contact sheets and before-after.jpg (old left, new right). Reviewed landing, readiness, consent, introduction/identity, overview, summary and receipt at 360×800, 390×844, 430×932 and 1440×960; all twelve guides/eight view roles/eight ghost angles at the primary mobile viewport; Admin images in both light/dark and template preview at desktop. Internal scrolling remains intentional; document horizontal/vertical overflow checks pass. Controls remain below the image and the sedan silhouette is contained. No screenshot baseline or reference PNG was changed.

Comparison contact sheets: customer-review.jpg, responsive-review.jpg, navigation-review.jpg, guide-review.jpg, ghost-screens.jpg and operations-review.jpg under the same review folder. Raw screenshots are authoritative if a sheet was generated before the final production rerun.

## Limitations and historical test debt

Historical visual baselines intentionally still depict older assets and can mismatch after this approved migration; they have not been silently regenerated. The full historical suite was previously non-green, as documented in FRONTEND_REMAINING_WORK.md. The final functional run filters those historical visual/obsolete expectations and retains its exact command in the ExecPlan. This is not a claim that all historical screenshot comparisons pass.

The separate historical approximately 4,010-pixel readiness mismatch and unrelated user changes remain out of scope and untouched. Legacy public assets/reference screenshots are retained as historical or explicit tenant-override resources, not default 2D fallbacks. Generic brand/functional icons, OTP phone artwork and an unmounted VideoOrbit legacy component are intentionally retained. The optional 3D model remains a Sportage. No endpoint/DTO, API integration, database, route, workflow, licensing, asset-generation or next-phase work was added.

## Final preservation audit

Route URLs, form field names, navigation labels, anchors, logos, partner identity, legal copy, fonts and brand tokens: unchanged. Only the approved asset URLs, image alt text and generic new-demo make/model label changed. Existing AppViewport/internal scroll architecture and controls-below-image layout are preserved. No stylistic em dash was introduced in customer copy. No canonical PNG/baseline, optional 3D file, GLB, backend contract or local credential is part of this migration. All 151 historical file hashes still match; prior deleted-file/directory entries remain unchanged.

## Git delivery

Implementation: 2531bc47985f56a3672623be59cd358314de6c80, feat: consolidate supplied sedan vehicle imagery. Pushed normally to origin/feat/unified-ui-admin-3d; remote HEAD matched. Prior functional audit checkpoint: e41df970dd425629c4c56f943715c99c72d7a236. No main merge, force push, source worktree cleanup or model publication. A final documentation commit records this validation. Standard Windows CRLF and Playwright NO_COLOR/FORCE_COLOR notices were non-blocking; no application console/page/resource failures remained in the successful asset scenarios.
