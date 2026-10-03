# Bootstrap foundation

Phase `00-bootstrap` establishes Persian RTL typography/tokens, shared controls, separate layout
groups, typed mock auth/inspection repositories, and test tooling. Product screens in phases
01–10 are not implemented. All 23 canonical PNGs are preserved and were inspected together;
gallery screenshots establish primitive regressions, not reference-screen acceptance.

## Local development

Use Node.js 24 and npm. Install with `npm ci`, then `npm run dev`.
Open `/foundation/preview` for the preserved foundation preview or `/foundation` for the
interactive component gallery. Phase 01 uses `/` for the customer referral landing.

Validation commands:

```sh
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Playwright builds and starts the production Next.js server on `127.0.0.1:3100` and runs Chromium
at 390×844 and 1440×960. Production rendering avoids hot-reload interference in screenshots.
The Playwright config adds System32 to its own process PATH on Windows so it can stop the server
even when the launching terminal omits Windows system utilities. Vitest uses two thread workers
for reliable startup in this Windows environment. Neither setting changes the operating system.
Snapshots live in `tests/e2e/screenshots/`; reports and transient artifacts are ignored.
For deliberate visual changes use `npm run test:visual:update`, inspect all new screenshots,
then rerun `npm run test:e2e`. Font loading and reduced motion stabilize captures. Screenshot
baselines are browser/platform-sensitive; generate and compare them on the same environment
(the initial baselines use Windows Chromium).

## Components

- `components/ui`: typed primary/secondary/icon buttons, labeled input, native checkbox,
  status badges/alerts, supplied SVG icon wrapper, and safe-area-aware sticky action container.
- `components/layout`: co-brand header, page heading/back link, customer shell, and desktop shell.
- `components/inspection`: data-driven journey stepper with current/completed/upcoming/error states.
- `features/foundation`: temporary preview, form controls with React Hook Form/Zod, and a
  TanStack Query example consuming domain models from the inspection mock.

Controls accept native props including React 19 refs. Buttons default to `type="button"`;
submit controls opt in. Loading disables actions and exposes `aria-busy`. Icon buttons require
an accessible label. Inputs connect labels, hints, and errors; checkboxes support native keyboard
interaction. Statuses pair text with icons, using darker text shades for readable contrast.

The sticky CTA remains in document flow and includes `env(safe-area-inset-bottom)`. Use it inside
a full-height flex shell, after the main content, so it never covers the last content block.
`Icon` uses CSS masks for supplied monochrome SVGs and inherits current text color. Multicolor
illustrations, ghost overlays, and physical vehicle direction assets should be rendered directly,
without masking or mirroring, in their later phases.

## Remaining integration points

- Replace mock repositories with generated ASP.NET clients once the backend contract is available.
- Add actual customer, reviewer, and admin pages in the specified phase order.
- Camera, IndexedDB queue, Serwist, real 3D/GLB, and production auth belong to later phases.
- Storybook is deferred; the gallery currently provides reviewable shared primitive states.
- The supplied asset README lists React starter files that are absent; SVGs are present in
  `public/` and bootstrap components were implemented in `src/components/`.

## Validation notes

The foundation has 16 unit tests, six Playwright tests, and four screenshot baselines.
The gallery and preview were visually inspected at both acceptance viewports. Browser assertions
cover console errors, local-font loading, native RTL, LTR identifiers, no horizontal overflow,
minimum action height, safe-area padding, skip navigation, validation focus, and keyboard controls.

`npm audit` currently reports seven high-severity dependency findings through the existing
Next.js ESLint and Serwist dependency chains (`braces`/`micromatch`/`fast-glob` and `browserslist`).
Its proposed fixes downgrade `eslint-config-next` to 14.2.35 and `@serwist/next` to 9.4.1.
Those incompatible toolchain changes were left out of bootstrap; reassess patched releases
before production deployment. No new runtime dependency was added in this phase.
