# Deployment and runtime configuration

## Target versus current reality
Target is a static frontend per brokerage with a separate ASP.NET Core API, MSSQL metadata and private filesystem media. The current normal Next build still needs a Next runtime for dynamic routes/image optimization; actual output:export failed. See STATIC_DEPLOYMENT_READINESS. No required production Node service was added, and this task does not claim the target migration is complete.

Example topology only: https://bazdid.example.com → https://example.com/api/bazdid and https://bazdid.example2.ir → https://example2.ir/api/bazdid. These are not configured live destinations or confirmed API endpoints. Each deployment owns staff/customer data, settings and backend. The public bootstrap binds tenant/API context; code changes are not required just to set another approved brokerage appearance.

## Configuration ownership
| Owner | Public configuration | Private/server-only configuration |
|---|---|---|
| Product/global infrastructure | Authorized domain-restricted Neshan Web Map settings, product contract/schema | Neshan reverse-geocoding service credential, central quota/security/origin policy |
| Brokerage deployment | tenantId, approved API base, public settings endpoint, trusted source/auth metadata as agreed | SQL/private media root, SSO/client secrets, forwarding destination credentials and allowlists |
| Brokerage Site Admin | Display/logo/favicon, approved images, contact/content, primary/secondary/accent/halo and publication | None; no infrastructure or private-key editor |

Runtime files: public/site-bootstrap.json; config/site-settings.loader.ts validates/loads no-store public settings; site-settings.provider.tsx remains the sole runtime theme source. configurationKey separates deployment context; bindDeployment blocks silently rebinding an origin with existing local data to another tenant/API. Published Site Settings/history remain versioned. In API mode production must supply that service; browser-local Admin publication is mock/local and does not distribute settings across devices. No second store/provider was added.

## Neshan and development
Existing authorized keys/configuration are unchanged. Public Web Map key is intentionally browser-visible only under authorized domain restrictions. The private service key stays in local proxy/server configuration and never browser bundles, public JSON, logs or Git. `npm run dev:neshan-proxy` starts local reverse/runtime hosts; `npm run dev -- --port 3114` starts the existing frontend. Development rewrites and allowed origins are not production routing. Production requires central ASP.NET reverse-geocoding boundary and shared Neshan ownership, separate from each brokerage inspection API. Do not copy local env/settings into a release.

## Hosting, assets and PWA
Use actual verified static out artifacts only after approved migration. Preserve URLs/deep links through a tested route map; current fallback-to-index alone is insufficient. Serve API/media separately, never through static HTML fallback. Next Image needs an approved static strategy for default artwork; Blob URLs and custom unoptimized branding do not solve all default optimizer calls. Keep local Vazirmatn and brand/logo treatment. No automotive assets changed.

Serwist is a dependency, not an active service-worker implementation. Durable IndexedDB/offline retry while the app is reachable is tested; installability, cold offline launch, SW updates and physical-device storage eviction remain unproven. Future SW must use private/no-store handling for sessions, status/config and evidence, scoped cache/version recovery and never public-cache authenticated media.

## API/session topology and operations
Prefer same-origin approved /api hosting where feasible. Separate origins need explicit trusted HTTPS bootstrap configuration, exact credentialed CORS allowlists and server-defined Secure/HttpOnly/SameSite/CSRF strategy. Agree source identity, sourceRequestId and logout/revocation before production. Browser-provided tenant/role IDs are context only. No permanent token in query parameters. See DATA_OWNERSHIP_AND_SECURITY and BROKERAGE_SSO_REQUIREMENTS.

Deploy frontend/API contract versions compatibly; pin inspection templates, preserve IndexedDB evidence/queue on upgrades and test old drafts. Rollback static code without rewinding accepted server evidence or deleting local media. Retention/cleanup is a separate approved lifecycle decision. Do not ship `.next`, local env, ignored models or private test captures as a static release package.

## Commercial asset readiness
The existing Sportage source is documented as 3D Cars Studio, CC BY-NC-SA 4.0, commercialCleared=false. That license includes a noncommercial restriction; commercial authorization is not established. Keep the approved production/remote-host restriction and excluded binaries. [Official license terms](https://creativecommons.org/licenses/by-nc-sa/4.0/) support this gate. No GLB, geometry or viewer code changed. A commercially cleared model or separate rights permission is required before commercial optional-viewer deployment.

Supplied sedan/logo assets are approved product inputs, but this audit does not invent a commercial rights grant. Product owner must retain provenance/rights documentation. Dribbble inspiration remains reference-only and is not authorized production artwork. Local Vazirmatn includes its OFL notice; retain applicable font/license notices. No new third-party art, icons or dependencies were introduced. The matching cleared sedan 4-5s orbit instructional clip remains missing; preserve the honest slot/fallback rather than substitute old Sportage or still-photo ghosts.


## V2 photo policy deployment boundary

New mock inspections pin the eleven-photo policy (ten fixed + one of four VIN/spec locations) in existing durable facts storage. Historical twelve-photo snapshots and configured White-Label v1 publication references remain valid; fresh Admin defaults to v2 and retains the v1 publication. No environment variable, origin, runtime host, static route or production server requirement changes. Global Neshan stays independent of brokerage inspection API/settings. Real server template assignment is planned API behavior; mock built-in pins do not claim production assignment integration. See PHOTO_REQUIREMENT_POLICY_V2.md.
