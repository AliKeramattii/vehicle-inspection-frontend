# Admin Panel (Phase 10)

## Isolation and access
Admin is on `feat/admin-panel` in `C:/Projects/vehicle-inspection-admin`, based on stable `origin/main` at `6228c67`. Phase 08 implementation `1b1e25c` and validation `6228c67` are on that base. Phase 09 `c5f59a1` and `c190012` are not ancestors; their feature, preview route and optimization tooling are absent from the Admin branch. No revert is needed. Existing legacy isolated Three dependencies on main are retained; Admin never imports them. Local restricted GLBs were not copied or published.

Run `npm run dev -- --port 3104` in this worktree and open `http://localhost:3104/admin`. The npm script retains LAN listening. The separate experimental preview can remain on its own port/worktree. Admin must not be merged with the experimental branch as a shortcut.

Safe exclusion: continue using main or this Admin branch without merging Phase 09. To reopen experimental code, use the existing original worktree or `git worktree add --detach ../vehicle-inspection-3d-future origin/feat/optional-vehicle-3d` for a detached inspection worktree. Local model artifacts stay where they are; license restrictions remain. Removing the experiment later requires a separate explicit scope review of its worktrees, ignored local artifacts and branch; no deletion/revert is executed here.

## Routes and component architecture
- `/admin`: repository-derived counts and recent audit activity.
- `/admin/templates`: title/ID search, lifecycle filter, template creation.
- `/admin/templates/[templateId]`: version selection, draft editor, guide preview, publication/history.
- `/admin/branding`, `/admin/policies`, `/admin/webhooks`, `/admin/users`, `/admin/permissions`.

Thin server pages provide metadata/params. AdminShell is the interaction/layout boundary with scoped `admin.css`; AppViewport/root RTL/Vazirmatn remain shared. The desktop shell has a right sidebar, restrained partner/user header, bounded content, and independent table/editor scroll panes. The stable customer CSS, routes and behavior are unchanged. NativeDialog, button, TextInput, Checkbox, Icon and InlineAlert are reused. New Admin icons use the existing supplied family.

TanStack Query owns loaded mock truth. React Hook Form/Zod owns unsaved form edits. Selection/tabs/dialogs use local state. No server entities are copied into Zustand. Sidebar and version navigation prompt before discarding unsaved values; browser refresh/close has beforeunload protection.

## Template schema and supported editing
Admin metadata wraps the existing PhotographyTemplate: stable template ID, title/partner, version ID, numeric templateVersion, revision, state, actor/time and current published pointer. These are metadata extensions, not a new capture schema.
The current canonical section IDs are right, left, front, rear, cabin, engine-details and roof. The twelve photo IDs remain:
front-45-right, back-45-right, front-45-left, back-45-left, front-plate, rear-plate, odometer-on, driver-interior, engine-bay, spec-plate, chassis-number and car-roof.

Supported edits: title, description, instructions, section, required flag, canonical sample, distance, height, orientation; within-section requirement ordering and section ordering. Section/requirement identities cannot be added/deleted in this compatibility phase. Moving all photos out of a section is invalid until it is restored. All seven sections must exist, IDs unique, orders contiguous and canonical asset references known. Unsupported fields are rejected recursively. Runtime evidence statuses/reviewer reasons cannot be edited in a template definition. Odometer photo remains required.

Manual odometer and walk-around video remain separate supplemental requirements, currently read-only compatible settings. No thirteenth photo or video-as-photo is added. Existing checks/guidanceTopics/semanticNodes are preserved without inventing new quality certification or 3D marker fields. The associated 2D view is derived from section; this phase does not edit global marker coordinates.

## Draft/version workflow
Published versions are immutable. Create/open a single draft from a published snapshot; next version number is derived. Changes are validated before a transactional save. Publishing is enabled only after saving edits and a concise confirmation. The same version ID is the mock publication idempotency identity; repeat publication does not create a second audit event. Publication updates the current pointer but retains earlier snapshots.
Drafts may be archived; published snapshots are never archived/deleted through this UI. Stale expected revision is rejected with a conflict and a load-fresh action, preserving unsaved local values until explicitly discarded. Template creation clones the current base publication with new template/version identity and the same canonical photo IDs.

## Durability and failure handling
`IndexedDbAdminPersistence` uses a separate `inspection-admin` database (version 1), a single small workspace record and atomic read/write transactions. It stores no media Blobs or customer evidence. Connections close on completion/abort/versionchange. A failed transaction cannot report save success or partially commit. Loading preserves layout; storage errors offer retry. Image errors preserve a frame with retry.
The in-memory implementation uses serialized copy-on-write transactions for deterministic service tests. Initial fixtures are deterministic and only seed missing storage; reload never overwrites existing edits.

## Inspection snapshot compatibility
`pinPublishedTemplate(template, versionId)` returns a deep clone of the requested published snapshot. Existing evidence namespaces, submissions and Additional Evidence use stable template/version/requirement linkage. Publishing Admin v2 does not mutate pinned v1, its media, original submission or retake references.
Integration gap: current customer mock repository still uses its existing template snapshot. Admin publication does NOT automatically choose templates for new inspections. A later server-backed inspection-creation adapter must explicitly select/pin the authorized publication and test all downstream compatibility before enabling it.

