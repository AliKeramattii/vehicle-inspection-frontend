# Unified worktree integration plan

## Verified base and method
Base: 84539b795ad305467d5a61cfac0af0dc33c07182 (Neshan live integration). New branch feat/unified-ui-admin-3d in C:/Projects/vehicle-inspection-integrated. No source tree is modified, stashed, staged or deleted. Ancestry, not timestamps or folder names, establishes authority. All approved Admin/White-Label/UI/Neshan commits are already ancestors, so do not cherry-pick duplicates.

## Inventory
| Worktree | Branch / HEAD | Status | Upstream | Unique versus base / merge base |
|---|---|---|---|---|
| C:/Projects/vehicle-inspection-frontend | feat/optional-vehicle-3d / c190012 | 35 status entries | origin/feat/optional-vehicle-3d | c190012 docs: record vehicle viewer validation and delivery; c5f59a1 feat: add isolated local Sportage viewer / 6228c67 |
| C:/Projects/vehicle-inspection-3d | preview-3d / c190012 | clean | origin/feat/optional-vehicle-3d | c190012 docs: record vehicle viewer validation and delivery; c5f59a1 feat: add isolated local Sportage viewer / 6228c67 |
| C:/Projects/vehicle-inspection-admin | feat/admin-panel / c26568c | clean | origin/feat/admin-panel | none / c26568c |
| C:/Projects/vehicle-inspection-neshan | feat/neshan-live-integration / 84539b7 | 1 status entries | origin/feat/neshan-live-integration | none / 84539b7 |
| C:/Projects/vehicle-inspection-static | feat/static-export-migration / 9c75417 | clean | origin/feat/white-label-platform | none / 9c75417 |
| C:/Projects/vehicle-inspection-ui-modernization | feat/ui-modernization-2d-3d / 678fb8a | clean | origin/feat/ui-modernization-2d-3d | none / 678fb8a |
| C:/Projects/vehicle-inspection-white-label | feat/white-label-platform / 9c75417 | clean | origin/feat/white-label-platform | none / 9c75417 |

## Feature authority / dependencies / order
| Feature | Authoritative commits/files | Already included? | Status and dependencies | Integration/conflict strategy | Verification |
|---|---|---|---|---|---|
| Core 2D, evidence, upload, submission, retakes | main through 6228c67; photography/media/upload/submission features | Yes | Approved; capture template and durable evidence | 1: retain base; never restore historical 14-photo logic | Existing unit/customer scenarios |
| Admin and role boundaries | 8cbf194,c26568c; features/admin; later reviewer assignment port in 93d9266 | Yes | Approved local mocks; role service and audit | 2: extend current shell/settings rather than old Admin folder | Role/navigation and assignment tests |
| White-Label | 531469c,9c75417; config/site-settings*, branding-assets, settings repositories | Yes | Approved runtime config, tenant binding | 3: add backward-compatible receipt image/local asset reference; preserve CAS/publication | Tenant-switch, image/draft/publish durability |
| UI modernization / optional viewer | 93d9266,678fb8a; features/vehicle-3d and reviewer | Yes (selective port from Phase09) | Approved UI; restricted GLB still local-only | 4: newer port supersedes old c5f59a1 viewer source; do not merge old routes/variants over it | One mobile model, 12 fixed pins, no production GLB |
| Neshan picker | 6d17226,c8db703 | Yes | Approved, runtime settings and existing picker | 5: preserve | Pan/GPS/edit/persistence tests |
| Neshan live/tile diagnosis | de45f4a,2a84930,b08fff7,84539b7; lib/map, tools/dev-neshan-proxy | Yes | Approved; ignored local keys and development tools | Preserve committed adapter; source worktree has uncommitted edits, excluded | Real PNG coverage/reverse and secret/prod isolation |
| Phase09 isolated original | c5f59a1,c190012; original feature branch | Two unique commits, newer implementation already ported | Experimental/restricted license | Do not merge older quality variants, preview routes or public binaries; consult source audits only | Confirm mobile GLB authorization gate remains |
| Static export branch | 9c75417, same tree as White-Label | Yes, audit only | Incomplete migration; existing runtime routes remain blockers | No fabricated generateStaticParams or general migration | Build success is not static-export proof |
| Recorder V2 | Supplied original references/ui/vehicle-360-recorder-v2 | New reference | Explicitly approved kit; existing video recorder/store/queue | 6: copy only named reference kit and 8 ghost assets; adapt controls into current flow; exclude standalone DB/app | Pause active duration, live-only capture, durable replacement |

## Exclusions / user work
Original frontend: 27 tracked changes plus untracked references/skills remain untouched. Required supplied V2 reference kit is read/copied selectively, never treated as completed implementation. Neshan local adapter formatting edit remains untouched and is not silently included. Original readiness mismatch remains excluded; only explicitly requested four-item correction is implemented in the new worktree. No private environment files or restricted GLB is tracked/published. Old branches/worktrees remain recoverable.

## Design preservation audit
PRESERVE. Persian RTL, Vazirmatn, bright automotive customer style, existing route labels and legal copy remain authoritative. Customer header references are removed only as explicitly requested; receipt retains them. Admin uses scoped light/dark tokens. Design variance 3–4, motion 2, density near 6 for customer photography. Reuse existing Lucide/custom icon family. Functional markers/ghost overlays are explicit exceptions to marketing-only skill rules.

## Ordered checkpoints
A: inherited integration and baseline smoke. B: Admin navigation/theme, four readiness items, receipt-only customer code. C: eight local image asset controls and runtime resolution. D: capture/upload truth and guidance-first 3D pins. E: V2 recorder controls/ghosts with existing store/queue. F: Persian Admin guide, focused visual/regression/security checks, normal commits/push.

## Merge risk
No automatic merge conflict is currently required because latest approved code is in the base. If source changes prove essential, inspect and selectively port without modifying the source worktree; request approval only if source disturbance would be necessary. Shared site schema, authorization, evidence revisions and camera lifecycle require focused tests.

## Production boundary
No new required Node server endpoint. Existing local-only preview/proxy remain development tools; licensing gates unchanged. Future branding upload/settings publication/reverse/evidence belong to ASP.NET. Canonical backend storage contract: INSPECTION_{InspectionId}; never CustomerId folders.
