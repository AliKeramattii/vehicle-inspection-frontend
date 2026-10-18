# Supplied sedan 2D asset consolidation

## Goal
Replace active default/reference 2D vehicle imagery with the exact supplied white sedan. Keep all optional 3D files/model/materials/loaders/cameras/gates unchanged.

## User-visible behavior
Same approved RTL/layout/routes/interactions and package: 7 sections, 12 photographs, independent odometer and video. Landing/referral, readiness, consent, vehicle illustration, overview/guides/views, Recorder V2 ghosts, receipt and Admin default previews share supplied sedan. Actual evidence and tenant custom images remain untouched.

## Current state
Canonical feat/unified-ui-admin-3d has fast-forwarded approved 7e71205 during the preceding functional audit. Focused functional fixes await final validation/commit before this separate asset checkpoint. Supplied references/assets/new-vehicle has 19 source, 8 navigation (byte-identical source copies, NOT documented 512-square view-* files), 5 heroes and 8 genuine-alpha ghosts. All visually reviewed using ignored contact sheets. Expected manifest.json, README_FA.md, GENERATE_THESE_IMAGES.md and previews/contact-sheet.jpg are absent across known worktrees. Document actual provenance rather than fabricating supplied metadata.

## Constraints
No new worktree, redesign, 3D edits/binary publication, backend/static migration, actual customer media replacement or tenant draft/publication overwrite. Original historical readiness local edits and all baselines stay intact. Source bytes stay exact, physical directions unmirrored. AppViewport/controls below vehicle unchanged. Generic icons/logo without vehicle-family identity remain functional symbols.

## Implementation
1. Finish separate functional audit checkpoint; preserve current 3D SHA-256 inventory and unrelated 8 local edits.
2. Document active/default/fallback/historical/3D asset inventory and explicit old-to-new mapping.
3. Copy only needed exact sources to public/assets/inspection-vehicle (photo-guides, hero, ghost-guides), deduplicating navigation through the same photo URLs; no AI generation.
4. Central explicit asset registry; default/runtime component mappings, 12 template images, 8 view roles, 8 recorder ghosts. Recognize legacy canonical guide URLs for persisted template display without mutating immutable templates or captured Blobs. Preserve tenant overrides; document Admin reset/replace path.
5. Update source-reference index and derived metadata docs, framing/alt text only as necessary. No counts/IDs/capture logic change. User approved generic demo sedan label; existing saved records remain untouched. Never infer actual marque.
6. Test source-byte identity/alpha/mappings/legacy guide compatibility/custom overrides/evidence preservation. Review 360x800/390x844/430x932/1440x960, all guides/views/ghosts and representative full journey.
7. Actual lint/typecheck/unit/relevant browser/build exits, compare screenshots without rewriting historical baselines, verify 3D/unrelated file hashes, focused commit/push and remote verification.

## API impact
No endpoint/DTO change. Public image allowlist may need the narrow new approved directory while retaining prior safe paths and tenant isolation. Current mock/domain boundaries unchanged.

## Testing
Unit mapping/durability invariants and asset metadata tests; explicit browser asset requests/decode/default fallback/custom override, guide/marker/nav synchronization, recorder ghosts and cleanup, receipt/Admin previews, overflow at target sizes. Preserve physical device and historical baseline limitations honestly.

## Acceptance criteria
- Every active default non-3D vehicle illustration/reference uses supplied sedan.
- 12 exact photo IDs, 7 sections, 8 explicit view roles, 8 alpha ghosts.
- No old-SUV fallback, no evidence/tenant/3D mutation.
- Missing package metadata and unchanged 3D visual difference documented.
- Safe tested focused changes delivered on canonical branch.

## Progress
- [x] New brief and actual source package inspected; all 40 images reviewed/metadata checked.
- [x] 3D source/binary preservation hashes saved (ignored).
- [x] Functional audit checkpoint e41df97 committed/pushed and remote verified.
- [x] Asset inventory and explicit registry.
- [x] Runtime asset mappings and compatibility.
- [x] Visually reviewed 67 comparison screenshots/contact sheets; four focused scenarios pass. Final production functional selection: 177 passed/99 skipped, exit 0. Lint/typecheck/383 units/build exit 0. Historical baselines unchanged.
- [x] Asset docs and implementation 2531bc47985f56a3672623be59cd358314de6c80 committed/pushed normally; remote HEAD verified.

## Validation command and discoveries

Production functional command (existing historical visual/obsolete assertions remain explicitly filtered, not rewritten):

```powershell
$env:COMPLETION_REPORT=".agent/reference-review/new-vehicle/functional-final.json"
$env:REVIEW_ADDITIONAL="1"
$env:REVIEW_SUBMISSION="1"
$env:REVIEW_UPLOAD="1"
npm.cmd exec playwright test -- --config playwright.completion.config.ts --grep-invert "reference-led|screenshot|visual|vehicle confirmation opens|image markers, shot cards|accepted replacement attention|portrait evidence|new draft has orange|odometer review validates|video ready, deterministic|re-record keeps accepted|partial package|two brokerage deployments|Site Settings validation, role checks|Site Settings desktop viewport 1440|eight local image slots"
```

Initial browser harness corrections: development server was no longer running; selectors were corrected to actual component classes; full-document guide navigation lost intentionally ephemeral mock auth, so tests now use real client navigation; await each back transition. An image override resolves to an absolute URL, so its URL assertion checks the exact path. Three prior evidence-frame checks assumed old 3:2 imagery; they now independently verify source and intrinsic evidence ratios. No implementation workaround or baseline update hid these failures. Thirty-three 3D and eight canonical unrelated checks match; all 151 historical file hashes and prior deletion/directory entries match.