## Roles and secondary modules
Mock identity selection is explicitly labeled and is not authentication. Platform Admin may mutate supported settings/publish; Template Editor may create/edit/archive drafts but not publish; Viewer may read only. Every repository mutation checks permission, independently of UI disabling. The last active mock administrator cannot be demoted.
Branding: display name saves durably, primary blue/logo remain approved and fixed; configuration only affects Admin. New logo upload is not supported.
Policies: honest read-only explanation of current capture/upload/consent rules; no invented insurer acceptance/enforcement.
Webhooks: persisted enabled state for a typed deterministic example endpoint/event; no external requests, delivery history or exposed secrets.
Users: persisted mock role assignments with audit. No real user creation/login.
Permissions: read-only central matrix; role assignment is through Users. Policy management permission describes a future server responsibility and does not imply an active write UI.
Audit records draft creation/save/publish/archive, branding/webhook/role actions with actor/time/resource. It is not a production tamper-proof security log.

## Visual decisions
Reference 20 supplies sidebar/header/template/status/version, list + selected editor and bottom save/publish hierarchy. Historical CAP identifiers, fourteen slots, 3D region editor and fake quality-policy controls are deliberately not imported. Current canonical images use containment, small lazy optimized table thumbnails and a larger editor/dialog guide. Editor copy/reference selection is a compact expandable detail so the primary guide stays useful.
Palette remains #F8FAFC/#FFFFFF/#2563EB/#111827, Vazirmatn, restrained borders and semantic status tones. Existing customer artwork remains untouched. Desktop/tablet targets: 1440×960, 1280×800, 1920×1080, 1024×768. Bounded horizontal table scrolling is intentional; no document overflow.

## Security/backend boundary
Everything here is a local deterministic mock. Browser identity and IndexedDB are not trusted security controls. ASP.NET must own authenticated tenant scope, per-operation authorization, optimistic concurrency, immutable publication, audit retention and asset verification. Never trust an actor/role sent by the browser. API_CONTRACT documents planned operations only. No backend requests or credentials are introduced.

## Validation
See the phase10 ExecPlan for actual command counts/exits and screenshot review. New Admin baselines only; earlier customer baselines and the original-worktree readiness mismatch remain untouched.

## Final validation and applicable TasteSkill pre-flight
- npm run lint: exit 0, no warnings.
- npm run typecheck: exit 0.
- npm run test: exit 0, 244 tests in 19 files (28 new Admin tests).
- npm run test:e2e: exit 0, 156 passed / 100 intentionally skipped by project targeting; includes 14 new desktop Admin scenarios. Final production rerun after recovery correction passed.
- npm run build: exit 0; only new Admin routes, no Phase09 preview/model handler on the branch.
- Normal-path screenshot helper reported no page/console errors and no document overflow. Deliberate storage/image failure fixtures exercise recovery separately.
- Reviewed 1440×960 against reference 20, plus 1280×800, 1920×1080 and 1024×768. Narrow/tablet panes use bounded internal scrolling. Images are contained rather than cropped.

Nine new files under tests/e2e/screenshots/admin.spec.ts, all suffixed -desktop.png:
admin-overview, admin-template-list, admin-published-detail, admin-draft-editor, admin-selected-requirement, admin-validation-error, admin-publish-confirmation, admin-published-version, admin-permissions. No earlier baseline changed.

Applicable pre-flight: PASS. Light theme, approved primary #2563EB, Vazirmatn, existing icon/brand treatment, controlled radii, readable hierarchy/table text, visible focus, semantic labels, disabled controls, keyboard-operable selection/dialogs/reordering, bounded layouts, empty/loading/error/retry feedback, no decorative motion and reduced-motion support. No em/en dashes were introduced in Admin UI copy. Marketing hero/layout, GSAP, social proof and marketing-CTA prescriptions are not applicable to this operations interface. Historical reference counts/3D fields are replaced only by authoritative current product schema.
Preservation: no customer URL, navigation label, field name, anchor, branding asset or legal text changed. Only new Admin routes/fields are added. All 24 pre-recorded original-worktree user-change hashes match; additional unrelated local proxy formatting is not touched. The pre-existing readiness working-tree mismatch is retained, not copied/fixed or baseline-updated. Restricted original/mobile/desktop GLBs remain local and unchanged in location/size; no GLB or restricted render is in this commit.
Corrections during implementation: Windows native piping encoding, promised repository rejection behavior, scoped Playwright selectors, active version after archive, and retained cached form on background read errors. These are resolved and covered; the initial missing-snapshot generation exit is not reported as a passing comparison. The final ordinary comparison and production suite pass. Existing test-environment NO_COLOR/FORCE_COLOR warnings remain informational.

## Git delivery
Implementation commit `8cbf194` (`feat: add admin panel and inspection template management`) was pushed normally to `origin/feat/admin-panel`. Remote verification confirmed stable main still at `6228c67` and optional Phase 09 still at `c190012`. No merge, reset, stash, model publication or original-worktree changes were performed. This delivery record is committed separately after implementation push verification.
