# Codex task — Visual acceptance pass

Goal: perform a systematic visual acceptance pass against all available local PNG references.

For each implemented reference screen:

1. Open the PNG.
2. Render the corresponding route at its target viewport.
3. Use the existing Playwright screenshot setup.
4. Compare hierarchy, spacing, typography, width, height, image proportions, radii, borders, shadows, status colors, and sticky action placement.
5. Fix visible mismatches without redesigning the reference.
6. Verify there is no overflow at 390×844 customer viewports.
7. Verify desktop pages at 1440×960.
8. Preserve component reuse; do not replace layouts with absolute-positioned screenshot tracing.
9. Run lint, typecheck, tests, and visual tests at the end.

Produce a short report listing:
- matched screens,
- remaining intentional differences,
- missing external assets (for example final GLB/map provider/backend).


## Mandatory reference coverage

The pass is not complete until every file below has been inspected:

- `references/screens/01-landing-referral.png`
- `references/screens/02-otp-verification.png`
- `references/screens/03-readiness.png`
- `references/screens/04-consent-privacy.png`
- `references/screens/05-location.png`
- `references/screens/06-vehicle-identity.png`
- `references/screens/07-inspection-3d-home.png`
- `references/screens/08-photo-guide-bottom-sheet.png`
- `references/screens/09-live-camera-ghost-alignment.png`
- `references/screens/10-photo-review.png`
- `references/screens/11-odometer-review.png`
- `references/screens/12-video-360-capture.png`
- `references/screens/13-upload-centre.png`
- `references/screens/14-final-inspection-summary.png`
- `references/screens/15-submission-receipt.png`
- `references/screens/16-additional-evidence-retake.png`
- `references/screens/17-inspection-photo-guide-reference.png`
- `references/screens/18-reviewer-queue.png`
- `references/screens/19-reviewer-workstation.png`
- `references/screens/20-admin-template-editor.png`
- `references/screens/21-vehicle-2d-fallback.png`
- `references/screens/22-vehicle-webgl-reference.png`
- `references/screens/23-ghost-alignment-asset.png`

Use `references/INDEX.md` to determine whether each file is a page reference or supporting visual asset.
