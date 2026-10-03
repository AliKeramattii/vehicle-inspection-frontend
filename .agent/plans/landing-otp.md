# Landing and OTP customer entry

## Goal
Implement only `prompts/01-landing-otp.md`: reference-led customer landing at `/` and OTP verification at `/verify`, working with existing mock repositories.

## User-visible behavior
At 390×844 the landing matches the co-branding, two-line headline, studio SUV hero, six-cell referral form, benefits, privacy footer, and support action in reference 01. A valid referral requests a mock OTP and opens reference 02: back action, branding, phone/shield illustration, masked mobile, five LTR cells displaying Persian digits, auto-verification, countdown, remaining attempts, and edit-number sheet. Successful verification stays on the OTP screen with a confirmation; no later phase is implemented.

## Current state
Bootstrap is validated and includes RTL/local typography/tokens, shared buttons/inputs/icons, Query, customer route shell, mock auth/inspection interfaces, and unit/E2E tooling. Preserve existing changes, tests, and scaffolding. Both full-resolution phase PNGs were carefully inspected before code changes. SVGs exist for icons, but the supplied library has no photographic car/OTP hero assets. Generate only these standalone visual assets, never a rendered UI or cropped screenshot.

## Constraints
- Preserve bootstrap architecture and thin server pages; client islands only for input, forms, and workflow.
- Use existing buttons, TextInput, icon system, RHF, Zod, Query mutations, and Zustand transient workflow state.
- Referral/OTP values remain ASCII and LTR internally; normalize Persian/Arabic digit input, and present OTP cells with Persian numerals.
- Single native input backs each segmented control for paste, editing, screen readers, SMS autofill, and keyboard access. Overlay its visual cells only where necessary for the input.
- Keep all 23 references untouched. Use no PNG reference as a production image or background.
- No real API, secrets, later route screens, camera, 3D, offline, reviewer, or admin behavior.
- Minimum 44px touch targets and 48–52px primary CTA; reference proportions take precedence over arbitrary spacing.

## Implementation
1. Preserve the temporary bootstrap home at `/foundation/preview` and retain its regression coverage. Update `/` to the landing and add a server `/verify` page.
2. Add `components/ui/segmented-code-input.tsx`, `ReferralCodeInput`, and `OTPInput`; add relevant supplied SVGs to the typed icon registry.
3. Add reusable auth branding/studio/benefit/footer components and independent car/phone illustrations under `public/images/auth/`.
4. Implement mock auth workflow in feature hooks/services plus transient Zustand challenge state; Query owns mutation results, not duplicated entities. Handle direct OTP navigation and reloads with an explicit missing-challenge state.
5. Implement referral validation, OTP request/verify/resend/error/lockout/success, and accessible edit-number dialog. In absence of another instruction, a clearly documented mock invitation supplies the initial mobile; edit remains available on OTP.
6. Add meaningful unit and browser tests, freeze browser time for deterministic countdown screenshots, produce 390×844 baselines, compare with scaled references, and iterate.
7. Review diffs for RTL/client boundaries/a11y/focus/overflow/duplication/backend assumptions; update API docs and this plan. Run lint/typecheck/unit/E2E/build.

## API impact
Use existing AuthRepository methods only. Improve mock resend timing/error metadata if required and document demo mobile, limits, and transient challenge lifetime. No finalized backend contract change is assumed; production invitation/phone acquisition, delivery, sessions, and routing beyond verification remain future integration decisions.

## Testing
Unit coverage for code normalization, LTR segmented semantics, paste/autofill structure, full five-digit completion, focus/editing, referral errors, countdown, attempt accounting, and challenge lifecycle. Playwright covers invalid/incomplete referral, entry to OTP, automatic success, rejection/lockout, resend timing, edit number, back action, no console/API errors or overflow, and both 390×844 visual baselines. Preserve bootstrap tests/screenshots at the relocated preview.

## Acceptance criteria
- [x] Both screens closely follow their references at 390×844, with reviewed screenshot comparisons.
- [x] Mock referral/OTP flows and every required state/action work.
- [x] Inputs maintain LTR underlying order, support native keyboard/paste/autofill, and expose accessible labels and focus.
- [x] Existing foundation tests pass; lint/typecheck/unit/E2E/build pass.
- [x] Only phase 01 is implemented, with limitations documented and references preserved.

## Progress
- [x] Read AGENTS/index/prompt/plan format and inspect both original PNGs and current architecture.
- [x] Produce standalone hero assets and implement shared visual/input components.
- [x] Implement mock-only entry and verification workflow.
- [x] Test, compare screenshots, iterate, and review diff.
- [x] Run final validation and document results/remaining differences.

## Review findings and decisions
- Preserved bootstrap changes and its four existing baselines; moved its preview route and
  adjusted its tests/back link without changing the preview's appearance.
- Used the documented demo invitation number because the landing reference has no mobile field.
  Production phone acquisition remains an explicit API contract question, not an assumption.
- A per-provider repository/store survives customer navigation and avoids cross-request state.
  Repository creation remains in the original composition factory.
- Fixed clipped supporting text, bottom/footer spacing, icon color inheritance, native dialog
  initial focus, re-enabled OTP focus after resend, and pasted-code caret position during review.
- Client boundaries are limited to browser controls, forms, providers, and hooks; both pages,
  branding, copy, images, benefits, and support disclosure remain server-renderable.
- No references changed, no real API calls, no added dependencies, and no later screens.
- Validation: lint/typecheck, 23 unit tests, 19 Playwright tests (one desktop copy of the
  mobile-only screenshot case deliberately skipped), and production build pass.
- Remaining visual differences are independent generated hero details, glyph/icon differences,
  and a deliberately incomplete OTP screenshot state to respect automatic five-digit verification.
  Detailed notes, asset prompts, and mock limitations are in `docs/LANDING_OTP.md`.
