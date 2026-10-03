# Frontend Architecture

## High-level split

One Next.js repository with three route groups:

- Customer PWA
- Reviewer
- Admin

They share tokens/icons/primitives but not their large-scale page layouts.

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
