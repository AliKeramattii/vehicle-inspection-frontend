# Experimental vehicle viewer — superseded customer direction

The unfinished 3D customer home was never committed or pushed. Production Phase 04 now uses
image-guided photography; see PHOTOGRAPHY.md and prompts/04-inspection-3d.md.

Reusable code remains in components/vehicle/three and lib/vehicle, with no customer route imports.
It supports a procedural development SUV, optional future GLB adapter, semantic nodes, pins,
region highlights, physical view controls, standing marker and schematic fallback. No GLB exists.
Expected future paths remain public/vehicle/models/inspection-suv-mobile.glb and desktop equivalent.
The stylized model/approximate anchors are experimental, not final production assets.

Future hotspot selection must map through section/requirement IDs in the shared photography
template. Camera/review/storage must not depend on WebGL or be duplicated. No model refinement
or optional viewer enablement is part of the current phase.
