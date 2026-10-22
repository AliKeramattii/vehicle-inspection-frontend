# Static deployment readiness

## Classification
**BLOCKED for a Node-free production release.** Normal Next build and browser success are not proof of static export. No routing migration, output-mode change, image rewrite or production Node service was introduced by this readiness task.

## Actual export evidence
Installed version: Next 16.3.8. An actual `npm run build` was executed with the existing config plus temporary `output: "export"`. Compilation and TypeScript completed, then page-data collection failed, **exit 1**:

```
Page "/inspection/[inspectionId]/capture" is missing "generateStaticParams()"
so it cannot be used with "output: export" config.
```

The normal next.config.ts, tsconfig.json and next-env.d.ts were restored byte-for-byte in finally. No fabricated inspection IDs or generateStaticParams fixtures were added. Logs: ignored `.agent/reference-review/pre-api/static-export-final.log` and `static-export-result.json`. An earlier diagnostic with isolated output stopped at an intentionally new test's missing type field; it also emitted relative CSS-resolution diagnostics under that nested diagnostic output path and is not counted as the routing proof. No customer CSS was changed; the standard-directory probe compiled normally. The final probe above used the normal build directory after the fixes compiled. Normal production build is separately revalidated by browser webServer startup.

## Compatibility matrix
| Feature | Current evidence | Static status / required work |
|---|---|---|
| Fixed landing/verify/readiness/consent/Admin entry pages | Normal build prerenders fixed routes; client mocks/runtime settings work | Compatible ingredients, not a complete tested static release |
| Arbitrary inspection/section/requirement/request IDs | Async App Router params and runtime route groups | Export cannot enumerate future authorized inspections; migration approval required |
| Reviewer case and Admin template IDs | Runtime case/template routes | Same arbitrary-ID blocker; cannot export demo IDs as a platform solution |
| Deep links and nested reload | Current Next server/browser tests | Static host proof NOT TESTED because no complete export artifact exists |
| next/image | Built-in guidance/heroes use default optimizer; Blob/custom-branding paths bypass it where specified | Default /_next/image requires runtime; select approved derivatives/custom loader or unoptimized strategy, then visually verify |
| Runtime White-Label bootstrap | Public no-store JSON; validated API/tenant binding; sole client provider | Compatible design; production settings API/config distribution still required |
| Development Neshan rewrites/proxy | Development-only rewrites, loopback services; hash-protected | Production must use host/ASP.NET API routing, never local Node proxy |
| Restricted GLB handler | api/development/vehicle-model/[variant] reads ignored local model only under explicit loopback dev gates | Must be excluded from static release; never force-static/export a restricted binary |
| PWA/offline | IndexedDB queue recovery is implemented; Serwist installed but not registered, no active install manifest/SW | Offline cold launch/installability/update strategy NOT TESTED/NOT IMPLEMENTED |
| Server features | No active middleware/proxy.ts, Server Actions or customer cookies()/headers() usage found | Server components alone can prerender; dynamic routes still block |
| Static assets/font | Public assets and local Vazirmatn available | Must audit release manifest for restricted/private files and licensing |

## Smallest migration proposal, not implemented
Approve static entrypoints for shared workflow components with validated client-side inspection/request/requirement context. Preserve accepted URL compatibility explicitly at the hosting/router boundary. Update centralized route builders, guards, namespace selection and direct-link tests together. Do not attempt a generic index.html rewrite over arbitrary App Router URLs: the framework route/RSC expectations also need a proven client/static strategy. Do not authorize by client URL IDs.

This is a P0 deployment decision with material navigation and data-namespace risk. **Product/engineering approval is required before this routing migration.** No invasive change is part of this task. A separately approved route map must cover every runtime file below and nonexistent/unauthorized IDs.

## Hosting acceptance after migration
ASP.NET Core/IIS/Nginx serves verified export artifacts and agreed deep-link mappings. Route authenticated API/media separately before any static fallback; never turn missing /api or private media into HTML200. Use correct MIME types for WebP/fonts/video/WASM if retained, HTTPS and cache policy: immutable versioned assets, no-store bootstrap/settings/session/status. Preserve query/history navigation and safe return paths. Avoid forwarding every URL to a fixture inspection.

Test direct links, reload and back/forward at each customer/Admin/Reviewer entrypoint, source session restoration, expired/foreign IDs, relative asset roots, configured brokerage APIs and two independent domains. Test with a plain static HTTP server and with the intended ASP.NET/IIS host. Verify there is no Next image endpoint, server Route Handler or Node process dependency in the release. These hosting proofs remain BLOCKED until migration.

## Runtime-ID inventory
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
src/app/(reviewer)/reviewer/cases/[caseId]/page.tsx
src/app/api/development/vehicle-model/[variant]/route.ts
```

See DEPLOYMENT_AND_RUNTIME_CONFIG for commercial assets, CORS and configuration ownership. Framework references: installed `node_modules/next/dist/docs/01-app/02-guides/static-exports.md` and [official static-export guide](https://nextjs.org/docs/app/guides/static-exports). Current normal server build must not be marketed as a static deployment.


## V2 photo policy impact

The eleven-photo follow-up adds typed client policy, optional metadata and IndexedDB pin/history behavior, with no new server route, dependency, production Node service or 3D download. All existing static-routing/deep-link blockers and the approved architecture-decision gate remain unchanged. Actual npm run build succeeds in the existing Next deployment mode; this is not a claim that arbitrary-ID static export has been migrated. See PHOTO_REQUIREMENT_POLICY_V2.md and STATIC_DEPLOYMENT_DECISION.md.
