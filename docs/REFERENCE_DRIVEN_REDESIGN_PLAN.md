# Reference-driven presentation redesign

## Scope and reference decisions
Checkpoint 1 only. The current implementation is the functional baseline, not the visual target. The latest user brief overrides earlier exact legacy-PNG matching for this redesign. Mode: presentation redesign, brand/domain preservation. TasteSkill supplies audit/landing quality guidance; its own dashboard/multi-step limitations mean product accessibility and operational requirements take priority. Dials: variance 4, motion 2, density customer 4–5 / photography 6 / operations 6–7.

Actual Fleetr, Automotive Inspection, EGO and Shadcn repository preview images were inspected. Shadcn sidebar/header/settings/RTL source and MIT license were studied, not transplanted. Wreckbook direct image returned 404 and was not inspected; the user authorized continuing. See references/design/inspiration/README.md. No reference artwork enters public assets.

## Code audit / preservation baseline
Canonical: C:/Projects/vehicle-inspection-integrated, feat/unified-ui-admin-3d, starting HEAD 8eed67bf93d764f6984bbe12db78f2f4324fefd4. Approved refinement, admin, map and white-label branches are ancestors. Older optional-3D work was selectively ported; do not merge its original branch wholesale. Nineteen unrelated dirty files are excluded.

Routes, anchors, field names, existing Persian navigation/legal/auth copy, logo, sedan assets and tenant settings remain. Vazirmatn, LAB Emerald/Amber/Slate and semantic success/attention/error/pending/selection remain independent. Landing referralCode and OTP names unchanged. Settings retains brokerageName/appTitle/logo/favicon/contact/colors/images/template fields and eight asset slots. Reviewer retains review-reason, assignment permissions and revision-aware decisions. AppViewport owns 100dvh and internal scrolling. No new viewport system.

Server/mock truth remains TanStack Query/repositories. IDB owns durable media/queue/submission. Local selection remains transient. Twelve configured photos, manual odometer and video remain distinct. Controls remain BELOW image, markers use requirement IDs, atomic replacements/continuous progression remain. Neshan, Recorder V2, runtime branding, post-submit locks and licensed optional 3D remain unchanged. No source/GLB/API/static-export migration.

