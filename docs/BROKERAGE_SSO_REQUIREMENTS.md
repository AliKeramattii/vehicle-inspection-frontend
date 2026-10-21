# Brokerage identity and staff SSO requirements

## Current frontend

`features/identity/staff-session.ts` defines authenticated/anonymous/expired states, tenant ID, staff subject, role, permissions and expiry, plus a `StaffSessionAdapter` boundary. Parsing validates shape, deployment tenant and expiry; it does not validate signatures or turn browser claims into authorization. Existing sample role controls and `createMockStaffSession` are local test mechanisms only. No real login callback, token exchange, identity provider, persistent token or SSO endpoint has been invented.

`CustomerSourceAdapter` separately owns customer subject/mobile. OTP remains until the authentication team agrees its production role. Never authorize a customer by URL phone or tracking code. Never authorize staff by URL role/tenant. Mock OTP session restoration only accepts matching previously verified sample identity and unexpired tab storage.

## Required identity-team agreement

Prefer OpenID Connect Authorization Code with PKCE, using a server session boundary appropriate to the static frontend and ASP.NET API. Agree issuer/discovery, client registration, exact redirect/logout URLs, scopes, role/permission mapping, deployment/tenant binding, session duration/renewal, allowed return paths and expired-session behavior. The server validates authorization response/token issuer, audience, expiry, state/nonce as applicable and resolves tenant/permissions independently of client input. No permanent access tokens in URL parameters. This direction follows the [OAuth security BCP](https://www.rfc-editor.org/rfc/rfc9700.html) and [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html); final deployment security design belongs to the authentication/backend teams.

An alternative is a short-lived single-use opaque ticket from the brokerage, exchanged and consumed by a server for a scoped app session. Agree expiry, replay prevention, audience/tenant binding, allowed redirect, error handling and audit. Do not interpret an unverified ticket or signed-looking string inside React as authentication. Production secrets never enter Site Settings, browser bundles or NEXT_PUBLIC variables.

## Proposed session shape

Authenticated context: authority=backend-session, tenantId, subjectId, role (mapped to existing platform-admin/reviewer/template-editor/viewer), explicit permissions, expiresAt. No bearer token is required in this frontend domain model. `staffDestination` resolves authorized Reviewer/Admin destinations; server must still enforce every operation and media request. A Reviewer has decision permission only for assigned inspections. Site Admin settings do not imply Reviewer decision rights.

Customer context: authority=brokerage-session, tenantId, subjectId, source-owned mobile and explicit OTP/phone-verification policy. Brokerage/inspection association must come from server session, not a URL override. Preserve the number as read-only in the app.

## Session/API failure policy to agree

401/expired: stop privileged mutations and return through approved source authentication without deleting durable local captures. 403: no role/assignment grant; show safe access recovery. Tenant mismatch: fail closed. 409: reload versioned decision/session data. Define cookie Secure/HttpOnly/SameSite, CSRF protection and CORS/origin policies for the actual deployment. SSO must work without a required production Next.js/Node server. Neshan central service credentials remain a separate server-owned concern.
