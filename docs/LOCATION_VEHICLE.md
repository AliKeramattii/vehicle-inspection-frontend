# Phase 03 — location and vehicle identity

## Scope and routes

Only `/inspection/[inspectionId]/location` and `/inspection/[inspectionId]/vehicle` are added.
ConsentWorkflow now passes an optional completion callback to the existing ConsentForm and
navigates to location after a successful mock save. Standalone ConsentForm keeps its original
completion behavior/tests. Location save navigates to vehicle; vehicle confirmation ends with a
receipt message on the same route because there is no existing capture scaffold. No Phase-04
route, 3D/viewer, camera or capture functionality is created. Referral/OTP remain A4K9P2/12345.

## Components and state

Thin async Server Component pages await typed route params and compose a shared inspection
journey header plus narrow workflows. The existing JourneyStepper receives the location/vehicle
states and has scoped visual overrides; its foundation behavior/baselines remain unchanged.
VehicleCard, IranianPlate and PlateInput are reusable frontend-domain components. Existing
buttons, TextInput, NativeDialog, BottomStickyCTA, icons and customer shell are reused.

Repository reads/saves use TanStack Query. No fetched entities are copied into Zustand. React
Hook Form/Zod own address and plate drafts; local state owns correction mode and disclosures.
Save states are pending/error/retry/success, with unavailable vehicle and unknown-ID recovery.
Unverified direct visitors can preview/edit, but cannot submit. The mock also requires consent
before location and saved location before vehicle confirmation. This is not production authentication.

## Map/location boundary

InspectionLocationMap consumes InspectionLocation and emits domain coordinate changes. The
InspectionLocationAdapter owns the initial suggestion, vector artwork, scale/projection/inverse
projection and explicit locate operation. The development adapter centralizes coordinates and
all deterministic GPS data. The authored SVG map is illustrative, not live geographic truth or
a rendered reference PNG. A provider can replace the component's development renderer while
keeping page/form props unchanged; no vendor package, branding, tile network call or client key
is added. Real map/GPS integrations remain separate adapters.

Pointer capture and keyboard arrows move map content; the selected pin's anchor stays centered.
GPS accuracy circle/dot move with the map and a distance check changes the panel's verified
status after moving beyond the fix accuracy. Locate recenters through the adapter, with checking,
denied/unavailable/unsupported states. It never requests real browser permission. Saved selected
coordinates are projected back when revisiting the form. The address is deterministic/manual;
no reverse-geocoding accuracy is implied. Building/unit/parking fields stay editable and optional
unit/parking values can be empty. Address errors are associated with their input.

## Vehicle, plate and discrepancy

Vehicle reuses the existing semantic model: make/model/year/color/swatch/masked VIN/plate.
The VIN is isolated LTR. A standalone unbranded silver SUV bitmap generated with imagegen follows
the reference's front-right view and blends into the card through alpha transparency, without
mirroring. Provenance is recorded under public/images/vehicle; existing SUV assets are preserved.
IranianPlate is HTML/CSS with a country strip/flag, first-two digits, Persian letter, three main
digits and region. It has a complete accessible label; no flattened plate artwork is displayed.

PlateInput lays out semantic fields in physical LTR order inside the RTL page. It reuses the
existing SegmentedCodeInput for the 2/3-digit groups; small optional paste/keyboard/autocomplete/
invalid props preserve the OTP/referral defaults. The native numeric fields normalize Persian,
Arabic and Latin digits and reject non-digits. Decorative Persian cells provide distinct positions;
one native field per numeric segment remains keyboard/screen-reader accessible. Digit completion
advances focus to the next segment, empty Backspace moves back, full-plate paste fills all fields,
and invalid submission focuses the first invalid segment. The Persian letter select is native.

Recognized plate starts selected as correct. Choosing correction enables/focuses manual controls;
choosing correct restores the recognized plate. The region control has a full 46px input target
with a quiet Iran label. All segment widths fit 320px. Alternate-format guidance is initially
collapsed and blocks submission while open; no alternate-format subsystem/API is invented.
The discrepancy dialog records a small typed field/description draft for final confirmation.
It uses a portal to avoid nested DOM forms, stops submit propagation through the React tree,
and restores trigger focus when closed. No discrepancy-management interface is implemented.

## Mock/backend contract

The existing InspectionRepository now exposes saveLocation/getVehicle/confirmVehicle. Its
instance holds cloned mutable inspection/confirmation state; shared fixtures are never mutated.
Equivalent confirmations are idempotent. There are no cookies, durable auth/consent records or
HTTP requests. API_CONTRACT documents planned existing location/vehicle/plate endpoints,
mapping, payloads, optional discrepancy, auth/validation/errors and requested atomic confirmation.
Those payloads remain frontend requests pending backend agreement.

## Visual decisions and limitations

05-location.png/06-vehicle-identity.png define hierarchy at 390×844: 109px header/stepper,
approximately 344px map and compact rounded address panel; 203px vehicle card above a plate
confirmation surface. Initial pages fit 844px with sticky 48px primary controls and safe-area
padding. Expanded forms/errors may scroll without horizontal overflow; essential fields are
not hidden beneath the sticky actions.

The SVG street/building/tree map is simpler than the raster reference and omits its decorative
layers control. Fine vehicle geometry/light/shadow details still differ from the reference. Vazirmatn
glyph shapes and fine supplied icon/plate-flag details differ; the UI is reference-led, not pixel
identical. These are explicit artwork limitations, not real map/vehicle verification. No prior
phase baselines are regenerated. Existing unrelated local edits remain outside this phase.

## Validation

Unit and browser coverage exercise address/accuracy/edit/optional fields, map keyboard/drag and
fixed pin, locate states, normalization/order/focus/paste/validation, correct/manual plate flows,
discrepancy submit isolation and focus return, repository cloning/idempotence/gates and bounded
direct visits. Two new 390×844 screenshots protect both screens. Browser overflow and 44px
targets are checked at 320/390/480. Lint, typecheck, all 54 unit tests, production build and the
existing localhost/LAN development-origin test pass. Full production-backed Playwright passes
35 tests with three intentional desktop screenshot skips. Only two new Phase-03 baselines were
created; all previous baselines are unchanged.

The full-suite prior-baseline check temporarily used committed readiness CSS/GPS artwork and
restored unrelated local edits byte for byte afterward. The local readiness hero gradient and
paragraph-width changes produce a 4,034-pixel mismatch against its old baseline; they are
preserved and excluded from Phase 03 rather than silently rewritten or accepted into a baseline.
