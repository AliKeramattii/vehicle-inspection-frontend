# Final product workflow and brokerage integration readiness
## Goal
Complete customer return/status/correction UX, operational whole-case decisions/search, configurable customer halos, and typed future source-identity/SSO/forwarding contracts in the canonical worktree.
## User-visible behavior
Customer phone is source-owned/read-only; verified returning users resume drafts or see status. Exact requested media/fields can be corrected without resetting the inspection. Full rejection explicitly starts a new empty attempt linked to the preserved rejected inspection. Staff distinguish evidence decisions, whole-case approval/rejection and server-confirmed forwarding. Tenant visual settings include halo/accent and preview with draft/publication semantics.
## Current state
Branch feat/unified-ui-admin-3d, HEAD dff9f6e. Twenty original tracked user changes remain, plus untracked supplied references/logo/nested checkout. Existing mock OTP permits phone edits; auth state is ephemeral. Durable submission/retake/media and assigned Reviewer queues exist. Whole-case rejection, forwarding and returning-entry resolution are missing. Review/Admin IndexedDB use a legacy same-origin workspace key; per-tenant mock scoping is needed. Existing full browser baseline has 45 known failures (42 screenshots, 3 old assertions).
## Constraints
No worktrees, resets, main merge, backend/SMS/real SSO service, new dependencies, production Node requirement, asset/GLB/viewer/map changes. Preserve IDs/enums and all accepted evidence/revisions. Tenant maps remain centrally managed; Site Admin may not change Neshan keys. Preserve manual schema edits; if extending it, stage only this task's schema delta against HEAD and verify original remaining diff. Runtime Site Settings remains the sole theme provider. Mock identities/outcomes must be explicitly described as local, never real authentication/forwarding.
## Implementation
1. Audit existing boundaries and references; preserve initial hashes, baseline checks and checkpoint gap report.
2. Add typed source-customer/session adapters, durable tenant/subject inspection index and lifecycle mapping. Remove phone editing/resend overrides. Resolve returning entry from local draft/progress or mock status provider; production backend remains authoritative.
3. Preserve existing media correction architecture. Add exact requested vehicle-field correction tasks and customer-safe reasons. Add explicit fresh-attempt creation after full rejection, without copying media/data into its namespace.
4. Extend assigned Reviewer repository with whole-case decisions, internal notes and revision comparisons; preserve evidence approvals and actor/time audit. Add Admin derived lifecycle cards, filtered case search by tracking/phone/plate/status and scoped workspaces.
5. Backward-compatible theme extension for accent/halo color/intensity, scoped CSS variables and live mobile preview/reset visual defaults. Read-only deployment map/infrastructure information; no provider changes.
6. Add staff session contract/validation/permission routing seams and four requested backend handoff documents; clearly label proposed endpoint categories and future security responsibilities.
7. Unit/browser/visual/RTL/mobile/operations regression; actual Neshan and existing authorized optional viewer where available. Focused commits/push and detailed report, preserving unrelated historical baselines.
## API impact
Frontend domain lifecycle and trusted source/staff context types; mock repository implementations. Future backend owns tracking-code generation, subject/tenant/session authentication, final decisions, notifications, new-attempt links, secure forwarding/idempotency/acknowledgement. No confirmed or implemented ASP.NET endpoints are invented.
## Testing
Run actual lint/typecheck/test/test:e2e/build scripts. Add domain/session/correction/tenant/halo tests and deterministic browsers. Test 360x800,390x844,430x932 and operations1440x960; no document overflow. Preserve 12-photo/odometer/video package, markers/controls/atomic replacement/queue/receipts. Review screenshots, never blanket-update old baselines. Report real process exits and pre-existing failures.
## Acceptance criteria
Read-only source phone; safe draft/status returns; targeted corrections and separate new rejected attempt; assigned/reasoned operational decisions; approved versus forwarded distinct; tracking searchable/copyable without public authorization; tenant-isolated mocks/settings; no exposed keys/SSO secrets; scoped halo and preserved blue/cyan operations; documentation and validated focused pushes.
## Progress
- [x] Read request, AGENTS, plans, index/design and existing workflow boundaries; no interrupted edits found.
- [x] Checkpoint 1 gap report/baseline.
- [x] Checkpoint 2 source identity and returns; unit and browser acceptance verified.
- [x] Checkpoint 3 targeted corrections/rejection implemented; focused units pass.
- [x] Checkpoint 4 operations UX implemented; assigned decisions, search and whole-case acceptance verified.
- [x] Checkpoint 5 visual settings implemented; old publications preserved.
- [x] Checkpoint 6 typed contracts and four handoff documents.
- [x] Checkpoint 7 functional, responsive and regression validation/report.
- [x] Task-only implementation commit and safe remote verification; documentation/validation delivered with this plan.

