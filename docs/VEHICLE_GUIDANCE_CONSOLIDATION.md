# Supplied sedan guidance consolidation

## Scope and asset destinations
Canonical worktree only: vehicle-inspection-integrated, feat/unified-ui-admin-3d. The preceding sedan migration already replaced active landing, readiness/consent hero, identity, overview/navigation, twelve guide and receipt defaults. This change adds four exact-byte runtime copies, no generated vehicle pixels:

| Supplied guide | Runtime path under public/assets/inspection-vehicle/ | Use |
|---|---|---|
| guides/readiness-clean-vehicle.webp | readiness/readiness-clean-vehicle.webp | First readiness row |
| guides/readiness-open-space.webp | readiness/readiness-open-space.webp | Second readiness row |
| guides/spec-plate-2.webp | photo-guides/spec-plate-2.webp | Under-seat code option |
| guides/Pearl-white sedan windshield VIN inspection.webp | photo-guides/windshield-vin.webp | Windshield code option |

The first two illustrations are the explicitly requested supplied technical/cartoon art, distinct from the sedan studio hero. Original source names/bytes remain intact. Pillar and engine-wall choices reuse existing exact sedan spec-plate.webp and chassis-number.webp. NEW_VEHICLE_ASSETS.json now inventories 47 supplied files and 31 unique runtime images; duplicate supplied guide/source copies do not create duplicate public copies.

## VIN/spec choices
Both built-in VIN/spec samples expose four keyboard-accessible visual buttons before capture: driver pillar, engine wall, under-seat and windshield. Selection changes only sample/instructions; original requirement IDs, seven sections, twelve photos, queue linkage and confirmation remain unchanged. Known legacy sample aliases still work; tenant/custom references are not silently replaced.

useIdentificationGuide keeps a tab-scoped presentation choice in sessionStorage, with an in-memory fallback when browser storage is disabled. It is keyed by inspection, requirement and workflow scope. Additional Evidence uses request/item scope so reviewer reasons and candidate evidence remain isolated. Guidance, direct camera access and comparison reuse this choice. The camera never opens before a required choice. No gallery input or new route/query parameter is added. Focus moves to the requirement heading after selection.

The choice is not new business/evidence state and is not a backend field. It survives route changes and same-tab reloads, not a new browser session; actual captured Blob ownership/persistence and accepted-original atomicity are unchanged. Reopened evidence remains its actual Blob, never reference artwork.

## Photo-only alignment
PhotoAlignmentGuide maps exact supplied/legacy sample roles to front, rear and four physical 45-degree ghosts. No mirroring. Interior/roof/technical captures have no unsuitable vehicle outline. The supplied transparent WebPs sit in a pointer-transparent decorative DOM layer at 22% opacity with an accessible on/off button. useCamera still captures only the video element through canvas: guides are never burned into JPEGs. Existing camera shutdown, permission failure and durable draft/accepted handling remain.

## Walk-around guidance: remaining asset blocker
Recorder V2 no longer imports, downloads or displays still-photo ghosts or angle-switch controls. Live recording, pause/timer, persistence, errors, retries, review/replacement and cleanup are unchanged. Its existing help dialog shows the supplied sedan top-view with a static orbit path, clearly separate from the actual live camera. This is an instructional path illustration, NOT a claimed 3D animation or position tracker.

**The requested smooth 4–5-second 3D orbit preview is not supplied and is not complete.** The only existing GLB is the restricted noncommercial Sportage, not the sedan. It was not modified, rendered into a public derivative, published, or enabled in production. Clarification was requested rather than bypassing licensing or reintroducing the old family.

WalkaroundPreview accepts an optional cleared clip, with native controls, no autoplay and full-frame containment; invalid/failed media falls back to the static sedan path. Duration must be 4–5 seconds. No clip is configured yet, no broken URL is requested. Next action: supply/approve a matching sedan orbit clip (recommended) or separately approve a clearly labeled loopback-only experiment using the existing restricted model. Do not fake an orbit by rotating a flat image or crossfading unrelated stills.

## Preserved boundaries
No optional 3D source/model, licensing gate, backend/API, Neshan proxy/map, route structure, brand tokens, AppViewport, upload, submission, reviewer/admin logic or canonical historical image/baseline was changed. Existing tenant image overrides and actual customer evidence remain untouched. Vehicle direction controls stay below the image. Live-only capture restriction remains.

## Local run
From C:/Projects/vehicle-inspection-integrated, run npm.cmd run dev:neshan-proxy in one terminal and npm.cmd run dev -- --port 3114 in another. The existing proxy allowlist uses localhost/127.0.0.1:3114; preserve it rather than changing local origin configuration. Customer /; admin /admin; reviewer /reviewer; confirmed-location /inspection/insp_demo/location; photography /inspection/insp_demo/capture; 360 /inspection/insp_demo/capture/video/record. Use A4K9P2 then 12345 and complete readiness/consent/location/vehicle before opening guarded capture URLs. localhost or HTTPS is required for live camera; LAN plain HTTP cannot use a gallery substitute. Existing local Neshan configuration/proxy remains as documented in UNIFIED_APPLICATION.md and the development proxy docs; no secrets changed.

## Validation
See VEHICLE_GUIDANCE_VALIDATION.md after final execution. Historical screenshot baselines remain unchanged; four new focused VIN/camera baselines are reviewed separately. Unrelated readiness/local configuration edits are not staged.
