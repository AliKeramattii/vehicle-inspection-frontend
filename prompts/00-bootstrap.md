# Codex task — Bootstrap the frontend foundation

Read `AGENTS.md`, `.agent/PLANS.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`,
`docs/ROUTES.md`, and `docs/API_CONTRACT.md`.

Read `references/INDEX.md`, inspect the **complete** `references/screens/` set,
and inspect the reusable asset library under
`references/assets/vehicle-inspection-ui-assets/`.

There are 23 canonical PNG references supplied by the user. Preserve all of them.

Goal: prepare this Next.js repository for the vehicle-inspection frontend without yet
implementing all product screens.

Implement:

1. Root Persian RTL layout (`lang="fa"`, `dir="rtl"`).
2. Local-font setup with a clean Vazirmatn-compatible fallback strategy.
3. Design tokens matching `docs/DESIGN_SYSTEM.md`.
4. Shared utility for class merging.
5. TanStack Query provider.
6. Initial route-group folders for customer, reviewer, and admin.
7. Component folders matching `docs/ARCHITECTURE.md`.
8. Typed domain model skeleton based on `docs/DOMAIN_MODEL.md`.
9. Mock repository/data layer for inspection and auth.
10. Base UI primitives:
   - PrimaryButton
   - SecondaryButton
   - IconButton
   - TextInput
   - Checkbox
   - StatusBadge
   - InlineAlert
   - BottomStickyCTA
11. AppHeader, PageHeader, JourneyStepper.
12. Copy/use the custom SVG icon assets rather than adding a generic icon library.
13. Playwright configured for 390×844 customer screenshots and 1440×960 desktop screenshots.
14. Basic Vitest configuration.
15. Add `typecheck` script if missing.
16. Ensure `npm run lint`, typecheck, and tests pass.

Do not:
- implement backend calls yet,
- introduce Material UI/Ant/etc.,
- make the whole app client-side,
- hardcode all screen markup into `page.tsx`,
- use PNG references as backgrounds.

Before coding, create a small ExecPlan because this touches the whole foundation.
