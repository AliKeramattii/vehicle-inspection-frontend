# Codex task — Reviewer queue + visual workstation

## Canonical visual references

- `references/screens/18-reviewer-queue.png`
- `references/screens/19-reviewer-workstation.png`

Inspect **all** references above before implementation. The first screen-specific image is the primary composition reference; the others are supporting references for shared visual language, media, 3D, or overlay details.


Create an ExecPlan.

Target viewport: 1440×960.

Build:

1. Reviewer queue
2. Reviewer case workstation

Queue:
- compact RTL navigation
- restrained operational summary
- search and filters
- dense data table
- statuses: جدید / در حال بررسی / مدرک تکمیلی
- flags: ManualPlate / LowAccuracy / QualityOverride
- frozen-header feel
- keyboard/focus-friendly table controls

Workstation:
- three resizable panes
- context pane
- dominant dark-neutral media stage
- viewer tools: zoom, rotate, loupe, original/watermarked
- 14-item filmstrip
- decision pane
- approve / retake
- retake reasons
- case flags
- additional evidence action
- final decision hierarchy

Do not turn all three panes into identical cards.
The center evidence image must visually dominate.
Use mocks through reviewer repository interfaces.