## Screen matrix
|Screen|Actual route / component|Inspiration|Observed weakness|Structural proposal|Reuse|Constraints|Checkpoint / risk|
|---|---|---|---|---|---|---|---|
|Landing|/; auth/landing-screen.tsx|Fleetr|Centered stack lacks clear start-task hierarchy|Distinct editorial intro, contained sedan, focused referral task and quiet benefit band|EntryBranding, CustomerHeroArtwork, ReferralForm, TrustFooter|Same auth/copy/assets and tenant slots|1; medium keyboard/fit|
|Photography|/inspection/[id]/capture; photography-overview.tsx|Fleetr + Automotive + EGO|Competing controls and dense two-row navigation|Vehicle-led stage, compact progress, explicit selected task and clear single filmstrip|OptionalVehicleNavigator, progress, cards, derived next task|Same IDs/state/markers, below-image controls|1; high viewport/selection|
|Site Settings|/admin/site-settings; site-settings-page.tsx|Shadcn source/preview|Global nav + tab rail + preview compress form; draft actions compete|Settings workspace with clear section intro, grouped fields, separate preview and publication context|SettingsNavigation, fields, asset control, NativeDialog, existing actions|Eight slots, permissions, draft/publish validation unchanged|1; high form/tenant|
|Evidence workspace|/reviewer/cases/[caseId]; reviewer-workspace.tsx|Shadcn + explicit evidence-first brief; Wreckbook unavailable|Three columns sacrifice viewer area; case context competes with decision|Compact case facts in the decision rail, enlarged evidence stage, filmstrip and pinned decisions; full facts in existing dialog|EvidencePreview, same decisions/queries/dialog/plate|Assigned cases only, exact revisions/reasons, no stock evidence|1; high permissions/decisions|
|OTP|/verify; auth verification|Fleetr|Audit only; later align entry hierarchy|Deferred|Existing OTP/form|Same credentials/LTR/timers|2; not implemented|
|Readiness/consent|/readiness, /consent|Fleetr + Automotive|Audit only; historical local mismatch excluded|Deferred|Capability service, Checkbox, CTA|Four checks, no eager permissions/legal changes|2; not implemented|
|Location/vehicle|/inspection/[id]/location, vehicle|Fleetr|Audit surrounding UI only|Deferred|Neshan boundary, VehicleCard, IranianPlate/PlateInput|No map/key/provider/domain edits|2; not implemented|
|Guidance/camera/review|capture/photo/[id]/guide,camera,review|EGO|Audit only|Deferred|Typed guidance, ghosts, four VIN suggestions, evidence review|Camera-only, no checklists, no destructive crop|2; not implemented|
|Video/upload/summary/receipt|capture/video/*, upload, review, submitted|Automotive|Audit only|Deferred|Recorder V2, queue, submission derivation|No fake progress, receipt code only|2; not implemented|
|Admin shell/dashboard/tables|/admin and implemented subroutes|Shadcn|Audit only beyond settings integration|Deferred|Current auth/nav/theme/repositories|No new dead nav/revenue charts|3; not implemented|
|Reviewer queue/retakes|/reviewer; additional-evidence routes|Shadcn + available refs|Audit only|Deferred|Assignments, decisions, exact-item requests|No bulk approval/new workflow|4; not implemented|

## Patterns / quality gates
Preserve shared headers/CTA/plate, true evidence viewer, query/repository boundaries, semantic state and scoped light/dark tokens. Retire equal-weight nested settings boxes, duplicated visible case facts and competing tiny photo navigation. No decorative widgets or fake interactions. Use existing custom icons/Lucide already installed; no icon library added. Typography is scoped and role-based; never globally rewrite successful screens. Motion remains minimal with reduced-motion respected.

## Screenshot / approval policy
BEFORE and AFTER candidate captures under .agent/reference-review/reference-redesign/{before,after}, same viewports. Customer 360x800,390x844,430x932; operations 1024x768,1280x800,1440x960, light/dark representative states. Screenshots are review artifacts, not approved baselines. No historical baseline updates. Stop after Checkpoint 1 for visual approval before further pages.

## Validation
Run lint/typecheck/unit/build and focused Playwright regression including auth/markers/selection, settings draft/publish and reviewer reasons/revision decisions. Record real exits and failures, inspect console/page/resource errors, document overflow and focus. Compare protected-file hashes before staging. Results recorded after implementation.


## Deferred screens: exact route/component map (no implementation in this checkpoint)

|Screen|Route / feature component|Reference / next presentation review|Reuse and functional boundary|Screenshot checkpoint / risk|
|---|---|---|---|---|
|OTP|/verify; auth/otp-screen.tsx|Fleetr entry hierarchy; current code is functional|OTP input, timer, auth challenge, same form names|2 / focus, timeout|
|Readiness|/readiness; readiness/readiness-screen.tsx|Fleetr + Automotive; four approved diagnostics already exist|Capability abstraction, approved assets; no eager permissions; unrelated local mismatch untouched|2 / permissions, local work|
|Consent|/consent; consent/consent-screen.tsx|Quiet grouped information; collapsed legal terms already exist|Checkbox, terms ARIA, sticky CTA and legal copy|2 / legal, consent|
|Location|/inspection/[id]/location; location/location-workflow.tsx|Fleetr map-first surround; SDK itself stays unchanged|Fixed pin, GPS, Persian address, coordinates, provider/proxy boundaries|2 / map, persistence|
|Vehicle identity|/inspection/[id]/vehicle; vehicle/vehicle-workflow.tsx|Fleetr vehicle hierarchy|VehicleCard, IranianPlate/PlateInput, exact fields, confirmed vehicle|2 / RTL segments, validation|
|Section detail|capture/section/[sectionId]; photography/photography-workflow.tsx|Automotive grouped tasks|Configured section order, accepted completion vs attention|2 / exact IDs, continuation|
|Guidance|capture/photo/[requirementId]/guide; photography/photography-workflow.tsx|EGO task/framing distinction; existing requirement-owned guidance preserved|Twelve guides, four VIN-location suggestions, selected requirement|2 / physical orientation|
|Camera|capture/photo/[requirementId]/camera; photography workflow + camera service|EGO focused framing; ghost separation already works|Live camera only, no gallery, cleanup, ghost omitted from saved Blob|2 / permissions, durability|
|Photo review / odometer|capture/photo/[requirementId]/review; photography workflow + capture-package|Evidence-first comparison; current no-checklist UX preserved|Atomic replacement, contain frame, numeric odometer editing, auto next|2 / accepted evidence|
|Video record|capture/video/record; photography/photography-workflow.tsx + capture-package/video-capture.tsx (Recorder V2)|Existing recorder kit; matching cleared orbit clip still a separate asset boundary|Live record, pause/timer, stream cleanup, no fake tracking/ghost video guide|2 / recorder lifecycle|
|Video review|capture/video/review; photography/photography-workflow.tsx + capture-package/video-review.tsx|Large contained playable evidence|Durable accepted/draft video, atomic replacement, no autoplay|2 / media durability|
|Capture package review|capture/review; photography/photography-workflow.tsx + capture-package/capture-package-summary.tsx|Automotive grouped readiness|12 photos + numeric reading + video remain separate|2 / package derivation|
|Upload Center|/inspection/[id]/upload; upload/upload-workflow.tsx|Clear task/status hierarchy|Shared durable media queue, offline/retry, no fake verification|2 / queue identity|
|Final summary|/inspection/[id]/review; submission/summary-workflow.tsx|Final review grouping|Derived capture/upload readiness, same edit routes/locks|2 / submission gates|
|Receipt|/inspection/[id]/submitted; submission/receipt-workflow.tsx|Calm completion, existing tenant art|Persisted submission, reference ID here, honest queued status|2 / reload, no duplicate submit|
|Additional evidence|additional-evidence/[requestId]/[[...step]]; additional-evidence/additional-workflow.tsx|Scoped requested tasks; current recovery already implemented|Exact-item authorization, original evidence, supplemental revisions/queue|4 / permissions, atomicity|
|Admin dashboard|/admin; admin/admin-pages.tsx|Shadcn actual supported metrics; current repositories audited|Authorized real/mock data, no invented business statistics|3 / permissions|
|Admin branding/policies/webhooks/users/permissions|/admin/{branding,policies,webhooks,users,permissions}; admin/admin-pages.tsx|Shadcn forms/tables, audit only|Existing handlers and field names; no dead navigation|3 / policy, access|
|Template list/editor|/admin/templates, /admin/templates/[templateId]; template-list.tsx, template-editor.tsx|Shadcn work surfaces|Pinned versions, template-driven photo IDs; no migration|3 / existing inspections|
|Assignments|/admin/assignments; review-operations/assignment-page.tsx|Shadcn accessible operational table|Role-scoped assignment; reviewer cannot assign self|3 / authorization|
|Reviewer queue|/reviewer; review-operations/reviewer-queue.tsx|Shadcn source; Wreckbook image remains unavailable|Assigned cases, functional search/status filtering|4 / authorization|

These are continuation mapping and constraints, not claims that the deferred screens were redesigned or visually approved.


## Checkpoint 1 delivery and validation

Implemented: separate landing welcome/start task; photography heading within progress, unchanged-size contained artwork with less surrounding scene padding, below-image controls, one larger native filmstrip; horizontal settings categories with a validated live draft customer preview and existing publication boundary; evidence-first two-column reviewer workspace with facts/details inside its scrollable rail and pinned decisions. Full address/VIN/history remain in the existing case dialog. No business rules or service contracts were replaced.

Important files: auth/landing-screen.tsx + landing-redesign.css; photography/photography-overview.tsx + overview-redesign.css + photography-progress.tsx + simplified capture-journey-header.tsx; admin/site-settings-page.tsx + settings-navigation.tsx + settings-brand-preview.tsx + settings-redesign.css; review-operations/reviewer-workspace.tsx + workstation-redesign.css; playwright.redesign.config.ts + tests/e2e/reference-redesign.spec.ts. The existing reviewer dark-theme assertion now targets the moved case-context component, with the same semantic color expectation.

Final actual script results (all separate exits recorded locally in final-script-exits.json):

|Command / scope|Result|Exit|
|---|---|---|
|npm run lint|No errors or warnings|0|
|npm run typecheck|Passed|0|
|npm run test|33 files, 400 tests passed|0|
|npm run build|Passed ordinary Next build; not a completed static export migration|0|
|Focused functional Playwright regression|66 passed; existing REVIEW_ADDITIONAL/REVIEW_UPLOAD comparison-review flags used, no baseline writes|0|
|Checkpoint captures/interactions|4 passed in development; 4 passed in production mode|0|
|Final production marker/navigation/viewport|13 passed|0|
|Final production operations decisions/theme/navigation|3 passed|0|
|Existing deep settings save/preview/publish/reset|1 passed|0|
|Existing explicitly gated local optional mobile-GLB interactions|1 passed; rotation/zoom/views/12 markers/toggle reuse/evidence context; no model changes|0|

All three customer viewports (360x800,390x844,430x932) and all three operations viewports (1024x768,1280x800,1440x960) were captured. Additional 320x740,390x500 keyboard-height and844x390 landscape landing captures passed focus/action/overflow checks. Light/dark operations, empty/partial photography, selected shot navigation and draft editing were inspected. Main/camera state remains real mock/repository-driven data. No physical-device testing claimed. No page/console/resource errors occurred in checkpoint candidate tests.

### Problems found and resolved

- Initial capture selector matched image cards too: scoped to the actual vehicle artwork.
- A CSS edit introduced an unclosed media block: fixed; subsequent capture runs and builds pass.
- New duplicate draft-status wording confused an existing strict locator: header now distinguishes draft editing from the footer save status.
- A reviewer theme test targeted the removed full-height facts column: updated to the new case-context surface, preserving the same color assertion.
- Pre-existing local schema imported vehicle-assets.ts, blocking TypeScript: applied the user's earlier explicit suffix-only authorization. All other local schema edits are preserved; the schema is not included in this checkpoint commit.

### Existing validation debt (not hidden as success)

An early broad run exited 1: 48 passed / 8 failed. Five failures were historical additional-evidence image comparisons (existing assets/colors differ from those old baselines), one was the pre-existing receipt test targeting .receipt-hero[src] after the earlier wrapper refactor, and two were the duplicate-status/old facts-selector issues fixed above. The subsequent functional run exited 0 with 66 passes, using the existing screenshot-review flags. Full historical screenshot regression is not declared green. No stored baseline was regenerated, updated or approved. Readiness's known unrelated mismatch remains untouched. The obsolete receipt selector remains outside this checkpoint. Older upload/map previews still emit Next development aspect-ratio warnings; the new preview's eager-loading hint was corrected. Environment NO_COLOR/FORCE_COLOR warnings are harmless test-runner output.

### TasteSkill applicable pre-flight / preservation audit

PASS: explicit brief/mode/dials; actual accessible references inspected; original sedan/logo/Vazirmatn and runtime LAB theme preserved; no new em-dash in customer copy; purposeful neutral surfaces; restrained semantic radii; no new animation/dependency; below-image controls and touch targets; native form/keyboard/ARIA behavior; no duplicate selection repository; no copied reference artwork/source; bounded AppViewport and safe-area actions; original IDB/revisions/queue/submission permissions remain. Existing theme switch, authorization, exact-item retakes, camera-only capture, stream cleanup and continuity pass regression.

Generic marketing-only TasteSkill checks (logo walls, bento count, global single-accent rule, generic image-generation preference) do not apply to these product workspaces and do not override the explicit LAB semantics, existing evidence or supplied sedan. Enabled primary actions use existing contrast-approved brand/success pairs; invalid tenant themes remain subject to the unchanged form validation. A full independent WCAG conformance certification is not claimed.

Changed existing URLs: none. Existing nav/section labels: none. Form names: none. Existing anchors: none. New landing-title ID is an ARIA heading association, not a route/navigation change. Logo/legal copy: unchanged. Capture IDs/count/config: unchanged. APIs/backend: unchanged. Automotive images/GLB: no changes. Protected-file manifest contains 799 paths: all remain byte-identical except the explicitly authorized local schema import suffix; that file and all 19 initial dirty paths are excluded from staging.

### Review artifacts and preview

Local-only captures: .agent/reference-review/reference-redesign/before, after (same development flags), after-production (production 2D-only), comparisons (four side-by-side sheets). They are review evidence, not approved snapshots. The downloaded inspiration images stay ignored/local-only. Wreckbook remains HTTP404 and was not inspected.

PowerShell preview:

```powershell
Set-Location C:\Projects\vehicle-inspection-integrated
$env:DEV_NESHAN_ENABLED='0'
$env:NEXT_PUBLIC_VEHICLE_3D_PREVIEW='1'
npm.cmd run dev -- --port 3114
```

The map flag selects local mock configuration for this visual preview only; no env file or proxy architecture changed. Optional 3D remains development+loopback gated; production remains 2D. Landing: http://localhost:3114/ . Photography: http://localhost:3114/inspection/insp_demo/capture (requires existing referral/OTP/session). Settings: http://localhost:3114/admin/site-settings . Reviewer: http://localhost:3114/reviewer/cases/insp_demo (requires a submitted inspection assigned to the selected mock reviewer). For an empty browser, complete the existing mock flow and assign through /admin/assignments; no bypass was added.

Recreate deterministic review artifacts with the server running: npm.cmd run test:e2e -- --config playwright.redesign.config.ts . This uses existing test fixtures, real UI navigation and isolated browser storage. Production smoke preview: npm.cmd run build followed by npm.cmd run start -- --hostname 127.0.0.1 --port 3140. These are local review servers, not a deployment/static-export claim.

**Checkpoint 1 is ready for user visual review. No later checkpoint has started.**

## Git delivery

Implementation: 53dbbbc3435d60c8d68bf60bc77d8dc3a3b85ab2, `feat: redesign representative inspection screens`. Normal push to origin/feat/unified-ui-admin-3d succeeded and the remote hash was verified. This documentation follow-up records validation/delivery only; visual approval and later checkpoints remain pending. All initial local user modifications and historical baselines remain outside the commits.
