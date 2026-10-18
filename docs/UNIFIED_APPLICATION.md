# Unified development application
Branch: feat/unified-ui-admin-3d. Base84539b7 already contains approved Admin/White-Label/UI/Neshan ports. WORKTREE_INTEGRATION_PLAN.md records commit authority and preserved dirty work.

## Running locally
In C:/Projects/vehicle-inspection-integrated:
```powershell
npm.cmd ci
npm.cmd run dev:neshan-proxy
# Second terminal, same directory:
npm.cmd run dev -- --port 3114
```
One frontend: http://localhost:3114, /admin, /admin/site-settings, /reviewer. The existing development tool is one process listening only on127.0.0.1:8787(reverse) and8788(public configuration), not another frontend. Ignored local files contain authorized keys and explicit development preview flags; never commit them.
Development-only NEXT_PUBLIC_LOCAL_SETTINGS_PREVIEW=1 overlays same-browser Admin publication on validated live public settings seed. Production API loading is unchanged. The private reverse key remains confined to the local tool.

## Model and marker contract
One ignored .agent/vehicle-3d/mobile.glb,12,716,516bytes. Endpoint /api/development/vehicle-model/mobile requires development, server flag and loopback; browser toggle requires development/public flag and loopback. Commercial rights remain unresolved. Production remains2D and endpoint404; no model variants/public GLB or new model generation.
Twelve pins use template requirement IDs. Parent selection synchronizes carousel/category/CTA. Green means accepted durable LOCAL capture. Upload text independently matches namespace + requirement + accepted revision + current job; stale acknowledgments cannot change current status. Orange means draft/retake, red actual current-job failure; selected blue ring is independent. No second counter.
Pin selects legitimate contextual view and shows canonical reference/instructions. Pending action enters shared guidance then camera. Accepted evidence opens existing review/replacement; old accepted Blob remains. Technical/internal examples are authoritative because exterior GLB does not reveal real VIN/engine details. Main bottom CTA remains; controls stay below image.

## Recorder V2
Exactly eight supplied transparent WebPs under public/assets/360-recording/ghost-guides. Supplied standalone kit remains reference only, not runtime HTML/controller/database.
Light shell/dark live-camera stage, explicit camera activation, manual guide navigation/toggle, time-only ring, supported pause/resume and pre-record switching on multi-camera devices. No gallery/fake live photo. Default60s target is configurable;100% does not stop recording or validate coverage. Manifest ordering is preserved and is not a measured walking path.
Existing recorder service owns stream, MediaRecorder, MIME selection, chunks/listeners and release. Event-driven duration excludes paused time. Hook owns UI timers, generation/late-permission cancellation and route/pagehide/visibility/unmount cleanup. Same durable draft/review/acceptance/queue pipeline; old accepted video survives replacement/discard/failure. DOM ghost is never recorded into the stream.
Physical iOS Safari/Android Chrome, camera switching, orientation/interruptions and storage pressure need device testing. Unsupported recording has live-only recovery. No fake quality result.

## Production/preservation
No new required Node endpoint, Server Action, production proxy or upload route. Historical dynamic routes/image optimization still prevent claiming completed static export. Future ASP.NET handles settings/branding/private reverse/evidence. MSSQL stores paths/metadata; evidence folder INSPECTION_{InspectionId}, never CustomerId-based storage.
12photos + integer odometer + video unchanged. Existing queues/atomic replacement/post-submit and retake locks/manual GPS fallback/AppViewport remain. Original readiness mismatch and Neshan uncommitted formatting stay untouched. No canonical automotive asset replacement, no previous baseline refresh.

## Verification
See UNIFIED_VALIDATION.md for actual commands, screenshots, source preservation and remaining limitations.

## Explicit ignored local flags
The prepared root .env.local contains DEV_NESHAN_ENABLED=1, NEXT_PUBLIC_LOCAL_SETTINGS_PREVIEW=1, VEHICLE_3D_PREVIEW=1 and NEXT_PUBLIC_VEHICLE_3D_PREVIEW=1, plus existing local proxy ports8787/8788. Do not set NODE_ENV manually. Private tool files remain tools/dev-neshan-proxy/.env.local and site-settings.local.json, copied only from the authorized local installation. They are not part of Git/deployment.
