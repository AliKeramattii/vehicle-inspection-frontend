# Data ownership and security boundaries

## Current guarantees and limits
The app is a frontend/mock implementation. Browser role selection, IndexedDB records and tab-session flags are not production credentials. Tests demonstrate local namespace checks and workflow behavior; they do not prove cross-user production security. All production authorization below is a requirement for ASP.NET/brokerage integration, not a service already running.

## Identity and ownership matrix
| Identifier / data | Owner | Frontend use | Mandatory server enforcement |
|---|---|---|---|
| tenantId | Deployment/session authority | Runtime settings and local namespace context | Bind domain/deployment, session and every resource; reject foreign IDs |
| subjectId / customerId | Authenticated brokerage | Source context, never phone-derived authority | Resolve from verified session and source system |
| sourceRequestId | Authorized source insurance request | Separate same-customer current attempts/sessions | Verify customer/request/vehicle association |
| inspectionId / attempt identity | Inspection backend | Evidence/facts/queue namespace, linked prior attempt | Resource ownership, pinned template and legal attempt transition |
| trackingCode | Inspection backend | Selectable/copyable receipt and authorized staff search | Unique identifier only; no public evidence lookup by code alone |
| evidenceId/revision/job ID | Evidence backend/local durable store | Exact revision review, idempotency and references | Immutable linkage to tenant/inspection/requirement/version |
| public reviewer reason | Assigned Reviewer/backend projection | Exact correction/rejection display | Whitelisted customer DTO; redact internal/private audit fields |
| internal note/audit | Authorized staff/backend | Staff-only UI | Separate staff authorization and retrieval; never customer DTO |

Read-only mobile is resolved by CustomerSourceAdapter. URL parameters do not supply identity. The mock source includes request-demo; legacy stored records without sourceRequestId belong only to that legacy request. Old default owner/session keys remain valid; other requests use distinct keys. A previously OTP-verified, matching, unexpired 30-minute mock tab session can restore; IndexedDB alone cannot authenticate. Production must define mid-session expiry, refresh and revocation rather than reusing editable browser storage as authority.

## Roles and resource access
Site Admin manages settings/staff/templates/assignment within tenant. Template editor edits drafts but cannot publish/configure infrastructure/decide evidence. Viewer is read-only. Reviewer acts only on assigned cases; final whole-case decision is separate from individual evidence. No unsafe bulk approval. StaffSession is typed/parsed for tenant, role, permissions and expiry; createMockStaffSession remains a sample actor bridge. A real backend must validate each query, mutation, list/search/filter, revision and media range request. UI hiding is not enforcement. Staff reassignment/revocation must invalidate stale decision permission atomically.

## SSO/session proposal, not implemented
Agree OIDC Authorization Code + PKCE with the brokerage authentication team, or a short-lived single-use opaque ticket consumed server-side. Bind tenant/source request/subject/audience/return path. Agree exact issuer, registration, redirect/logout, state/nonce, token validation and replay policy. Never use long-lived URL tokens or browser-supplied role/tenant claims. Standards references: [OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html), [OAuth security BCP](https://www.rfc-editor.org/rfc/rfc9700.html). No auth endpoint or identity provider is invented here.

Prefer a server-managed Secure/HttpOnly session where topology permits. Agree SameSite, refresh/expiry, logout/revocation, CSRF Origin/token checks and exact credentialed CORS allowlists for the chosen cross-domain layout. 401 stops privileged operations and returns to approved source authentication without deleting local evidence; 403 remains denied, not another role; tenant mismatch fails closed. Document local evidence privacy on shared devices separately from logout. Never silently clear accepted media to resolve session errors.

## Public versus private configuration
Global infrastructure: central Neshan map/service ownership, product security and hosting policy. Brokerage deployment: API origin, trusted source/SSO metadata, tenant identity. Brokerage-editable settings: name/logo/favicon/contact, approved image slots, colors/halo/content. Same validated Site Settings provider/publication history remains. Central map configuration is read-only to brokerage Admin and guarded in the repository.

A domain-restricted public Neshan Web Map key may reach the browser in authorized public configuration. Private reverse-geocoding/service keys, SSO/client secrets, forwarding credentials, SQL strings and private filesystem roots must never reach public settings, browser chunks, NEXT_PUBLIC or committed env files. Local-only Neshan Node tooling is development infrastructure; production static frontend calls an ASP.NET-owned service boundary. No key values are reproduced in documentation/logs.

## Evidence storage and retrieval
Local photo/video Blobs remain IndexedDB evidence; the metadata queue references existing Blob keys and never base64-encodes video. Accepted and replacement drafts coexist until durable confirmation. Local storage may be denied/evicted and is not a remote backup. Do not store private media/session credentials in localStorage or public caches.

Backend target: MSSQL stores paths/metadata/audit/version relationships; private filesystem stores binaries under INSPECTION_{InspectionId}, outside webroot. Keep temporary uploads quarantined from finalized evidence. Server checks tenant/inspection ownership, safe generated paths, MIME/content sniffing, byte limits, integrity and acknowledgement before promoting immutable evidence. Client-provided filenames/paths are never trusted. Do not expose absolute filesystem paths or public unrestricted media URLs.

Reviewer retrieval requires authenticated resource/revision checks (including history) and controlled streaming or short-lived scoped URLs with expiry/range support for video. No autoplay, no eager loading of all full-resolution media. Apply no-store/private cache behavior and prevent authenticated media entering public service-worker caches. Finalized evidence remains until an approved retention/deletion policy, audit/legal hold, active-request and recovery rules exist. No deletion schedule or cleanup job is invented here.

## Concurrency, audit and forwarding
Use server-issued expectedVersion/ETag and idempotency for submit, decisions, replacement/resubmit, restart, settings publication and delivery. Store actor/time, previous/current revision, public reason separately from internal note and delivery attempts. Reject stale transitions, do not last-write-win legal decisions. Backend-owned outbox handles private brokerage transfer with destination allowlist, credentials, retries, timeout and acknowledged receipt. Approval is not delivery; failed forwarding does not trigger customer recapture.
