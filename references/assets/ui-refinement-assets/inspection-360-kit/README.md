# 360° Vehicle Capture — Persian RTL UI kit

A standalone Vite + React + TypeScript starter **based on the supplied Persian UI reference**. Contains all essential WebP assets, outline SVG icons, an interactive circular orbit guide, video camera access, MediaRecorder support, and a Persian RTL UI.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use `npm run typecheck` and `npm run build` to validate.

**No-dependency static preview:** from the project root, run `python -m http.server 5500` and open `http://localhost:5500/preview.html`. This is a visual mockup (not the functional React recorder).

> Camera permissions require **localhost** or **HTTPS**. `getUserMedia` and `MediaRecorder` availability varies by browser. A demo background is shown until camera access is granted.

The exact supplied screenshot is included at `references/360-ui-reference.png` for visual comparison.

## Folder layout

```text
public/
  images/inspection-360/
    scene-background.webp       static demo photo (NOT the real camera)
    car-main-360.webp           white SUV illustrative source photograph (optional)
    top-view-car.webp           real top-down view for mini-orbit
    orbit-360-illustration.webp for the Help sheet
  icons/inspection-360/
    close.svg, guide-book.svg, light.svg, level.svg, speed.svg,
    check-circle.svg, switch-camera.svg, pause.svg, play.svg,
    record-stop.svg, orbit-arrow.svg, camera.svg, warning.svg,
    download.svg
src/
  App.tsx
  styles.css
  components/{SvgIcon,OrbitProgressGuide,RecordingTimer,StatusCard,GuideDialog}.tsx
  hooks/useCameraRecorder.ts
```

## What works in this starter

- Responsive Persian RTL UI closely inspired by the supplied screenshot.
- Demo view (explicitly marked as sample) with sample 65% orbit and 00:28 timer.
- On-demand camera permission and rear/front camera toggling.
- Browser `MediaRecorder`: start/stop/pause/resume; local video URL download.
- Guide/help sheet and exit confirmation.
- Orbit/mini-orbit visualized using responsive SVG and WebP, **not** baked into a static image.
- The screen's demonstration quality checks appear green **only in demo mode**.

## Critical production integration

- **Orbit progress is not inferred from recording time.** The UI sets the live progress to `null` until you integrate verified 360° coverage data (e.g. a validated capture/coverage system). Never show “65%” as real without proof.
- In real camera mode the quality signals (`light`, `level`, `speed`) are **not verified** and correctly display neutral markers. Implement your camera/computer-vision/motion checks and wire validated `QualitySignals` in `App.tsx`. DeviceOrientation alone cannot reliably measure walking speed around the car.
- Recording stays local in the browser. To persist, upload the Blob to your backend or object storage using your authenticated upload flow. Saving a generated object URL locally is not a durable upload.
- Add explicit supported browser/device checks, storage constraints, file validation, permission handling, accessibility QA, and lifecycle integration before production use.
- **Do not render `car-main-360.webp` over a live camera feed**. The car is already in the actual video; the cutout is an optional onboarding/help visual.
- If your project already uses custom design-system components, import the public assets and reuse the `OrbitProgressGuide` and hook rather than replacing existing app-level UI architecture.

## Asset guidance

- WebP assets are compressed; top-view and help illustrations preserve transparency, while the optional main SUV photo keeps its studio background.
- SVG icons have a consistent 24×24 viewBox, ~1.9px strokes, and `currentColor`, and can use CSS `mask-image` (as in the provided `SvgIcon` component).
- Icons/labels/camera layer/progress are separate. This is intentional to preserve interactivity.
- `scene-background.webp` is a stylized sample assembled from the previously provided vehicle reference image; replace it with the real camera feed in production.
- `car-main-360.webp` is a full studio photo, **not a transparent cutout**. Use it as a reference/help image; do not layer it onto live camera footage.

## Recommended integration point

Copy `public/images/inspection-360` and `public/icons/inspection-360` into your PWA's public folder, merge the React components, and adapt `useCameraRecorder` to the project's existing upload/submission state machine. Review the existing app's `AGENTS.md`, phase specifications, offline upload queue, and reviewer requirements before changing their behavior.
