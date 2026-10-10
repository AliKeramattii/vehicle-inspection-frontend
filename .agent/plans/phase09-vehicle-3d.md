# Phase 09 — local optional Sportage viewer

## Goal
Audit the supplied GLB, create measured local optimization variants, and integrate a development-only optional viewer with the existing inspection workflow. Production remains 2D; commercial model permission is unresolved.

## User-visible behavior
An explicitly enabled local preview reuses the customer overview, selection, evidence states and guarded guidance/review routes. Preset/orbit controls remain below the viewer. Loading/failure/user-selected 2D use the existing artwork and markers. No new photo requirements or default 3D downloads.

## Current state
Base HEAD 6228c67 on main follows completed Phases 04–08; work is isolated on `feat/optional-vehicle-3d`. Twenty-four tracked user edits, untracked skills, readiness artwork and two GLB source locations exist. Their initial hashes are recorded in ignored `.agent/reference-review/phase09/user-state.json` and remain unchanged. Existing experimental primitive vehicle components are not suitable substitutes for the actual Sportage. glTF Transform, meshoptimizer, sharp, Three/R3F/Drei and Playwright are installed. Blender was not found; the official validator was installed only in ignored local tooling.

## Constraints
Preserve all unrelated edits and readiness baseline drift. Never commit the source, derivatives or model-render comparison images while licensing is unresolved. Preview requires development mode and an explicit server flag, and only serves models through a local guarded endpoint. Protect the old public GLB path without deleting user files. Maintain AppViewport/RTL/physical directions, 12 configured photos, common evidence helpers and post-submit permissions. No backend, new capture framework, img2threejs or asset generation.

## Implementation
1. Inspect metadata, hierarchy, bounds, geometry, materials and images; document provenance and tooling.
2. Use reproducible local scripts for selective simplification, texture budgets and equivalent comparisons. Keep original immutable and preserve attribution.
3. Add isolated lazy viewer/model loading, semantic aliases, world anchors, bounded controls and resource cleanup.
4. Inject an optional navigator into the existing guarded overview only from a development preview route. Reuse selection/card/CTA and evidence navigation.
5. Add feature-gate/geometry/navigation/fallback/cleanup tests and local screenshot/performance review.
6. Run actual scripts, isolate known unrelated readiness failure, review only task diff, commit/push code and documentation without restricted assets.

## API impact
None. Existing PhotoRequirement IDs and routes remain authoritative. No production API or public model endpoint is introduced.

## Testing
Unit: gate, presets, anchors, semantic aliases, loader lifecycle. Browser: real local GLB, pending/completed/retake navigation, fallback/loading, controls below scene, responsive bounds, no default downloads, context disposal. Full lint/typecheck/unit/e2e/build with real exits. Compare original and variants in eight equivalent views; record render/download/parse/renderer metrics with limitations.

## Acceptance criteria
- [x] Source measured and license/provenance documented.
- [x] Local variants measured and visual degradation assessed honestly.
- [x] Optional local viewer uses actual source, shared IDs and routes.
- [x] Presets/markers/fallback accessible, selection synchronized, controls below.
- [x] Production model handler/public path blocked; pre-stream preview gate added after production test caught HTTP 200 not-found streaming.
- [x] Viewports and performance reviewed; real validation exits recorded.
- [ ] User edits unchanged; focused code/docs committed and pushed, no model binaries.

## Progress
- [x] Required source exists (29,608,360 bytes); embedded noncommercial license found, no independent commercial permission found in project text.
- [x] Architecture/reference review and initial user-state snapshot.
- [x] Audit/optimization: 584,865 → 238,087 mobile / 302,631 desktop triangles; 29,608,360 → 12,716,516 / 17,262,392 bytes. Official validator: 0 errors/warnings all three; source 293 unused-UV infos, candidates none. Goal budgets remain unmet.
- [x] Viewer/integration: real GLB, actual-bounds framing, eight shared exterior anchors, contextual detail requirements, adaptive single-variant loading, material paint updates without refetch, semantic highlights, 2D fallback and disposal.
- [x] Validation and documentation.
- [ ] Focused Git delivery (only 31 task-owned code/docs files; no model assets or user changes).

## Discoveries and visual/performance results

License is CC-BY-NC-SA-4.0; no commercial permission found. Only local prototypes are authorized;
original/derivatives/render images stay ignored and outside deployment traces. The default remains 2D.
No Blender installation found; existing glTF Transform/meshoptimizer/sharp used. Selective simplification
keeps painted topology after rejecting an early interior matcher that also matched CarPaint.
World transforms/actual wheel vertex bounds preserve dimensions and physical left/right aliases.

Reviewed original/mobile/desktop in all eight equivalent views, selected/completed/retake markers,
loading/fallback and 360×800 / 390×844 / 430×932. No control overlays or document overflow; small-screen
cards remain reachable through existing internal scroll. Source trim/transparency imperfections and
approximate contact shadow remain; no hinge animation or exact VIN/spec geometry is claimed.

SwiftShader one-second warm-up: original 531 calls / 607,345 render triangles / 43.3 FPS; mobile
237 / 250,267 / 43.3; desktop 237 / 317,579 / 41.7. Throttled mobile (4 Mbps,120ms,CPU×4) fetch 26,169ms,
parse 179ms, warm-up 35.8 FPS. These are finite desktop/software measurements, not sustained-phone
approval or measured GPU memory. Model RGBA/mips estimates: mobile 32.30MiB, desktop/source 64.30MiB.

Fixed hidden meshes caused by changing scalar material into an array without groups; stale preset
override on returning to a shot card; far-side marker overlap; and dev bind-address Host detection.
Dev Playwright trace writes inside the watched project caused Fast Refresh/manifest feedback; local
artifacts now use OS temp and the full local runner exits. Existing THREE.Clock deprecation remains.
Final proxy gate correction was revalidated in an isolated export because a user dev server
is running on port 3000; it was not stopped or overwritten. The private preview command additionally
binds to 127.0.0.1, leaving the normal LAN development command unchanged.

## Final validation

All commands below actually completed, rather than only completing their assertions:

| Check | Working tree | Isolated intended source |
|---|---|---|
| `npm run lint` | exit 0 | exit 0 |
| `npm run typecheck` | exit 0 | exit 0 |
| `npm run test` | 227 tests / 18 files, exit 0 | 227 tests / 18 files, exit 0 |
| `npm run test:e2e` | 143 passed / 86 skipped / readiness failure, exit 1 | 144 passed / 86 skipped, exit 0 |
| `npm run build` | exit 0 | exit 0 |
| Explicit local viewer suite | 9 passed, exit 0 | final loopback-only run: 9 passed, exit 0 |

The only working-tree full-suite failure is the exact pre-existing 4,010-pixel readiness mismatch;
no readiness change/baseline was staged or modified. Isolated source was exported from the staged
index and reused installed dependencies via a junction; it was not a fresh dependency installation.
The final private run covers the corrected pre-stream gate and loopback bind. Both builds have 26
server traces with zero restricted model references, and no GLB anywhere in their `.next` output.
No screenshot baselines, canonical automotive assets, package files or API contracts changed.

Final staging/security review: 31 explicit intended files, all 24 unrelated tracked paths retain
their initial SHA-256/deleted state. Original model hash unchanged. No model binary/render artifact,
credential/environment file or unrelated user work is staged. Code/doc delivery is pending below.
