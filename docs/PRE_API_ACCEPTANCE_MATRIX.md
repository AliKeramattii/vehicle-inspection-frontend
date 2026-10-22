# Pre-API acceptance matrix

Evidence date: 2026-10-21 (Asia/Tehran). Start 8a9c418, canonical integrated worktree. PASS below means the named local/mock/browser behavior was actually exercised; it never means real production authorization/SSO/forwarding. Physical-device tests are separate. Logs/captures remain in ignored .agent/reference-review/pre-api/.

## Current commands
Baseline lint/typecheck/unit/build: exit0, 480 units. Reproductions: six failed before fixes, exit1. Final lint/typecheck/unit: exit0, 493 tests/44 files. Final standalone normal build: exit0. Targeted retake/submission/upload functional run: 57 passed, exit0 with existing review flags; normal full-suite comparisons remain enabled and failures disclosed. Existing customer-only baseline acceptance: 8 passed/3 desktop skips, exit0. Focused two-project final-product + pre-api-readiness: 17 passed/17 intentional project skips, exit0. Normal production-backed full browser: 248 passed/191 skipped/45 failed, exit1, 484 cases. All 45 failing test identities and first error signatures match the preceding task exactly; zero new failure identities/signature changes. No snapshot was updated.

| Scenario | Preconditions | Expected result | Test/procedure | Actual evidence and status | Outstanding dependency |
|---|---|---|---|---|---|
| New referral/OTP/setup | Mock source, fresh context | Source phone read-only; correct required setup | auth, preparation, viewport specs | Functional coverage passes in current full run; historical visual case failures separate. PASS behavior | Real identity/OTP BACKEND REQUIRED |
| Returning draft | Prior scoped valid OTP session and local draft | Resume same inspection | final-product.spec; pre-api-context units | PASS current focused/full | Server source session |
| No identity/direct private route | No valid prior session | Safe verification recovery, no private content | final-product.spec | PASS | Server resource auth |
| Same customer, two source requests | Same tenant/subject, different trusted sourceRequestId | Separate current attempts and sessions | pre-api-context.test.ts | Reproduced before fix; PASS after fix | Source-site contract/production context |
| Legacy stored default session | Old key and valid unexpired prior OTP | Restore default only, never another request | pre-api-context.test.ts | PASS | Production sessions differ |
| Tenant boundary | Two independent mocked deployments | Separate settings/inspection IDs; foreign private route denied | final-product.spec, final-product-settings/lifecycle units | PASS mock tests | Server tenant isolation BACKEND REQUIRED |
| Submitted return/tracking | Durable mock receipt | Same tracking, copy and reload/status | final-product.spec, submission.spec | PASS functional paths | Server tracking generation |
| Exact media retake | One named request | Only affected item editable; original survives | additional-evidence.spec, final-product.spec | PASS nonvisual current paths; 57-test supplemental functional run passes, exit0 | Versioned secure server revisions |
| Vehicle field correction | Exact plate/color/year task | Only requested editor, proposal persists | final-product.spec | PASS including cold plate review | Backend command/version |
| Full rejection/new attempt | Rejected case and public reason | Explicit empty linked attempt; old preserved | final-product.spec, lifecycle units | PASS | Server transaction/idempotency |
| Stale lifecycle projection | Final status then older review update | No reopening/downgrade | pre-api-context.test.ts | Reproduced before fix; PASS | Backend CAS/version |
| Revision replay | Multiple completed correction rounds | Latest acknowledged target remains current | final-product-operations.test.ts | Reproduced before fix; PASS | Backend canonical revision/version |
| Final-case replacement lock | Whole decision already committed | Sync does not mutate evidence snapshot | final-product-operations.test.ts | Reproduced before fix; PASS | Server lock/version |
| Individual versus whole approval | Assigned Reviewer, current required revisions | Separate final approval gate | final-product.spec, operations units | PASS | Production permission/assignment checks |
| Staff/public note separation | Internal note plus public rejection | Customer receives public reason only | final-product.spec, operations units | PASS | Server DTO/access control |
| Approved/pending/failed/forwarded | Deterministic lifecycle fixtures | Truthful distinct states; ack required for forwarded | final-product.spec, pre-api-context units | PASS simulated UI | Actual delivery BACKEND REQUIRED |
| Admin search/filter/assignment | Authorized sample actors, submitted case | Tracking/phone/plate/status links and assigned scope | final-product/unified-admin/admin specs | PASS functional checks | Real staff/API |
| Settings publication/halo | Two scoped settings, draft edit | Preview first, publication persists, visual reset only | final-product.spec, site-settings/unit tests | PASS functional checks | Cross-device publication BACKEND REQUIRED |
| 2D composition/markers | Production default route | Controls below image, interactive markers, correct target | viewport, marker/capture tests, pre-api-readiness.spec | PASS functional bounds at six sizes | Optional 3D not required |
| Odometer/video/local package | Deterministic media fixtures | Separate photo/data/video, accepted replacement retained | unit capture/video/queue; current browser package/vehicle-assets checks | PASS nonvisual paths; four package screenshot cases FAIL before later assertions | Physical codecs/camera NOT TESTED |
| Queue/offline/retry | Persisted mock media/jobs | Refresh/resume/backoff/current revision safety | upload.spec and unit upload queue | PASS functional paths; six historical visual cases FAIL | Real transport BACKEND REQUIRED |
| Receipt idempotency/edit guards | Uploaded fixture package | Duplicate prevention, durable receipt/locked edits | submission.spec + final-product.spec | PASS functional paths | Server transaction/auth |
| Six requested viewport sizes | Mock customer workflows | No document overflow; actions/recovery usable | pre-api-readiness.spec | PASS 320x568,360x800,390x844,430x932,768x1024,1440x960 | Emulator/layout proof only |
| Keyboard/safe area/reduced motion | Reduced-height/browser media fixtures | Focus/actions reachable, bounded shell | viewport.spec; existing media tests | PASS current browser/unit checks | Android/iOS manual NOT TESTED |
| Neshan live tiles/address | Authorized local configuration/services | Visible complete base imagery; Persian real reverse lookup | neshan-live.spec | PASS: 3 real-provider tests, exit0; actual visible tiles and Persian reverse HTTP200 | Provider/network/authorized domain |
| Optional licensed GLB | Explicit loopback dev gates | Loads only after toggle, preserves controls/markers | ui-modernization.spec optional mobile GLB | PASS: 1 loopback GLB interaction test, exit0 | Commercial use BLOCKED by current license |
| Actual output:export | Existing routes + temporary output export | Complete Node-free artifact | Actual npm run build probe | FAIL exit1: missing generateStaticParams for runtime capture route | Approved route/image migration |
| Static nested deep-link refresh | Verified complete static artifact | Direct URL/reload safe with authorized ID | Static host/ASP.NET/IIS procedure | BLOCKED: export fails, no complete artifact | Hosting migration approval |
| Offline cold launch/installability | Real deployed manifest/SW | Defined update/cache/offline policy | Physical hosting/PWA checklist | NOT TESTED; no active SW/manifest implementation | Separate approved PWA work |
| Commercial optional model | Rights clearance | Authorized commercial deployment | Model config/docs + official license | BLOCKED; commercialCleared=false | Cleared model or rights grant |
| Matching sedan orbit guidance | Cleared 4-5s clip | Separate video instruction, not still ghost | Existing walkaround slot/fallback | BLOCKED asset slot; no asset replaced | Product-approved cleared clip |
| Production SSO/SMS/forwarding | Deployed authenticated backend | Real session/delivery acknowledgement | Proposed API/SSO/outbox contracts | BACKEND REQUIRED | Brokerage/auth/backend teams |

