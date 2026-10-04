# Phase 01: landing and OTP

Implemented routes: `/` and `/verify`. No readiness or later product phase is implemented.

## Reference implementation

Both 853×1844 source PNGs were inspected at full resolution and compared at 390×844 against
the rendered app. The implementation reconstructs their branding, headline/copy, hero regions,
white form surfaces, borders, buttons, benefits, privacy/support footer, and OTP controls.
The final landing form starts at approximately y=432 and the OTP form at y=453 at the target
viewport. Supporting copy is fully visible, the landing support action fits the screen, and
neither route has horizontal overflow at 320, 390, or 480px widths.

Hero photographs/illustrations are independent assets generated with the built-in imagegen
tool, not cropped or rendered reference-screen UI. Files and exact generation prompts:
`public/images/auth/landing-suv.png`, `otp-phone-shield.png`, and `PROVENANCE.md` in that directory.
Supplied SVG icons are reused for benefits, status, clock, and editing. A small monochrome auth
SVG extension adds the platform car mark, ticket, headset, and RTL navigation chevrons that
the supplied library lacked. The insurance mark is a small semantic SVG, not a real insurer logo.

## Mock behavior

- Enter referral `A4K9P2` to request the OTP for demo invitation number `09120004567`.
- Enter OTP `12345` to verify. Successful verification remains on `/verify` with confirmation.
- The mock expires codes and permits resend after 120 seconds. Three incorrect completed
  entries exhaust the challenge; resend resets the attempt count after the countdown.
- Number editing opens a native dialog, validates an Iranian mobile, requests a new challenge,
  updates the masked number, and restores OTP focus. Escape/cancel returns focus to the trigger.
- Direct navigation or reload of `/verify` has no in-memory challenge and offers a return link.
- A support disclosure directs the customer to their issuing representative. No external
  contact address or telephone number is assumed.

Repository composition remains centralized in `lib/api/client.ts`. Query mutations own auth
operations; a per-provider Zustand store owns transient challenge workflow state. No server
entities, tokens, or real API calls are introduced. Requested future metadata and unresolved
production invitation/session decisions are documented in `API_CONTRACT.md`.

## Inputs and accessibility

`ReferralCodeInput` and `OTPInput` share a single native-input segmented control. Visual cells
are decorative; one labeled input carries the actual LTR ASCII code, supports select/edit/paste,
and exposes validation descriptions. Persian/Arabic digits normalize before submission; OTP
cells display Persian numerals. `autocomplete="one-time-code"`, `inputmode="numeric"`, and
`maxlength="5"` provide native SMS/autofill-compatible structure. Complete entries submit once,
without waiting for a submit button. Actual SMS delivery/autofill requires a supported device
and future backend delivery; there is no SMS interception logic.

Focus follows selection, validation, failed verification, resend, and number editing. Controls
use the existing primitives. Native dialogs provide modality/focus containment; main routes and
visual shells remain Server Components. Muted text uses the existing contrast-friendly token.

## Visual baselines and remaining differences

The final landing regression review accounted for all 615 changed pixels: the
shortened referral heading (330), perforated ticket replacement (97), crossed
location pin (115), and support-headset replacement (73). No differences were
found in hero proportions, typography, spacing, CTA dimensions, benefit rows,
or privacy/footer layout outside those four regions.

The canonical PNG supports the full `کد معرفی / کد ارجاع` heading, a ticket with
horizontal strokes, and the compact boom-microphone headset. Those presentation
regressions were restored without changing form behavior. The crossed location
pin is closer to the canonical PNG than the old crosshair symbol, so it is retained.
After visually reviewing the corrected render and confirming that only 115 pixels
at that icon differed, the landing baseline was regenerated. The OTP and foundation
baselines, screenshot thresholds, workflows, routes, and development origin fix
remain unchanged.

`tests/e2e/screenshots/auth.spec.ts/landing-referral-customer.png` and
`otp-verification-customer.png` are exact 390×844 screenshots of the working routes. The landing
baseline contains the valid sample code. The OTP baseline freezes time at 1:42 remaining and
contains four digits with the fifth cell active. The reference contains five digits with its
first cell highlighted; that cannot remain the normal interactive state because entering all
five digits immediately verifies or rejects the code. Geometry and visual treatment are matched.

Generated car/phone geometry, studio lighting, small icon details, and Vazirmatn glyph shapes
have minor differences from the source artwork. Baselines protect the implemented composition;
they do not imply pixel identity with the reference PNGs. There are no functional phase-01
blockers. Existing dependency-audit findings from bootstrap remain outside this UI phase.

## Tests

Seven new unit tests cover digit normalization, code/cell ordering, paste and caret behavior,
autofill structure, completion, accessible error association, formatting, and authoritative
mock cooldown/attempt metadata. Seven browser scenarios cover both screens, invalid referral,
automatic verification, lockout/resend, editing/focus, direct navigation, and responsive overflow.
The 390×844 visual scenario runs only in the customer project; behavioral cases run in both
projects. The original foundation screenshots/tests are preserved at `/foundation/preview`.
