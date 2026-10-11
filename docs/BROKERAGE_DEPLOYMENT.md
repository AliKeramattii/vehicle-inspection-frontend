# Brokerage installation, upgrade and rollback

## Current release status
No verified static export yet. Do not ship .next as a Node-free static release or call next dev a production installation. STATIC_EXPORT_AUDIT lists runtime ID/image/PWA migration gates. No actual ASP.NET/MSSQL/filesystem integration exists. deployment examples are reviewable future templates, not a deployed service.

Reviewable examples are provided in deployment/: IIS/Nginx routing, private backend-settings placeholders and blue/green fictional bootstrap/settings payloads. These are not deployed infrastructure or proof of static readiness.

## Target package
brokerage-release/frontend: verified out contents (index.html, _next, assets, site-bootstrap.json).
brokerage-release/deployment: reviewed IIS/Nginx examples and backend-settings.example.json.
brokerage-release/docs: installation/upgrade/rollback using this document plus storage/backend specs.
ASP.NET service, private MSSQL credentials and private media root deploy separately. Never include local GLBs, private model renders, .env files, credentials or customer evidence. Static assets can be identical for every brokerage; public bootstrap identifies the independent installation.

## Provisioning sequence
1. Prepare independent brokerage domain/subdomain and DNS.
2. Install only a verified static frontend artifact after migration proof.
3. Configure HTTPS, correct MIME types and static route refresh mappings.
4. Deploy compatible ASP.NET API; host /api before static fallback, not Next rewrites.
5. Configure private MSSQL connection string in server environment/secret store.
6. Create private media root outside webroot; grant least-privilege API identity.
7. Set InspectionFolderPattern=INSPECTION_{InspectionId}.
8. Deploy no-store public bootstrap; public tenant ID/API endpoint are nonsecret.
9. Publish authorized Site Settings/immutable branding asset versions in backend.
10. Verify OTP/session/CSRF and Admin authorization.
11. Capture/upload both photo and negotiated video formats with offline/retry.
12. Verify MSSQL contains relative paths and metadata, not media bytes.
13. Verify authorized retrieval/video ranges and no direct filesystem browsing.
14. Verify cross-tenant/cross-inspection denial.
15. Approve retention and test active-review/retake holds before enabling cleanup.
16. Verify Admin/settings/template history and pinned old inspections.
New brokerage setup uses config/provisioning, not React source edits.

## Same-origin and separate API origin
Prefer HTTPS frontend / and ASP.NET /api. IIS ARR/Nginx upstream is server configuration. Separate API origin requires explicit trusted bootstrap HTTPS origin, exact CORS allowlist, no wildcard credentialed CORS, appropriate Secure/HttpOnly session cookies/SameSite policy and CSRF Origin/token validation. Browser never holds service tokens/SQL credentials.
Bootstrap and public settings use no-store and versioned publication; private APIs require no-store. Configure CSP connect-src/img-src for the trusted API and backend-owned public assets. Reject unexpected frontend host/tenant mappings server-side.

## Upgrade
Stage immutable versioned frontend files and API compatibility first; preserve private data/Blobs/SQL records. Validate bootstrap schema/contract and asset references, pinned inspections and queues. Switch release pointer atomically only after direct-route/browser/static-server checks. Reconcile caches through reviewed SW version strategy. Do not silently switch tenant/API on an origin with existing browser evidence; implementation blocks this to protect data.

## Rollback
Retain prior compatible static release and public settings publication. Switch release pointer back without deleting inspection media or rewinding submitted/evidence database state. Use backend-authorized settings rollback as a new publication, not history mutation. Check API contract compatibility and queued jobs; no destructive Git reset or SQL restore as normal UI rollback.

## PWA/static HTTP acceptance
Verify actual out via static HTTP hosting, refresh every entrypoint, invalid IDs, auth API, responsive AppViewport, manifest/installability/service-worker scope/update and offline retry. Config/API requests must bypass stale shell cache. No SW is active on current base; offline cold launch is not claimed. Never route /api or private storage into an index.html fallback. Examples currently preserve 404 for unexported routes rather than fabricating success.
