# Phase 04 — production image-guided photography

## Goal
Supersede unfinished customer 3D work with a premium seven-section, twelve-photo workflow.
Complete overview, dedicated section/guidance routes, camera, comparison, replacement, retakes
and local durability. Do not implement remote upload/submission or redesign earlier phases.

## User-visible behavior
Image-first overview with computed progress and explicit section rows. Large exact sample photos
teach framing. Camera opens only after an explicit action; unavailable/denied camera offers native
photo selection. Review compares sample with the user's photograph and requires quality checks.
Confirmation advances to the next incomplete requirement or returns to the completed section.
All sections remain reopenable. Completion enables review of all twelve photos.

## Recovered initial state
HEAD/main/origin main is 279d3a2 (Phase 03). Previous Phase 04 is uncommitted, not pushed.
Reusable experimental Three.js code exists, but no media storage/camera/upload implementation
exists. Canonical twelve assets are supplied and individually inspected. Unrelated auth/readiness
edits, deleted old readiness SVGs, installed local skills and new vehicle image must be preserved.
Current readiness CSS/GPS edits already conflict with their committed screenshot baseline.

## Constraints
Preserve Next agent block exactly and earlier routes/baselines/origin settings. Update conflicting
instructions before implementation. No new dependencies, real API calls or fake quality analysis.
Query owns template/evidence reads; local state owns camera/check interactions. IndexedDB owns
draft/accepted blobs and saves them before confirm;
replacement atomically swaps evidence after confirmation, retaining old accepted photo meanwhile.
Camera streams stop on exit; object URLs are revoked. LTR IDs; physical left/right images unmirrored.

## Implementation
1. Audit/supersede old 3D/14 instructions, update INDEX, prompt 04, API and architecture documents.
2. Extend existing domain/repository boundary with template sections/photo requirements and capture
   status. Authoritative configuration maps exact assets; adapt to legacy capture-plan consumers.
3. Add durable IndexedDB photo store and explicit camera service with loading/permission errors.
4. Build thin server routes and small shared photography components for overview/section/guide/review.
5. Add derived progress, next requirement, replacement/retake and completion behavior.
6. Add unit/browser scenarios and reviewed visual baselines at 390x844, responsive 360/430 checks.
7. Validate all scripts and full suite; distinguish pre-existing readiness changes without overwriting
   them. Review, scoped commit, push and verify.

## API impact
GET capture-plan becomes configurable sections/requirements; canonical IDs map evidence/reviewer
requests without mesh coupling. Local blobs/status are not remote upload acknowledgements. Planned
evidence/upload endpoints remain unimplemented; full-completion review ends at this existing boundary.

## Testing
Configuration uniqueness/count/assets; progress/status/next; durable replacement failure safety;
camera cleanup/errors; quality gates; section/camera/review/replacement/retake/full completion;
all important visual states, mobile overflow, no Three.js/GLB requests or real API calls.

## Acceptance criteria
- [x] Seven sections/twelve mapped requirements from one template, no production 3D import.
- [x] Real camera/native-photo path and durable drafts, review and atomic replacement work.
- [x] Derived progress, automatic next, retakes and final review work without remote APIs.
- [x] Visual review and baseline states complete; unrelated user changes preserved.
- [x] Required validation and diff/security review completed and recorded below.

## Progress
- [x] Recover repository, read request/instructions and inspect all twelve photos plus camera/review PNGs.
- [x] Update direction documentation, implement domain/storage and customer screens.
- [x] Test and visually iterate every major state.
- [x] Final validation and scoped diff/security review.
- [ ] Commit/push and verify Git outcome.

## Discoveries and resolutions
- No existing camera, photo persistence or downstream upload/submission implementation existed.
  Added the explicitly requested camera/local review; final review preserves an honest unimplemented
  remote boundary instead of pretending to send evidence.
- Shared App Router layout preserved the previous section scroll position. Route focus now resets
  scroll and focuses the new heading. Review initially exceeded 844px; compact comparison frames
  and spacing keep all checks and actions visible. Completed stepper colors are scoped to photography
  to avoid inherited Phase-03 CSS overriding them.
- Browser assertions initially inspected a different sorted IndexedDB record or reloaded before
  confirmation committed. Tests now select the stable requirement ID and await the resulting route.
  Replacement quota failure retains accepted/draft blobs; retry and fresh-login recovery are covered.
- Working-tree full Playwright: 50 passed, 5 skipped, one pre-existing readiness baseline failure
  (4,125 differing pixels from user CSS/GPS-icon edits). Those files and their baseline stay untouched.
  An ignored isolated copy of HEAD plus only intended task changes passes the entire suite:
  51 passed, 5 skipped. This also validates earlier consent/readiness baselines without overwriting
  unrelated working-tree edits.

## Validation and visual evidence
- `npm run lint`: pass; `npm run typecheck`: pass; `npm test`: 70 tests/7 files pass.
- `npm run test:e2e`: results qualified above; all Phase-04 scenarios and 17 new baselines pass.
- Final working-tree Phase-04-only run: 16 passed, 2 intentional desktop visual skips.
- `npm run test:e2e:dev`: one localhost/LAN/HMR/fresh-auth parity test passes against the existing
  development server. Initial launch was blocked by its existing Next dev lock; using explicit test
  origins resolved that without stopping the server or changing configuration.
- `npm run build`: pass. Production JS has no GLTFLoader/WebGLRenderer/R3F/Drei signatures.
- Reviewed canonical 12 images and 08–11 camera/review references, iterated screenshots of overview,
  all seven sections, guide, camera and comparison, and reviewed partial, accepted, completed,
  retake and final-review states. Seventeen baselines at 390x844; no overflow at 360/390/430.
- Playwright prints existing NO_COLOR/FORCE_COLOR warnings; the isolated copy also prints a nested
  lockfile root warning. The actual project production build has neither configuration issue.

## Known boundaries
Live camera on LAN HTTP requires HTTPS; native camera/file selection remains available. Local
storage may be cleared/evicted. Quality checks are customer confirmations, not computer vision.
No upload/submission/reviewer/admin feature or 3D refinement was started.
