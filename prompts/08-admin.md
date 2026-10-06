# Codex task — Admin capture-template editor

## Canonical visual references

- `references/screens/20-admin-template-editor.png`

Inspect **all** references above before implementation. The first screen-specific image is the primary composition reference; the others are supporting references for shared visual language, media, 3D, or overlay details.


Create an ExecPlan.

Target viewport: 1440×960.

Implement the admin area with selected navigation `قالب بازدید`.

Current template:
`بازدید استاندارد بیمه بدنه — نسخه ۳`
status: `منتشرشده`

Create an editable template-driven table (current customer template: seven sections, twelve photos) with:
- code
- Persian title
- category
- required
- guide availability
- quality policy

Selecting a requirement opens the editor:
- title
- instructions
- required
- distance
- phone height
- camera orientation
- section and canonical sample image
- optional future 3D viewpoint/node mapping, never required by the customer flow
- small visual vehicle pose preview

Actions:
- `ذخیره پیش‌نویس`
- `انتشار نسخه جدید`

Keep template data fully typed and compatible with the capture-plan API contract.
Do not hardcode screen behavior around any requirement ID; selection should be data-driven.
