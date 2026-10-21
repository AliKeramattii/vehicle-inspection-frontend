# Static deployment architecture decision

Date: 2026-10-22. Status: **RECOMMENDED, awaiting architecture approval**. This document authorizes no application routing migration. Baseline: canonical `C:/Projects/vehicle-inspection-integrated`, branch `feat/unified-ui-admin-3d`, HEAD `72a4e99` before this documentation task.

## Decision

Recommend **Next.js static export with finite workflow entry pages and browser-validated query context**, served on each brokerage's HTTPS subdomain by IIS/Nginx or ASP.NET Core static-file hosting. Use explicit legacy-link redirects at the host. Keep the brokerage's independent ASP.NET API behind an approved same-origin `/api` gateway where feasible. Node is used to build, not to serve production requests.

This is the smallest supported adaptation identified for the current codebase, not a zero-change export. Existing pretty links remain resolvable, but their address-bar destination changes to an exported page plus IDs in query parameters. Product approval of that URL contract is required. If unchanged address-bar paths are mandatory, reconsider the real client-router SPA option below; do not conceal this tradeoff with a fallback rewrite.

The application is still **READY WITH DOCUMENTED BLOCKERS** for API review and **blocked for Node-free production release**. The isolated proof validates the proposed mechanism, not a migrated/released application.

## Evidence and boundaries

| Classification | Finding |
|---|---|
| Verified in this task | Installed `next/package.json` is **16.3.8**, React/React DOM 19.2.8. Local framework documentation was read. Current `next.config.ts` has no `output: "export"` and uses the default image optimizer. |
| Existing evidence, not rerun | The prior actual export probe compiled, then exited 1 because `/inspection/[inspectionId]/capture` lacks `generateStaticParams`. See STATIC_DEPLOYMENT_READINESS.md and its local logs. Demo-only generated IDs cannot cover future inspections. |
| Verified source | Thin Server pages await dynamic params and pass IDs to client workflows. Customer inspection, request/item/step, Reviewer case and Admin template paths need adaptation. A search found 76 Next navigation/link/image import matches across 61 files; replacing the routing stack has a wider impact than changing page adapters alone. |
| Verified proof | A separate tiny Next 16.3.8 app exported finite capture/review pages. Runtime IDs created after build worked on a Python static host, including reload and client navigation. No production source/config was modified. |
| Verified limitation | Default Link prefetch on this Windows export requested dotted segment filenames absent from the generated output. `prefetch={false}` in the proof produced clean navigation. This is a release-verification gate, not a change to the working app or a claim that every export host works. |
| Proposal | Finite page/query route contract, host compatibility redirects, production image strategy, auth gateway and release packaging below. |
| Not verified | Migrated customer/Admin/Reviewer workflows, actual ASP.NET/IIS hosting, deployed TLS/auth/CORS, physical-device capture, PWA cold launch or a production API. |

