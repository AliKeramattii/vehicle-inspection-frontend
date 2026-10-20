# Final customer reference UI review

Actual browser screenshots from the canonical worktree, not reference PNGs rendered as UI. Comparison boards show BEFORE above AFTER. Source captures are local under `.agent/reference-review/final-reference-ui/{before,after}` (107 images per set). These portable images are review evidence, not updated golden baselines.

- [Landing and OTP](entry-comparison.png)
- [Readiness, consent and vehicle](preparation-comparison.png)
- [Photography, guidance and actual evidence review](photography-comparison.png)
- [Final summary and receipt](summary-receipt-comparison.png)
- [Video, upload and additional evidence](remaining-comparison.png)
- [Admin light/dark and Reviewer regression](operations-regression.png)
- [Complete vehicle card detail](summary-vehicle-mobile.png)
- [Readiness capability detail](readiness-capabilities-mobile.png)
- [Expanded, explicitly accepted consent](consent-details-accepted.png)
- [Real Neshan map and Persian address](protected-real-map.png)

Primary customer captures: 390x844. Consent detail: 430x932. The framing tests also cover 320x568, 360x800, 430x932, 768x1024 and 1440x960; keyboard/landscape checks cover 390x500 and 844x390. Admin/Reviewer acceptance capture is 1440x960. Browser geometry checks are not physical-device certification.

The Neshan image uses actual authorized local services and actual provider responses; no keys are included. Its GPS coordinates are the deterministic demo location. General workflow captures use existing deterministic mocks. Existing recorded-video test evidence is retained, including its original vehicle; it is not new instructional artwork. No restricted GLB render or asset is included.

See [the completion report](../../FINAL_REFERENCE_UI_COMPLETION_REPORT.md) for validation failures, preservation constraints and exact source-asset mapping.
