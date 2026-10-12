# Customer and operations UI refinement

## Scope and preservation
Implemented on `feat/ui-modernization-2d-3d`, based on White-Label/Admin commit 9c75417 in a separate worktree. The original dirty Phase09 worktree, including its unrelated readiness visual mismatch, is untouched. No static export, ASP.NET, MSSQL or deployment migration is part of this work.

Preserved: Persian RTL, Vazirmatn, runtime theme, AppViewport, seven configurable sections and twelve photos, separate odometer/video, durable media and upload queue, submission/edit locks, Additional Evidence and atomic replacement. Physical vehicle direction is never mirrored.

## Identity and success
CoBranding reuses the established platform-car mark and runtime brokerage name/logo. No separate approved replacement application-logo asset was provided. Missing brokerage logo uses the existing shield mark and readable name. Removed entry slogan; support uses the configured telephone via tel:, with honest unavailable copy when missing.

Primary remains runtime theme driven, default #2563EB. Genuine completion checks use #059669 independent of primary. Pending is gray, attention orange, active selection a separate ring. Photo-local completion, binary upload and reviewer approval retain separate labels and state. Readiness diagnostics are mock capabilities, not permission grants or media analysis.

OTP mock permits five invalid entries, retaining 12345, A4K9P2, paste/autofill, automatic verification and resend cooldown. This is local policy, not a backend rate-limit guarantee.

## Asset mappings
Source bundle: references/assets/ui-refinement-assets. Its standalone Vite sample is reference source only, never installed, mounted or run.
Runtime navigation: public/ui-refinement/navigation:
- front.webp, rear.webp, right.webp, left.webp, top.webp: physical view controls
- body.webp, cabin.webp, engine-specs.webp: category navigation
Runtime icons: public/ui-refinement/icons:
- readiness-checklist-icon.svg: device readiness heading
- camera-outline-icon.svg: camera readiness
- map-pin.svg: selected location
- license-plate.svg / manual-plate.svg: plate confirmation/correction
- retry.svg: overview reset
- stability2.svg / alignment2.svg: camera guidance
GuidanceIcon uses Lucide React at a consistent 22px / 1.8 stroke, keyed by existing requirement-owned guidance topics.

## Location and vehicle
Neshan SDK is isolated in lib/map/neshan-adapter.ts. Configure a public, domain-restricted Neshan web-map key as NEXT_PUBLIC_NESHAN_MAP_KEY in local deployment configuration, then restart/rebuild Next.js. This is a public map credential, never a private reverse-geocoding/API token. No key is included.

With a configured SDK: map moves under a fixed pin, moveend changes selected coordinates, explicit locate requests real browser GPS, and a separate point and accuracy polygon update with every fix. No initial permission prompt. Manual map movement resets selected-point accuracy to 0 (unknown), rather than claiming GPS precision. Private reverse geocoding remains a future adapter; no invented address is shown. Without the key, the screen clearly says unconfigured, retains coordinates and allows manual address entry. Actual tile authorization cannot be validated without the key.

Ten stable colors (white, black, silver, gray, charcoal, blue, red, green, beige, brown) persist through the mock repository. Confirmed location/vehicle metadata lives in inspection-confirmed-facts IndexedDB. Failed persistence cannot commit a changed vehicle in memory; existing submitted edit guards remain.

## Photography and live media
The vehicle remains dominant. The structure remains image/viewer, controls BELOW, categories/context, shot cards, BottomStickyCTA. Directional controls never overlay the car. Guide-only headers omit the inspection reference; the identifier remains in domain/other inspection headers. Secondary links have explicit touch-friendly affordances. The progress ring has room for its value/caption.

PhotoCamera captures only from the active getUserMedia stream into a Blob. VideoCapture uses the existing MIME-detecting MediaRecorder service. No customer gallery/File Manager/native file input remains, including requested retakes. Unsupported/denied/insecure devices get honest recovery guidance, not imported media. Browser live capture reduces ordinary gallery substitution; it cannot prove authenticity.

The supplied 360 kit contributes the top-view car and speed/level/light/guide-book icons. Actual live camera is the background during recording. The orbit is neutral instruction only; elapsed time is a real recorder timer. No invented 65%, physical position or green quality checks. Continuous-recording service does not expose pause, so no inert pause control is rendered. Review/confirm/re-record, IndexedDB durability, accepted-video preservation, URL/stream/timer cleanup and the shared upload pipeline remain.

