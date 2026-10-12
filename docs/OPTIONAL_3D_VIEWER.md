# Optional local 3D viewer

Production customer photography remains 2D. The optional viewer is a selective reuse of Phase09 c190012, not a branch merge or a second capture workflow.

## Gate and model
Only explicit development configuration plus loopback enables the toggle:
```powershell
cd C:\Projects\vehicle-inspection-ui-modernization
$env:VEHICLE_3D_PREVIEW='1'
$env:NEXT_PUBLIC_VEHICLE_3D_PREVIEW='1'
npm.cmd run dev -- --webpack --port 3110
```
Open http://localhost:3110, follow A4K9P2 / 12345 through location/vehicle to /inspection/insp_demo/capture, then select 3D. Start in 2D. LAN and production remain restricted. Local .env.local may hold these non-secret development flags, but is never committed.

The sole active variant is the existing optimized mobile Sportage GLB (12,716,516 bytes) at .agent/vehicle-3d/mobile.glb. Copy it from the authorized Phase09 local output when setting up another worktree. No original/desktop/adaptive variant is fetched. Missing file, WebGL or load failure falls back to functional 2D.

The route /api/development/vehicle-model/mobile serves only under development, explicit VEHICLE_3D_PREVIEW and loopback Host. It has no-store and nosniff headers. All other variants and production requests return 404. Model directories are ignored and excluded from production tracing. Never place this GLB under public or push it.

Source: Kia sportage GT line 2023, 3D Cars Studio; CC BY-NC-SA 4.0. Commercial clearance is NOT established. Production use remains denied. Phase09 source and original/optimized binaries remain separately recoverable.

## Viewer and ownership
OptionalVehicleNavigator owns only mode/view/reset. PhotographyOverview retains the sole requirement selection and existing marker/card/CTA/route synchronization. The heavy Canvas is lazy loaded only after explicit 3D activation and kept mounted while temporarily switching to 2D, avoiding another GLB request.

The scene reuses the loader, semantic alias/material lifecycle and camera presets. R3F/Drei controls rotate and zoom; front/right/rear/left/top/reset retain physical directions. PBR materials, a room environment, restrained lights, contact-floor treatment, bounded DPR 1-1.5 and demand rendering preserve mobile performance. All model textures/materials/geometry and environment resources are disposed on exit; fetch is aborted on unmount. Context loss triggers fallback. Three.js currently emits an upstream Clock deprecation warning through R3F; it is not a scene error.

## Fixed markers
The current twelve configured PhotoRequirements each supply their existing requirementId. Marker positions are fixed percentages along two screen-space rails (six per side), not projected Three.js world coordinates. Rotation, zoom and physical-view changes never move the markers. Transparent 44px controls contain compact visible symbols. Outside those controls, pointer input reaches the canvas.

State uses current photo + exact revision + namespace/current upload job:
- pending/no binary acknowledgement: gray
- current accepted revision binary-upload-complete: green
- draft/reviewer retake/attention: orange
- selection: independent ring, never a replacement for evidence state
Processing after binary upload can remain green for upload completion; reviewer approval is still separate. A stale revision or queued/failed transfer cannot make a marker green.

Activation delegates to the existing photography entry action. It never starts destructive recapture. Submitted edit guards remain authoritative; reviewer requests authorize only existing scoped Additional Evidence routes. No separate 3D camera, counter, evidence store, quality analysis or world-space hit system exists.

## Validation and limitations
Real mobile model loaded locally, rotates/zooms, switches views; twelve marker positions remain identical after drag/zoom; 2D/3D toggle does not download it again. Customer viewport controls remain below the image at all reviewed sizes.
This optimized source model is heavier and less photorealistic than the canonical 2D artwork. No model regeneration, mesh overhaul or asset-continuity pass was performed. It is a licensed local experiment, not a commercially cleared production viewer.
