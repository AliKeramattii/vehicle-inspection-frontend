# Local reviewer assignment and decisions

## Boundary
features/review-operations contains domain, IndexedDB persistence, repository, query hook and thin presentation components. No ASP.NET calls or real shared reviewer authentication are enabled.

The browser's persisted submitted records are imported into inspection-review-operations/workspace. New summaries pin the exact PhotographyTemplate; legacy summaries are accepted only when their namespace matches the known base template. Metadata references existing durable evidence and upload jobs, never duplicate Blobs. No synthetic customer evidence is shown as real evidence.

## Roles
مدیر سایت (platform-admin): existing Admin permissions, assignment mode/capacity, all locally imported cases and safe reassignment.
کارشناس (reviewer): only cases whose reviewerId equals the mock actor ID, their evidence and exact-version decisions. Cannot read the Admin repository, publish settings/templates or alter capacity/assignment.
Legacy template-editor/viewer checks remain for compatibility.
Mock identity selectors are explicitly labelled; ASP.NET must enforce real authorization later. Browser-local data is not secure shared multiuser storage.

## Assignment
Admin sets manual or random mode, edits maximum active capacity and sees workload, awaiting count/history.
Active workload excludes review-complete; awaiting customer retake still consumes capacity.
Random mode selects only active eligible reviewers with remaining capacity, using injected RNG for deterministic tests. If all are full, cases remain awaiting-assignment.
One reviewerId per case; duplicate same assignment is idempotent; existing assignee requires explicit reassignment. Full/inactive/unknown reviewers and completed-case reassignment are rejected by the service.
Single IndexedDB read/write transactions serialize local capacity check and change. This is not server-side concurrency across users/devices.

## Evidence and decisions
The workspace shows actual persisted photo/video, confirmed vehicle/plate/VIN/location/odometer and the submitted reference. Only selected media is loaded; object URLs are revoked. Video does not autoplay. Missing exact-revision media has honest retrieval-unavailable feedback, never a reference image masquerading as capture.

A decision identifies case, requirementId (or video-360), evidence revision and evidenceId. Reviewer must own the case and target the current uploaded revision. Rejection requires a concise reason. Duplicate identical decisions are idempotent; conflicting decisions for an already-decided revision are refused. Reassignment preserves the decision/history record.
Binary upload completion and reviewer approval are distinct. Approving does not manufacture upload/verification status. All current required media approved derives review-complete.

## Rejected-item requests and recovery
Durable rejection decisions form an outbox. flushRequest creates an idempotent URL-safe request through the existing RequestRepository, scoped only to rejected items and their original evidence IDs. A one-photo rejection never asks for all twelve. Original submission/evidence remain intact.

The existing Phase08 repository permits one active immutable request per inspection. If another request is active, a new rejection remains in the outbox until that request is resubmitted/resolved; synchronizeSubmittedCases retries it on opening/refetching operations. It does not silently append to an immutable active request. Multiple undelivered rejects can be grouped into the next request.

After supplemental submission, current uploaded request revisions replace the operations view's current media references, preserve historical decisions and require new reviewer approval. A green replacement upload is not approval. Original durable submission and local-good evidence are not rewritten or deleted.
No aggressive polling, storage cleanup or full reviewer result-notification pipeline was added.

## Screens and validation
/admin/assignments: capacity/mode, all cases, workload, assignment and history.
/reviewer: own cases only, search/reference/vehicle/plate/time/status/evidence count.
/reviewer/cases/[caseId]: large contained evidence frame, facts, exact-version approve/reject/reason, optional guide and history.
AppViewport is reused; operations columns/tables have intentional internal scrolling. Reviewed at 1440x960, 1280x800, 1024x768.

Tests cover full capacity, injectable random selection, duplicate assignment, safe reassignment, unauthorized access, exact revision, required reason, idempotent one-item request, accepted evidence preservation and reviewer/upload state distinction. Browser smoke performs a real local submission, assignment, own-case guard and customer request handoff.

## Future backend
Use planned reviewer cases/evidence/decision/Additional Evidence contracts in API_CONTRACT.md. Backend must enforce tenant scope, reviewer identity, atomic capacity/assignment, revision optimistic concurrency, stable idempotency and evidence retrieval. Keep INSPECTION_{InspectionId} private storage intent unchanged. No browser-local role selector is a production authorization mechanism.
