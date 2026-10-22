# Versioned eleven-photo policy and media optimization reuse

## Goal
New inspections require ten fixed photographs and exactly one VIN/specification photograph selected from four existing location suggestions. Historical twelve-photo inspections remain pinned and readable.

## User-visible behavior
Seven sections, eleven logical photo slots, separate odometer data and walk-around video. The existing four guidance choices supply one slot; its selected location follows captured evidence into review, uploads and Reviewer. Replacement keeps accepted evidence until confirmation. Production remains 2D with optional viewer isolated.

## Current state
HEAD 59abbce already provides worker compression, source-first atomic media revisions, bounded IDB reads, shared durable queue and lazy Reviewer previews. Four suggestions currently decorate two independent mandatory technical photographs. Repository capture plans are not pinned to an inspection. Preserve all pre-existing local changes recorded in the ignored diagnostic manifest.

## Constraints
Canonical worktree only; no dependency, backend, credential, asset, Neshan or model changes. No whole-project optimization repeat. Retain revision checks, scoped corrections, submitted locks, original backups, queue concurrency and 100dvh shell. Historical policy and namespace remain versioned.

## Implementation
1. Add explicit photo policy and nested single-choice alternatives; preserve legacy template.
2. Pin templates durably through existing confirmed-facts storage and infer legacy activity conservatively.
3. Persist captured alternative identity through drafts, confirmation, upload metadata and scoped corrections; centralize satisfaction and display.
4. Adapt existing guidance/review/overview, Reviewer and Admin consumers without redesign.
5. Add focused policy, history, replacement/race and browser tests; retain prior media optimizations.
6. Update media/backend/business documentation, run actual validation and inspect visual/responsive results.
7. Review preservation manifest and scoped diff, commit and push normally.

## API impact
Planned contracts carry policy/template version, stable logical requirementId, selected alternativeId and evidence revision separately from media kind. ASP.NET validates the chosen group; no APIs implemented.

## Testing
Unit coverage for all four alternatives, zero choice, ten mandatory photographs, old templates, revision switching, uploads and scoped corrections. Browser checks real capture/guidance/review and responsive eleven-photo progression, plus previous media, queue, submission, Neshan and optional viewer regressions. Run lint, typecheck, unit suite, focused Playwright and build with actual exit statuses. Reuse prior performance measurements explicitly as legacy twelve-photo baseline.

## Acceptance criteria
- [x] New templates have eleven required logical photographs; all four choices independently satisfy the one group.
- [x] Evidence choice persists and appears consistently; one current upload revision and atomic replacement.
- [x] Existing twelve-photo evidence, submitted summaries and snapshots retain their original identity.
- [x] Admin, Reviewer, progress, upload and submission agree; video/odometer stay separate.
- [x] Media performance improvements and unrelated user changes are preserved.
- [x] Validation, documentation and Git verification recorded honestly.

## Progress
- [x] Audit current state and identify the four exact existing suggestions.
- [x] Read repository instructions and full task; record protected local changes.
- [x] Implement versioned policy and evidence identity.
- [x] Implement consumer compatibility and regression coverage.
- [x] Validate, document, review and commit.

## Delivery and discoveries

Implementation committed and pushed as 11f5d880ead1130cb0390caef236841d50a191ea; remote branch was verified equal. Tests/docs validation commit follows on the same branch. No repeated optimization implementation: reused 59abbce and reran its benchmark harness separately. Retained v1 Admin publication to avoid breaking existing White-Label template references. Explicit v1 fixtures preserve historical regression intent; new policy tests cover all four choices and actual Reviewer-requested replacement. No model geometry, asset, secret, route or CSS changes. All twenty protected local files remain byte-identical.

Final validation: lint/typecheck/build exit 0; 553 unit tests exit 0; current policy nine browsers + two new manually inspected baselines exit 0; 86 customer regressions (3 skips), 3 staff/White-Label (8 skips), 3 live Neshan, 1 optional GLB and 2 production benchmark checks exit 0. The broad historical pixel suite remains separate debt, including readiness; no existing baseline was updated. Detailed measurements, failures/fixes, caveats and responsive captures are in docs/PERFORMANCE_OPTIMIZATION_REPORT.md. No new throughput/quality or universal speed claim.
