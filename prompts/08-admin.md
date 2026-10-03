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

Create editable CAP-01..CAP-14 table/list with:
- code
- Persian title
- category
- required
- guide availability
- quality policy

Selecting CAP-05 opens the editor:
- title
- instructions
- required
- distance
- phone height
- camera orientation
- linked 3D viewpoint
- highlighted 3D nodes
- small visual vehicle pose preview

Actions:
- `ذخیره پیش‌نویس`
- `انتشار نسخه جدید`

Keep template data fully typed and compatible with the capture-plan API contract.
Do not hardcode screen behavior around CAP-05; selection should be generic.
