# Future brokerage deployment templates

These files are handoff examples, not a verified deployable release. See docs/STATIC_EXPORT_AUDIT.md: runtime-ID routes, default image optimization and PWA support still require an approved migration. No out/ artifact is shipped.

For each isolated brokerage, copy its reviewed site-bootstrap.json into the eventual static release, and seed/publish site-settings.json through ASP.NET so GET /api/public/site-settings returns the schema. Both sample brokerages are fictional. Broker A uses same-origin API; Broker B demonstrates a trusted separate HTTPS API and requires explicit CORS/session/CSP policy.

Default local development remains demo/mock. The examples do not enable real business API integration: existing evidence/auth/submission repositories stay mocked until backend contract validation.

Nginx/IIS templates prioritize /api over actual exported files, preserve 404, disable directory browsing and never publish private media. Review TLS, upload limits, streaming/timeouts, response headers and static deep links before installation. IIS requires separately configured ARR/URL Rewrite. Backend settings are private server inputs, never browser configuration. Retention cleanup is disabled until approved.

Installation, upgrade and rollback procedures are in docs/BROKERAGE_DEPLOYMENT.md. Do not deploy restricted GLBs or unrelated original-worktree assets.
