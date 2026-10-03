# Codex task — Offline media + upload center + final summary + receipt

## Canonical visual references

- `references/screens/12-video-360-capture.png`
- `references/screens/13-upload-centre.png`
- `references/screens/14-final-inspection-summary.png`
- `references/screens/15-submission-receipt.png`
- `references/screens/16-additional-evidence-retake.png`

Inspect **all** references above before implementation. The first screen-specific image is the primary composition reference; the others are supporting references for shared visual language, media, 3D, or overlay details.


Create an ExecPlan.

Implement the durable media/upload subsystem and completion screens.

Requirements:

IndexedDB:
- captured media Blob
- inspection ID
- shot code
- capture metadata
- durable upload state

Upload manager:
`local -> queued -> uploading -> processing -> uploaded -> verified`
with failed/retry behavior.

Retry triggers:
- app start
- browser online event
- upload-center entry
- explicit user retry

Do not rely only on service-worker Background Sync.

Build:
- upload center
- final inspection summary
- submission receipt
- additional evidence flow

Use typed mock API repositories matching `docs/API_CONTRACT.md`.

Submission must be disabled until required evidence is complete/synced according to the mock domain rules.

Add tests for:
- offline capture persistence
- upload retry transition
- failed item retry
- final submission eligibility
