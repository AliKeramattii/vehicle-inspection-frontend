# Bootstrap the vehicle-inspection frontend

## Goal
Replace the Next.js starter with a Persian RTL foundation that subsequent product phases can build on, without implementing those phases.

## User-visible behavior
The root route displays a clearly labeled foundation preview using shared controls, inspection progress, and Persian copy. Separate customer, reviewer, and admin layout groups exist. An internal `/foundation` gallery exercises component states and keyboard interactions at both acceptance viewports; it is not an inspection workflow.

## Current state
The repository contains the Next.js App Router starter and the required production dependencies, but no domain layer, shared components, or test tooling. All 23 canonical PNGs have been inspected as a complete set, including camera, upload, desktop, vehicle, and ghost references. The asset library's SVGs already exist under `public/`; its README mentions React starter sources that are absent from the supplied library. Implement small typed wrappers around the actual supplied SVGs.

## Constraints
- Limit work to `prompts/00-bootstrap.md`; defer all later product phases.
- Keep pages and layouts server-rendered, with narrow client boundaries for Query and the gallery form.
- Use `lang="fa"`, `dir="rtl"`, logical spacing, 44px targets, focus indicators, and safe-area-aware actions. Keep technical codes LTR and never mirror physical assets.
- Use the design-system palette, geometry, local Vazirmatn, and supplied SVG icons. Preserve every reference PNG; never render them as production UI.
- Typed mock repositories and Zod validation replace network calls. Do not add backend calls, persistence, capture, 3D, or service-worker workflows yet.

## Implementation
1. Add local font/license, CSS tokens, `cn`, root Query provider, and separate route-group shells.
2. Create the architecture's component/feature/library folders, domain schemas/types, repository contracts, typed fixtures, and mock auth/inspection implementations.
3. Implement shared buttons, inputs, checkbox, badge, alert, sticky CTA, headers, and data-driven journey stepper.
4. Add a small foundation preview and internal component gallery; keep page files thin.
5. Configure Vitest and Playwright with customer 390×844 and desktop 1440×960 projects; add meaningful repository and accessibility/interaction tests plus gallery screenshot baselines.
6. Document development commands, mock behavior, API boundary, and future integration points. Run lint, typecheck, unit/E2E tests, and production build; inspect rendered screenshots.

## API impact
No endpoints are called or changed. Add repository contracts for existing auth and inspection concepts, parse mock transport fixtures with Zod, and adapt them to domain types. Centralize existing endpoint paths and document mock credentials, isolation, and future OpenAPI replacement in `docs/API_CONTRACT.md`.

## Testing
- Unit: class conflicts, schema validation, mock auth rejection/success, missing inspection, mock data isolation, and capture-plan required-count consistency.
- Playwright: RTL/local font, no horizontal overflow or console errors, labeled inputs and validation, keyboard checkbox/button behavior, disabled/loading controls, safe-area CTA, and screenshots at both target viewports.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`.
- Visually inspect gallery baselines; these are bootstrap component baselines, not acceptance claims for later reference screens.

## Acceptance criteria
- [ ] Required foundation components, domain contracts, mocks, layouts, and tooling exist.
- [ ] Local Persian font, tokens, RTL, LTR codes, focus states, and mobile CTA work.
- [ ] Mock data is validated and presentation components do not depend on DTOs.
- [ ] All automated checks pass and screenshots are inspected.
- [ ] Later product phases remain unimplemented and all references are preserved.

## Progress
- [x] Read AGENTS, reference index, all requested docs, and bootstrap prompt; inspect all 23 PNGs and supplied asset inventory/docs.
- [x] Record scope and implementation plan before editing application code.
- [ ] Implement foundation and typed mock boundary.
- [ ] Add tests and visual baselines.
- [ ] Validate, inspect screenshots, and document results/unresolved items.
