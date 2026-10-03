# Codex task — Interactive inspection home

## Canonical visual references

- `references/screens/07-inspection-3d-home.png`
- `references/screens/17-inspection-photo-guide-reference.png`
- `references/screens/21-vehicle-2d-fallback.png`
- `references/screens/22-vehicle-webgl-reference.png`

Inspect **all** references above before implementation. The first screen-specific image is the primary composition reference; the others are supporting references for shared visual language, media, 3D, or overlay details.


Create and follow an ExecPlan.

Implement the customer 3D inspection home at the capture route.

Requirements:
- Journey stepper: location and vehicle complete, capture current
- 7/14 progress treatment
- segmented capture progress
- upload status `۷ همگام‌شده • ۲ در صف`
- main 3D scene dominates the viewport
- React Three Fiber shell
- model adapter that can work now with a placeholder/fallback and later with the production GLB
- inspection pin component states:
  pending / selected / completed / retake
- selected pin pulse, respecting reduced motion
- region-highlight API by semantic node names
- standing-position marker
- viewer controls for front/right/rear/left/top/reset/2D
- shot groups and horizontal shot carousel
- sticky CTA for next shot

Do not fake the whole viewer with a static reference screenshot.
If the final GLB is absent, implement a clean adapter/fallback and document exactly where it should be added.

Keep WebGL code isolated from ordinary page UI.
