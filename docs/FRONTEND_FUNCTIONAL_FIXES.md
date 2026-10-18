# Frontend functional fixes, 2026-10-15

## F1 / P1: Site Settings conflict recovery reset stale form data
Reproduction: open settings in two tabs, edit both, save the first, then save the second. Its CAS rejection correctly preserves edits, but “بارگذاری نسخه تازه” followed by confirmation reset the name to the original seed rather than the first tab's latest saved draft.
Root cause: the action read state.draft/state.revision before asynchronous query invalidation; React Hook Form does not update defaultValues when query props change.
Correction: reload returns the awaited fresh workspace; only a successful read resets the form/revision. Failure retains current edits and shows retry feedback. Background refetch never silently overwrites a dirty form. Existing tenant validation, role restrictions and CAS remain.
Files: src/features/admin/site-settings-page.tsx; tests/e2e/frontend-completion.spec.ts.
Evidence: new two-tab regression failed with expected latest name / received original partner; corrected scenario passes, including subsequent save and refresh.

## F2 / P1: reviewer outbox acknowledgement recovery
Reproduction: retake request commits, but its acknowledgement/link transaction is interrupted; reviewer rejects a second photo before recovery. The old outbox considered both decisions unlinked, then refused the different batch while the first request was active. A later round could re-request the first already-delivered item.
Root cause: only the generated batch ID was checked, with no reconciliation against persisted immutable request items.
Correction: reconcile exact decision ID, original evidence, target and original namespace against existing requests before deriving pending work. Link recovered decisions transactionally, retain later decisions until the active round ends, and never discard evidence/history.
Files: src/features/review-operations/repository.ts; tests/unit/frontend-functional.test.ts.
Evidence: interrupted acknowledgement regression failed before correction; recovery and subsequent exact second-target round pass after correction.

## F3 / P1: retake request identity could collide
Reproduction: distinct requirements share a legacy revision string and are rejected in separate rounds. A request ID derived only from case + revision strings identifies both as the same request.
Correction: new request IDs include full existing decision identities (case + requirement + revision). Existing requests remain readable and reconciled by exact item identity; no migration/rewrite is needed.
Files: same repository and unit test. Two distinct targets sharing a revision create distinct requests with correct item linkage.

## Test/documentation debt
The approved shared EntryBranding removed .entry-partner; White-Label checks now locate the existing brokerage mark, preserving the same identity, tenant, title, persistence and isolation assertions. No historical snapshot was rewritten. API documentation incorrectly still said three OTP attempts and volatile confirmed facts; it now reflects the existing five-attempt mock and durable facts, without changing runtime authentication/API behavior.
An attempted broader test-edit batch was rejected by automatic approval review as potentially weakening reference coverage. That batch did not run. The historical reference assertion is retained; independent new coverage asserts the approved capture-header absence and durable receipt LTR presence instead.

## Validation
See FRONTEND_COMPLETION_AUDIT.md for final actual command exits, browser findings and remaining historical baseline debt. No redesign, canonical imagery replacement, backend implementation, static migration or production model publication.
