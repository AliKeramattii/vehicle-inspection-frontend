# Codex task — Readiness + Consent

## Canonical visual references

- `references/screens/03-readiness.png`
- `references/screens/04-consent-privacy.png`

Inspect **all** references above before implementation. The first screen-specific image is the primary composition reference; the others are supporting references for shared visual language, media, 3D, or overlay details.


Implement:
- `/readiness`
- `/consent`

Use the custom illustration/SVG assets where suitable.

Readiness must include:
- title `قبل از شروع، آماده‌اید؟`
- estimate `زمان تقریبی: ۱۲ دقیقه`
- one prominent visual readiness area
- compact readiness rows
- device diagnostic states for camera, location, 3D/WebGL, storage
- sticky CTA `همه چیز آماده است`

Consent must include:
- title `رضایت و حریم خصوصی`
- concise collection explanation
- photos/video, approximate location, capture time/technical metadata
- collapsed full-terms row
- consent checkbox
- disabled `تأیید و ادامه` until accepted

Keep the legal page intentionally concise and calm.
Add visual and behavioral tests.
