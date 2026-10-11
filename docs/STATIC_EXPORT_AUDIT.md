# Static Export audit (Next.js 16.3.8)

## Result
NOT enabled. No verified static out/ exists. next build currently produces a Next runtime build; successful development or regular production build does not prove static-only hosting. Installed Next App Router static-export documentation was inspected. Runtime IDs cannot be replaced with fabricated generateStaticParams fixtures.

## Exact blockers
| File(s) | Current behavior / incompatibility | Safe migration / risks / backend dependency |
|---|---|---|
| src/app/(customer)/inspection/[inspectionId]/layout.tsx | Runtime inspection subtree, async params, client guards. No generateStaticParams for arbitrary IDs. | Static workflow entrypoints with validated client ID retrieval; keep old URL compatibility at hosting boundary. High navigation/evidence namespace risk. Backend must authorize IDs. |
| .../[inspectionId]/location/page.tsx, vehicle/page.tsx | Runtime inspection params. | Static entrypoints + client state/API; preserve confirmed state and edit locks. |
| .../[inspectionId]/capture/page.tsx, capture/review/page.tsx | Runtime ID overview/local completion. | Preserve selectors/continuous capture and IndexedDB namespace while moving route entrypoints. |
| .../capture/section/[sectionId]/page.tsx | Runtime inspection and section params. | Known sections are configurable, not a license to fabricate inspections. Client template lookup/404 state. |
| .../capture/photo/[requirementId]/guide/page.tsx, camera/page.tsx, review/page.tsx | Runtime inspection/requirement IDs. | Shared static guide/camera/review entrypoints with validated linkage; preserve replacement/cleanup. |
| .../capture/video/record/page.tsx, video/review/page.tsx | Runtime inspection ID. | Static entrypoint, existing services/cleanup/native fallback preserved. |
| .../[inspectionId]/upload/page.tsx, review/page.tsx, submitted/page.tsx | Runtime IDs, durable queue/submission guards. | Client retrieval without weakening upload threshold or receipt/edit guard. |
| .../[inspectionId]/additional-evidence/[requestId]/[[...step]]/page.tsx | Runtime request ID/catch-all; server notFound on invalid step. | Static additional-evidence entrypoint with client step parser and safe not-found state. Preserve request scope/leases/retakes. |
| src/app/(admin)/admin/templates/[templateId]/page.tsx | Runtime newly created template IDs. | Static editor entrypoint plus client ID lookup; preserve direct access, history and CAS. |
| next.config.ts; next/image uses in customer/Admin; src/config/branding-assets.tsx default getImageProps | Default optimizer needs /_next/image runtime. | Later approved custom image loader/pre-generated derivatives or unoptimized static media. Recheck every earlier baseline; no global quality change in this pass. |

Full leading path for ellipsis above is src/app/(customer)/inspection; nested capture paths are beneath [inspectionId]. These rows cover all current dynamic page groups, not only demo IDs.

## Audited non-blockers and absences
Root local font is build-time compatible. Thin server components can pre-render if no dynamic params. No stable-base proxy/middleware, request-dependent Route Handler, Server Action, cookies()/headers(), runtime SSR fetch, redirects or rewrites were found. Original dirty optional-3D proxy is not imported. Existing client repositories/mock services can remain behind static entrypoints; real auth must move to ASP.NET, not Next handlers. node:os in next.config is build/dev-only, not a browser runtime requirement.

Serwist is installed but not configured/registered. No active manifest/service worker is claimed. Client navigation alone does not implement static deep-link refresh or offline cold launch.

## Safe changes implemented
Public JSON runtime configuration independent of build-time environment; client provider/validated public fetch; broker branding assets bypass the default optimizer when configured. No private key/BFF dependence is introduced. Legacy default optimization and route URLs remain intact to avoid unapproved customer regressions.

## Next-stage migration and proof
1. Approve a precise route compatibility plan and static entrypoint strategy, including old deep-link handling and invalid IDs.
2. Migrate shared route builders/guards/tests together; no fake static IDs.
3. Choose static image derivatives/loader and visually approve deliberate differences.
4. Configure manifest/SW scope and NetworkOnly/no-store config/API handling. Never cache authenticated evidence as a public shell.
5. Enable output: export only after lint/typecheck/unit/full browser tests.
6. Verify actual out with a static HTTP server, all customer/Admin direct-route refreshes, OTP/backend boundary, PWA update/offline behavior and absence of Node image/routes. IIS/Nginx route /api separately.
7. Package verified static artifacts only. Current deployment examples are future scaffolding, not evidence of this proof.

## Complete runtime-ID file inventory

All paths below fall under the route migration policies in the blocker table. Capture layout is included because it also consumes the runtime inspection ID. No runtime parameter fixtures were added.

```text
src/app/(admin)/admin/templates/[templateId]/page.tsx
src/app/(customer)/inspection/[inspectionId]/additional-evidence/[requestId]/[[...step]]/page.tsx
src/app/(customer)/inspection/[inspectionId]/capture/layout.tsx
src/app/(customer)/inspection/[inspectionId]/capture/page.tsx
src/app/(customer)/inspection/[inspectionId]/capture/photo/[requirementId]/camera/page.tsx
src/app/(customer)/inspection/[inspectionId]/capture/photo/[requirementId]/guide/page.tsx
src/app/(customer)/inspection/[inspectionId]/capture/photo/[requirementId]/review/page.tsx
src/app/(customer)/inspection/[inspectionId]/capture/review/page.tsx
src/app/(customer)/inspection/[inspectionId]/capture/section/[sectionId]/page.tsx
src/app/(customer)/inspection/[inspectionId]/capture/video/record/page.tsx
src/app/(customer)/inspection/[inspectionId]/capture/video/review/page.tsx
src/app/(customer)/inspection/[inspectionId]/layout.tsx
src/app/(customer)/inspection/[inspectionId]/location/page.tsx
src/app/(customer)/inspection/[inspectionId]/review/page.tsx
src/app/(customer)/inspection/[inspectionId]/submitted/page.tsx
src/app/(customer)/inspection/[inspectionId]/upload/page.tsx
src/app/(customer)/inspection/[inspectionId]/vehicle/page.tsx
```
