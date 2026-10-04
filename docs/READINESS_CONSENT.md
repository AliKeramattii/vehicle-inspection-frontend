# Phase 02: readiness and consent

Only `/readiness` and `/consent` are added. Successful existing mock OTP verification enters
readiness; its CTA opens consent. Consent records acceptance and shows confirmation on the
same route. No Phase-03 location route existed, so none is invented. Referral `A4K9P2`, OTP
`12345`, Phase-01 controls/screens/baselines and localhost/LAN configuration are preserved.

## Components and visual decisions

Thin Server Component pages compose `ReadinessScreen` and `ConsentScreen`. The preparation
header, requirements and collection summary are server-rendered; only device diagnostics and
the consent form are client islands. Existing `Checkbox`, `BottomStickyCTA`, buttons, alerts,
icons, customer shell and font/tokens are reused. Styles are scoped to the new screens.

References `03-readiness.png` and `04-consent-privacy.png` define the composition at 390×844:
one 176px readiness hero, four compact numbered requirements, two-column restrained diagnostics,
and a 48px sticky action; consent uses a 196px privacy visual above one quiet white summary
surface with three collection rows, a short purpose statement, collapsed terms and one checkbox.
SVGs come from the supplied readiness/permissions/security asset system. Both screens reuse
the approved standalone Phase-01 SUV photo (`public/images/auth/landing-suv.png`, provenance
in that directory); no new bitmap is required. Privacy combines it with an SVG shield derived
from the supplied privacy illustration and four decorative DOM markers. Overlay positioning
is limited to these genuine vehicle/illustration layers; normal page regions use flow/flex/grid.
Physical vehicle orientation is never mirrored. Text and controls remain semantic DOM.

## Capability architecture

`capabilities.ts` defines IDs `camera | location | webgl | storage`, results with statuses
`checking | ready | unavailable | permission-required | unsupported`, normalization and the
continuation policy. `CapabilityService.check(AbortSignal)` is the replacement boundary;
`createMockCapabilityService` returns deterministic ready fixtures with optional test overrides.
It does not access raw browser APIs or grant permissions. `useCapabilities` owns results locally,
aborts on unmount, ignores stale results and exposes retry. Initial rows reserve the same space.

Checking blocks continuation. Missing/unavailable/unsupported core camera/location/storage
blocks it and shows explanatory text plus retry. Permission-required allows proceeding to
consent; permission requests belong in future capture/location features. Unsupported WebGL is
non-blocking because the architecture provides for a later 2D fallback; no viewer is implemented.
States have icons and accessible words, not color alone. A future browser adapter can perform
availability/Permissions API/WebGL/storage checks without rewriting the UI and must not request
camera or location access on initial load. Actual hardware readiness is not verified in this phase.

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

The reused photo and supplied technical SVGs differ in car angle (privacy remains front-left),
pavilion/greenery, lighting and icon details from the raster references. Vazirmatn glyph shapes
also differ. Two built-in image generation requests did not return during the implementation;
they were stopped and the approved local assets were reused instead. The composition is
reference-led; screenshot baselines protect the rendered implementation, not pixel identity
with the reference. Final legal terms, retention and customer rights need service-owner approval
before production. No live device checks, durable consent/auth or Phase-03 functionality exist.

## Final validation

`npm run lint`, `npm run typecheck`, `npm test` (39 tests), `npm run test:e2e` (26 passed,
two intentional desktop skips for mobile-only screenshots), `npm run test:e2e:dev` (one parity
test against both running port-3000 origins) and `npm run build` passed. Two new 390×844
baselines are under `tests/e2e/screenshots/preparation.spec.ts/`; every existing Phase-01 and
foundation baseline remains unchanged and passes. Browser scenarios found no app console errors,
failed resources, permission prompts or real API requests. Playwright still emits the existing
NO_COLOR/FORCE_COLOR environment warning. Fine artwork differences above remain explicit.
