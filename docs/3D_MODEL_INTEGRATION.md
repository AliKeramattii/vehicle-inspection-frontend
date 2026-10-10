# Optional local vehicle viewer

## Boundary and launch

Production remains the existing **2D** workflow. No source/derived GLB belongs in public deployment.
Source and local derivatives are ignored by Git; the user's old untracked `public/assets/models` copy
is preserved but its serving path returns 404 through `src/proxy.ts`. The model route and preview
page return HTTP 404 in production even if a deployment accidentally sets the preview flag.
The proxy gates before customer-layout streaming; page-level `notFound()` alone can return HTTP 200
after streaming starts. Restricted asset directories are excluded from production file traces.
Do not copy ignored assets into
deployment packaging; no commercial permission is established (see `3D_MODEL_AUDIT.md`).

Local launch in PowerShell:

```powershell
node scripts/vehicle-3d/optimize.mjs
$env:VEHICLE_3D_PREVIEW = '1'
npm run dev -- --webpack --hostname 127.0.0.1 --port 3103
```

The tooling script requires the locally installed `@gltf-transform/{core,extensions,functions}` 4.5.1,
meshoptimizer and sharp. These tooling packages were already added locally by the user, outside this
task's commit; a fresh environment needs those tools separately before generating candidates.

Enter the unchanged mock flow (A4K9P2 / 12345), confirm vehicle, then use **پیش‌نمایش محلی مدل خودرو**.
The explicit `/inspection/{id}/capture/preview-3d` page inherits the same auth/edit guard and capture
layout. Page and model handler require development + `VEHICLE_3D_PREVIEW=1` and loopback Host.
This Host restriction limits normal local access; it is not a production authentication mechanism.
The preview launch binds only to loopback; the normal `npm run dev` LAN configuration is unchanged.
The page is unavailable over normal LAN Host and never exposed as an approved commercial mode.

## Architecture and shared state

`src/features/vehicle-3d/` contains a small optional navigator, lazy R3F scene, owned model loader,
resource lifecycle, typed presets/quality config and world anchors. The ordinary photography feature
has an optional navigator slot, defaulting to its unchanged 2D component. It imports no renderer.
The viewer is loaded only after explicit preview navigation; only one quality variant is fetched.

The existing PhotographyOverview owns the selected requirement ID. Its shared marker activation
uses `photoRequirementEntry`: pending/retake → guide; accepted/draft → existing evidence review.
Cards/categories/section/reset/CTA derive from that selection; controls return the parent-selected ID
when choosing a view. No new requirements, evidence state, photo counters or marker-specific router.
Submitted inspections cannot mount this editable preview; ordinary and Additional Evidence permissions
remain unchanged. Requested retakes use the existing scoped request route, not this preview.

## Rendering, anchors and controls

Actual supplied GLB only; no primitive substitute. Original/mobile/desktop/reduced quality options are
local diagnostic controls. Mobile/reduced use the mobile candidate, desktop only on wide capable
devices or explicit choice. DPR is clamped at 1–1.5 (reduced 1), no postprocessing/dynamic shadows/HDR
download. Local RoomEnvironment provides restrained PBR reflections, white/cool-grey studio lighting
and a quiet floor contact treatment. Finite initial frame measurements return to demand rendering;
orbit is bounded and damping disabled, respecting reduced motion without decorative animation.
An actual model-bounds corner projection constrains camera distance so orbit/zoom cannot clip the
silhouette. Body-paint changes update owned materials without downloading or parsing the model again.

Coordinates use actual metres: +Y up, front -Z, physical left -X, right +X. Eight exterior guide
anchors reference existing IDs; geometry is normalized by centering/floor placement, not arbitrary
resizing. Anchors are guide locations, not claims of automated mesh/CV detection. Near-facing markers
are semantic 44px buttons around unchanged 28px gray/blue/orange status symbols. Selection is a ring.
Far-facing/occluded markers are hidden; the shared cards provide keyboard access to every requirement.
Odometer, cabin, VIN/spec details have explicit contextual guidance instead of fabricated locations.
The standing ring indicates an approximate photographic position, never measured customer position.
Highlighting changes only the actual aliased region, subtly; it does not assert precise plate mesh IDs.

The layout remains viewer → **controls below** → categories/context → cards → BottomStickyCTA.
No breakpoint overlays the control strip. AppViewport/100dvh and one internal content scroll region
remain. Targets: 360×800, 390×844, 430×932; physical directions are not mirrored by RTL.

## Loading, fallback and cleanup

The existing current artwork/markers remain visible during loading. Error/unsupported/user-selected
2D mode unmounts Canvas, keeps selection/progress and exposes the existing navigator plus retry.
Fetch has an AbortController; late parsed results are disposed. Geometry/material/texture ownership
is unique per mounted model, with de-duplicated disposal. Scene/environment/render-list resources,
context listeners and controls are released; R3F owns Canvas/context teardown. No cache/preload or
perpetual timer retains GLBs after navigation. The source's single-material mesh shape is preserved;
turning it into an array without geometry groups would incorrectly hide the vehicle.