## Physical Android Chrome and iPhone Safari procedure (NOT EXECUTED)
1. Use approved HTTPS deployment (or trusted secure test origin), not insecure LAN HTTP; record device/OS/browser/version and configuration version without credentials.
2. Verify source identity and two separate insurance requests/vehicles, OTP role, denied/expired/foreign session recovery, draft resume and submitted tracking return.
3. Exercise browser chrome/orientation/keyboard/200% text zoom and safe areas. Check first/last actions without body overflow; one intended content scroll region. Check Persian labels, LTR plate/VIN/reference and focus with keyboard/VoiceOver/TalkBack.
4. Explicitly permit/deny location, pan/zoom real Neshan, fixed center pin and GPS; confirm Persian address/edit persistence. Do not expose keys in capture/network exports.
5. Capture all required photos including VIN choices; verify sample/ghost outside evidence and no mirroring of physical directions. Background/exit camera and confirm OS camera indicator stops.
6. Enter/edit Persian/Arabic/Latin kilometers, zero, malformed input and keyboard dismissal. Replace the odometer photo while preserving numeric reading until deliberately edited.
7. Record/play actual supported video MIME, pause/resume/camera switch where supported, route away/lock-screen/permission failure, accepted replacement/discard. Confirm native playback and all tracks/timers release. Do not infer real coverage from orbit UI.
8. Toggle offline during upload, refresh/reopen with local media, restore connection, individual/retry-all; check no duplicate acknowledgements and no lost accepted originals. Do not uninstall/clear storage as a retry mechanism.
9. Submit once, double tap/reload, inspect receipt/tracking, exact correction and explicit new attempt. Real forwarding success only from actual backend acknowledgement.
10. Review permissions/tenant isolation on the deployed server separately; local mock/emulation cannot establish this. PWA install/update/cold offline only after that feature is implemented and approved.


## Eleven-photo policy acceptance supplement

New policy: ten fixed + exactly one of four existing VIN/spec suggestions = eleven photographs; numeric odometer and required video stay separate. Each choice independently passes captured-identity, upload and readiness tests. New browser coverage checks all four live photo paths, refresh, 100dvh widths, upload/submission/Reviewer, exact requested correction, retained original and Admin eleven-slot presentation. Explicit v1 fixtures retain historical twelve-photo/receipt/decision coverage. Future API checks must validate group/alternative/revision identity and one active accepted upload. Actual command counts, screenshots, known visual debt and exits are recorded in PERFORMANCE_OPTIMIZATION_REPORT.md; no backend acceptance is claimed.
