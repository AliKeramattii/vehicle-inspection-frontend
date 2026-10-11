# Brokerage private evidence storage (authoritative planned contract)

## Confirmed invariants
**Storage folder pattern: INSPECTION_{InspectionId}.**
**No CustomerId in filesystem paths.**
**No image/video binary storage in MSSQL.**
**MSSQL stores only paths/references and metadata.**
**Media files belong to the brokerage's private filesystem.**
**Media retrieval requires backend authorization.**
**Retention/cleanup belongs to the backend.**

The first inspection-specific directory beneath each private brokerage root is INSPECTION_<canonical-safe-inspection-id>. Example: INSPECTION_BDI-8F31K2/EV-001-rev-1.webp. A different inspection gets an independent folder even when the customer/vehicle is the same. Customer relationships remain in MSSQL for business ownership/reporting, never folder naming. Any historical customer-folder example is superseded by this specification; unrelated historical docs are not silently rewritten.

## Root and path generation
ASP.NET receives a private root via server configuration (Storage__RootPath). It is never returned in public Site Settings or ordinary Admin forms. Do not publish this root via Next public, IIS static file browsing or Nginx alias.
Resolve canonical inspection ID from trusted database records after authentication/tenant/ownership checks, then validate a restricted storage-safe identifier. Display IDs that are unsafe require a stable server storage identifier, preserving INSPECTION_.

src/lib/storage/inspection-storage-contract.ts is a pure frontend handoff/test specification, not a filesystem service or authorization control. Identifiers allow ASCII letters/digits/underscore/hyphen (1..80); reject separators, traversal, encoded traversal, drives, spaces and empty IDs. Server filenames are EvidenceId-rev-N plus signature-validated extension. Never concatenate a user filename/path. Canonical containment check must resolve full root/target and reject escape, symbolic-link/reparse traversal and arbitrary directories. Backend collision policy must use unique evidence revision and exclusive/idempotent creation; never overwrite current good revision.

## Proposed MSSQL metadata
EvidenceId, InspectionId FK, RequirementId nullable for video, EvidenceKind(photo/video-360), RelativeFilePath, MimeType, FileSizeBytes BIGINT, Revision positive int, UploadStatus, CreatedAt, UploadedAt, DeletedAt, RetentionUntil.
Unique (InspectionId,EvidenceId,Revision), unique normalized relative path within tenant storage. CustomerId/tenant ownership joins through inspection. No media BLOB/VARBINARY/MAX/FILESTREAM column. Integer odometer uses its separate inspection data entity/endpoint, not a file row.
Store relative normalized forward-slash paths only; absolute physical roots never leave server. Extension follows actual accepted signature and MIME (WebP/JPEG/PNG photos, negotiated WebM/MP4 video); do not force every browser to WebM.

## Upload lifecycle and consistency
Keep one photo/video queue and existing durable Blob key/revision/idempotency:
1. Authenticate and authorize inspection/requirement/replacement request.
2. Register stable evidence/revision with idempotency key; return upload contract.
3. Stream bounded binary transfer to a private staging file, with byte/size limits and content/signature validation.
4. Reserve collision-safe final filename under INSPECTION_{InspectionId}.
5. Flush/validate, publish file by safe move, register relative path/metadata in MSSQL.
6. Complete idempotently; uploaded/processing/verified meanings remain separate.
7. Reconcile partial file/database failures using pending metadata, staging manifests and compensation. Filesystem writes and SQL transactions are not automatically atomic.
Interrupted individual files may restart unless resumable transfer is negotiated. Do not Base64 media in JSON or copy large videos eagerly. Odometer is synchronized separately.

## Retrieval and revision safety
GET /api/inspections/{inspectionId}/evidence/{evidenceId}/file selects an authorized revision server-side, checks authenticated tenant/inspection/role and retention availability, then streams bytes (range support for video). Do not accept physical/relative path from caller; no public directory listing. Return 404/410 for unavailable/deleted revisions without leaking another tenant.
Replacement rev2 is independent of rev1. Keep original/current accepted pointer valid until replacement confirmation according to existing domain/request semantics. Additional Evidence stores request linkage; no overwrite-in-place. Cleanup cannot delete still-referenced original/submission/retake evidence.

## Retention
Cleanup disabled until brokerage-approved policy. No deletion immediately after upload/submission; keep media throughout review, retake, resubmission and required legal/contract period. Server-only retention config includes CleanupEnabled=false and nullable RetentionDaysAfterClosure until approved. Backend jobs check terminal status, active requests, holds/references and retention date; audit outcomes, handle missing files/partial deletion and reconcile metadata. Frontend has no cleanup scheduler.

## Required ASP.NET integration tests
Traversal/encoded paths/reparse escape; wrong tenant/owner/revision; content-vs-MIME/size limits; collisions/idempotent retry; same customer multiple inspections; interrupted staged write; file move succeeds/DB fails and reverse failure; crash reconciliation; original-preserving retakes; range retrieval; denied directory listing; active-request retention hold; eligible-only deletion and missing-file recovery. Frontend tests specify folder/revision rules only and do not prove filesystem security.