## Discoveries and validation log
- Direct user approval confirmed scoped frontend/mock auth return, tenant isolation and assigned Reviewer decisions after automatic review rejected attachment-only authorization. Production SSO/backend remain out of scope.
- Initial lint/typecheck passed. Initial new full unit run: 458 passed/6 failed (464 total); five old fixtures edited centrally owned maps via Admin, one assumed individual evidence finalizes whole case. Updated fixtures preserve all Neshan precedence assertions and test the new ownership rule. Focused lifecycle/settings/operations/map suite: 35 passed, exit 0.
- Earlier development services were no longer listening; first browser run failed at connection refusal. Started existing dev scripts on 3114 and local-only 8787/8788, without changing credentials/configuration or stopping unrelated processes.
- Four deliberate Admin light/dark dashboard/settings baselines were manually reviewed and updated for the seven lifecycle metrics and configurable customer halo preview; all other baselines remain untouched. Lint/typecheck pass, 480 units pass, build passes, 3 actual Neshan tests and 1 licensed optional viewer test pass. Final production-backed results are recorded below.

- Browser helper recovery was extended for verified users who have not completed location/vehicle setup, and for changed identity/return expectations. A publication test now waits for durable success before navigation. The Upload Center refresh scenario verifies direct status-aware restoration rather than the obsolete reauthentication loop. The first complete production run exited 1 (235 passed/185 skipped/52 failed), before these last expectation fixes and intentional Admin baselines; the final frozen rerun is recorded below.

## Continuation checkpoint and final evidence
- Recovered the same canonical branch/HEAD and staged work; no worktree or duplicate implementation. All four required handoff documents exist and describe frontend/mock versus future backend responsibilities.
- The interrupted functional command actually finished: 57 passed, exit 0, across additional-evidence, submission and upload customer scenarios. Existing REVIEW_ADDITIONAL/REVIEW_SUBMISSION/REVIEW_UPLOAD flags bypass only historical pixel comparisons in this targeted run so assertions after those comparisons execute. Default full-suite comparisons remain enabled and their failures are disclosed.
- That final check preserved the supplemental resubmission/rereview timeline instead of allowing the new business timeline to hide it. Removed two obsolete unused test imports. Lint/typecheck and the production build used by this focused run exited 0.
- Final normal production-backed Playwright: 242 passed, 185 skipped, 45 failed, exit 1 (472 cases). A parsed comparison against the recorded pre-task log found the exact same 45 failing test identities, zero new failing identities. Eleven new acceptance scenarios passed. The full suite is NOT reported as passing; historical screenshot/missing-baseline failures and three stale assertions remain separate follow-up work.
- Unit validation: 480 tests in 43 files, exit 0. Real Neshan: 3 tests, exit 0. Licensed optional viewer: 1 test, exit 0. Reviewed mobile 360x800/390x844/430x932 and operations 1440x960 captures. Only four deliberate Admin light/dark dashboard/settings baselines changed.
- Protected-file hash audit: all original assets, map/viewer/proxy, environment and other user files unchanged. Removing only the three additive theme fields reproduces the manual schema backup byte-for-byte. Its index contains only the task delta, not the manual edits. No configured private values found in staged text or built browser chunks.
- No development listeners remain on 3100/3114/8787/8788 at continuation recovery; no unrelated process was stopped. No test runner is left pending. Logs and screenshots remain under ignored .agent/reference-review/final-product/.

## Git delivery
Implementation commit `4cff1e04a2aff4c0f6c6181b1ceee454f5f892b7` (`feat: complete customer lifecycle and review operations`) was pushed normally to origin/feat/unified-ui-admin-3d and its remote hash verified. Documentation and this completed validation record follow in a focused commit; the delivery response records the final remote HEAD. Original user work remains unstaged and unchanged apart from the three additive schema fields included in the implementation.
