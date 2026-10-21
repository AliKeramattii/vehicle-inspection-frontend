# Inspection lifecycle and transitions

## Compatibility

`src/features/inspection-status/lifecycle-model.ts` maps customer/business lifecycle without replacing existing submission, upload, verification or request enums. It is metadata only: media stays in the existing evidence stores. `status-service.ts` is an explicit mock status adapter; a future authenticated status provider must replace it for submitted truth.

| Lifecycle | Meaning | Customer return |
| --- | --- | --- |
| DRAFT | Capture or confirmed facts incomplete | Last safe local step; fallback from confirmed facts |
| UPLOAD_PENDING | Existing capture-package helper says complete | Upload Center; media denominator remains template-derived |
| SUBMITTED | Durable submission receipt, no assigned decision yet | Tracking receipt |
| UNDER_REVIEW | Assigned review, no final decision | Tracking/status |
| CHANGES_REQUESTED | Exact media request and/or field task | Exact media list or status with field editors |
| REJECTED | Whole-case rejection with public reason | Reason and explicit new-attempt confirmation |
| REVIEW_APPROVED | Assigned Reviewer separately approved whole case | Approval; no delivery claim |
| FORWARD_PENDING | Server is sending or retrying | Pending acknowledgement; no recapture |
| FORWARDED | Delivery acknowledged with ID and timestamp | Reviewed, approved and received by brokerage |
| FORWARD_FAILED | Delivery failed after approval | Delivery recovery information; no recapture |

## Transition ownership

Capture/upload completion derives from Phase-05/06 helpers. Initial submission and durable receipt stay owned by the submission service. Staff assignment starts review. Individual evidence decisions never finalize the entire case; all current required media must be approved before the separate whole-case approval. `ReviewRepository.finalize` checks assignment, readiness and unresolved fields and records actor/time. Final rejection supersedes active correction requests without deleting their records or originals. New empty attempt creation is explicit and idempotent relative to the rejected current attempt.

Field tasks progress requested → submitted → approved. Each task owns a field, public reason, actor/time and typed proposal. An approved proposal updates the staff reviewed snapshot; the original submission snapshot remains preserved. Outstanding tasks alone unlock no other submitted field.

The frontend exposes no forwarding button that pretends a server delivered evidence. `caseLifecycle` requires acknowledgement and time before showing forwarded. Mock fixtures may project these outcomes explicitly for tests; there is no external delivery transport. Future backend must enforce legal transitions/version checks and publish a customer-safe projection, never staff notes.

## Return and persistence

`inspection-lifecycle` IndexedDB v1 stores metadata and current inspection index keyed by tenant/subject/sourceRequestId (legacy default keys preserved). Staff workspaces use tenant-specific records, preserving the legacy demo `current` key. Customer access requires the current verified mock session and matching inspection ID; a tracking string or private route alone does not authorize access. Auth restoration is a scoped, expiring mock-session convenience, not a substitute for future server sessions. No new backend entity is mirrored into Zustand; only the existing transient auth workflow remains there.

Safe resume paths cannot change origins or inspections. Review/status queries include runtime deployment context. Focus/navigation re-reads status without aggressive polling. Media and accepted replacements retain existing durable stores. A rejected attempt's previous blobs are never copied into the new attempt.

## Known mock limits

Separate production deployments require server-enforced authorization, tenant databases/scoping, concurrency/version control, notification delivery, new-attempt transactions, secure media retrieval and forwarding outbox recovery. Browser mock workspaces are not a multi-user security system. Previous evidence can be compared where its durable local namespace still exists; missing old media is disclosed rather than fabricated.

Current pre-API consolidation: see [FRONTEND_API_REQUIREMENTS.md](FRONTEND_API_REQUIREMENTS.md), [INSPECTION_STATE_MACHINE.md](INSPECTION_STATE_MACHINE.md) and [PRE_API_FINAL_READINESS_REPORT.md](PRE_API_FINAL_READINESS_REPORT.md). These supplement the existing mock boundaries; they do not implement production services.
