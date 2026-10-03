# Codex task — Landing + OTP

## Canonical visual references

- `references/screens/01-landing-referral.png`
- `references/screens/02-otp-verification.png`

Inspect **all** references above before implementation. The first screen-specific image is the primary composition reference; the others are supporting references for shared visual language, media, 3D, or overlay details.


Implement the first two customer screens:

- landing/referral
- OTP verification

Target viewport: 390×844.

Requirements:

Landing:
- Persian RTL
- partner/platform co-branding
- hero title: `بازدید آنلاین خودرو در کمتر از ۱۵ دقیقه`
- supporting Persian copy
- automotive hero imagery integrated into the layout
- six-cell referral code input
- LTR code order inside the input
- CTA `شروع بازدید`
- benefits:
  - بدون مراجعه حضوری
  - ذخیره خودکار
  - امن و رمزنگاری‌شده
- privacy/support footer
- mock referral validation through repository abstraction

OTP:
- page title `تأیید شماره موبایل`
- five OTP cells
- autofill-friendly implementation
- LTR logical code order; Persian visual numerals where appropriate
- masked number
- resend countdown UI
- remaining-attempt message
- auto-submit behavior after all five digits
- edit-number action

Use existing design tokens and primitives.
Do not copy the reference as an image background.
Add Playwright visual coverage for both screens.
