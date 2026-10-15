# Premium UI/UX validation record

Date: 2026-10-15, Asia/Tehran. Base: eb8a1832e21dd6465bd73b1d91a1876c53569547. Isolated branch: feat/premium-ui-ux-refinement. Worktree: C:/Projects/vehicle-inspection-design-refinement.

## Scope and preservation
PRESERVE mode, installed design-taste-frontend framework, existing Tailwind/CSS primitives and Lucide. No new dependencies, route changes, backend, MSSQL, static-export migration or automotive asset replacement. Application identity is the supplied color SVG; brokerage identity remains independently configurable. Original inspection package, revisions, IndexedDB, upload transport, submission locks, exact retakes, Neshan adapter/proxy and optional-model licensing gates are unchanged.
Seven historical worktrees retain their recorded HEADs; 160 recorded file hashes match the previous preservation snapshot. Original readiness local changes/baseline remain untouched. Source unified initially had six local Playwright configs; later globals.css and the development model route also changed there. None was copied, overwritten or staged in this feature branch.

## Actual checks and process exits
- npm.cmd run lint: exit 0, final run has no ESLint warnings. Two newly introduced unused/anonymous-export warnings were corrected. PowerShell redirection formats npm notices on stderr as NativeCommandError records; actual npm process exit is 0, not a lint/typecheck failure.
- npm.cmd run typecheck: exit 0.
- npm.cmd run test: exit 0, 372 tests / 29 files.
- npm.cmd run build: exit 0. This remains a standard Next build with existing dynamic routes, NOT proof of static export or a production Node-free release.
- Existing functional regression command: npm.cmd run test:e2e with auth, location-vehicle, photography-markers, viewport, unified-admin, unified-recorder, unified-readiness, upload, submission and additional-evidence specs, customer project. Excluded reference-led/screenshots/visual and the five previously documented implicit retake screenshot scenarios. Final exit 0, 65 passed. Full log: .agent/reference-review/premium/regression-final.log.
- New preview interaction/customer review suite: seven scenarios passed and exited 0. Production candidate capture passed and exited 0. Final combined production comparison: npm.cmd exec playwright test -- --config playwright.premium-production.config.ts, exit 0, 8 passed with nine screenshot comparisons. Complete log: .agent/reference-review/premium/premium-production-final.log.
- Actual licensed local mobile GLB on refined localhost:3120: exit 0, 1 passed. One model load, twelve canonical fixed markers, rotation/zoom, selection/guidance/physical views and controls-below boundary verified. Production restricted-model 404 check passed in the 65-scenario suite. No restricted model or model screenshot is tracked.
- Actual authorized Neshan on localhost:3120: final exit 0, 1 passed. Real base tiles/visible coverage, Persian reverse address, pan/GPS/manual edit and refresh verified without interception. Initial coverage check failed transiently; sanitized responses included PNG 200 and optional 204, no console error. The unchanged live check passed on rerun; no map implementation/test weakening was made.

## Bugs found and corrected
1. Existing flex layout collapsed the readiness hero. The same main internal scroller now preserves the full hero and four reachable quiet device rows, with the existing sticky CTA.
2. Existing higher-specificity CSS forced the narrow Admin header back to flex. A scoped grid now separates branding/navigation from theme/role controls.
3. New primary text styling overrode the recorder stop button's semantic red. Lower-specificity opt-in styling preserves camera-specific contrast (red/rose ratio approximately 5.84).
4. Added receipt support caused 41px internal overflow at 360x800. It now reuses the existing notice disclosure footprint. The unchanged receipt-fit regression passes.
5. Duplicated Reviewer case status caused a strict locator failure. A single persistent workspace-header status remains; context retains the other facts.
6. Assignment screenshot fixture navigated before its async save completed. It now waits for the persisted reviewer cell.
7. Offscreen lazy-image decode made the new screenshot harness wait indefinitely. It now decodes only visible images. One earlier exploratory wrong-selector worker and one lazy-image candidate worker were explicitly stopped after identifying task-owned processes; unrelated runners were untouched. Corrected suites exit normally. This was not resolved by increasing timeout or weakening assertions.
8. Default favicon preview pointed at a missing asset. Trusted approved app-logo fallback now renders; upload validation/storage unchanged.
9. Readable dark accent originally targeted only the ordinary surface, leaving selected navigation below AA. It now derives against the least-contrasting selected surface; tests cover white/soft/selected surfaces and multiple brand colors.

