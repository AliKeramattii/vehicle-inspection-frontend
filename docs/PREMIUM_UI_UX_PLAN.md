# Premium UI/UX implementation plan

Mode: PRESERVE. Design framework: installed design-taste-frontend, contextual product rules. DESIGN_VARIANCE 3–4, MOTION_INTENSITY 2 (brief theme feedback), VISUAL_DENSITY 5 customer / 6 operations. Existing custom Tailwind/CSS system and Lucide retained; no new UI dependency.

## Source and preservation baseline
Unified eb8a183 is the approved base. This isolated branch does not copy the six uncommitted source Playwright configs. References supplied under Downloads/UI-UX are copied byte-for-byte to the documented references/ui/ui-ux-refinement location. No old worktree reset/stash/overwrite. Existing historical readiness/retake baseline debt is not silently accepted.

## Screen/component inventory
| Area | Observed issue / risk | Improvement / shared reuse |
|---|---|---|
| Landing / OTP / customer headers | Generic masked app car; app and brokerage identities could be conflated | Shared color-preserving ApplicationLogo; preserve CoBranding/runtime brokerage logo and compact geometry |
| Readiness | Repeated ready badges inflate four-check grid; meaningful failed states must survive | Four quiet icon/title/explanation rows; expose only actionable checking/permission/failure feedback; preserve capability service |
| Admin theme | Plain select; system preference must remain reachable | Animated sun/moon switch with explicit system action; reuse theme persistence/initialization |
| Admin shell / dashboard | Flat navigation, little context, configuration-only metrics | Group only existing routes, responsive drawer/collapse, repository-derived operations snapshot, retain all routes/permissions |
| Site Settings | Long flat tab labels, insufficient lifecycle context | Group supported existing fields, contextual descriptions, eight previews and sticky draft/publication state/actions |
| Admin templates / users / permissions / webhooks / assignment | Inconsistent density and table/form feedback | Shared scoped operations tokens, existing primitives, readable horizontal table scrolling; no new backend controls |
| Reviewer queue | Reference-heavy list without easy filtering | Scoped client filtering of assigned records, clear status/context, no unassigned data leakage |
| Reviewer workspace | Evidence competes with controls; narrow layouts need clear order | Responsive context/viewer/action composition, usable filmstrip, previous/next, existing exact revision decisions |
| Consent / location / vehicle | Mixed headers/field hierarchy | Shared logo and scoped feedback/control rhythm; preserve legal, Neshan gestures, plate and VIN |
| Photography / guides / live camera | Established dominant image and controls-below hierarchy | Preserve geometry and requirement mapping; targeted secondary-action legibility only where review shows need |
| Odometer / Recorder V2 / video review | Real media lifecycle must not be disturbed | Preserve dark camera stage, eight guides, pause/resume, durable evidence and native controls |
| Upload / summary / receipt / retakes | Different completion stages must remain explicit | Consistent action/status hierarchy; receipt reference/copy and support, reuse existing states, never imply reviewer approval |

