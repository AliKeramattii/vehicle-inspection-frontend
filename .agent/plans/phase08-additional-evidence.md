# Phase 08: scoped additional evidence

## Goal
Allow a submitted customer to replace only explicitly requested photo/video evidence, upload durable candidates, and idempotently resubmit a supplemental package without mutating the original submission.

## User-visible behavior
Receipt notice → reference-driven request list → existing requirement-specific guidance/camera/review → next requested item → upload readiness → supplemental submission → persistent confirmation. Original photos, video, numeric odometer and inspection facts stay protected. Sending remains the current journey stage.

## Current state
Phase 07 is committed on main (c12a071). Photos and video already use IndexedDB and a shared revision-aware upload coordinator. Submission receipts persist independently of ephemeral mock authentication. The global edit guard is fail-closed. Twenty-two unrelated tracked changes, including readiness visual drift, are preserved and excluded.

## Constraints
Production remains 2D, seven sections/twelve photos plus separate odometer/video. No new camera implementation, real API, reviewer/admin, assets or 3D. Preserve AppViewport, routes/labels/fields/legal copy and earlier baselines. Reference 16 governs request composition; existing guide/camera/review references govern reuse. TasteSkill is subordinate to product requirements.

## Implementation
1. Snapshot existing changes and inspect references/services.
2. Add typed request lifecycle, narrow mutation authorization and IndexedDB request/history/acknowledgement repository. Each request version owns a separate media namespace.
3. Reuse media stores through scoped adapters and existing queue/transport with request linkage metadata. Derive candidate/upload readiness once.
4. Add thin additional-evidence routes, request list, receipt notice/timeline and shared capture presentation navigation overrides.
5. Add durable idempotent supplemental submission, uncertain-response recovery, offline gating and historical rounds.
6. Add domain/browser/regression and manually reviewed visual coverage. Run actual scripts, preserve original-change hashes, focused commit/push/remote verification.

## API impact
Planned/mock request retrieval, replacement registration, supplemental resubmit and status contracts; request/version/item/candidate linkage, ownership and stable idempotency. No runtime HTTP.

## Testing
Unit request authorization/readiness/history/idempotency/replacement/queue tests. Deterministic photo/video/offline/failure/refresh/stale-request Playwright scenarios. New request-state snapshots only after manual inspection at 390×844 and responsive checks at 360×800 and 430×932. Root full suite reports the known readiness mismatch separately; validate intended source without unrelated work if needed.

## Acceptance criteria
- Requested-only mutation enforced below UI, including ownership and active version.
- Submitted originals and accepted candidates survive drafts/failure/retry.
- Candidate capture, upload and resubmission remain separate.
- No body overflow, accessible actions, reviewer reasons visible throughout.
- Idempotent durable resubmission, receipt history and multiple rounds.
- Actual lint/typecheck/unit/e2e/build results; unrelated work excluded; normal push verified.

## Progress
- [x] Read requirements, repository instructions, relevant references and existing architecture.
- [x] Implement request/domain/persistence/scoped capture/upload/resubmission.
- [x] Implement customer routes and reference-driven presentation.
- [x] Add 36 unit cases and 24 customer browser scenarios; inspect all nine intended new baselines and responsive request/guidance views.
- [x] Validate and review preservation/security.
- [ ] Commit and push the focused implementation; verify remote HEAD.

## Final technical validation
All commands ran to a real process exit. On the full working tree: lint 0, typecheck 0, unit 0 (216 tests / 17 files), Playwright 1 (141 passed, 86 intentionally skipped, only the pre-existing readiness screenshot fails with exactly 4,010 pixels), build 0. No readiness fix or baseline update was made.

The exact staged source was exported under the ignored `.agent/reference-review/phase08-validation` directory, restoring HEAD versions only inside that export for the unrelated dirty files. Its lint, typecheck, unit (216), full Playwright (142 passed / 86 skipped), and production build all exited 0. The final full browser run completed in 2.7 minutes without a runner stall. It covers all 24 new customer scenarios and previous-phase regressions, including marker/control layout, recording cleanup, upload recovery and initial submission.

Console/page/resource failures are assertions in the new browser scenarios. The nested validation export causes a Next.js workspace-root inference warning; Playwright also reports the existing NO_COLOR/FORCE_COLOR warning. Neither is a lint/type/build failure or a production UI change.

## Discoveries and decisions
- Reviewer scope is enforced by the route guard and a re-read/transactional mutation claim below presentation. Each immutable request version has its own media namespace; initial submission data never changes.
- Candidates use the existing photo/video stores and upload coordinator. Binary upload completion permits processing without claiming reviewer approval. Drafts retain accepted credit but block resubmission.
- Recovery rechecks lease ownership/expiry transactionally so an older recovery read cannot release a newer capture or submission claim.
- Deterministic reviewer fixture IDs include the inspection identity so separate submitted inspections cannot collide in the request store.
- Initial upload-progress/failure screenshots were timing-dependent because fixtures wrote media while the coordinator was mounted. Fixture installation now uses an intercepted same-origin empty document, then opens the application; both intended snapshots are unchanged.
- The working-tree suite's only known failure is the existing 4,010-pixel readiness mismatch. Intended staged source is exported without the 22 unrelated edits for full clean-source validation; no prior baseline is updated.
- Concurrent unrelated package/model work appeared during implementation and is also excluded. Original 22 tracked file hashes remain unchanged.

## Preservation and visual pre-flight
- Existing URLs, journey/section labels, form fields, anchors, logo/partner treatment and legal copy: unchanged. Additional-evidence descendants are additive routes.
- Vazirmatn, #2563EB, restrained orange attention and bright automotive reference direction are preserved. No new dependencies, icons, automotive imagery or production 3D.
- Applicable TasteSkill pre-flight: preserve mode; variance 3–4, motion 2, density 5–6; consistent light list/review and existing dark capture context; readable primary actions; semantic status/focus/44px targets; one internal scroll region; loading/error/retry/offline states; no added em/en dashes, quality checklists or decorative animation. Marketing-only hero/logo-wall/bento rules do not apply to this focused reference-driven application.
- Reference 16 and existing guidance/camera/review references were compared manually. All nine new states were reviewed at 390×844, with bounded/focus/touch checks at 360×800 and 430×932. The canonical samples and current twelve-photo IDs intentionally take precedence over historical CAP-14 imagery/copy.
- Security/diff review: no secret/private credential, raw HTML, real API request or unrelated user work staged.