## Validation and release gates

Local screenshots/comparisons are generated under the OS temporary directory
`vehicle-inspection-phase09/screenshots/` and copied to ignored
`.agent/reference-review/phase09/final-renders/`; no restricted
model-render image is published or turned into a production baseline. Existing visual baselines
remain untouched. Browser tests use real local GLBs and deterministic stored photo fixtures, with
no real camera/backend. Production gate coverage runs in the ordinary full e2e suite.

The separate `playwright.vehicle3d.config.ts` runs real-model browser tests only with explicit local
enablement. Its traces/results are outside the watched project tree: writing Playwright traces
inside the development server's filesystem caused repeated Fast Refresh invalidations, interrupted
hydration and manifest races. Moving artifacts to OS temp resolved that feedback loop. Production
tests keep their existing configuration. A user development server is not stopped for validation;
the final local preview check uses an isolated source export.

## Measured browser results

Chromium/ANGLE SwiftShader, 390×844, bounded DPR; one-second finite warm-up samples, not sustained
orbit benchmarks. Local fetch times include dev-server variability and must not be compared as
production network speed rankings. Parse times exclude shader compilation and scene preparation.

| Variant | Fetch ms | GLTF parse ms | Renderer calls | Rendered triangles | Warm-up FPS |
|---|---:|---:|---:|---:|---:|
| Original | 7,283 | 197 | 531 | 607,345 | 43.3 |
| Mobile | 3,129 | 188 | 237 | 250,267 | 43.3 |
| Desktop | 1,224 | 209 | 237 | 317,579 | 41.7 |
| Mobile, 4 Mbps / 120 ms / CPU ×4 | 26,169 | 179 | 238 | 250,363 | 35.8 |

Renderer counts include transparency passes, environment and floor/guide resources. The throttled
sample includes one additional standing ring. All samples reported 24 renderer textures, including
environment resources; uncompressed model RGBA/mips are estimated at 32.30 MiB mobile / 64.30 MiB
desktop, not measured GPU allocations. No browser page/console errors occurred in the comparison
run. An upstream `THREE.Clock` deprecation warning remains; dependencies were not changed to mask it.
The 26-second throttled download is a release blocker. Reduced mode limits DPR/antialiasing but currently
shares mobile geometry, so it does not meet a genuinely low-end geometry budget yet.

Visual review covered eight equivalent model views, default 2D, 3D at 360×800 / 390×844 / 430×932,
rear/side markers, selected region, completed and retake states, loading and fallback. Controls stay
below the scene, touch targets are at least 44px, document overflow is absent and actions remain
reachable. On the smallest viewport, cards use the existing intentional internal scroll region.
The scene preserves the bright automotive hierarchy of references 07/22, but the source's trim/glass
artifacts and approximate contact shadow still fall short of final premium reference rendering.

Cleanup checks cover unique geometry/material/texture disposal, aborted and late loads, bounded
frame activity, context loss listeners and actual WebGL context release after switching to 2D.
They do not measure physical GPU-memory reclamation or long-session mobile thermal behavior.

## Final technical validation

| Command / check | Working tree | Isolated staged source |
|---|---|---|
| `npm run lint` | exit 0 | exit 0 |
| `npm run typecheck` | exit 0 | exit 0 |
| `npm run test` | 227 tests, 18 files, exit 0 | 227 tests, 18 files, exit 0 |
| `npm run test:e2e` | 143 passed / 86 skipped / 1 unrelated readiness failure, exit 1 | 144 passed / 86 skipped, exit 0 |
| `npm run build` | exit 0 | exit 0 |

The working-tree failure is exactly the pre-existing 4,010-pixel readiness mismatch. All 24 unrelated
tracked edits/deletions were checked against their initial hashes and excluded from staging. No
baseline was regenerated, no canonical automotive asset was changed and no dependency/configuration
user work was included. Both production builds' 26 server file traces contain no restricted model
references, and no GLB is emitted into production output. Production gate tests pass in both projects.
The isolated local viewer suite passes all nine scenarios; private launch uses a loopback-only bind.
The isolated export uses the existing installed node_modules through a junction; it is not a claim
that a new clean-machine dependency installation was performed. Next's nested-lockfile warning is
specific to this validation export, not a new deployed workspace layout.

Final command exits and preservation results are also recorded in the Phase-09 ExecPlan. Commercial
permission, source cleanup, lower GPU budgets, real-device performance and final visual approval
remain prerequisites for any production switch; this task does not switch the default or start a
future phase. API contracts, canonical imagery and all existing screenshot baselines are unchanged.
