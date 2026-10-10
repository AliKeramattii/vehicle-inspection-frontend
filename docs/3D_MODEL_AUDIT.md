# Existing Sportage GLB audit — local, not production-cleared

## Provenance and licensing gate

The exact supplied file is `references/assets/3d/source/kia_sportage_gt_line_2023.glb`.
Embedded glTF `asset.extras`: title **Kia sportage GT line 2023**, author **3D Cars Studio**
([creator](https://sketchfab.com/3DC_STUDIO)), [original source](https://sketchfab.com/3d-models/kia-sportage-gt-line-2023-fa9c34bf1bed4350a80759fe4fa54490),
**CC-BY-NC-SA-4.0**, generator Sketchfab-0.13.0. The [license](https://creativecommons.org/licenses/by-nc-sa/4.0/)
restricts commercial use and requires attribution/share-alike when distributing adaptations.
No independent commercial permission was found in project documentation/source. This is not
commercially cleared. Neither original, derivatives nor model-render images are committed or deployed.
The original file remains immutable; derivatives retain exact provenance and annotate local changes.

## Measured source

`node scripts/vehicle-3d/audit.mjs` writes a full local JSON hierarchy/material/mesh/texture report.

| Measurement | Original | Mobile candidate | Desktop candidate |
|---|---:|---:|---:|
| Bytes | 29,608,360 | 12,716,516 | 17,262,392 |
| Triangles | 584,865 | 238,087 | 302,631 |
| Reachable nodes / meshes | 1,002 / 468 | 198 / 198 | 198 / 198 |
| Materials | 43 | 37 | 37 |
| Embedded images | 22 | 22 | 22 |
| RGBA + full mip estimate | 64.30 MiB | 32.30 MiB | 64.30 MiB |
| Animations | 0 | 0 | 0 |

File measurements refer to the final semanticRegion/sourcePaths-annotated variants. Renderer calls may exceed mesh
count because transparent double-sided materials render multiple passes, plus studio geometry.
Decoded texture memory is an uncompressed RGBA/mipmap estimate, not a measured GPU allocation.

Bounds (metres): X [-1.05507345, 1.05507361], Y [-0.00995319, 1.64504681],
Z [-2.25267267, 2.26356916]. Size **2.110147 × 1.655000 × 4.516242 m**.
The world is **+Y up; front -Z; rear +Z; physical left -X; right +X**. This is verified by front/rear
light and bumper bounds and the source Door_FL/FR and steering-wheel positions, not inferred from RTL.
The Sketchfab root contains inverse X-axis rotations, and wheels centimetre scaling; world transforms
are composed before measuring or optimizing. Runtime only centers X/Z and places the bottom on the floor.
Original SHA-256: `3404702d4fe1242c4ca2cecac09d46ae906d652c763660d2b92853ec9cebe491`.

The source has 468 scene mesh instances, 468 draw primitives before transparent passes and 1,002
reachable nodes; no unreachable source nodes were found. Six material pairs are exactly identical
apart from their names. Most geometry is interior: 302,447 triangles; wheel assemblies 56,080;
lights/glass/grille 69,640; remaining exterior 156,698. Seats alone include a 42,265-triangle mesh.
Eleven materials use alpha blending, including glass and interior decals/stitches, increasing overdraw.

Textures range from 8×128 stitching maps to two 2048² interior sheets. The mobile candidate reduces
only those two sheets to 1024²; 1024² tire/normal maps, 512² dashboard/text/detail maps and smaller
maps remain untouched. PNG preserves alpha and detail. No Base64, KTX2, Draco or external decoder
network request is introduced. The official Khronos glTF Validator was installed only in ignored local
tooling. Final validation: source 0 errors / 0 warnings / 293 unused-UV informational notices;
both candidates 0 errors / 0 warnings / 0 informational notices. Blender was not on PATH or in the
standard installation directory. Existing glTF Transform 4.5.1,
meshoptimizer and sharp were used locally; application dependency files were left untouched.

## Selective optimization

`node scripts/vehicle-3d/optimize.mjs` generates only ignored `.agent/vehicle-3d/{mobile,desktop}.glb`.
It snapshots source ancestry, bakes composed world transforms, welds compatible vertices and applies
meshoptimizer with bounded error and locked borders per primitive. Interior gets stronger reduction;
painted panels retain their original topology to protect reflected body shape. Lights/glass/grille
receive tighter error budgets. Wheels keep more than hidden trim.
Compatible primitives are batched within semantic region + material + attribute layout; doors,
lights and body groups remain separate. Exact duplicate resources are pruned/deduplicated. Each
optimized node retains `sourcePaths` and `semanticRegion` extras. No source node is blindly renamed.

The mobile reduction is 59.3% of triangles / 57.1% of file size; desktop 48.3% / 41.7%.
The 35–70k and 80–150k triangle goals are **not achieved**: error/border limits stop further
simplification. These candidates are measured improvements, not production mobile approval.
More aggressive reduction requires a DCC pass, identifying overlapping trim variants and manual
silhouette/light/wheel QA. The script deliberately does not discard source assemblies speculatively.

## Materials and semantic limits

Runtime body paint affects only `CarPaint`, configurable pearl/silver, with restrained metalness,
clearcoat and roughness. Tire/leather/plastic metalness is corrected; chrome is softened; glass
roughness/depth writing are controlled. Other colors/maps/UVs remain intact. Materials are shared
within a semantic group but separated between groups so a selected region cannot recolor all bodywork.
Original and candidate comparison renders use identical material adaptation, camera and local studio.

Door FL/FR/RL/RR source meshes exist, but their pivots are not validated hinges and parts are grouped
by material, not coherent animated assemblies. `Hood_Surface` maps the front paint surface; it is not
a proven openable engine lid. No animation is claimed. Dashboard/interior exist, but VIN/specification
plate and readable odometer data are not asserted. Those requirements remain contextual guide entries.

## Equivalent visual review and rejected candidates

Original/mobile/desktop were compared from front-right, front-left, rear-right, rear-left, front,
rear, side and top, with matching camera, lighting and material adaptation. Final candidates retain
the silhouette, wheel placement, major light shapes and panel boundaries at the tested display size.
Some tire/interior tessellation is reduced. Fine speckling, overlapping trim/glass and front-grille
artifacts are also visible in the original; the current candidates do not solve those source issues.
The floor treatment is a restrained ellipse, not physically accurate contact shadows. This is local
prototype approval only, not final premium-render or commercial approval.

An early interior-name matcher accidentally matched the substring in `CarPaint`; the resulting hood
distortion was rejected. Interior matching now uses whole node prefixes and painted topology is
retained. A stale camera override also caused non-equivalent comparisons; selection reset was fixed
and all eight comparisons regenerated. Wheel aliases now use actual transformed vertex bounds,
not node translations, because source vertices can already contain wheel offsets.

Local comparison images, validator findings and browser/performance results are recorded in
`3D_MODEL_INTEGRATION.md`. Lower mobile budgets, source assembly cleanup and physical-device testing
remain gates before changing the commercial production default.
