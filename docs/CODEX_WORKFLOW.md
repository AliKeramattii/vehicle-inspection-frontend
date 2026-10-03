# Working with Codex on This Project

## Install/update Codex

```powershell
npm install -g @openai/codex@latest
codex --version
```

Open the repository and run:

```powershell
codex
```

Sign in with your ChatGPT account when prompted.

On Windows, if something is wrong with the CLI, run:

```powershell
codex doctor
```

## First session

Do not start with "build the whole app."

Start by asking Codex to audit the repository and prepare the foundation.

Use `prompts/00-bootstrap.md`.

## Recommended interaction pattern

For each phase:

1. Start from a clean working tree.
2. Give Codex one phase prompt.
3. Ask it to inspect the matching local PNGs first.
4. Let it implement.
5. Run the app yourself.
6. Compare at the target viewport.
7. Give visual corrections with concrete observations.
8. Ask Codex to run lint/typecheck/tests.
9. Commit only when the phase is stable.

## Good task prompt structure

Use:
- outcome
- exact reference file
- required behavior
- constraints
- acceptance checks

Example:

> Implement the OTP screen using `references/screens/02-otp.png` as the visual source of truth. Use existing tokens and primitives. Do not use the PNG as a background. Target 390×844. Add five accessible OTP cells, autofill-friendly behavior, Persian visual numerals, LTR underlying code order, resend timer UI, remaining-attempt text, and visual regression coverage. Keep API mocked through the auth repository.

## Use goals for open-ended tasks

For tasks with a clear finish line but uncertain path, Codex supports `/goal`.

Example:

```text
/goal Make the landing and OTP screens visually match their references at 390×844 while keeping all Playwright and accessibility checks passing.
```

## Use ExecPlans

For:
- capture subsystem
- IndexedDB/upload queue
- Three.js integration
- reviewer workstation
- admin capture-template editor

Tell Codex:

> Create an ExecPlan following `.agent/PLANS.md`, then implement it and keep the progress section updated.

## Keep prompts focused

Prefer:
- one coherent screen pair
- one subsystem
- one refactor goal

Avoid a single request to implement all customer, reviewer, admin, camera, upload, PWA, and API integration at once.

## Visual correction prompt

After you inspect a screen:

> Compare the current implementation to `references/screens/<file>.png`. Keep the current component architecture, but correct visible differences in hierarchy, spacing, type scale, element width, radius, shadows, image proportions, and sticky CTA placement. Do not redesign the reference. Run the visual test after changes.

## Review prompt

Before finishing a phase:

> Review your own diff as a senior frontend engineer. Look specifically for RTL mistakes, unnecessary client components, hydration risks, duplicated server state, hardcoded backend assumptions, inaccessible controls, layout overflow at 390×844, and visual mismatch with the reference. Fix issues you find, then run lint, typecheck, and relevant tests.
