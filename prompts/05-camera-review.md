# Codex task — Guide sheet + Camera + Photo review + Odometer

**Scope update:** basic guidance, camera, durable local capture and sample comparison now belong
to revised Phase 04 (`04-inspection-3d.md`). This is a future enhancement brief. Preserve that shared
workflow; do not restore mandatory 3D or duplicate camera logic. Quality policies/IDs are configured.

## Canonical visual references

- `references/screens/08-photo-guide-bottom-sheet.png`
- `references/screens/09-live-camera-ghost-alignment.png`
- `references/screens/10-photo-review.png`
- `references/screens/11-odometer-review.png`
- `references/screens/17-inspection-photo-guide-reference.png`
- `references/screens/23-ghost-alignment-asset.png`

Inspect **all** references above before implementation. The first screen-specific image is the primary composition reference; the others are supporting references for shared visual language, media, 3D, or overlay details.


Create an ExecPlan because this includes browser media APIs.

Implement:

1. Photo-guide bottom sheet
2. Live camera screen
3. Photo review
4. Odometer photo review

Camera architecture:
- live `<video playsInline autoPlay>`
- `getUserMedia`
- ghost overlay as a separate SVG/DOM layer
- no guide card covering the live camera
- quality indicator components
- shutter UI
- capture still using canvas -> Blob
- save Blob into a storage abstraction before upload
- graceful permission/error states

Photo review:
- image dominant
- pinch/zoom-capable viewer or future-ready abstraction
- quality checklist
- readable-plate confirmation where the configured quality policy requests it
- confirm/save vs retake

Odometer:
- configured odometer requirement (currently `odometer-on`)
- integer domain value
- Persian formatted display/input presentation
- never store/send `۴۸٬۳۲۰` as the API numeric value; domain value is `48320`

Keep the camera surface dark; ordinary review screens remain light.
