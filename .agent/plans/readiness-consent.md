# Phase 02: readiness and consent

## Goal
Implement only prompts/02-readiness-consent.md: /readiness and /consent matching references 03/04 at 390 x 844, linked from successful existing OTP verification. Preserve Phase-01 visuals, baselines, mock codes, origin configuration, and shared architecture.

## User-visible behavior
Landing -> referral -> OTP -> readiness -> consent. Readiness shows four concise requirements, estimate, prominent automotive hero, and four typed device diagnostics without requesting permissions. Consent shows concise collection/purpose copy, collapsed terms, one checkbox and disabled-until-accepted sticky CTA. Record consent through a mock inspection repository and finish with a confirmation on /consent; no implemented Phase-03 placeholder exists, so do not create a location route.

## Current state
Read AGENTS/index/prompt/architecture/API/domain/routes/design/plan instructions and inspected both primary PNGs plus supplied readiness, permission, privacy, camera/GPS/storage/WebGL SVGs. Existing uncommitted user formatting affects AGENTS, auth CSS, and four auth components; preserve and stage only task edits. Auth uses per-provider mocks and transient workflow; inspection repositories currently read draft/capture plan only. Shared Checkbox, BottomStickyCTA, buttons/icons/shell exist. Existing success tests intentionally stayed on verify; update those assertions for the newly authorized transition without touching baseline images.

## Constraints
Thin Server Component pages, feature client islands, no new dependencies/framework/state library, no permission requests or actual capture/location/storage operations, no real API, no screenshots as UI, no Phase 03 or later screens. Use logical CSS/focus-safe semantics, stable diagnostic rows and 44px interactive targets; respect reduced motion/safe area/320-480px widths.

## Implementation
1. Add typed capabilities and interchangeable mock check service; client diagnostic hook only calls service, with stable checking/ready/unavailable/permission-required/unsupported states. Use supplied SVGs, reuse/generate standalone automotive imagery only where suitable; preserve source references.
2. Add readiness/consent server shells, narrowly scoped feature CSS, consent form and expandable terms using existing primitives.
3. Extend existing inspection repository with validated consent input/receipt, per-instance mock recording, centralized planned consent endpoint. Keep checkbox local; Query owns submission state.
4. Store only verified inspection ID in ephemeral auth workflow and route OTP success to readiness. Share the original repository instance through provider; no fetched entity duplication.
5. Add unit/browser coverage and two exact mobile screenshot baselines; compare with references and iterate without changing Phase-01 baseline files.
6. Document mock/backend capabilities, limitations, route boundary, update plan, validate lint/typecheck/unit/full E2E/build, review focused diff and commit/push.

## API impact
Document planned POST /api/inspections/{inspectionId}/consent, accepted true, terms version, server acceptance receipt, validation/not-found/auth/network/rate-limit handling expectations. Runtime remains mocked. Capability diagnostics are local readiness, not actual permissions or verified backend facts.

## Testing
Meaningful unit tests for requirements, every capability status/fallback/transition, CTA, consent unchecked/disabled/enabled/expanded semantics, submission/error/retry/success and repository recording. Full Playwright covers authenticated navigation, both visuals, consent states, keyboard, no permission prompts/API requests/console errors, responsive overflow at 320/390/480. Existing baselines unchanged; full suite and production build required.

## Acceptance criteria
- [x] Both screens match major reference regions/proportions at target viewport (artwork differences documented).
- [x] Typed services/states and mock consent boundary are replaceable without UI rewrite.
- [x] Existing workflow reaches readiness/consent; no Phase-03 route added.
- [x] A11y, safe area, loading/error/success, no overflow, and tests validated.
- [x] Existing Phase-01 baselines/origin fixes preserved; documentation and focused Git review complete.

## Progress
- [x] Inspect instructions, Git state, primary PNGs and supporting assets/architecture.
- [x] Implement typed capability/consent boundaries and workflow navigation.
- [x] Implement reference-led visual shells and interactions with existing approved artwork.
- [x] Add tests, capture baselines, visually compare and iterate.
- [x] Final validation, documentation and focused review.
- [x] Prepare focused task commit; final commit/push outcome is recorded in the completion report.

## Discoveries
- Initial exact-viewport review found 33px/60px excess content height and sticky-action overlap.
  Corrected intro baseline spacing, requirement/diagnostic heights and consent row/footer density;
  both current shells measure 844px at 390px with all ordinary content above the CTA.
- Added 16 meaningful unit tests; 39 tests pass. Lint and production build passed. Fixed a test-only
  optional browser property assertion found by typecheck, which now passes.
- Built-in standalone readiness/privacy artwork requests did not return after extended waiting.
  Stopped both requests and reused the approved Phase-01 SUV photo with supplied SVGs/native
  shield/marker artwork. No external image API fallback or new asset dependency was introduced.
- Explicit image decode is needed in QA captures, not just `complete`/naturalWidth: the first
  decoded frame can otherwise omit a loaded hero. New screenshot tests wait for decode.
  Both new baselines are now created and reviewed, and final browser-error verification passes.

## Validation results
- Lint/typecheck: pass. All 39 unit tests pass (16 added).
- Full production Playwright suite: 26 pass, 2 intentional desktop skips for mobile-only visuals.
  All original Phase-01/foundation baseline comparisons pass without image changes.
- Development parity test: 1 pass against localhost and the current discovered LAN address on
  port 3000, with HMR/assets/fresh state and the new readiness transition.
- Production build: pass; static routes include readiness/consent and no Phase-03 route.
- Both final screens manually compared with canonical PNGs at 390x844; 320/480 overflow and
  touch/keyboard states pass. Artwork/vehicle-angle/glyph/icon differences remain as documented.
- First screenshot run wrote missing new baseline files and reported failure; the reviewed new
  baselines were regenerated after the final copy spacing correction. Full suite then passed.
- Existing Playwright NO_COLOR/FORCE_COLOR environment warnings remain; no app console errors.
