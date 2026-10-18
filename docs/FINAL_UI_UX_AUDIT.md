# Final frontend refinement audit

Mode: PRESERVE. Starting branch feat/unified-ui-admin-3d, HEAD e36054d. No new product workflow, framework, repository, asset family or backend is proposed.

## Baseline and preservation
The canonical integrated worktree has nineteen unrelated tracked modifications: six browser configurations, ten hero artwork copies, the development model route, globals.css and site-settings.schema.ts. They are excluded from task commits. An old untracked public/brand/logo.webp is also excluded. Local credentials and runtime settings remain ignored. A local hash manifest records these files before editing.

The exact approved /branding/logo.webp is transparent, square, and rendered without masks or recoloring. Customer colors remain runtime tenant values. Admin retains its six navy/blue/cyan primitives; Reviewer retains its own scoped theme. Vazirmatn, native RTL, plate ordering and LTR codes remain.

## References inspected
Actual Fleetr, EGO, Automotive Inspection and Shadcn Admin images were inspected locally. They support vehicle-first composition, clear task progression, restrained operational navigation and evidence-first review. Reference 07 supplies photography hierarchy; its legacy vehicle, photo totals and 3D are not production requirements. Wreckbook's page is accessible but the original artwork is not locally available; no claim of inspecting it is made.

## Route and component inventory
Customer: / (referral), /otp, /readiness, /consent; /inspection/[inspectionId] children location, vehicle, capture, sections/[sectionId], photos/[requirementId] guidance/camera/review, video capture/review, capture review, uploads, summary, submitted and additional-evidence. Existing inspectionRoutes remains authoritative; no URL or parameter changes.
Admin: dashboard, inspections, assignments, reviewers, templates, site-settings and existing audit/configuration areas. Reviewer: assigned queue and /reviewer/[caseId] workspace. Preserve role checks, exact-item decisions and revision ownership.
Shared primitives include AppViewport, CoBranding/ApplicationLogo, JourneyStepper, BottomStickyCTA, NativeDialog, buttons, TextInput, InlineAlert, IranianPlate and PhotoImage. Existing photography/capture/upload/submission helpers own all readiness/count/status derivation.

## Findings and implementation decisions
1. Photography is vehicle-led, but selected requirement context is weak and card/status type is compressed. Add an explicit selection/status/frame context and a next-required shortcut using existing selection and helpers. Keep small markers on image and the entire controls row below it. Keep one internal scroll region rather than shrinking the car at short heights.
2. Upload Center shows correct binary counts but hides processing/verification/failure distinctions in rows below the fold. Add a compact derived state breakdown and precise retry scheduling feedback. Keep odometer outside the media denominator, mocks clearly labeled and accepted evidence untouched.
3. Dialog close glyphs are optically weak. Use an existing inline SVG icon and explicit connected-trigger focus restoration; retain native focus trapping and Escape handling.
4. Site Settings already has working draft/publish/history boundaries and the approved palette. Improve the color editing workspace with paired native swatches and existing HEX fields, plus per-role labels. Do not add a second theme store or change field paths.
5. Reviewer has a useful large evidence stage and fixed decision actions. Improve selected evidence metadata and distinguish binary upload, processing/verification and human decisions. Preserve sample comparison, revisions and exact-item reasons.
6. Setup, guidance, review, video and receipt already use correct assets and durable flows. Improve scoped typography, readable grouping, framing metadata and explanatory next steps. No legal, authentication or camera contract changes.

## Functional recovery evidence
Five live Neshan/recovery tests passed with exit 0: decoded visible base tiles, Persian reverse geocoding, persisted settings inheritance, denied camera recheck/continuation and legacy local settings recovery. No critical current map/readiness defect reproduced; no speculative SDK/configuration rewrite is justified. Unit baseline: 454 tests in 37 files, exit 0.

## BEFORE evidence
The final-ui-review browser suite captures setup, photography, live mock camera/review, video, uploads, summary/receipt/retake, Admin light/dark settings and Reviewer queue/evidence. Files are ignored under .agent/reference-review/final-ui-ux/before. Customer sizes 320x568, 360x800, 390x844, 430x932, 768x1024; operations 1024x768, 1280x800, 1440x960, 1920x1080. Capture metadata records document bounds and action geometry. A capture-helper lazy-image wait was corrected; a submitted-state fixture must use an isolated test for retake because the real edit guard correctly rejects re-entering setup.

## Quality gates and risks
No historical baseline overwrite, including the unrelated readiness mismatch. Avoid editing protected globals/schema/artwork. Verify actual twelve camera captures through video, upload and receipt; seeded media is allowed only for deterministic UI states. Run lint/typecheck/unit/browser/build with real exit codes. Test static export separately and report any existing boundary failure. Physical iOS/Android/PWA checks require real hardware and must be marked NOT DONE here.

Design dials: variance 3–4/10, motion 2/10, photography density about 6/10. Reduce competing labels, not required information or touch sizes. No decorative motion or library additions.
