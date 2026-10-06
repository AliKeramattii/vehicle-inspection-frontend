# AGENTS.md — Vehicle Inspection Frontend

## Mission

Build a production-quality Persian RTL vehicle self-inspection web application whose implemented UI closely matches the local PNG references in `references/screens/`.

The product has three interfaces that share one design system:

1. Customer PWA — mobile first, Persian RTL.
2. Reviewer workspace — desktop operations UI.
3. Admin portal — desktop configuration UI.

The backend is a separate C# / ASP.NET Core API. Frontend development must not block on backend availability: use typed mocks and adapters first, then replace them with generated API clients.

## Source of truth

For visual work, use this priority:

1. The complete visual reference set documented in `references/INDEX.md`.
2. The primary local PNG in `references/screens/` for the screen being implemented.
3. Supporting PNG references for the same phase (vehicle, ghost overlay, 2D fallback, etc.).
4. `docs/DESIGN_SYSTEM.md`.
5. Reusable assets under `references/assets/vehicle-inspection-ui-assets/`.
6. Existing project components and tokens.

All PNGs supplied in `references/screens/` are intentional. Do not ignore or delete any of them.
Before a phase, read `references/INDEX.md` and inspect every reference assigned to that phase.

Never use a reference PNG as a CSS background to fake the UI. Reconstruct it with semantic React components.

## Required stack

- Next.js App Router
- TypeScript, strict mode
- React
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query for server state
- Zustand only for transient UI/workflow state
- Three.js + React Three Fiber + Drei for the 3D viewer
- IndexedDB for locally captured media
- Serwist for PWA/service-worker behavior
- Playwright for end-to-end and screenshot regression tests
- Vitest for unit tests
- Storybook for reusable UI components when practical

Do not add a second UI framework such as Material UI, Ant Design, Bootstrap, Chakra, or Mantine unless explicitly requested.

## General coding rules

- Prefer small typed components over large page components.
- Keep page files thin.
- Put business logic in features/lib/hooks, not JSX.
- Avoid `any`.
- Prefer discriminated unions for workflow/status state.
- Keep API DTOs out of UI components. Adapt API DTOs to domain models.
- Use Server Components by default. Add `"use client"` only where interaction/browser APIs require it.
- Do not expose secrets to the browser.
- Never call private token-generation endpoints from client code.
- Do not hardcode photo IDs or counts throughout the UI; consume the configured sections/requirements.
- No unsafe raw HTML injection.
- Do not introduce dependencies without a clear reason.

## RTL rules

The application is natively Persian RTL.

- Root HTML must use `lang="fa"` and `dir="rtl"`.
- Prefer CSS logical properties and Tailwind RTL-safe layout patterns.
- Do not blindly mirror physical direction assets.
- Back/forward navigation must make sense in RTL.
- Do not mirror camera angles, vehicle left/right, map directions, play icons, upload/download icons, or physical orientation semantics unless the asset specifically requires it.
- Codes such as `BDI-8F31K2`, VIN fragments, referral codes, and technical IDs remain LTR.

## Visual quality rules

The target visual direction is "bright automotive studio":

- Background: #F8FAFC
- Surfaces: #FFFFFF
- Primary: #2563EB
- Ink: #111827
- Muted: #6B7280
- Border: #E2E8F0
- Success: #059669
- Warning: #D97706
- Destructive: #DC2626
- Information: #0284C7

Radii:
- controls: 8–10px
- inputs: 12px
- cards: 16px
- sheets: 20–24px

Mobile primary buttons are approximately 48–52px tall.
Minimum interactive target: 44×44px.

Do not use:
- purple AI gradients
- excessive glassmorphism
- random floating cards
- excessive pills
- nested card-inside-card visual noise
- fake English text in Persian UI
- generic SaaS dashboard visuals for the customer experience

## Responsive targets

Primary visual acceptance viewports:

- Customer PWA: 390 × 844
- Reviewer/Admin desktop: 1440 × 960

Customer layouts are touch-first and single-column.
Reviewer/admin layouts are separate desktop interaction models; do not treat them as stretched customer pages.

## Screenshot implementation procedure

For every reference screen:

1. Identify the matching PNG in `references/screens/`.
2. Inspect the image before coding.
3. Reproduce major regions first.
4. Match width/height and spacing.
5. Match typography hierarchy.
6. Match colors, radii, borders, and shadows.
7. Add imagery/3D last.
8. Add realistic loading/error/empty states.
9. Add Playwright screenshot coverage at the target viewport.
10. Compare the screenshot against the reference and iterate.

Avoid arbitrary absolute positioning except where the UI genuinely overlays media/3D/camera content.

## State management

Use:
- TanStack Query: backend/server truth.
- Zustand: ephemeral client workflow state.
- React local state: component-local interactions.
- IndexedDB: captured photo/video blobs and durable upload queue.

