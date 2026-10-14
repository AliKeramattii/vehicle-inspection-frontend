# Unified validation record
Date:2026-10-15 (Asia/Tehran). Branch feat/unified-ui-admin-3d. See WORKTREE_INTEGRATION_PLAN.md and UNIFIED_APPLICATION.md.
Ignored review artifacts: .agent/reference-review/unified; live-provider artifacts: .agent/reference-review/neshan-live. No earlier screenshot baselines updated.

## Commands and real process exits
- Before changes: typecheck,346unit tests and production build exited0.
- npm.cmd run lint: exit0, no lint warnings.
- npm.cmd run typecheck: exit0.
- npm.cmd run test: exit0,365tests in28files. Additional final readiness/foundation rerun17tests exit0.
- npm.cmd run build: exit0 after correcting the new test callback type.
- npm.cmd exec playwright test -- --config playwright.unified.config.ts:7passed, exit0 (all eight assets, custom receipt/refresh, all Admin routes/dark reviewer decisions, four readiness checks, production model404, V2 pause/target/review/error).
- npm.cmd run test:e2e -- tests/e2e/photography-markers.spec.ts tests/e2e/viewport.spec.ts --project=customer:12passed, exit0.
- npm.cmd run test:e2e -- tests/e2e/upload.spec.ts tests/e2e/submission.spec.ts tests/e2e/additional-evidence.spec.ts --project=customer --grep-invert 'visual|reviewer reason persists|requested front plate guidance|failed replacement uploads can retry together|all binary uploads including processing|resubmission confirmation and receipt status':36passed, exit0.
- npm.cmd exec playwright test -- --config playwright.unified-dev.config.ts:1passed, exit0; actual local Sportage mobileGLB,12fixed pins, rotation/zoom, view/shot synchronization and guidance-first entry.
- Same development check reusing UNIFIED_DEV_ORIGIN=http://localhost:3114:1passed, exit0.
- UI_REFINEMENT_ORIGIN=http://localhost:3114 npm.cmd exec playwright test -- --config playwright.refinement.config.ts --project=customer --grep 'optional mobile GLB':1passed, exit0; capture before upload, current-job upload/retake, physical views and one download across2D/3D toggles.
- NESHAN_LIVE_CHECK=1 npm.cmd exec playwright test -- --config playwright.neshan-live.config.ts:1passed, exit0, no interception. Visible base coverage checked;36base PNG200 responses, optional overlay204s, no console/page errors or lookup warnings. Private local proxy logged real reverse upstreamHTTP200. Pan/navigation cancellations produced ERR_ABORTED diagnostics, not missing base coverage.
- UNIFIED_ORIGIN=http://localhost:3114 new Admin suite:3passed exit0; same-origin local publication works alongside real API-seeded Neshan settings. Readiness separately passed at all widths.

## Problems corrected
Existing context validator rejected newly persisted local image references; now only correctly tenant-bound immutable references pass. Binary validation has bounded/truncated-header guards. Test Node/DOM File typing and exposed browser callback typing corrected.
Manual review found inherited dark recorder pseudo-overlay and a three-item readiness last-child span; both removed only in the unified implementation. Four diagnostics now form exactly two rows at360/390/430.
New browser fixture initially reset confirmed mock facts through full document navigation; corrected to existing client flow. Live-map helpers now wait for and choose the real map when configured. Permission fixtures explicitly grant camera alongside GPS; they do not call getUserMedia. Unsupported recorder is introduced at recording time rather than defeating the new required readiness check.
Old retake tests expected one-step start; updated for explicit camera activation. Recorder timer suppresses per-second live-region announcements; recording state remains announced.

## Historical screenshot debt, intentionally unchanged
The initial broader41-case run returned exit1:34passed, five screenshot mismatches and two obsolete recorder actions. After correcting actions/capability fixture,36selected functional cases exit0. The five historical screenshot comparisons remain unresolved and excluded from that functional command:
- additional-evidence-reviewer-reason-customer.png
- additional-evidence-retake-guidance-customer.png
- additional-evidence-upload-failed-customer.png
- additional-evidence-ready-customer.png
- additional-evidence-resubmitted-customer.png
At least the297-pixel reviewer-reason difference is inherited backlink border/weight treatment: identical .photo-back rule exists in base84539b7 refinement.css. No additional-evidence styling was changed. Other historical differences were not accepted by blanket snapshot updates. Full historical visual suite is NOT reported as passing.
The separately known original readiness mismatch remains untouched and unstaged. New four-check diagnostics are an explicitly approved change in the new worktree; original files and readiness baseline remain intact.

## Visual/security/preservation review
Inspected supplied V2 idle/active/paused/target/completed/failed/contact-sheet, canonical03/07/15/17/20/21/22, rendered Admin light/dark, reviewer dark, customized receipt, four diagnostics, real GLB/guidance, V2 ready/65%/paused/100%/review/error. Mobile360x800,390x844,430x932 and Admin/model1440x960. No document overflow in asserted screens; important actions visible; one internal scroll region where needed. Controls remain below vehicle image.
Eight1024x680 WebPs have alpha and exact supplied bytes; pin is byte-identical to the supplied asset. No canonical automotive asset replacement. Camera tests use deterministic stream/recorder fixtures, never pretend fixture imagery is actual user evidence.
Seven source worktrees retain original HEAD/status;160recorded file checks match. No reset/stash/overwrite. No tracked .env.local, private settings or GLB; staged files scanned against actual authorized key values without printing them.
Applicable TasteSkill preflight: PRESERVE, RTL/Vazirmatn, scoped brand/theme contrast and status semantics,44pxcontrols, focus/keyboard, reduced motion, restrained feedback, loading/recovery, AppViewport, no new visible em-dash copy. Marketing-only no-overlay/no-progress rules do not override required camera/inspection UI.
URLs/nav labels/anchors/legal copy preserved; added image inputs and fourth capability are intentional. Customer reference hidden via shared header, retained only receipts and authorized operations. No 3D mounted/downloaded on default production capture route.

## Remaining limitations/warnings
Physical iOS/Android, camera switching, long-record storage pressure and hardware interruption tests pending device access. Commercial GLB rights unresolved; local-only gates remain. No production backend or completed static export claim.
Known dependency/tool warnings: deprecated eslint9.39.5 package, blocked unrs-resolver install script, NO_COLOR/FORCE_COLOR, local R3F THREE.Clock deprecation, local Node module-type warning. Supplied reference Markdown retains intentional hard-break trailing spaces/trailing blank line; source package preserved. Git CRLF normalization warnings are informational. No dependency breaking changes made.

## Git delivery
Focused commits:5f5e613 integration base;da2c78d Admin/branding/readiness;d66c2c5 reviewer theme;8b7e61f marker synchronization;88d84a6 recorderV2;9e2f436 validation/Admin guide. Normal push of feat/unified-ui-admin-3d succeeded; remote9e2f4364292acc4c6be29f70c6f0363fbbbf12a5 matched local before this final record commit. Existing source worktrees unchanged. One frontend listener3114 and one loopback tool process8787/8788 remain; temporary test servers are stopped. No Git history rewrite or restricted asset publication.