## Visual review and provenance
Primary references: supplied logo SVG and theme GIF (132 frames), canonical 03/18/19/20 plus the complete reference contact sheet and existing customer references. The GIF was inspected as frames, never rendered as the control. The logo source is copied unchanged to public/brand/application-logo.svg; only transparent margins are cropped by the reusable proportional component.
Before/after artifacts: .agent/reference-review/premium/before and after. Initial before images came from this clean isolated base; supplementary customer/model before images came from the source unified working tree at capture time and may reflect its local edits. These are comparison artifacts, not canonical references.
Customer sizes: 360x800,390x844,430x932. Operations:1440x960,1280x800,1024x768,390x844. Reviewed landing/OTP, readiness top/bottom, consent, location, vehicle, photography, guide, camera/review, odometer, RecorderV2 ready/65%, video review, upload, summary/receipt, Admin/settings/light/dark, queue/workstation and optional GLB controls. Body/document overflow assertions pass; existing internal scrolling owns longer content. Direction controls remain below the image/viewer.
Only nine NEW baselines under tests/e2e/screenshots/premium-visual.spec.ts:
- premium-landing-customer.png
- premium-readiness-customer.png
- premium-admin-overview-customer.png
- premium-site-settings-light-customer.png
- premium-site-settings-dark-customer.png
- premium-settings-images-customer.png
- premium-receipt-customer.png
- premium-reviewer-queue-customer.png
- premium-reviewer-workspace-customer.png
Candidates were rendered and inspected before copying. The final dark/caption changes affected exactly two candidates and those were re-inspected individually. No blanket snapshot-update command and no historical snapshot overwrite.

## Historical visual debt
The original approximately 4,010-pixel readiness mismatch is outside this branch and untouched. Five historical retake snapshot mismatches remain documented in UNIFIED_VALIDATION.md. Historical screenshots also have intentional identity/layout differences after this approved logo/refinement work; these were not backfilled automatically. The full historical visual suite is NOT certified green. New refinement screenshots and functional checks are reported separately.

## TasteSkill pre-flight and preservation audit
PRESERVE; variance3–4, motion2, customer density5/operations6. Existing custom design system, Vazirmatn, RTL and configured brand primary retained. Dark/light scoped to operations; camera dark stage and customer-brand preview are intentional product contexts. Status success/attention/failure remains independent. Semantic buttons, visible focus, system preference, >=44px controls, disabled/busy states and native dialog focus/Escape verified. Reduced-motion removes transitions. No new visible stylistic em-dash copy. Marketing-only no-table/no-progress/no-overlay rules do not override inspection requirements. Focused accessibility checks are not a formal WCAG certification.
Existing URL/nav-label/form-name/anchor/legal preservation: no route, journey/section label, registered field-name or legal-copy change. The approved app logo changes; brokerage identity is preserved. The image field label is clarified to “لوگوی کارگزاری”; its registered identity.logo path is unchanged. Receipt reuses RuntimeSupport and its existing support anchor.

## Remaining limitations
Physical iOS/Android media, camera switching/storage pressure and assistive-technology device validation remain unverified. GLB commercial rights remain unresolved and gates remain intact. Historical visual debt remains; asset-family continuity is separately recommended, with no canonical regeneration. Existing dependency/tool warnings (NO_COLOR/FORCE_COLOR, local R3F Clock deprecation, development proxy Node module-type) were not hidden or fixed via breaking upgrades. No PWA/static export/backend-production completion claim.

## Local preview
cd C:/Projects/vehicle-inspection-design-refinement
npm.cmd run dev:neshan-proxy
In a second terminal at the same path: npm.cmd run dev -- --port 3120
Customer: http://localhost:3120/
Admin: http://localhost:3120/admin
Settings: http://localhost:3120/admin/site-settings
Reviewer: http://localhost:3120/reviewer
Ignored authorized local settings/model fixtures are required for live-provider/optional-GLB checks. Never commit them.
