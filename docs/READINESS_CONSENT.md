# Phase 02: readiness and consent

Phase 02 added only `/readiness` and `/consent`. Successful existing mock OTP verification enters
readiness; its CTA opens consent. Consent records acceptance and shows confirmation on the
same route. No Phase-03 location route existed, so none is invented. Referral `A4K9P2`, OTP
`12345`, Phase-01 controls/screens/baselines and localhost/LAN configuration are preserved.

Phase 03 now supplies a completion callback from ConsentWorkflow to enter the location route.
The standalone ConsentForm completion state and all initial Phase-02 visuals/baselines remain
unchanged. See `LOCATION_VEHICLE.md` for the new bounded workflow.

## Components and visual decisions

Thin Server Component pages compose `ReadinessScreen` and `ConsentScreen`. The preparation
header, requirements and collection summary are server-rendered; only device diagnostics and
the consent form are client islands. Existing `Checkbox`, `BottomStickyCTA`, buttons, alerts,
icons, customer shell and font/tokens are reused. Styles are scoped to the new screens.

References `03-readiness.png` and `04-consent-privacy.png` define the composition at 390×844:
one 176px readiness hero, four compact numbered requirements, two-column restrained diagnostics,
and a 48px sticky action; consent uses a 196px privacy visual above one quiet white summary
surface with three collection rows, a short purpose statement, collapsed terms and one checkbox.
The supplied `vehicle-inspection.webp` fills the readiness hero as a cover background; a light
gradient keeps its existing semantic RTL copy readable. Next.js `getImageProps` provides
optimized density variants through CSS `image-set`, without an inner vehicle image or duplicate
check mark. Four WebP illustrations under `public/illustrations/readiness/` replace the clean
vehicle, open space, engine and phone SVGs. Diagnostic icons remain unchanged. Consent uses
the single optimized `consent-hero.webp` banner, replacing the shield/car/marker DOM composition.
Both banners live under `public/images/preparation/`. Overlay positioning is limited to the
readiness copy and readability gradient; normal page regions use flow/flex/grid. Physical
vehicle orientation is never mirrored. Existing copy, controls and screen geometry are preserved.

## Capability architecture

Current IDs are camera, location, storage, video and isolated optional webgl. Four customer
rows retain the approved icons/layout. Results distinguish checking, ready, permission-required,
permission-denied, unsupported, unavailable and unknown. CapabilityService.check(AbortSignal)
remains the adapter boundary; useCapabilities owns abortable local results and an explicit retry.
The browser adapter queries support/permission/storage estimates only: no camera stream, GPS
prompt or WebGL context is opened on initial rendering or recheck.

readinessBlockingResults is the shared continuation/recovery rule. Camera/recording support,
known sufficient storage and completed checks are required. Unrequested permission permits
continuation but is never labelled granted. Denied or unsupported GPS does not block manual map
selection and does not create a pointless Recheck prompt. Unknown storage capacity is deferred
to actual durable evidence writes; known capacity below the existing 100 MiB threshold blocks.
Unknown camera/video checks do not falsely count as ready. WebGL never blocks production 2D.

Denied camera permission is distinct from unavailable hardware and explains how to allow the
camera in the browser's site settings, then explicitly recheck. Unsupported recording, insecure
camera context and insufficient storage have specific recovery copy. Recheck runs the adapter
again, clears stale failures and removes the recovery prompt once required conditions pass.
The disabled CTA references its recovery explanation. No required capability is bypassed; the
current live camera/Recorder V2 have no native-file fallback, so none is falsely advertised.
The four quiet rows still avoid repetitive ready badges. Actual hardware opening remains owned
by the user-initiated camera/recorder screens. Existing imagery, consent copy and routes remain.

## Consent state and repository boundary

Checkbox and expansion state are local. The native checkbox starts unchecked, the native submit
button starts disabled, and the terms toggle exposes `aria-expanded`/`aria-controls` with a hidden
region. Acceptance enables submission only with a verified inspection ID. Query handles pending,
error/retry and success; saving disables the checkbox and button. No receipt/server entity is
copied into Zustand. `ConsentState` and Zod-validated `ConsentInput`/`ConsentReceipt` are typed.

`InspectionRepository.recordConsent` records explicit acceptance/version with a cloned,
idempotent receipt in the existing mock instance. Auth/provider memory survives client navigation
only. Direct consent visits can read/toggle terms, but cannot record without verification and have
a landing recovery link. Reload resets auth and mock consent; no persistence, cookies, real
ASP.NET calls or browser permission prompts are introduced. The planned POST consent endpoint
and requested response/error/auth behavior are documented in `API_CONTRACT.md`.

## Tests and limitations

Unit coverage exercises requirements, all capability states, checking/ready transitions, fallback,
retry, consent keyboard/ARIA states, saving, errors, bounded completion, unverified visits and
mock validation/idempotency. Browser coverage exercises the complete Phase-01→Phase-02 path,
two 390×844 baselines, checkbox/terms states, no permission/API calls/console errors, touch targets
and overflow at 320/390/480px. Existing Phase-01/foundation baselines are not regenerated.

The approved replacement banners and requirement illustrations supersede the original SVG/photo
artwork. Vazirmatn glyph shapes and fine artwork details still differ from the original raster
references. The composition is reference-led; screenshot baselines protect the rendered
implementation, not pixel identity with the reference. Final legal terms, retention and customer rights need service-owner approval
before production. No live device checks, durable consent/auth or Phase-03 functionality exist.

## Final validation

`npm run lint`, `npm run typecheck`, `npm test` (39 tests), `npm run test:e2e` (26 passed,
two intentional desktop skips for mobile-only screenshots), `npm run test:e2e:dev` (one parity
test against both running port-3000 origins) and `npm run build` passed. Two new 390×844
baselines are under `tests/e2e/screenshots/preparation.spec.ts/`; every existing Phase-01 and
foundation baseline remains unchanged and passes. Browser scenarios found no app console errors,
failed resources, permission prompts or real API requests. Playwright still emits the existing
NO_COLOR/FORCE_COLOR environment warning. Fine artwork differences above remain explicit.

For the approved WebP asset update, lint, typecheck, all 39 unit tests, the full Playwright suite
(26 passed, two intentional skips) and production build passed again. Only the two preparation
baselines were regenerated after reviewing both 390×844 screens. The readiness snapshot wait
now decodes the optimized CSS background instead of expecting an inner image. Browser validation
used the committed diagnostic GPS icon; an unrelated local edit to that icon was restored
byte-for-byte afterward and is excluded from this change. The existing Phase-01 baselines,
capability/consent behavior, API contract, routes and development configuration are unchanged.

## Unified readiness correction
Four customer diagnostics: camera, location, storage, video recording support. WebGL stays internal/optional. Permission queries never request access; ungranted GPS is neutral, manual map selection remains. Exact approved pin copied to public/icons/readiness/inspection-pin.svg.

## Approved sedan artwork update

The prior vehicle-inspection/consent-hero filenames above document the original asset phase. Active defaults now use `hero/readiness-vehicle.webp` and `hero/consent-vehicle.webp` under `/assets/inspection-vehicle/`. The readiness background is shifted right only when the default asset is resolved, retaining the text/gradient region. Tenant override framing is unchanged. Clean-vehicle/open-space rows use the same supplied sedan; power/phone illustrations, all four requirements, capability behavior and copy remain unchanged. No historical readiness baseline was overwritten.