## Brand and interaction baseline
Runtime primary (default #2563EB), independent success #059669, warning #D97706, error #DC2626; Vazirmatn; semantic radii control10/input12/card16/sheet24; spacing4/8/12/16/20/24/32; 44px targets. Physical directions, technical LTR, current routes/nav labels/form names/legal copy remain. App logo changes explicitly approved. AppViewport retained.

## Focused checkpoints
See .agent/plans/premium-ui-ux.md. Each checkpoint is reviewed in browser before completion. Before/after artifacts stay ignored; baseline changes, if any, are explicitly listed after inspection.

## Validation debt and safety
Historical readiness and five retake snapshots are documented on the base. Do not claim full visual suite success if they remain. No external installation required. GLB remains ignored/local licensed development-only. Neshan local proxy configuration is ignored, never logged or committed. Standard build is not static-export proof.

## Implementation discoveries
Manual review found a flex-collapsed preparation hero, an inherited high-specificity narrow header override, stop-button color overriding semantic red, and insufficient dark selected-surface text contrast. These were corrected inside existing components/shells. Readiness uses its existing main internal scroller with the full hero, four reachable capability items and sticky CTA. Dark text accents are adjusted against the least-contrasting selected surface, independently of brand button colors.
During the task two additional source-unified local files appeared (src/app/globals.css and src/app/api/development/vehicle-model/[variant]/route.ts). They were not copied or overwritten. Supplementary source-worktree before images reflect that working tree at capture time; initial before images were captured from the clean isolated eb8a183 base.

## Route-by-route customer inventory
| Screen / existing route | Audit result and implemented refinement | Preservation risk / reuse |
|---|---|---|
| Welcome + referral / | Successful automotive composition retained; approved app SVG and tenant-safe CTA feedback | Referral/order/mock unchanged; CoBranding/ApplicationLogo |
| OTP /verify | Shared logo; existing five-digit/autofill/countdown/edit focus retained | Authentication copy/inputs and challenge semantics unchanged |
| Registration | No standalone registration route exists on this base | No fake page or dead navigation added |
| Readiness /readiness | Removed repeated ready markup; full hero no longer collapses; four quiet checks with real failure recovery | Same capability service, pin and main internal scroller |
| Consent /consent | Shared identity; existing terms/checkbox/disabled CTA preserved | Legal copy and local consent architecture unchanged |
| Location /inspection/{id}/location | Shared compact identity; real Neshan visuals/attribution/controls reviewed | SDK, pin, coordinates, GPS, reverse and local proxy unchanged |
| Vehicle /inspection/{id}/vehicle | Shared identity and control feedback reviewed | VehicleCard, IranianPlate, VIN and PlateInput retained |
| 2D photography /inspection/{id}/capture | Image/marker/control/card composition retained | Twelve IDs, markers, progress, selection and controls-below unchanged |
| Optional 3D /same capture route | Real gated mobile model verified; no viewer rewrite | Existing license gate/fallback and downstream requirement IDs retained |
| Section /capture/section/{sectionId} | Existing image-guided navigation reviewed | Requirement-owned progression unchanged |
| Guidance /capture/photo/{requirementId}/guide | Existing sample/instructions/framing retained | No canonical image replacement or generic copy rewrite |
| Live camera /capture/photo/{requirementId}/camera | Existing dark camera-only composition reviewed | Stream/ghost/shutter/cleanup untouched |
| Photo review /capture/photo/{requirementId}/review | Evidence contain/comparison and simple actions retained | No manual quality checklist; atomic replacement unchanged |
| Odometer /same odometer requirement review | Numeric input/edit and evidence hierarchy verified | Integer normalization/persistence/zero unaffected |
| Capture-package review /capture/review | Separate photo/odometer/video statuses retained | No fake photo/file denominator |
| Recorder /capture/video/record | V2/eight manual ghosts/pause/target retained; shared semantic-button contrast protected | No fake coverage, gallery input or media-service change |
| Video review /capture/video/review | Existing contained native player and re-record reviewed | Durable accepted evidence and replacement retained |
| Upload /inspection/{id}/upload | Shared identity/control feedback; states/retry reviewed | Same photo+video queue, offline/idempotency and odometer exclusion |
| Final summary/submit /inspection/{id}/review | Existing facts/readiness/disabled/loading/error hierarchy retained | Submission gating and durable identity unchanged |
| Receipt /inspection/{id}/submitted | Existing reference/ETA/timeline; truthful copy failure and configured support disclosure | No false review approval; original fit preserved |
| Additional Evidence /inspection/{id}/additional-evidence/{requestId}/[[...step]] | Shared identity; existing list/guide/camera/review/upload/re-submit reviewed | Scoped exact-item/revision authorization and locks unchanged |

Admin actual routes reviewed: /admin, /admin/site-settings, /admin/branding, /admin/policies, /admin/templates, /admin/templates/{templateId}, /admin/webhooks, /admin/assignments, /admin/users, /admin/permissions. Reviewer: /reviewer and /reviewer/cases/{caseId}. Shared scoped forms/tables/status/navigation were refined, with no invented case-list/SLA/notification/user-invitation pages.
