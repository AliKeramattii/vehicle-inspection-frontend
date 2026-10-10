# Phase 08 validation

Validated 2026-10-10. Implementation commit: `1b1e25c` (`feat: support reviewer-requested evidence replacements`).

## Actual command results

Every reported result has a completed process exit. The working-tree run includes unrelated user edits; the isolated export contains the intended staged source and HEAD versions of the unrelated dirty files.

| Command | Full working tree | Intended source export |
| --- | --- | --- |
| `npm run lint` | PASS, exit 0 | PASS, exit 0 |
| `npm run typecheck` | PASS, exit 0 | PASS, exit 0 |
| `npm run test` | PASS, 216 tests / 17 files, exit 0 | PASS, 216 tests / 17 files, exit 0 |
| `npm run test:e2e` | 141 passed, 86 skipped, 1 known readiness failure, exit 1 | PASS, 142 passed, 86 skipped, exit 0 |
| `npm run build` | PASS, exit 0 | PASS, exit 0 |

The final isolated full browser suite completed in 2.7 minutes and exited normally. Skips are explicit project/mobile applicability skips, including desktop copies of the customer additional-evidence scenarios. The working-tree failure is exactly the pre-existing 4,010-pixel readiness mismatch. It was neither fixed nor snapshotted again as a baseline. No failed command is reported as PASS.

Tooling warnings: Next.js infers the outer workspace root because the ignored nested validation export contains another lockfile. Playwright reports the existing NO_COLOR/FORCE_COLOR environment warning. No lint/type/build failure or application console/page/resource error was found.

## New coverage

36 unit cases cover configured requirement IDs/counts, ownership/version/item permission, mutation denial, immutable request identity, drafts/original history, shared photo/video queue linkage, candidate invalidation/stale callbacks, binary-upload policy, offline gating, durable idempotency, duplicate activation, failure/retry, uncertain acknowledgement and abandoned/racing lease recovery. Deterministic fixture identities are inspection-specific.

24 customer browser scenarios cover receipt notice, two-photo and mixed/video requests, reasons throughout reused capture, direct next requested item, native fallback, durable refresh, queued/uploading/failed/processing states, individual/all retry, draft replacement, original preservation, offline capture/resume, requested odometer-photo boundaries, invalid/stale/wrong-owner navigation, normal submitted locks, duplicate/uncertain resubmission, historical rounds and all target viewports. New scenarios assert console/page/resource failures and reject production 3D resource loading.

Earlier coverage remains stable: twelve-photo/seven-section configuration, markers, controls below the vehicle image, atomic replacement, automatic photo continuation, numeric odometer, video cleanup, durable/offline queue, initial idempotent submission and receipt refresh.

## Visual review and baselines

Reference 16 governs the request composition; current canonical front-plate/chassis assets and requirement IDs take precedence over historical CAP-14 content. Existing guidance/camera/review references govern those reused screens. All nine new deterministic states were inspected at 390×844 before adding snapshots. Request/guidance views and viewport/focus/touch behavior were reviewed at 360×800 and 430×932. No document overflow; long content has one internal scroll region and the bottom action remains reachable.

Only these new files were added under `tests/e2e/screenshots/additional-evidence.spec.ts/`:

- `additional-evidence-two-items-customer.png`
- `additional-evidence-one-complete-customer.png`
- `additional-evidence-reviewer-reason-customer.png`
- `additional-evidence-retake-guidance-customer.png`
- `additional-evidence-uploading-customer.png`
- `additional-evidence-upload-failed-customer.png`
- `additional-evidence-ready-customer.png`
- `additional-evidence-resubmitting-customer.png`
- `additional-evidence-resubmitted-customer.png`

No earlier baseline changed. An early fixture/coordinator race caused upload-progress/failure screenshots to change state before capture. Fixtures now install while the app is unmounted on an intercepted same-origin test document, then reopen the application. Both intended baseline files stayed unchanged; stronger assertions require both progress rows and retry-all state.

## Preservation and pre-flight

The original 22 unrelated tracked files match their starting hashes. Concurrent unrelated package/model work is excluded. No automotive asset, reference PNG, dependency, brand/logo, partner identity, existing URL, journey/section label, form field, anchor or legal copy changed in this task. Additional-evidence routes are additive. Production remains 2D.

Applicable TasteSkill pre-flight passes: preserve mode, established Vazirmatn/#2563EB, coherent light request/review and existing dark capture contexts, restrained orange attention, semantic status, visible focus, 44px targets, stable viewport/loading/error/offline recovery, no added decorative motion or static customer em/en dashes. No manual quality checkbox was restored. Marketing-only hero/bento/logo-wall rules do not override the application references.

Security/diff review found no credentials, secrets, unsafe raw HTML or real ASP.NET call. Original submission and media are immutable; authorized candidates remain separate by request/version. Server ownership/version transactions and real reviewer status are still planned backend responsibilities, not claims about this local mock.

## Scope and remaining limits

Request creation is development/test-only. Runtime transport/status remain deterministic mocks, with one active request and retained historical rounds. Formal resubmission requires connectivity; clearing browser storage still removes local mock records. No reviewer/admin/push service, asset pass or future phase was implemented. The unrelated readiness mismatch remains separately actionable user work.