Official Next documentation supports per-route static HTML and client data fetching, while excluding runtime dynamic paths, request-dependent handlers, Next rewrites/redirects and the default image optimizer from export. The installed 16.3.8 docs agree. The online site currently describes a newer 16.4.2 release; **the executable proof uses 16.3.8**, with no upgrade. [Next static exports](https://nextjs.org/docs/app/guides/static-exports), [Next SPA guide](https://nextjs.org/docs/app/guides/single-page-applications).

## Options compared

### A. Finite Next export pages with runtime query IDs — recommended

- **Advantages:** Retains App Router's fixed-page navigation, code splitting, current component/domain/repository architecture and most Link/router usage. Finite HTML/RSC assets are generated without knowing inspection/customer IDs. Static branding remains runtime-configured.
- **Disadvantages:** URL shape changes; host redirects preserve old link reachability rather than identical address bars. Query parsing/guards and pathname-sensitive providers must be updated together. Browser data initialization needs a stable loading/invalid-context state.
- **Required code changes:** Replace runtime-ID page/layout adapters with finite entries; introduce one validated route-context parser and update centralized route builders, direct string links, guard logic and namespace initialization. Read IDs in client leaves under Suspense, not server Page `searchParams`/`params`. Enable export, select static images and exclude development-only handlers from the release entry tree. No workflow business-rule rewrite.
- **Hosting:** Serve actual exported HTML, JS, CSS and Next static payload files. Exact legacy GET/HEAD redirects precede static lookup; APIs/auth/private media are explicitly excluded. No generic HTML fallback is needed for these entry pages.
- **Security:** URL IDs never authorize access. Server sessions, ownership, tenant/assignment and command permissions remain mandatory. No credentials in queries. Unknown/duplicated/malformed context is rejected before opening durable namespaces; unauthorized valid IDs are rejected by the API.
- **Regression risk:** Medium, concentrated in URL generation, scope/guards, reload/back navigation and media cleanup during context changes. Existing workflows are reused.
- **Complexity/maintenance:** Medium migration, comparatively low long-term complexity; no second router/framework. Exact effort requires an approved route map, not a speculative estimate.
- **Verification:** Export artifact + direct/random IDs for every page family; legacy links, queries, client transitions, refresh/back/forward, stale assets, staff/customer guards and state isolation. Prefetch artifact gate below must pass.

### B. Actual client-router SPA, static files hosted by ASP.NET Core

- **Advantages:** A browser router can retain `/inspection/{id}/...`, `/reviewer/cases/{id}` and template URLs exactly. ASP.NET Core can serve the shell and independent APIs without Node. A finite client route table handles IDs created after build.
- **Disadvantages:** A host fallback does not supply a router. Existing `next/navigation`, Link, awaited page params, layouts, metadata and image assumptions cannot simply be retained on unknown paths. Build/router changes and code splitting require separate approval.
- **Required code changes:** Extract the thin route/layout layer into a genuine client dispatcher, route all internal links/imperative navigation/guards through it, reuse workflow/domain components, and replace Next-only asset/metadata adapters. Choose an established browser router/build tool only after approval; none is installed by this task. Do not maintain two competing routers for one workflow or write a large custom router just to avoid a dependency.
- **Hosting:** ASP.NET static assets plus a constrained fallback for known customer/Admin/Reviewer route families; all API/auth/media/asset failures retain real statuses. Direct GET/HEAD of an allowed client route returns its shell. Browser route recognition and popstate are essential. [Microsoft fallback reference](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.builder.staticfilesendpointroutebuilderextensions.mapfallbacktofile?view=aspnetcore-10.0).
- **Security:** Same API/session obligations as A. A public shell may contain no private data. A fallback must not turn a denied/missing API, media file or script into HTML 200. Guarded UI is not resource authorization.
- **Regression risk:** Higher than A for this repository: many existing Next-bound navigation sites and three interface layouts must be adapted; component workflows are reusable, but router integration is not already present.
- **Complexity/maintenance:** High initial migration; sound long-term option if exact pretty URLs justify adopting one client-routing stack. Avoid maintaining Next and a second production build indefinitely.
- **Verification:** A separate disposable History API dispatcher in this task verified runtime pretty IDs, direct load, push, reload and popstate on a static shell. It does **not** verify the existing React app under a new router, or ASP.NET hosting. Require full route coverage and intended-host integration before adopting B.

### C. Single exported workflow entry with hash context

- **Advantages:** `/inspection/#/id/capture` can carry arbitrary context without any per-ID host rules; hash stays client-side. Fewer physical exported pages and no production Node.
- **Disadvantages:** Changes all shared links, hash/scroll behavior and analytics; bookmarks without the fragment lose context. A client dispatcher still needs implementation; current Next pathname guards cannot remain authoritative. Larger workflow chunk unless deliberately split.
- **Required changes/hosting:** One finite export page plus a validated hash dispatcher, centralized navigation adapters and compatibility redirects that encode old context into a fragment; APIs/assets remain separate. No new backend feature is needed for static serving.
- **Security:** Fragment IDs still are not credentials; XSS and API authorization remain. Source/auth callbacks must stay separately registered, not be hidden in a hash.
- **Risk/complexity/maintenance:** Medium-to-high navigation risk, medium migration; two route representations provide less benefit than A's normal exported pages. Not recommended and not executed as a proof.
- **Verification:** Hash reload/back/forward, old-link redirects, state scoping, keyboard/scroll restoration and every workflow stage would need new coverage.

An unchanged Next runtime, SSR/serverless or a Next container is not an alternative satisfying the no-production-Node requirement. Building a page per demo inspection, returning HTML from every 404, or copying one dynamic page's RSC files to arbitrary paths is not an acceptable architecture.

## Proposed URL compatibility contract for A

All target paths below are **proposals**, not active application routes. Keep root deployment on the brokerage subdomain; subpath hosting needs a separate basePath/asset-path proof. Define a strict allowlist of IDs/step values, duplicate-query behavior and maximum lengths with the backend team.

| Existing URL pattern | Proposed finite export destination |
|---|---|
| `/`, `/verify`, `/readiness`, `/consent`, fixed Admin/Reviewer entries | Same page paths, consistent trailing-slash policy |
| `/inspection/{id}/location` | `/inspection/location/?inspectionId={id}` |
| `/inspection/{id}/vehicle` | `/inspection/vehicle/?inspectionId={id}` |
| `/inspection/{id}/capture` | `/inspection/capture/?inspectionId={id}` |
| `/inspection/{id}/capture/section/{section}` | `/inspection/capture/section/?inspectionId={id}&sectionId={section}` |
| `/inspection/{id}/capture/photo/{requirement}/{guide,camera,review}` | `/inspection/capture/photo/{guide,camera,review}/?inspectionId={id}&requirementId={requirement}`; three finite pages |
| `/inspection/{id}/capture/review` | `/inspection/capture/review/?inspectionId={id}` |
| `/inspection/{id}/capture/video/{record,review}` | `/inspection/capture/video/{record,review}/?inspectionId={id}`; two finite pages |
| `/inspection/{id}/{upload,review,submitted}` | `/inspection/{upload,review,submitted}/?inspectionId={id}`; three finite pages |
| `/inspection/{id}/additional-evidence/{request}/[[...step]]` | `/inspection/additional-evidence/?inspectionId={id}&requestId={request}&step={allowedStep}` plus validated requirement/item context where needed; map every current catch-all branch before approval |
| `/reviewer/cases/{case}` | `/reviewer/case/?caseId={case}` |
| `/admin/templates/{template}` | `/admin/template/?templateId={template}` |
| `/api/development/vehicle-model/{variant}` | No production export; retain the existing licensed loopback development boundary separately |

Use real 307/302 temporary redirects during a migration pilot, and agree permanent redirect policy only after validation. Map exact path segments once, decode/validate/re-encode context, preserve only approved query fields, reject encoded slashes/path traversal and do not accept an arbitrary return origin. Authentication callbacks/tickets are consumed by the agreed server auth boundary before normal route handling. External old links resolve through HTTP redirect; new internal navigation must target physical export pages directly, not rely on host redirects for RSC navigation.

## Production topology and configuration ownership

```text
HTTPS brokerage inspection subdomain
  /, finite pages, /_next/static, public artwork -> versioned static export
  /site-bootstrap.json -> deployment-specific public no-store JSON
  published settings -> existing sole SiteSettingsProvider / approved endpoint
  /auth and /api -> brokerage ASP.NET session/business services (proposed gateway)
  authorized private media -> ASP.NET resource checks / scoped streaming
                          -> brokerage MSSQL + private media root
  reverse address -> approved central ASP.NET Neshan service boundary
```

The brokerage API remains independently deployed and owned; a same-origin gateway is a hosting choice, not shared brokerage data. Where infrastructure requires a separate API origin, approve exact HTTPS CORS origins, credential handling and CSRF/Origin policy. CORS is not authentication. [ASP.NET CORS guidance](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0).

- Keep `site-settings.loader.ts`/`SiteSettingsProvider` authoritative. Its public bootstrap/settings loading already exists; `bindDeployment` prevents silently rebinding existing local data to another tenant/API on the same origin. Do not introduce another browser config store. Cross-device Admin publication still requires backend persistence.
- Deployment resolves tenant/API/source/auth allowlists. Brokerage Admin owns approved visual/content publication. Global infrastructure owns Neshan credentials and authorized public map policy. The existing public settings projection may include approved Web Map configuration; private Neshan service credentials never enter JSON, Next public env or static files. Global policy is composed server/deployment-side into the same provider, not edited independently by each Admin.
- Prefer a host-only Secure/HttpOnly app session at the frontend origin, with agreed CSRF protection. Staff OIDC authorization-code/PKCE or a one-use source ticket is a **proposal** requiring identity-team agreement; the ASP.NET boundary validates issuer/audience/nonce/state/replay/tenant. Keep source-owned customer phone and OTP policy. Never make IndexedDB/mock roles the production authority, or save access tokens in route context.
- Camera/video require HTTPS (loopback is a development exception), user permission and browser support. IndexedDB/Blob storage and queue recovery run in the browser and do not inherently require Next SSR. Keep the same origin, namespace/ID bindings and schema upgrade policy to preserve captures. Route changes must retain camera/recorder/timer/object-URL cleanup. This is architectural compatibility, not newly tested physical-device behavior.
- Serwist is not currently registered: static hosting does not itself add installability or offline cold launch. Keep service-worker rollout a separate approved task.

## Release and host requirements

Publish **only audited export files**, never the full worktree/public directory by assumption. Exclude ignored restricted GLBs, reference art, private diagnostics, env files, development Route Handlers/proxies and captured media. Do not force-static a handler that reads restricted binaries. Existing optional 3D development behavior remains untouched; a production license decision remains separate.

Choose `images.unoptimized: true` initially for approved, already-sized local images and custom branding, or a separately approved static derivative loader. Preserve image framing and source artwork. Verify that no `/_next/image` request is required. This changes delivery behavior, not authorization; evidence still uses a private media adapter. Do not automatically regenerate assets.

Host ordering: auth/API/private-media routing and exclusions first; exact legacy redirects next; actual exported files/default documents next; true 404 last. Preserve public Next payload `.txt` assets and MIME types, font/WebP/video delivery and query strings. IIS/Nginx/ASP.NET configuration depends on the selected host version; this task supplies no untested production server config. [Microsoft static files](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files?view=aspnetcore-10.0).

Use immutable caching for content-hashed JS/CSS; revalidate HTML and keep bootstrap/session/status and configured public settings no-store as agreed. Private media is never publicly cached. Use CSP, frame/Permissions-Policy, Referrer-Policy and HTTPS headers at the host, with tested Neshan origins/worker needs rather than a guessed blanket CSP. Deploy HTML and assets atomically, retain old hashed chunks for open sessions, and test rollback without deleting durable media or server receipts.

## Executed disposable proof

All files are ignored under `.agent/reference-review/static-decision/` in the canonical worktree; no second checkout/worktree or dependency install was created. Synthetic brokerages only; no env, authorized map key or customer data copied. An existing logo was copied into the diagnostic output solely to test actual image loading; no production asset changed.

Commands run from the canonical project:

```powershell
node node_modules/next/dist/bin/next build .agent/reference-review/static-decision/proof-app
node .agent/reference-review/static-decision/verify-proof.mjs
```

The second command owns two loopback Python static hosts, launches isolated Chromium, closes it and terminates the owned host process in finally. No `next start`, Next dev server or Node HTTP server serves the exported files. Node is only the build/test driver. The standalone alternative shell uses browser History API code, not Next's dynamic route tree.

- Static build: **exit 0**, Next 16.3.8, finite `/`, `/inspection/capture`, `/inspection/review` and framework 404 output.
- Browser proof: **exit 0, 19 assertion groups**. Runtime ID `runtime_ca07aa71fe974c2ebaa51ab86048028a` was created after build and absent from exported text assets.
- Example tested canonical diagnostic URL: `http://127.0.0.1:3219/inspection/capture/?inspectionId=runtime_ca07aa71fe974c2ebaa51ab86048028a`. Old-shape `/inspection/{thatId}/capture` redirected there and refreshed correctly.
- Verified CSS/image bytes, no `/_next/image`, Link without document reload, `router.push`, back/forward, second-view refresh, missing/duplicate/malformed IDs and real 404s for unknown views/API/media/assets.
- Same output on port 3220 loaded independent brokerage-b JSON; changing its synthetic published identity appeared on reload without rebuilding. This demonstrates runtime fetch mechanics; it **does not execute the real Zod/settings/IndexedDB provider**. Those existing components were read, not modified or replaced by this simplified fixture.
- Separate `/spa/inspection/{runtimeId}/capture` shell verified path recognition, pushState, direct refresh and popstate. No production React-router or ASP.NET integration is claimed.
- Diagnostic screenshots `proof-360.png`, `proof-390.png`, `proof-430.png` recorded asset visibility; 390 was visually inspected. These are not application baselines or UI acceptance screenshots. Hosts are stopped after tests; rerun the command to reproduce locally while the diagnostic files remain.

Initial failures were retained as observations: an image assertion needed to wait for decode rather than visibility; default prefetch returned segment 404s. Inspection of installed `next/dist/export/index.js` shows OS-relative segment paths passed to `convertSegmentPathToStaticExportFilename`, whose implementation replaces forward slashes. The Windows artifact contained `__next.inspection/review/__PAGE__.txt`, while the browser requested `__next.inspection.review.__PAGE__.txt`. No node_modules patch, filename rewrite or suppressed error was used. The proof's documented Link `prefetch={false}` avoided segment prefetch; final positive paths had **zero console/page errors and zero failed resources**. A module-availability check also confirmed esbuild is not installed; no dependency was installed or required by the final proof.

Local evidence: `proof-build.log`, `proof-browser.log`, `proof-result.json`, `observations.json`, synthetic host files and sources under that ignored directory. The proof is intentionally disposable and is not the release artifact. Reproduction on a clean clone requires recreating the tiny fixed-page example: Server page -> Suspense -> client `useSearchParams`, Link `prefetch={false}`, `output: "export"`, `trailingSlash: true`, unoptimized image, and no request-time server features.

## Approval and migration gates

1. Approve A's finite-page/query URL contract and exact legacy mappings for all route families. No application URL changed in this task.
2. Approve a production static entry tree/build profile excluding development handlers while retaining licensed local preview. Decide image delivery without replacing artwork.
3. Require artifact navigation tests on intended CI OS and real host. Verify/correct the segment-prefetch limitation through a documented build/profile choice, not silent internal-path hacks; default prefetch cannot be assumed safe.
4. Run approved migration in a separate task: route adapters/builders/guards and existing workflow tests together, then the static release under IIS/ASP.NET/Nginx. Test source restoration, foreign IDs, additional rounds, camera/video/IDB/uploads, Admin/Reviewer and old drafts at the same origin.
5. Agree production auth, tenant/context, secure media and central Neshan API contracts. Test two real brokerage deployments, security/headers and physical mobile browsers. No backend work starts under this document.

No current application route, CSS, baseline, Neshan system, GLB, source asset, package, lockfile or local configuration was changed. The unrelated readiness mismatch stays out of scope. Architecture approval is the next decision; production migration remains unimplemented.
