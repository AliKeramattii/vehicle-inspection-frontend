# Integration instruction for Codex

Integrate the attached `inspection-360-kit` assets/components into the existing vehicle-inspection PWA. Read `AGENTS.md` and the project design system first. Preserve the existing navigation, photo/video evidence workflow, persisted uploads, consent state, offline guardrails, and submission locking.

- Copy `public/images/inspection-360/` and `public/icons/inspection-360/` into the existing `public/` tree.
- Adapt the provided React UI components and CSS to the project's current component architecture; do not create duplicate routers.
- Reuse and adapt `useCameraRecorder.ts` only after reviewing how the app currently captures and uploads videos.
- Use the native camera stream for the background; the sample WebP scene is for demo only. Do not overlay a static car cutout on the live camera view.
- Connect completed recordings to the project's durable upload queue and server API, and validate MIME types, size limits, retries, and background upload behavior.
- Only show 360° progress when backed by real validated coverage-tracking data. Do not interpret recording elapsed time as the percentage completed.
- Only show green quality indicators when corresponding real sensor/vision measurements have been made and passed; the provided React page displays neutral indicators in live mode.
- Keep Persian RTL labels and accessibility semantics; test narrow mobile viewport sizes and reduced motion preferences.
- Run lint, typecheck, build, and E2E tests; capture before/after screenshots; report any browser compatibility limitations.
- Commit and push only after verification and under the existing Git workflow.

Demo entry: `preview.html` works as a static browser preview through a local HTTP server. The React starter runs with `npm install && npm run dev` when npm registry access is available.