Do not duplicate fetched backend entities into Zustand.

## Media capture

Camera:
- use `navigator.mediaDevices.getUserMedia`
- render live stream in `<video playsInline autoPlay>`
- ghost/alignment SVG overlays must be separate DOM layers above the live video
- capture stills through canvas -> Blob
- preserve captured blobs in IndexedDB before upload

Upload state model:
`local -> queued -> uploading -> processing -> uploaded -> verified`
and error/retry paths.

Never rely only on service-worker background sync.

## Current customer photography — Phase 04

Production Phase 04 is premium **2D image-guided inspection**: overview → InspectionSection →
PhotoRequirement → canonical sample/guidance → camera → comparison → confirmation. Current
template: seven sections/twelve required photos; derive progress/totals from configuration.
This supersedes historical customer 3D/14-photo requirements and reference screenshot counts.

Definition of Done prioritizes section navigation, meaningful reference photography, camera,
durable local captures, comparison, replacement, automatic continuation, retakes and mobile quality.
No customer GLB/WebGL/mesh selection/3D viewer is required. Never mount/download the experimental
Three/R3F subsystem in the default photography route. Use exact photo-guide assets in INDEX.

Preserve reusable 3D infrastructure isolated for future use, without refining its model in this
phase. Future hotspot → InspectionSection → same PhotoRequirement shares all downstream logic;
today 2D section navigation uses that boundary. Do not duplicate camera/review/storage logic.

## Phase-04 design and viewport revision

Reference 07 remains the primary composition: compact journey/progress, dominant studio vehicle,
markers directly on the image, physical-direction controls, categories and image shot cards.
Use canonical 2D photography and the current seven-section/twelve-photo template, never customer
WebGL/3D. Marker coordinates share the image crop; card/marker/view/CTA derive from one selection.
Gray = no photo, blue = completed, orange = incomplete/retake; accompany color with text/icons.
Review prioritizes actual captured evidence and a compact sample, retake and simple confirmation.
Do not reintroduce interactive customer quality checkboxes or fabricated quality success.
Guidance is requirement-specific; derive the next incomplete photo/section from configuration.

All application documents use a bounded 100dvh shell. Keep header/actions stable and designate
internal scrolling for long content. Safe areas, focus, keyboard resizing and browser zoom must
remain usable. See docs/VIEWPORT.md and docs/PHOTOGRAPHY.md. Preserve planned odometer/360-video/
upload/final-summary/retake requirements without implementing future phases automatically.

## Future optional 3D

When a future task explicitly enables 3D, its viewer must be genuinely interactive, not a
prerendered image. This requirement does not apply to production customer Phase 04 photography.

Expected semantic model node names include:
`Body_Main`, `Hood`, `Door_FL`, `Door_FR`, `Door_RL`, `Door_RR`,
`Fender_FL`, `Fender_FR`, `Plate_Front`, `Plate_Rear`,
`Wheel_FL`, `Wheel_FR`, `Wheel_RL`, `Wheel_RR`,
`VIN_Zone`, `EngineBay`.

Keep the UI usable before the final GLB is available by providing a typed 2D fallback and placeholder model adapter.

## Backend/API boundary

The backend is ASP.NET Core.

Until the real API exists:
- implement typed mock repositories and fixtures
- define Zod schemas/domain types
- maintain `docs/API_CONTRACT.md`
- keep endpoint paths centralized
- design for OpenAPI-generated TypeScript types later

The frontend must be able to switch from mock -> real API without rewriting presentation components.

## Testing requirements

Before calling a task done:

- `npm run lint` passes.
- Type checking passes.
- Relevant unit tests pass.
- Relevant Playwright tests pass.
- No obvious console errors.
- RTL is correct.
- Mobile safe area is handled.
- Keyboard/focus behavior works where applicable.
- Loading, empty, success, and error states exist where applicable.

For reference-screen work, also add/update a visual regression screenshot.

## Planning

For work that spans several files, adds a major feature, changes architecture, or is likely to take more than a short edit, create/update an ExecPlan according to `.agent/PLANS.md`.

Do not create a plan for trivial one-file changes.

## Git behavior

- Do not rewrite existing history.
- Prefer focused commits when explicitly asked to commit.
- Do not commit generated secrets or `.env.local`.
- Do not delete unrelated user work.
- Keep changes scoped to the requested phase/task.

## Definition of done

A feature is not done merely because it renders.

It is done when:
- implementation matches the reference/design intent,
- interactions work,
- states are typed,
- the component is reusable where appropriate,
- accessibility is reasonable,
- target viewport behavior is correct,
- tests cover the important behavior,
- and the backend dependency is represented in the API contract if necessary.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