## Operations
See REVIEWER_ASSIGNMENT.md. New /admin/assignments, /reviewer and /reviewer/cases/[caseId] reuse bounded viewport, identity and custom primitives. Existing Admin Site Settings/template versioning, immutability, role checks and audit behavior remain. Two primary product labels are مدیر سایت and کارشناس. Legacy template-editor/viewer roles remain for compatibility and regression checks; they are not silently elevated.

## Visual review and tests
Customer: 360x800, 390x844, 430x932. Operations: 1440x960, 1280x800, 1024x768.
Local screenshots are in .agent/reference-review/modernization (ignored). No screenshot baseline was regenerated. Existing earlier-phase snapshots deliberately still represent prior branding/approved imagery and need explicit review before a future visual-baseline acceptance pass.

Focused browser checks cover live photo/video, unavailable recording, persisted color, controls and touch sizes, theme-independent success, actual mobile GLB, fixed upload-aware markers, no re-download on toggle, own-case authorization and one-item rejection handoff. SDK unit fixture covers movement, explicit GPS, updated circle/point and disposal. A mock map fixture is not validation of real Neshan tiles.

## TasteSkill pre-flight
PRESERVE mode. Design variance 3-4, motion 2, customer density about 6. Established system and canonical composition remain authoritative.
Applicable checks: one light application theme (separate intentional dark camera route), readable primary CTA, visible keyboard focus, 44px interactions, reduced motion, bounded shell/internal scrolling, explicit loading/error/empty states, truthful copy, no new UI framework or decorative animation. No new stylistic em-dash was introduced in visible UI.
Marketing-only prescriptions and the generic ban on image overlays do not override functional inspection markers, RTL, existing typography or the supplied references.

## Limits
Public Neshan key and a distinct new app-logo asset were not supplied. Reviewer authorization/concurrency is a local mock, not production security. The restricted GLB is development-only and not shipped. Existing canonical vehicle families remain unchanged. The original readiness mismatch is intentionally separate.

## Validation record (2026-10-13)
- npm run lint: exit 0.
- npm run typecheck: exit 0.
- npm run test: exit 0, 284 tests / 23 files.
- npm run build: exit 0.
- npm run test:e2e -- --config playwright.refinement.config.ts: exit 0, six applicable scenarios passed, six viewport-inapplicable cases skipped. Includes the actual local restricted GLB. A missing local GLB skips that one development-only scenario.
- The same focused scenarios against the production build: exit 0, five passed, seven skipped (including the intentionally denied GLB scenario).
- Twelve selected existing OTP/capture/replacement/offline/Additional Evidence regressions: exit 0. Snapshot comparisons were excluded for this behavioral run; no snapshot was rewritten.
- Production model endpoint: 404 even with local development flags present. No GLB in production output-file traces or public folders; normal production photography has no 3D toggle.
- Manual production flow/screenshots: no page/console errors and no document overflow. Operations screenshots: 1440x960, 1280x800, 1024x768; customer composition: 360x800, 390x844, 430x932.

To rerun focused development checks, close any manually running server on port 3110 and use the command above. The config owns its server and restores the existing Windows System32 PATH handling for reliable taskkill cleanup. UI_REFINEMENT_ORIGIN may point to a deliberately external development server; that server must have the documented preview flags to test GLB behavior.

During validation, an early fixture refreshed before vehicle persistence completed, and hard navigation dropped the intentionally transient mock session. Tests now wait for successful confirmation and follow existing client links. Reviewer plate segments and assignment table flex shrink were corrected after visual inspection. Mixed build/development artifacts produced intermittent malformed development scripts; the final clean development-cache run passed. Server teardown initially lacked the existing Windows PATH workaround and was corrected; final commands exited successfully.

Warnings still visible: upstream Three.Clock deprecation through R3F, existing Next Image dimension warnings in upload/summary preview components, and terminal NO_COLOR/FORCE_COLOR notices. Dependency installation reported seven high audit findings; no forced or breaking dependency changes were made. The full historical visual suite was not represented as passing: intentionally changed identity/success/live-video presentation needs separately reviewed snapshot acceptance.

No automotive asset replacement, original-readiness fix, real permission analysis, backend integration or deployment occurred.

## Git delivery
Implementation: 93d9266c7aec2311492f88293ccc4cf1ab689c93, `feat: modernize inspection UI and reviewer workflow`, on `feat/ui-modernization-2d-3d`. Pushed normally to the existing origin and verified with `git ls-remote`; remote HEAD matched. This branch starts from approved White-Label/Admin commit 9c75417. Phase 09 remains independently recoverable; main and all other worktrees are untouched. Original-worktree preservation recheck: all 24 records match, including pre-existing deletions. Restricted GLB/environment files, historical baselines and canonical photo-guide assets are excluded.
