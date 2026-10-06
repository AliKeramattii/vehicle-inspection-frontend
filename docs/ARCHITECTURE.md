# Frontend Architecture

## High-level split

One Next.js repository with three route groups:

- Customer PWA
- Reviewer
- Admin

They share tokens/icons/primitives but not their large-scale page layouts.

Bootstrap establishes `(customer)`, `(reviewer)/reviewer`, and `(admin)/admin` layouts.
Reviewer/admin groups reserve their URL namespaces; their product pages are intentionally absent
until the corresponding phases. `/` and `/verify` implement phase 01 with mock auth only;
`/readiness` and `/consent` implement phase 02. Phase 03 adds the inspection location/vehicle routes;
see `LOCATION_VEHICLE.md` for the map, form and confirmation boundaries. Phase 04 adds the canonical
capture route with a production image-guided 2D workflow; see `PHOTOGRAPHY.md`. Vehicle confirmation
enters it. Dedicated section/guide/camera/review routes share one template and durable local photos.
Experimental 3D remains isolated and is never imported by customer photography.
The unchanged foundation preview moved to `/foundation/preview`; `/foundation` remains the
non-indexed component gallery with its original baselines.

The root layout is a Server Component. `QueryProvider` is the narrow client boundary for server
state; its per-mount QueryClient avoids sharing caches between server requests. Interactive form
examples and mock Query preview are client islands inside the server-rendered gallery.
No backend entities are duplicated into Zustand; workflow stores and IndexedDB implementation
will be added with their respective phases.

Phase 01's customer layout mounts a per-instance `AuthWorkflowProvider` around server-rendered
children. It owns the mock repository and a transient Zustand store with a discriminated
`idle | challenge | verified` workflow. Query mutations perform referral validation and OTP
request/verification. The store holds mobile/code context, deadlines, and remaining attempts for
the active workflow; fetched user, partner, inspection, and session entities are not duplicated.
The provider also owns the same per-instance inspection repository used to record consent,
save location and confirm the vehicle/plate.
The verified workflow retains only an inspection ID for that operation. Capability diagnostics
use an interchangeable local service and an abortable hook; consent checkbox/terms use local
state and Query mutations own submission status. See `READINESS_CONSENT.md` for this boundary.
The repositories and workflow survive customer client navigation, but not a full reload.
OTP direct navigation/reload renders an explicit recoverable missing-challenge state.

## Suggested source structure

```text
src/
  app/
    (customer)/
      page.tsx
      verify/
      readiness/
      consent/
      inspection/[inspectionId]/
        location/
        vehicle/
        capture/
        upload/
        review/
        submitted/
        additional-evidence/
    reviewer/
      queue/
      cases/[caseId]/
    admin/
      branding/
      policies/
      templates/
      webhooks/
      users/
      permissions/
    api/

  components/
    ui/
    inspection/
    vehicle/
    camera/
    location/
    upload/
    status/
    reviewer/
    admin/

  features/
    auth/
    inspection/
    capture/
    uploads/
    reviewer/
    templates/

  lib/
    api/
      client.ts
      endpoints.ts
      adapters/
      generated/
    camera/
    storage/
    map/
    three/
    utils/

  hooks/
  mocks/
  schemas/
  stores/
  types/
```

## Component rule

Pages orchestrate components; they do not contain all UI and business logic directly.

Good:
`<VehicleCard vehicle={vehicle} />`

Bad:
rendering raw transport DTO field names throughout page JSX.

## Data boundary

ASP.NET DTO -> schema/adapter -> frontend domain model -> component.

This makes mock data and real API interchangeable.

## BFF

Use Next.js Route Handlers as a thin BFF when server-only credentials or auth translation is required.

Never ship backend private keys or service tokens to the browser.

## Browser-only boundaries

Use client components for:
- camera
- 3D Canvas
- IndexedDB
- geolocation
- interactive maps
- transient controls

Keep surrounding layout/server data server-renderable when practical.
